import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from '../../typography/Text';
import { Card } from '../../ui/Card';
import { DataTable } from '../../tables/DataTable';
import { Button } from '../../ui/Button';
import { Plus, CreditCard as Edit, Trash2 } from 'lucide-react-native';
import Colors from '../../../constants/Colors';

interface WeightRecord {
  id: string;
  animal_tag: string;
  weight_date: string;
  weight: number;
  notes: string;
}

interface WeightRecordsTableProps {
  data: WeightRecord[];
  onAdd: () => void;
  onEdit: (record: WeightRecord) => void;
  onDelete: (id: string) => void;
}

export function WeightRecordsTable({ data, onAdd, onEdit, onDelete }: WeightRecordsTableProps) {
  const columns = [
    { key: 'animal_tag', title: 'Animal Tag', width: 100 },
    { key: 'weight_date', title: 'Date', width: 100 },
    { 
      key: 'weight', 
      title: 'Weight (kg)', 
      width: 100,
      render: (value: number) => (
        <Text variant="caption">{value} kg</Text>
      )
    },
    { key: 'notes', title: 'Notes', width: 150 },
    {
      key: 'actions',
      title: 'Actions',
      width: 120,
      render: (value: any, record: WeightRecord) => (
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
          Weight Records
        </Text>
        <Button
          variant="primary"
          size="sm"
          startIcon={<Plus size={16} color={Colors.white} />}
          onPress={onAdd}
        >
          Add Weight
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