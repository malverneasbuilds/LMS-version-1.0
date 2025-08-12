import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from '../../typography/Text';
import { Card } from '../../ui/Card';
import { DataTable } from '../../tables/DataTable';
import { Button } from '../../ui/Button';
import { Plus, CreditCard as Edit, Trash2 } from 'lucide-react-native';
import Colors from '../../../constants/Colors';

interface CalfRecord {
  id: string;
  tag_number: string;
  age: number;
  sex: string;
  birth_weight: number;
  weaning_weight: number;
  weaning_date: string;
}

interface CalfRegisterTableProps {
  data: CalfRecord[];
  onAdd: () => void;
  onEdit: (record: CalfRecord) => void;
  onDelete: (id: string) => void;
}

export function CalfRegisterTable({ data, onAdd, onEdit, onDelete }: CalfRegisterTableProps) {
  const columns = [
    { key: 'tag_number', title: 'Tag #', width: 100 },
    { key: 'age', title: 'Age', width: 80 },
    { key: 'sex', title: 'Sex', width: 60 },
    { key: 'birth_weight', title: 'Birth Wt', width: 100 },
    { key: 'weaning_weight', title: 'Wean Wt', width: 100 },
    { key: 'weaning_date', title: 'Wean Date', width: 120 },
    {
      key: 'actions',
      title: 'Actions',
      width: 120,
      render: (value: any, record: CalfRecord) => (
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
          Calf Register
        </Text>
        <Button
          variant="primary"
          size="sm"
          startIcon={<Plus size={16} color={Colors.white} />}
          onPress={onAdd}
        >
          Add Calf
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