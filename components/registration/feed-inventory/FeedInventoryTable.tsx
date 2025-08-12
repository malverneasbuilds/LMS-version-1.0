import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from '../../typography/Text';
import { Card } from '../../ui/Card';
import { DataTable } from '../../tables/DataTable';
import { Button } from '../../ui/Button';
import { Plus, CreditCard as Edit, Trash2 } from 'lucide-react-native';
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

interface FeedInventoryTableProps {
  data: FeedInventoryRecord[];
  onAdd: () => void;
  onEdit: (record: FeedInventoryRecord) => void;
  onDelete: (id: string) => void;
}

export function FeedInventoryTable({ data, onAdd, onEdit, onDelete }: FeedInventoryTableProps) {
  const columns = [
    { key: 'feed_type', title: 'Feed Type', width: 120 },
    { key: 'brand', title: 'Brand', width: 100 },
    { key: 'date_received', title: 'Date Received', width: 120 },
    { key: 'expiry_date', title: 'Expiry Date', width: 120 },
    { 
      key: 'current_stock', 
      title: 'Current Stock (kg)', 
      width: 140,
      render: (value: number) => (
        <Text variant="caption">{value} kg</Text>
      )
    },
    { 
      key: 'total_price', 
      title: 'Total Price ($)', 
      width: 120,
      render: (value: number) => (
        <Text variant="caption">${value.toFixed(2)}</Text>
      )
    },
    {
      key: 'actions',
      title: 'Actions',
      width: 120,
      render: (value: any, record: FeedInventoryRecord) => (
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
          Feed Inventory
        </Text>
        <Button
          variant="primary"
          size="sm"
          startIcon={<Plus size={16} color={Colors.white} />}
          onPress={onAdd}
        >
          Add Feed
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