import React from 'react';
import { View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Text } from '../../typography/Text';
import { Card } from '../../ui/Card';
import { DataTable } from '../../tables/DataTable';
import { Button } from '../../ui/Button';
import { Plus, Eye, Scale } from 'lucide-react-native';
import Colors from '../../../constants/Colors';
import { useHerd } from '../../../contexts/HerdContext';

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
  onAddWeight: (animalTag: string) => void;
  onViewAllWeights: (animalTag: string) => void;
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

// Helper function to determine stock type based on sex and age
function getStockType(animal: any): string {
  const age = calculateAge(animal.date_of_birth);
  
  if (animal.sex === 'female') {
    if (age < 2) return 'Female Calf';
    if (age < 3) return 'Heifer';
    return 'Cow';
  } else {
    if (age < 2) return 'Male Calf';
    if (age < 3) return 'Steer';
    return 'Bull';
  }
}

// Helper function to get latest weight for an animal
function getLatestWeight(animalTag: string, weightData: WeightRecord[]): number | null {
  const animalWeights = weightData
    .filter(record => record.animal_tag === animalTag)
    .sort((a, b) => new Date(b.weight_date).getTime() - new Date(a.weight_date).getTime());
  
  return animalWeights.length > 0 ? animalWeights[0].weight : null;
}

export function WeightRecordsTable({ 
  data, 
  onAdd, 
  onEdit, 
  onDelete, 
  onAddWeight, 
  onViewAllWeights 
}: WeightRecordsTableProps) {
  const { herdData } = useHerd();

  // Create table data by combining herd data with weight records
  const tableData = herdData.map(animal => {
    const latestWeight = getLatestWeight(animal.tag_number, data);
    const stockType = getStockType(animal);
    
    return {
      id: animal.id,
      animal_tag: animal.tag_number,
      breed: animal.breed,
      stock_type: stockType,
      current_weight: latestWeight,
      age: calculateAge(animal.date_of_birth),
    };
  });

  const columns = [
    { key: 'animal_tag', title: 'Animal ID/Tag', width: 120 },
    { key: 'breed', title: 'Breed', width: 100 },
    { key: 'stock_type', title: 'Stock Type', width: 120 },
    { 
      key: 'current_weight', 
      title: 'Current Weight (kg)', 
      width: 140,
      render: (value: number | null) => (
        <Text variant="caption" color={value ? 'neutral.900' : 'neutral.400'}>
          {value ? `${value} kg` : 'No data'}
        </Text>
      )
    },
    { 
      key: 'age', 
      title: 'Age (years)', 
      width: 100,
      render: (value: number) => (
        <Text variant="caption">{value} years</Text>
      )
    },
    {
      key: 'actions',
      title: 'Actions',
      width: 200,
      render: (value: any, record: any) => (
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.addWeightButton]}
            onPress={() => onAddWeight(record.animal_tag)}
          >
            <Scale size={14} color={Colors.white} />
            <Text variant="caption" color="white" style={styles.buttonText}>
              Add Weight
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.viewButton]}
            onPress={() => onViewAllWeights(record.animal_tag)}
          >
            <Eye size={14} color={Colors.primary[500]} />
            <Text variant="caption" color="primary.500" style={styles.buttonText}>
              View All
            </Text>
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
        <Text variant="body2" color="neutral.600" style={styles.description}>
          All animals from Herd Register are automatically included
        </Text>
      </View>
      <DataTable columns={columns} data={tableData} />
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  header: {
    marginBottom: 16,
  },
  description: {
    marginTop: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 6,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    gap: 4,
  },
  addWeightButton: {
    backgroundColor: Colors.primary[500],
  },
  viewButton: {
    backgroundColor: Colors.primary[50],
    borderWidth: 1,
    borderColor: Colors.primary[200],
  },
  buttonText: {
    fontSize: 11,
  },
});