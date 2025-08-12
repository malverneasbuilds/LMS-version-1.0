import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from '../../typography/Text';
import { Card } from '../../ui/Card';
import { DataTable } from '../../tables/DataTable';
import { Button } from '../../ui/Button';
import { Plus, CreditCard as Edit, Trash2 } from 'lucide-react-native';
import Colors from '../../../constants/Colors';

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

interface SalesRegisterTableProps {
  data: SalesRecord[];
  onAdd: () => void;
  onEdit: (record: SalesRecord) => void;
  onDelete: (id: string) => void;
}

export function SalesRegisterTable({ data, onAdd, onEdit, onDelete }: SalesRegisterTableProps) {
  const columns = [
    { key: 'animal_tag', title: 'Animal Tag', width: 100 },
    { key: 'transaction_date', title: 'Date', width: 100 },
    { key: 'transaction_type', title: 'Type', width: 80 },
    { key: 'buyer_seller', title: 'Buyer/Seller', width: 120 },
    { 
      key: 'weight', 
      title: 'Weight (kg)', 
      width: 100,
      render: (value: number) => (
        <Text variant="caption">{value} kg</Text>
      )
    },
    { 
      key: 'price_per_kg', 
      title: 'Price/kg', 
      width: 100,
      render: (value: number) => (
        <Text variant="caption">${value.toFixed(2)}</Text>
      )
    },
    { 
      key: 'total_price', 
      title: 'Total', 
      width: 100,
      render: (value: number) => (
        <Text variant="caption">${value.toFixed(2)}</Text>
      )
    },
    { key: 'payment_method', title: 'Payment', width: 100 },
    {
      key: 'actions',
      title: 'Actions',
      width: 120,
      render: (value: any, record: SalesRecord) => (
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => onEdit(record)}
          >
            <Edit size={16} color={Colors.primary[500]} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => onDelete(record.id)}
          >
            <Trash2 size={16} color={Colors.error[500]} />
          </TouchableOpacity>
        </View>
      ),
    },
  ];

  return (
    <Card style={styles.container}>
      <View style={styles.header}>
        <Text variant="h6" weight="medium">
          Sales & Purchases Register
        </Text>
        <Button
          variant="primary"
          size="sm"
          startIcon={<Plus size={16} color={Colors.white} />}
          onPress={onAdd}
        >
          Add Transaction
        </Button>
      </View>
      <DataTable columns={columns} data={data} />
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 4,
  },
});