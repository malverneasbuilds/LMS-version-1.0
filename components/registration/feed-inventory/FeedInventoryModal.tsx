import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Modal, ScrollView, TouchableOpacity } from 'react-native';
import { Text } from '../../typography/Text';
import { TextField } from '../../inputs/TextField';
import { Picker } from '../../inputs/Picker';
import { Button } from '../../ui/Button';
import { X } from 'lucide-react-native';
import Colors from '../../../constants/Colors';

interface FeedInventoryRecord {
  id: string;
  feed_type: string;
  brand: string;
  date_received: string;
  expiry_date: string;
  current_stock: number;
  total_price: number;
}

interface FeedInventoryModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (record: Omit<FeedInventoryRecord, 'id'>) => void;
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
  { label: 'Supplements', value: 'supplements' },
];

export function FeedInventoryModal({ visible, onClose, onSave, editRecord }: FeedInventoryModalProps) {
  const [formData, setFormData] = useState({
    feed_type: '',
    brand: '',
    date_received: '',
    expiry_date: '',
    quantity_to_add: 0, // New quantity to add to current stock
    current_stock: 0,
    total_price: 0,
  });

  useEffect(() => {
    if (editRecord) {
      setFormData({
        feed_type: editRecord.feed_type,
        brand: editRecord.brand,
        date_received: editRecord.date_received,
        expiry_date: editRecord.expiry_date,
        quantity_to_add: 0,
        current_stock: editRecord.current_stock,
        total_price: editRecord.total_price,
      });
    } else {
      setFormData({
        feed_type: '',
        brand: '',
        date_received: '',
        expiry_date: '',
        quantity_to_add: 0,
        current_stock: 0,
        total_price: 0,
      });
    }
  }, [editRecord, visible]);

  const handleSave = () => {
    // Add the new quantity to current stock
    const finalRecord = {
      ...formData,
      current_stock: editRecord 
        ? formData.current_stock + formData.quantity_to_add 
        : formData.quantity_to_add,
    };
    
    // Remove the temporary quantity_to_add field
    const { quantity_to_add, ...recordToSave } = finalRecord;
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

          <TextField
            label="Date Received"
            value={formData.date_received}
            onChangeText={(text) => setFormData({ ...formData, date_received: text })}
            placeholder="YYYY-MM-DD"
          />

          <TextField
            label="Expiry Date"
            value={formData.expiry_date}
            onChangeText={(text) => setFormData({ ...formData, expiry_date: text })}
            placeholder="YYYY-MM-DD"
          />

          {editRecord && (
            <View style={styles.stockInfo}>
              <Text variant="body2" color="neutral.600">
                Current Stock: {formData.current_stock} kg
              </Text>
            </View>
          )}

          <TextField
            label={editRecord ? "Quantity to Add (kg)" : "Initial Stock (kg)"}
            value={formData.quantity_to_add.toString()}
            onChangeText={(text) => setFormData({ ...formData, quantity_to_add: parseFloat(text) || 0 })}
            placeholder={editRecord ? "Enter quantity to add" : "Enter initial stock"}
            keyboardType="numeric"
          />

          <TextField
            label="Total Price ($)"
            value={formData.total_price.toString()}
            onChangeText={(text) => setFormData({ ...formData, total_price: parseFloat(text) || 0 })}
            placeholder="Enter total price"
            keyboardType="numeric"
          />
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
});