import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Text } from '../../typography/Text';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Picker } from '../../inputs/Picker';
import { Plus, Utensils, Calculator, TrendingUp, Calendar } from 'lucide-react-native';
import Colors from '../../../constants/Colors';
import { useHerd } from '../../../contexts/HerdContext';
import { useWeightRecords } from '../../../contexts/WeightRecordsContext';
import { useAnimalFeedIntake } from '../../../contexts/AnimalFeedIntakeContext';
import { useAnimalFCR } from '../../../contexts/AnimalFCRContext';
import { AnimalFeedIntakeModal } from '../animal-feed-intake/AnimalFeedIntakeModal';

interface AnimalFCRSummary {
  animal_tag: string;
  breed: string;
  sex: string;
  age: number;
  total_feed_consumed: number;
  weight_gain: number;
  fcr: number;
  period_start: string | null;
  period_end: string | null;
}

interface AnimalFCRTableProps {
  onAddFeedIntake: (animalTag: string) => void;
}

export function AnimalFCRTable({ onAddFeedIntake }: AnimalFCRTableProps) {
  const { herdData } = useHerd();
  const { getAnimalWeightHistory } = useWeightRecords();
  const { getTotalFeedConsumed, addRecord: addFeedIntakeRecord } = useAnimalFeedIntake();
  const { animalFCRData, calculateAndStoreFCR, getAnimalFCR, getAverageHerdFCR } = useAnimalFCR();
  const [feedIntakeModalVisible, setFeedIntakeModalVisible] = useState(false);
  const [selectedAnimal, setSelectedAnimal] = useState<string>('');
  const [periodMonths, setPeriodMonths] = useState(6); // Default to 6 months

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

  // Calculate FCR data for all animals
  const getAnimalFCRSummaries = (): AnimalFCRSummary[] => {
    return herdData.map(animal => {
      // Get stored FCR record for this animal
      const fcrRecord = getAnimalFCR(animal.tag_number, periodMonths);

      return {
        animal_tag: animal.tag_number,
        breed: animal.breed,
        sex: animal.sex,
        age: calculateAge(animal.date_of_birth),
        total_feed_consumed: fcrRecord?.total_feed_consumed || 0,
        weight_gain: fcrRecord?.total_weight_gain || 0,
        fcr: fcrRecord?.fcr_value || 0,
        period_start: fcrRecord?.period_start_date || null,
        period_end: fcrRecord?.period_end_date || null,
      };
    });
  };


  // Calculate average FCR for animals with valid data
  const validFCRs = animalFCRData.filter(animal => animal.fcr > 0 && animal.fcr < 50); // Filter out unrealistic FCRs
  const averageFCR = getAverageHerdFCR(periodMonths);

  const handleAddFeedIntake = (animalTag: string) => {
    setSelectedAnimal(animalTag);
    setFeedIntakeModalVisible(true);
  };

  const handleCalculateFCR = async (animalTag: string) => {
    try {
      await calculateAndStoreFCR(animalTag, periodMonths);
    } catch (error) {
      console.error('Error calculating FCR:', error);
      alert('Error calculating FCR. Please ensure the animal has both weight records and feed intake data.');
    }
  };

  const handleSaveFeedIntake = async (record: any) => {
    try {
      await addFeedIntakeRecord(record);
      // Auto-calculate FCR after adding feed intake
      await handleCalculateFCR(record.animal_tag);
      setFeedIntakeModalVisible(false);
    } catch (error) {
      console.error('Error saving feed intake:', error);
    }
  };

  const getFCRColor = (fcr: number): string => {
    if (fcr === 0) return Colors.neutral[400];
    if (fcr <= 6) return Colors.success[500]; // Good FCR
    if (fcr <= 8) return Colors.warning[500]; // Average FCR
    return Colors.error[500]; // Poor FCR
  };

  const periodOptions = [
    { label: '3 Months', value: '3' },
    { label: '6 Months', value: '6' },
    { label: '12 Months', value: '12' },
    { label: '24 Months', value: '24' },
  ];

  return (
    <>
      <Card style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text variant="h6" weight="medium">
              Animal Feed Conversion Ratio (FCR)
            </Text>
            <Text variant="caption" color="neutral.600">
              Average FCR: {averageFCR.toFixed(2)} | {validFCRs.length} animals with data
            </Text>
          </View>
          <View style={styles.headerControls}>
            <View style={styles.periodSelector}>
              <Picker
                label=""
                value={periodMonths.toString()}
                onValueChange={(value) => setPeriodMonths(parseInt(value))}
                items={periodOptions}
                style={styles.periodPicker}
              />
            </View>
          </View>
        </View>

        <View style={styles.summaryCards}>
          <View style={styles.summaryCard}>
            <Calculator size={20} color={Colors.primary[500]} />
            <View style={styles.summaryText}>
              <Text variant="h6" weight="bold" color="primary.500">
                {averageFCR.toFixed(2)}
              </Text>
              <Text variant="caption" color="neutral.600">
                Average FCR
              </Text>
            </View>
          </View>
          <View style={styles.summaryCard}>
            <TrendingUp size={20} color={Colors.success[500]} />
            <View style={styles.summaryText}>
              <Text variant="h6" weight="bold" color="success.500">
                {validFCRs.filter(a => a.fcr <= 6).length}
              </Text>
              <Text variant="caption" color="neutral.600">
                Efficient Animals
              </Text>
            </View>
          </View>
          <View style={styles.summaryCard}>
            <Calendar size={20} color={Colors.warning[500]} />
            <View style={styles.summaryText}>
              <Text variant="h6" weight="bold" color="warning.500">
                {periodMonths}M
              </Text>
              <Text variant="caption" color="neutral.600">
                Period
              </Text>
            </View>
          </View>
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
              <Text variant="caption" weight="medium" style={[styles.cell, styles.feedCell]}>
                Feed Consumed (kg)
              </Text>
              <Text variant="caption" weight="medium" style={[styles.cell, styles.gainCell]}>
                Weight Gain (kg)
              </Text>
              <Text variant="caption" weight="medium" style={[styles.cell, styles.fcrCell]}>
                FCR
              </Text>
              <Text variant="caption" weight="medium" style={[styles.cell, styles.periodCell]}>
                Period
              </Text>
              <Text variant="caption" weight="medium" style={[styles.cell, styles.actionsCell]}>
                Actions
              </Text>
            </View>

            {/* Data Rows */}
            {animalFCRData.map((animal, index) => (
              <View 
                key={animal.animal_tag} 
                style={[
                  styles.dataRow,
                  index === animalFCRData.length - 1 && styles.lastRow
                ]}
              >
                <Text variant="body2" style={[styles.cell, styles.tagCell]}>
                  {animal.animal_tag}
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
                  style={[styles.cell, styles.feedCell]}
                  color={animal.total_feed_consumed > 0 ? 'neutral.800' : 'neutral.400'}
                >
                  {animal.total_feed_consumed > 0 ? animal.total_feed_consumed.toFixed(1) : 'No data'}
                </Text>
                <Text 
                  variant="body2" 
                  style={[styles.cell, styles.gainCell]}
                  color={animal.weight_gain > 0 ? 'success.600' : animal.weight_gain < 0 ? 'error.600' : 'neutral.400'}
                >
                  {animal.weight_gain !== 0 ? animal.weight_gain.toFixed(1) : 'No data'}
                </Text>
                <Text 
                  variant="body2" 
                  style={[styles.cell, styles.fcrCell]}
                  color={getFCRColor(animal.fcr)}
                  weight={animal.fcr > 0 ? 'medium' : 'regular'}
                >
                  {animal.fcr > 0 ? animal.fcr.toFixed(2) : '-'}
                </Text>
                <Text variant="caption" style={[styles.cell, styles.periodCell]} color="neutral.600">
                  {animal.period_start && animal.period_end 
                    ? `${animal.period_start} to ${animal.period_end}`
                    : 'No data'
                  }
                </Text>
                <View style={[styles.cell, styles.actionsCell]}>
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: Colors.primary[500] }]}
                    onPress={() => handleAddFeedIntake(animal.animal_tag)}
                  >
                    <Utensils size={14} color={Colors.white} />
                    <Text variant="caption" color="white" style={styles.buttonText}>
                      Add Feed
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.calculateButton]}
                    onPress={() => handleCalculateFCR(animal.animal_tag)}
                  >
                    <Calculator size={14} color={Colors.white} />
                    <Text variant="caption" color="white" style={styles.buttonText}>
                      Calc FCR
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
        
        {animalFCRData.length === 0 && (
          <View style={styles.emptyState}>
            <Text variant="body" color="neutral.500">
              No animals found. Add animals to the Herd Register first.
            </Text>
          </View>
        )}
      </Card>

      <AnimalFeedIntakeModal
        visible={feedIntakeModalVisible}
        onClose={() => setFeedIntakeModalVisible(false)}
        onSave={handleSaveFeedIntake}
        preselectedAnimal={selectedAnimal}
      />
    </>
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
  headerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  periodSelector: {
    minWidth: 120,
  },
  periodPicker: {
    marginBottom: 0,
  },
  summaryCards: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.neutral[50],
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  summaryText: {
    alignItems: 'center',
  },
  table: {
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    borderRadius: 8,
    overflow: 'hidden',
    minWidth: 1000,
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
  feedCell: {
    width: 120,
  },
  gainCell: {
    width: 120,
  },
  fcrCell: {
    width: 80,
  },
  periodCell: {
    width: 200,
  },
  actionsCell: {
    width: 120,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 4,
    marginBottom: 2,
  },
  calculateButton: {
    backgroundColor: Colors.success[500],
  },
  buttonText: {
    fontSize: 10,
  },
  emptyState: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
});