import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Modal, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { Text } from '../../typography/Text';
import { TextField } from '../../inputs/TextField';
import { Picker } from '../../inputs/Picker';
import { DatePicker } from '../../inputs/DatePicker';
import { Button } from '../../ui/Button';
import { X } from 'lucide-react-native';
import Colors from '../../../constants/Colors';
import { FeedInventoryRecord } from '../../../contexts/FeedInventoryContext';

interface FeedInventoryModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (record: Omit<FeedInventoryRecord, 'id' | 'created_at' | 'updated_at'>) => void;
  editRecord?: FeedInventoryRecord | null;
}

const feedTypeOptions = [
  { label: 'Dairy Meal', value: 'dairy_meal' },
  { label: 'Beef Fattener', value: 'beef_fattener' },
  { label: 'Calf Starter', value: 'calf_starter' },
  { label: 'Hay', value: 'hay' },
  { label: 'Silage', value: 'silage' },
  { label: 'Concentrates', value: 'concentrates' },
  { label: 'Minerals', value: 'minerals' },
  { label: 'Salt', value: 'salt' },
  { label: 'Supplements', value: 'supplements' },
  { label: 'Molasses', value: 'molasses' },
  { label: 'Bran', value: 'bran' },
  { label: 'Maize', value: 'maize' },
];

const categoryOptions = [
  { label: 'Concentrate', value: 'concentrate' },
  { label: 'Roughage', value: 'roughage' },
  { label: 'Supplement', value: 'supplement' },
  { label: 'Mineral', value: 'mineral' },
  { label: 'Medication', value: 'medication' },
  { label: 'Other', value: 'other' },
];

const unitOptions = [
  { label: 'Kilograms (kg)', value: 'kg' },
  { label: 'Bags', value: 'bags' },
  { label: 'Liters', value: 'liters' },
  { label: 'Tons', value: 'tons' },
  { label: 'Pounds', value: 'pounds' },
];

export function FeedInventoryModal({ visible, onClose, onSave, editRecord }: FeedInventoryModalProps) {
  const [formData, setFormData] = useState({
    feed_type: '',
    brand: '',
    category: '',
    unit: 'kg',
    initial_stock: 0,
    current_stock: 0,
    cost_per_unit: 0,
    total_price: 0,
    supplier: '',
    batch_number: '',
    storage_location: '',
    minimum_stock_level: 0,
    date_received: null as Date | null,
    expiry_date: null as Date | null,
  });

  useEffect(() => {
    if (editRecord) {
      setFormData({
        feed_type: editRecord.feed_type,
        brand: editRecord.brand,
        category: editRecord.category,
        unit: editRecord.unit,
        initial_stock: editRecord.initial_stock,
        current_stock: editRecord.current_stock,
        cost_per_unit: editRecord.cost_per_unit,
        total_price: editRecord.total_price,
        supplier: editRecord.supplier,
        batch_number: editRecord.batch_number,
        storage_location: editRecord.storage_location,
        minimum_stock_level: editRecord.minimum_stock_level,
        date_received: new Date(editRecord.date_received),
        expiry_date: new Date(editRecord.expiry_date),
      });
    } else {
      setFormData({
        feed_type: '',
        brand: '',
        category: '',
        unit: 'kg',
        initial_stock: 0,
        current_stock: 0,
        cost_per_unit: 0,
        total_price: 0,
        supplier: '',
        batch_number: '',
        storage_location: '',
        minimum_stock_level: 0,
        date_received: new Date(),
        expiry_date: null,
      });
    }
  }, [editRecord, visible]);

  // Auto-calculate total price when initial stock or cost per unit changes
  useEffect(() => {
    const calculatedTotal = formData.initial_stock * formData.cost_per_unit;
    if (calculatedTotal !== formData.total_price) {
      setFormData(prev => ({ ...prev, total_price: calculatedTotal }));
    }
  }, [formData.initial_stock, formData.cost_per_unit]);

  // Set current stock to initial stock for new records
  useEffect(() => {
    if (!editRecord && formData.initial_stock !== formData.current_stock) {
      setFormData(prev => ({ ...prev, current_stock: prev.initial_stock }));
    }
  }, [formData.initial_stock, editRecord]);

  const handleSave = () => {
    const recordToSave = {
      ...formData,
      date_received: formData.date_received?.toISOString().split('T')[0] || '',
      expiry_date: formData.expiry_date?.toISOString().split('T')[0] || '',
    };
    onSave(recordToSave);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text variant="h5" weight="medium">
            {editRecord ? 'Update Feed Inventory' : 'Add Feed Inventory'}
          </Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color={Colors.neutral[600]} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          <Picker
            label="Feed Type"
            value={formData.feed_type}
            onValueChange={(value) => setFormData({ ...formData, feed_type: value })}
            items={feedTypeOptions}
          />

          <TextField
            label="Brand"
            value={formData.brand}
            onChangeText={(text) => setFormData({ ...formData, brand: text })}
            placeholder="Enter brand name"
          />

          <Picker
            label="Category"
            value={formData.category}
            onValueChange={(value) => setFormData({ ...formData, category: value })}
            items={categoryOptions}
          />

          <Picker
            label="Unit of Measurement"
            value={formData.unit}
            onValueChange={(value) => setFormData({ ...formData, unit: value })}
            items={unitOptions}
          />

          <TextField
            label={`Initial Stock (${formData.unit})`}
            value={formData.initial_stock.toString()}
            onChangeText={(text) => setFormData({ ...formData, initial_stock: parseFloat(text) || 0 })}
            placeholder="Enter initial stock quantity"
            keyboardType="numeric"
          />

          {editRecord && (
            <View style={styles.stockInfo}>
              <Text variant="body2" color="neutral.600">
                Current Stock: {formData.current_stock} {formData.unit}
              </Text>
            </View>
          )}

          <TextField
            label={`Cost per ${formData.unit} ($)`}
            value={formData.cost_per_unit.toString()}
            onChangeText={(text) => setFormData({ ...formData, cost_per_unit: parseFloat(text) || 0 })}
            placeholder="Enter cost per unit"
            keyboardType="numeric"
          />

          <TextField
            label="Total Price ($)"
            value={formData.total_price.toFixed(2)}
            onChangeText={(text) => setFormData({ ...formData, total_price: parseFloat(text) || 0 })}
            placeholder="Auto-calculated"
            keyboardType="numeric"
            editable={false}
          />

          <TextField
            label="Supplier"
            value={formData.supplier}
            onChangeText={(text) => setFormData({ ...formData, supplier: text })}
            placeholder="Enter supplier name"
          />

          <TextField
            label="Batch Number"
            value={formData.batch_number}
            onChangeText={(text) => setFormData({ ...formData, batch_number: text })}
            placeholder="Enter batch number"
          />

          <TextField
            label="Storage Location"
            value={formData.storage_location}
            onChangeText={(text) => setFormData({ ...formData, storage_location: text })}
            placeholder="Enter storage location"
          />

          <TextField
            label={`Minimum Stock Level (${formData.unit})`}
            value={formData.minimum_stock_level.toString()}
            onChangeText={(text) => setFormData({ ...formData, minimum_stock_level: parseFloat(text) || 0 })}
            placeholder="Enter minimum stock alert level"
            keyboardType="numeric"
          />

          {/* Date Received */}
          {Platform.OS === 'web' ? (
            <View style={{ marginBottom: 16 }}>
              <Text variant="body2" style={{ marginBottom: 6 }}>Date Received</Text>
              <input
                type="date"
                value={formData.date_received ? formData.date_received.toISOString().split('T')[0] : ''}
                onChange={(e) => {
                  const date = e.target.value ? new Date(e.target.value) : null;
                  setFormData({ ...formData, date_received: date });
                }}
                style={styles.webDateInput}
              />
            </View>
          ) : (
            <DatePicker
              label="Date Received"
              value={formData.date_received}
              onDateChange={(date) => setFormData({ ...formData, date_received: date })}
              placeholder="Select date received"
            />
          )}

          {/* Expiry Date */}
          {Platform.OS === 'web' ? (
            <View style={{ marginBottom: 16 }}>
              <Text variant="body2" style={{ marginBottom: 6 }}>Expiry Date</Text>
              <input
                type="date"
                value={formData.expiry_date ? formData.expiry_date.toISOString().split('T')[0] : ''}
                onChange={(e) => {
                  const date = e.target.value ? new Date(e.target.value) : null;
                  setFormData({ ...formData, expiry_date: date });
                }}
                style={styles.webDateInput}
              />
            </View>
          ) : (
            <DatePicker
              label="Expiry Date"
              value={formData.expiry_date}
              onDateChange={(date) => setFormData({ ...formData, expiry_date: date })}
              placeholder="Select expiry date"
            />
          )}
        </ScrollView>

        <View style={styles.footer}>
          <Button variant="outline" onPress={onClose} style={styles.button}>
            Cancel
          </Button>
          <Button variant="primary" onPress={handleSave} style={styles.button}>
            {editRecord ? 'Update' : 'Save'}
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
  closeButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  stockInfo: {
    padding: 12,
    backgroundColor: Colors.neutral[50],
    borderRadius: 8,
    marginBottom: 16,
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
  webDateInput: {
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.neutral[300],
    width: "100%",
  },
});
