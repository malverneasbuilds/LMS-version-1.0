import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Modal, ScrollView, TouchableOpacity } from 'react-native';
import { Text } from '../../typography/Text';
import { TextField } from '../../inputs/TextField';
import { Picker } from '../../inputs/Picker';
import { Button } from '../../ui/Button';
import { X } from 'lucide-react-native';
import Colors from '../../../constants/Colors';
import { useHerd } from '../../../contexts/HerdContext';

interface SalesRecord {
  id: string;
  animal_tag: string;
  transaction_date: string;
  transaction_type: string;
  buyer_seller: string;
  weight: number;
  price_per_kg: number;
  total_price: number;
  payment_method: string;
  notes: string;
}

interface SalesRegisterModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (record: Omit<SalesRecord, 'id'>) => void;
  editRecord?: SalesRecord | null;
}

const transactionTypeOptions = [
  { label: 'Sale', value: 'sale' },
  { label: 'Purchase', value: 'purchase' },
];

const paymentMethodOptions = [
  { label: 'Cash', value: 'cash' },
  { label: 'Bank Transfer', value: 'bank_transfer' },
  { label: 'Check', value: 'check' },
  { label: 'Credit', value: 'credit' },
];

export function SalesRegisterModal({ visible, onClose, onSave, editRecord }: SalesRegisterModalProps) {
  const { herdData } = useHerd();
  const [formData, setFormData] = useState({
    animal_tag: '',
    transaction_date: '',
    transaction_type: '',
    buyer_seller: '',
    weight: 0,
    price_per_kg: 0,
    total_price: 0,
    payment_method: '',
    notes: '',
  });

  // Create options for animals from herd register (only for sales)
  const animalOptions = herdData.map(animal => ({
    label: `${animal.tag_number} (${animal.breed}, ${animal.sex})`,
    value: animal.tag_number,
  }));

  useEffect(() => {
    if (editRecord) {
      setFormData({
        animal_tag: editRecord.animal_tag,
        transaction_date: editRecord.transaction_date,
        transaction_type: editRecord.transaction_type,
        buyer_seller: editRecord.buyer_seller,
        weight: editRecord.weight,
        price_per_kg: editRecord.price_per_kg,
        total_price: editRecord.total_price,
        payment_method: editRecord.payment_method,
        notes: editRecord.notes,
      });
    } else {
      setFormData({
        animal_tag: '',
        transaction_date: '',
        transaction_type: '',
        buyer_seller: '',
        weight: 0,
        price_per_kg: 0,
        total_price: 0,
        payment_method: '',
        notes: '',
      });
    }
  }, [editRecord, visible]);

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text variant="h5" weight="medium">
            {editRecord ? 'Edit Transaction' : 'Add New Transaction'}
          </Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color={Colors.neutral[600]} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          <Picker
            label="Transaction Type"
            value={formData.transaction_type}
            onValueChange={(value) => setFormData({ ...formData, transaction_type: value })}
            items={transactionTypeOptions}
          />

          {formData.transaction_type === 'sale' ? (
            <Picker
              label="Animal to Sell"
              value={formData.animal_tag}
              onValueChange={(value) => setFormData({ ...formData, animal_tag: value })}
              items={animalOptions}
            />
          ) : (
            <TextField
              label="Animal Tag"
              value={formData.animal_tag}
              onChangeText={(text) => setFormData({ ...formData, animal_tag: text })}
              placeholder="Enter animal tag number"
            />
          )}
          <TextField
            label="Transaction Date"
            value={formData.transaction_date}
            onChangeText={(text) => setFormData({ ...formData, transaction_date: text })}
            placeholder="YYYY-MM-DD"
          />

          <TextField
            label={formData.transaction_type === 'sale' ? 'Buyer' : 'Seller'}
            value={formData.buyer_seller}
            onChangeText={(text) => setFormData({ ...formData, buyer_seller: text })}
            placeholder="Enter buyer or seller name"
          />

          <TextField
            label="Weight (kg)"
            value={formData.weight.toString()}
            onChangeText={(text) => setFormData({ ...formData, weight: parseFloat(text) || 0 })}
            placeholder="Enter weight"
            keyboardType="numeric"
          />

          <TextField
            label="Price per kg ($)"
            value={formData.price_per_kg.toString()}
            onChangeText={(text) => setFormData({ ...formData, price_per_kg: parseFloat(text) || 0 })}
            placeholder="Enter price per kg"
            keyboardType="numeric"
          />

          <TextField
            label="Total Price ($)"
            value={formData.total_price.toString()}
            onChangeText={(text) => setFormData({ ...formData, total_price: parseFloat(text) || 0 })}
            placeholder="Enter total price"
            keyboardType="numeric"
          />

          <Picker
            label="Payment Method"
            value={formData.payment_method}
            onValueChange={(value) => setFormData({ ...formData, payment_method: value })}
            items={paymentMethodOptions}
          />

          <TextField
            label="Notes"
            value={formData.notes}
            onChangeText={(text) => setFormData({ ...formData, notes: text })}
            placeholder="Enter additional notes"
            multiline
            numberOfLines={3}
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