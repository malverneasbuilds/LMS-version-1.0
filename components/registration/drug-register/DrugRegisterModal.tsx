import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Modal, ScrollView, TouchableOpacity } from 'react-native';
import { Text } from '../../typography/Text';
import { TextField } from '../../inputs/TextField';
import { Button } from '../../ui/Button';
import { X } from 'lucide-react-native';
import Colors from '../../../constants/Colors';

interface DrugRecord {
  id: string;
  drug_name: string;
  expiry_date: string;
  quantity: string;
  date_received: string;
  unit_cost: string;
  withdrawal_period: string;
}

interface DrugRegisterModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (record: Omit<DrugRecord, 'id'>) => void;
  editRecord?: DrugRecord | null;
}

export function DrugRegisterModal({ visible, onClose, onSave, editRecord }: DrugRegisterModalProps) {
  const [formData, setFormData] = useState({
    drug_name: '',
    expiry_date: '',
    quantity: '',
    date_received: '',
    unit_cost: '',
    withdrawal_period: '',
  });

  useEffect(() => {
    if (editRecord) {
      setFormData({
        drug_name: editRecord.drug_name,
        expiry_date: editRecord.expiry_date,
        quantity: editRecord.quantity,
        date_received: editRecord.date_received,
        unit_cost: editRecord.unit_cost,
        withdrawal_period: editRecord.withdrawal_period,
      });
    } else {
      setFormData({
        drug_name: '',
        expiry_date: '',
        quantity: '',
        date_received: '',
        unit_cost: '',
        withdrawal_period: '',
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
            {editRecord ? 'Edit Drug Record' : 'Add New Drug'}
          </Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color={Colors.neutral[600]} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          <TextField
            label="Drug Name"
            value={formData.drug_name}
            onChangeText={(text) => setFormData({ ...formData, drug_name: text })}
            placeholder="Enter drug name"
          />

          <TextField
            label="Expiry Date"
            value={formData.expiry_date}
            onChangeText={(text) => setFormData({ ...formData, expiry_date: text })}
            placeholder="YYYY-MM-DD"
          />

          <TextField
            label="Quantity"
            value={formData.quantity}
            onChangeText={(text) => setFormData({ ...formData, quantity: text })}
            placeholder="Enter quantity"
          />

          <TextField
            label="Date Received"
            value={formData.date_received}
            onChangeText={(text) => setFormData({ ...formData, date_received: text })}
            placeholder="YYYY-MM-DD"
          />

          <TextField
            label="Unit Cost ($)"
            value={formData.unit_cost}
            onChangeText={(text) => setFormData({ ...formData, unit_cost: text })}
            placeholder="Enter unit cost"
            keyboardType="numeric"
          />

          <TextField
            label="Withdrawal Period (days)"
            value={formData.withdrawal_period}
            onChangeText={(text) => setFormData({ ...formData, withdrawal_period: text })}
            placeholder="Enter withdrawal period"
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