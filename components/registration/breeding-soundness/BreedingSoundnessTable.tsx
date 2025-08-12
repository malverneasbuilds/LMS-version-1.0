import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from '../../typography/Text';
import { Card } from '../../ui/Card';
import { DataTable } from '../../tables/DataTable';
import { Button } from '../../ui/Button';
import { Plus, CreditCard as Edit, Trash2 } from 'lucide-react-native';
import Colors from '../../../constants/Colors';

interface BreedingSoundnessRecord {
  id: string;
  tag: string;
  age: number;
  pe: string;
  sperm_mortality: string;
  sperm_morphology: number;
  scrotal: number;
  libido: string;
  score: number;
  classification: string;
}

interface BreedingSoundnessTableProps {
  data: BreedingSoundnessRecord[];
  onAdd: () => void;
  onEdit: (record: BreedingSoundnessRecord) => void;
  onDelete: (id: string) => void;
}

export function BreedingSoundnessTable({ data, onAdd, onEdit, onDelete }: BreedingSoundnessTableProps) {
  const columns = [
    { key: 'tag', title: 'Tag', width: 80 },
    { key: 'age', title: 'Age', width: 60 },
    { key: 'pe', title: 'PE', width: 80 },
    { key: 'sperm_mortality', title: 'Sperm Mortality', width: 120 },
    { 
      key: 'sperm_morphology', 
      title: 'Sperm Morphology (%)', 
      width: 140,
      render: (value: number) => (
        <Text variant="caption">{value}%</Text>
      )
    },
    { 
      key: 'scrotal', 
      title: 'Scrotal (cm)', 
      width: 100,
      render: (value: number) => (
        <Text variant="caption">{value} cm</Text>
      )
    },
    { key: 'libido', title: 'Libido', width: 80 },
    { key: 'score', title: 'Score', width: 80 },
    { key: 'classification', title: 'Classification', width: 120 },
    {
      key: 'actions',
      title: 'Actions',
      width: 120,
      render: (value: any, record: BreedingSoundnessRecord) => (
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
          Bull Breeding Soundness Evaluation
        </Text>
        <Button
          variant="primary"
          size="sm"
          startIcon={<Plus size={16} color={Colors.white} />}
          onPress={onAdd}
        >
          Add Evaluation
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