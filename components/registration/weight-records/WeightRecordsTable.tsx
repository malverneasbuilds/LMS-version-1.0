import React from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Text } from '../../typography/Text';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Plus, Eye, Scale } from 'lucide-react-native';
import Colors from '../../../constants/Colors';
import { useHerd } from '../../../contexts/HerdContext';
import { useWeightRecords } from '../../../contexts/WeightRecordsContext';

interface WeightRecord {
  id: string;
  animal_tag: string;
  weight_date: string;
  weight: number;
  notes: string;
}

interface AnimalWeightSummary {
  tag_number: string;
  breed: string;
  sex: string;
  age: number;
  current_weight: number | null;
  last_weight_date: string | null;
}
interface WeightRecordsTableProps {
  data: WeightRecord[];
  onAdd: () => void;
  onEdit: (record: WeightRecord) => void;
  onDelete: (id: string) => void;
  onAddWeight?: (animalTag: string) => void;
  onViewWeights?: (animalTag: string) => void;
  onAddWeight: (animalTag: string) => void;
  onViewWeights: (animalTag: string) => void;
}

export function WeightRecordsTable({ 
  data, 
  onAdd, 
  onEdit, 
  onDelete, 
  onAddWeight, 
  onViewWeights 
}: WeightRecordsTableProps) {
  const { herdData } = useHerd();
  const { weightRecordsData } = useWeightRecords();

  // Helper function to calculate age from date of birth
  const calculateAge = (dateOfBirth: string): number => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  // Get current weight for each animal
  const getAnimalWeightSummary = (): AnimalWeightSummary[] => {
    return herdData.map(animal => {
      // Find the most recent weight record for this animal
      const animalWeights = weightRecordsData
        .filter(record => record.animal_tag === animal.tag_number)
        .sort((a, b) => new Date(b.weight_date).getTime() - new Date(a.weight_date).getTime());
      
      const latestWeight = animalWeights[0];
      
      return {
        tag_number: animal.tag_number,
        breed: animal.breed,
        sex: animal.sex,
        age: calculateAge(animal.date_of_birth),
        current_weight: latestWeight?.weight || null,
        last_weight_date: latestWeight?.weight_date || null,
      };
    });
  };

  const animalSummaries = getAnimalWeightSummary();

  return (
    <Card style={styles.container}>
      <View style={styles.header}>
        <Text variant="h6" weight="medium">
          Weight Records
        </Text>
        <Text variant="caption" color="neutral.600">
          {animalSummaries.length} animals tracked
        </Text>
      </View>
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.table}>
          {/* Header Row */}
          <View style={styles.headerRow}>
            <Text variant="caption" weight="medium" style={[styles.cell, styles.tagCell]}>
              Animal Tag
            </Text>
            <Text variant="caption" weight="medium" style={[styles.cell, styles.breedCell]}>
              Breed
            </Text>
            <Text variant="caption" weight="medium" style={[styles.cell, styles.sexCell]}>
              Sex
            </Text>
            <Text variant="caption" weight="medium" style={[styles.cell, styles.ageCell]}>
              Age
            </Text>
            <Text variant="caption" weight="medium" style={[styles.cell, styles.weightCell]}>
              Current Weight
            </Text>
            <Text variant="caption" weight="medium" style={[styles.cell, styles.dateCell]}>
              Last Recorded
            </Text>
            <Text variant="caption" weight="medium" style={[styles.cell, styles.actionsCell]}>
              Actions
            </Text>
          </View>

          {/* Data Rows */}
          {animalSummaries.map((animal, index) => (
            <View 
              key={animal.tag_number} 
              style={[
                styles.dataRow,
                index === animalSummaries.length - 1 && styles.lastRow
              ]}
            >
              <Text variant="body2" style={[styles.cell, styles.tagCell]}>
                {animal.tag_number}
              </Text>
              <Text variant="body2" style={[styles.cell, styles.breedCell]}>
                {animal.breed}
              </Text>
              <Text variant="body2" style={[styles.cell, styles.sexCell]}>
                {animal.sex}
              </Text>
              <Text variant="body2" style={[styles.cell, styles.ageCell]}>
                {animal.age}y
              </Text>
              <Text 
                variant="body2" 
                style={[styles.cell, styles.weightCell]}
                color={animal.current_weight ? 'neutral.800' : 'neutral.400'}
              >
                {animal.current_weight ? `${animal.current_weight} kg` : 'No data'}
              </Text>
              <Text 
                variant="caption" 
                style={[styles.cell, styles.dateCell]}
                color="neutral.600"
              >
                {animal.last_weight_date || 'Never'}
              </Text>
              <View style={[styles.cell, styles.actionsCell]}>
                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.addButton]}
                    onPress={() => onAddWeight(animal.tag_number)}
                  >
                    <Scale size={14} color={Colors.white} />
                    <Text variant="caption" color="white" style={styles.buttonText}>
                      Add
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.viewButton]}
                    onPress={() => onViewWeights(animal.tag_number)}
                  >
                    <Eye size={14} color={Colors.primary[500]} />
                    <Text variant="caption" color="primary.500" style={styles.buttonText}>
                      View
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
      
      {animalSummaries.length === 0 && (
        <View style={styles.emptyState}>
          <Text variant="body" color="neutral.500">
            No animals found. Add animals to the Herd Register first.
          </Text>
        </View>
      )}
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
  table: {
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    borderRadius: 8,
    overflow: 'hidden',
    minWidth: 800,
  },
  headerRow: {
    flexDirection: 'row',
    backgroundColor: Colors.neutral[100],
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
  },
  dataRow: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[100],
  },
  lastRow: {
    borderBottomWidth: 0,
  },
  cell: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    justifyContent: 'center',
  },
  tagCell: {
    width: 100,
  },
  breedCell: {
    width: 100,
  },
  sexCell: {
    width: 60,
  },
  ageCell: {
    width: 60,
  },
  weightCell: {
    width: 120,
  },
  dateCell: {
    width: 100,
  },
  actionsCell: {
    width: 160,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 4,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  addButton: {
    backgroundColor: Colors.primary[500],
  },
  viewButton: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.primary[500],
  },
  buttonText: {
    fontSize: 11,
  },
  emptyState: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
});