import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from '../../typography/Text';
import { Card } from '../../ui/Card';
import { DataTable } from '../../tables/DataTable';
import { Button } from '../../ui/Button';
import { Plus, CreditCard as Edit, Trash2 } from 'lucide-react-native';
import Colors from '../../../constants/Colors';

interface HerdRecord {
  id: string;
  tag_number: string;
  breed: string;
  date_of_birth: string;
  sex: string;
}

interface HerdRegisterTableProps {
  data: HerdRecord[];
  onAdd: () => void;
  onEdit: (record: HerdRecord) => void;
  onDelete: (id: string) => void;
}

// Helper function to calculate age from date of birth
function calculateAge(dateOfBirth: string): number {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
}

export function HerdRegisterTable({ data, onAdd, onEdit, onDelete }: HerdRegisterTableProps) {
  const columns = [
    { key: 'tag_number', title: 'Tag #', width: 100 },
    { key: 'breed', title: 'Breed', width: 100 },
    { key: 'stock_type', title: 'Stock Type', width: 100 },
    { key: 'source', title: 'Source', width: 120 },
    { 
      key: 'date_of_birth', 
      title: 'Age', 
      width: 80,
      render: (value: string) => (
        <Text variant="caption">{calculateAge(value)} years</Text>
      )
    },
    { key: 'sex', title: 'Sex', width: 60 },
    {
      key: 'actions',
      title: 'Actions',
      width: 120,
      render: (value: any, record: HerdRecord) => (
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
          Herd Register
        </Text>
        <Button
          variant="primary"
          size="sm"
          startIcon={<Plus size={16} color={Colors.white} />}
          onPress={onAdd}
        >
          Add Animal
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