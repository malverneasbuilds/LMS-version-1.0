import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from '../../typography/Text';
import { Card } from '../../ui/Card';
import { DataTable } from '../../tables/DataTable';
import { Button } from '../../ui/Button';
import { Plus, CreditCard as Edit, Trash2 } from 'lucide-react-native';
import Colors from '../../../constants/Colors';

interface MortalityRecord {
  id: string;
  animalTag: string;
  dateOfEvent: string;
  eventType: string;
  cause: string;
  weight: string;
  value: string;
  disposalMethod: string;
  notes: string;
}

interface MortalityRegisterTableProps {
  data: MortalityRecord[];
  onAdd: () => void;
  onEdit: (record: MortalityRecord) => void;
  onDelete: (id: string) => void;
}

export function MortalityRegisterTable({ data, onAdd, onEdit, onDelete }: MortalityRegisterTableProps) {
  const columns = [
    { key: 'animalTag', title: 'Animal Tag', width: 100 },
    { key: 'dateOfEvent', title: 'Date', width: 100 },
    { key: 'eventType', title: 'Type', width: 80 },
    { key: 'cause', title: 'Cause', width: 120 },
    { key: 'weight', title: 'Weight', width: 80 },
    { key: 'value', title: 'Value', width: 80 },
    { key: 'disposalMethod', title: 'Disposal', width: 100 },
    { key: 'notes', title: 'Notes', width: 120 },
    {
      key: 'actions',
      title: 'Actions',
      width: 120,
      render: (value: any, record: MortalityRecord) => (
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
          Cull & Mortality Register
        </Text>
        <Button
          variant="primary"
          size="sm"
          startIcon={<Plus size={16} color={Colors.white} />}
          onPress={onAdd}
        >
          Add Record
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