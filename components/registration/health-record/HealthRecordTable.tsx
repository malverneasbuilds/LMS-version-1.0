import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from '../../typography/Text';
import { Card } from '../../ui/Card';
import { DataTable } from '../../tables/DataTable';
import { Button } from '../../ui/Button';
import { Plus, CreditCard as Edit, Trash2 } from 'lucide-react-native';
import Colors from '../../../constants/Colors';

interface HealthRecord {
  id: string;
  date: string;
  event_type: string;
  event: string;
  tag: string;
  diagnosis: string;
  treatment: string;
  drug_administering: string;
  special_notes: string;
  done_by: string;
}

interface HealthRecordTableProps {
  data: HealthRecord[];
  onAdd: () => void;
  onEdit: (record: HealthRecord) => void;
  onDelete: (id: string) => void;
}

export function HealthRecordTable({ data, onAdd, onEdit, onDelete }: HealthRecordTableProps) {
  const columns = [
    { key: 'date', title: 'Date', width: 100 },
    { key: 'event_type', title: 'Event Type', width: 100 },
    { key: 'event', title: 'Event', width: 120 },
    { key: 'tag', title: 'Tag', width: 80 },
    { key: 'diagnosis', title: 'Diagnosis', width: 120 },
    { key: 'treatment', title: 'Treatment', width: 120 },
    { key: 'drug_administering', title: 'Drug', width: 100 },
    { key: 'special_notes', title: 'Notes', width: 120 },
    { key: 'done_by', title: 'Done By', width: 100 },
    {
      key: 'actions',
      title: 'Actions',
      width: 120,
      render: (value: any, record: HealthRecord) => (
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
          Health Records
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