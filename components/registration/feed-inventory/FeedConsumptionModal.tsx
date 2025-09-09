import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Modal, ScrollView, TouchableOpacity } from 'react-native';
import { Text } from '../../typography/Text';
import { TextField } from '../../inputs/TextField';
import { Picker } from '../../inputs/Picker';
import { DatePicker } from '../../inputs/DatePicker';
import { Button } from '../../ui/Button';
import { X, TrendingDown } from 'lucide-react-native';
import Colors from '../../../constants/Colors';
import { FeedInventoryRecord, useFeedInventory } from '../../../contexts/FeedInventoryContext';

interface FeedConsumptionModalProps {
  visible: boolean;
  onClose: () => void;
  feedItem: FeedInventoryRecord | null;
}

const consumptionTypeOptions = [
  { label: 'Daily Feeding', value: 'daily_feeding' },
  { label: 'Monthly Update', value: 'monthly_update' },
  { label: 'Adjustment', value: 'adjustment' },
  { label: 'Waste', value: 'waste' },
];

export function FeedConsumptionModal({ visible, onClose, feedItem }: FeedConsumptionModalProps) {
  const { addConsumptionRecord, getConsumptionHistory } = useFeedInventory();
  const [formData, setFormData] = useState({
    consumption_date: new Date(),
    amount_consumed: 0,
    remaining_stock: 0,
    consumption_type: 'monthly_update',
    notes: '',
    recorded_by: '',
  });

  useEffect(() => {
    if (feedItem && visible) {
      // Get the latest consumption record to determine current stock
      const history = getConsumptionHistory(feedItem.id);
      const latestStock = history.length > 0 ? history[0].remaining_stock : feedItem.current_stock;
      
      setFormData({
        consumption_date: new Date(),
        amount_consumed: 0,
        remaining_stock: latestStock,
        consumption_type: 'monthly_update',
        notes: '',
        recorded_by: '',
      });
    }
  }, [feedItem, visible]);

  // Auto-calculate remaining stock when amount consumed changes
  useEffect(() => {
    if (feedItem) {
      const history = getConsumptionHistory(feedItem.id);
      const currentStock = history.length > 0 ? history[0].remaining_stock : feedItem.current_stock;
      const newRemainingStock = Math.max(0, currentStock - formData.amount_consumed);
      
      if (newRemainingStock !== formData.remaining_stock) {
        setFormData(prev => ({ ...prev, remaining_stock: newRemainingStock }));
      }
    }
  }, [formData.amount_consumed, feedItem]);

  const handleSave = async () => {
    if (!feedItem) return;

    try {
      await addConsumptionRecord({
        feed_inventory_id: feedItem.id,
        consumption_date: formData.consumption_date.toISOString().split('T')[0],
        amount_consumed: formData.amount_consumed,
        remaining_stock: formData.remaining_stock,
        consumption_type: formData.consumption_type,
        notes: formData.notes,
        recorded_by: formData.recorded_by,
      });
      onClose();
    } catch (error) {
      console.error('Error saving consumption record:', error);
    }
  };

  if (!feedItem) return null;

  const history = getConsumptionHistory(feedItem.id);
  const currentStock = history.length > 0 ? history[0].remaining_stock : feedItem.current_stock;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <TrendingDown size={24} color={Colors.warning[500]} />
            <View style={styles.headerText}>
              <Text variant="h5" weight="medium">
                Record Consumption
              </Text>
              <Text variant="body2" color="neutral.600">
                {feedItem.feed_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} - {feedItem.brand}
              </Text>
            </View>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color={Colors.neutral[600]} />
          </TouchableOpacity>
        </View>

        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text variant="caption" color="neutral.600">Current Stock</Text>
              <Text variant="h6" weight="bold" color="primary.500">
                {currentStock} {feedItem.unit}
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text variant="caption" color="neutral.600">Initial Stock</Text>
              <Text variant="h6" weight="bold">
                {feedItem.initial_stock} {feedItem.unit}
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text variant="caption" color="neutral.600">Total Consumed</Text>
              <Text variant="h6" weight="bold" color="warning.600">
                {(feedItem.initial_stock - currentStock).toFixed(1)} {feedItem.unit}
              </Text>
            </View>
          </View>
        </View>

        <ScrollView style={styles.content}>
          <DatePicker
            label="Consumption Date"
            value={formData.consumption_date}
            onDateChange={(date) => setFormData({ ...formData, consumption_date: date })}
            placeholder="Select consumption date"
          />

          <TextField
            label={`Amount Consumed (${feedItem.unit})`}
            value={formData.amount_consumed.toString()}
            onChangeText={(text) => setFormData({ ...formData, amount_consumed: parseFloat(text) || 0 })}
            placeholder="Enter amount consumed"
            keyboardType="numeric"
          />

          <TextField
            label={`Remaining Stock (${feedItem.unit})`}
            value={formData.remaining_stock.toString()}
            onChangeText={(text) => setFormData({ ...formData, remaining_stock: parseFloat(text) || 0 })}
            placeholder="Auto-calculated"
            keyboardType="numeric"
          />

          <Picker
            label="Consumption Type"
            value={formData.consumption_type}
            onValueChange={(value) => setFormData({ ...formData, consumption_type: value })}
            items={consumptionTypeOptions}
          />

          <TextField
            label="Notes"
            value={formData.notes}
            onChangeText={(text) => setFormData({ ...formData, notes: text })}
            placeholder="Enter additional notes"
            multiline
            numberOfLines={3}
          />

          <TextField
            label="Recorded By"
            value={formData.recorded_by}
            onChangeText={(text) => setFormData({ ...formData, recorded_by: text })}
            placeholder="Enter your name"
          />

          {history.length > 0 && (
            <View style={styles.historySection}>
              <Text variant="h6" weight="medium" style={styles.historyTitle}>
                Recent Consumption History
              </Text>
              {history.slice(0, 3).map((record) => (
                <View key={record.id} style={styles.historyItem}>
                  <View style={styles.historyHeader}>
                    <Text variant="body2" weight="medium">
                      {record.consumption_date}
                    </Text>
                    <Text variant="body2" color="warning.600">
                      -{record.amount_consumed} {feedItem.unit}
                    </Text>
                  </View>
                  <Text variant="caption" color="neutral.600">
                    Remaining: {record.remaining_stock} {feedItem.unit}
                  </Text>
                  {record.notes && (
                    <Text variant="caption" color="neutral.500" style={styles.historyNotes}>
                      {record.notes}
                    </Text>
                  )}
                </View>
              ))}
            </View>
          )}
        </ScrollView>

        <View style={styles.footer}>
          <Button variant="outline" onPress={onClose} style={styles.button}>
            Cancel
          </Button>
          <Button variant="primary" onPress={handleSave} style={styles.button}>
            Record Consumption
          </Button>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerText: {
    marginLeft: 12,
  },
  closeButton: {
    padding: 8,
  },
  summaryCard: {
    backgroundColor: Colors.warning[50],
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.warning[100],
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  historySection: {
    marginTop: 24,
    padding: 16,
    backgroundColor: Colors.neutral[50],
    borderRadius: 12,
  },
  historyTitle: {
    marginBottom: 12,
  },
  historyItem: {
    padding: 12,
    backgroundColor: Colors.white,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: Colors.warning[400],
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  historyNotes: {
    marginTop: 4,
    fontStyle: 'italic',
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral[200],
  },
  button: {
    flex: 1,
  },
});