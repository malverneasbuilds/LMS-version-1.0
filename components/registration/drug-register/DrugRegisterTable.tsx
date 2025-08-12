import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from '../../typography/Text';
import { Card } from '../../ui/Card';
import { DataTable } from '../../tables/DataTable';
import { Button } from '../../ui/Button';
import { Plus, CreditCard as Edit, Trash2 } from 'lucide-react-native';
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

interface DrugRegisterTableProps {
  data: DrugRecord[];
  onAdd: () => void;
  onEdit: (record: DrugRecord) => void;
  onDelete: (id: string) => void;
}

export function DrugRegisterTable({ data, onAdd, onEdit, onDelete }: DrugRegisterTableProps) {
  const columns = [
    { key: 'drug_name', title: 'Drug Name', width: 140 },
    { key: 'expiry_date', title: 'Expiry', width: 100 },
    { key: 'quantity', title: 'Quantity', width: 80 },
    { key: 'date_received', title: 'Received', width: 100 },
    { key: 'unit_cost', title: 'Unit Cost', width: 100 },
    { key: 'withdrawal_period', title: 'Withdrawal', width: 100 },
    {
      key: 'actions',
      title: 'Actions',
      width: 120,
      render: (value: any, record: DrugRecord) => (
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
          Drug Register
        </Text>
        <Button
          variant="primary"
          size="sm"
          startIcon={<Plus size={16} color={Colors.white} />}
          onPress={onAdd}
        >
          Add Drug
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