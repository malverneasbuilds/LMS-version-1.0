import React from 'react';
import { View, StyleSheet, Modal, ScrollView, TouchableOpacity } from 'react-native';
import { Text } from '../../typography/Text';
import { Card } from '../../ui/Card';
import { DataTable } from '../../tables/DataTable';
import { Button } from '../../ui/Button';
import { X, TrendingUp, TrendingDown, Minus } from 'lucide-react-native';
import Colors from '../../../constants/Colors';

interface WeightRecord {
  id: string;
  animal_tag: string;
  weight_date: string;
  weight: number;
  notes: string;
}

interface WeightHistoryModalProps {
  visible: boolean;
  onClose: () => void;
  animalTag: string;
  weightData: WeightRecord[];
}

export function WeightHistoryModal({ 
  visible, 
  onClose, 
  animalTag, 
  weightData 
}: WeightHistoryModalProps) {
  // Filter and sort weight records for the specific animal
  const animalWeights = weightData
    .filter(record => record.animal_tag === animalTag)
    .sort((a, b) => new Date(b.weight_date).getTime() - new Date(a.weight_date).getTime());

  // Calculate weight changes
  const weightsWithChanges = animalWeights.map((record, index) => {
    const previousRecord = animalWeights[index + 1];
    let weightChange = null;
    let changeIcon = null;
    let changeColor = Colors.neutral[500];

    if (previousRecord) {
      weightChange = record.weight - previousRecord.weight;
      if (weightChange > 0) {
        changeIcon = <TrendingUp size={14} color={Colors.success[500]} />;
        changeColor = Colors.success[500];
      } else if (weightChange < 0) {
        changeIcon = <TrendingDown size={14} color={Colors.error[500]} />;
        changeColor = Colors.error[500];
      } else {
        changeIcon = <Minus size={14} color={Colors.neutral[500]} />;
      }
    }

    return {
      ...record,
      weightChange,
      changeIcon,
      changeColor,
    };
  });

  const columns = [
    { key: 'weight_date', title: 'Date', width: 100 },
    { 
      key: 'weight', 
      title: 'Weight (kg)', 
      width: 100,
      render: (value: number) => (
        <Text variant="body2" weight="medium">{value} kg</Text>
      )
    },
    {
      key: 'weightChange',
      title: 'Change',
      width: 100,
      render: (value: number | null, record: any) => (
        <View style={styles.changeContainer}>
          {record.changeIcon}
          {value !== null && (
            <Text 
              variant="caption" 
              style={{ color: record.changeColor }}
            >
              {value > 0 ? '+' : ''}{value?.toFixed(1)} kg
            </Text>
          )}
        </View>
      )
    },
    { key: 'notes', title: 'Notes', width: 150 },
  ];

  // Calculate statistics
  const totalRecords = animalWeights.length;
  const latestWeight = animalWeights[0]?.weight || 0;
  const earliestWeight = animalWeights[animalWeights.length - 1]?.weight || 0;
  const totalWeightGain = latestWeight - earliestWeight;
  const averageWeight = animalWeights.reduce((sum, record) => sum + record.weight, 0) / totalRecords || 0;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text variant="h5" weight="medium">
            Weight History - {animalTag}
          </Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color={Colors.neutral[600]} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          {/* Statistics Cards */}
          <View style={styles.statsContainer}>
            <Card style={styles.statCard}>
              <Text variant="caption" color="neutral.600">Latest Weight</Text>
              <Text variant="h5" weight="bold" color="primary.500">
                {latestWeight} kg
              </Text>
            </Card>
            
            <Card style={styles.statCard}>
              <Text variant="caption" color="neutral.600">Total Gain</Text>
              <Text 
                variant="h5" 
                weight="bold" 
                color={totalWeightGain >= 0 ? 'success.500' : 'error.500'}
              >
                {totalWeightGain > 0 ? '+' : ''}{totalWeightGain.toFixed(1)} kg
              </Text>
            </Card>
            
            <Card style={styles.statCard}>
              <Text variant="caption" color="neutral.600">Average Weight</Text>
              <Text variant="h5" weight="bold" color="neutral.700">
                {averageWeight.toFixed(1)} kg
              </Text>
            </Card>
            
            <Card style={styles.statCard}>
              <Text variant="caption" color="neutral.600">Total Records</Text>
              <Text variant="h5" weight="bold" color="neutral.700">
                {totalRecords}
              </Text>
            </Card>
          </View>

          {/* Weight History Table */}
          <Card style={styles.tableCard}>
            <Text variant="h6" weight="medium" style={styles.tableTitle}>
              Monthly Weight Records
            </Text>
            {weightsWithChanges.length > 0 ? (
              <DataTable 
                columns={columns} 
                data={weightsWithChanges}
                emptyText="No weight records found for this animal"
              />
            ) : (
              <View style={styles.emptyState}>
                <Text variant="body" color="neutral.500">
                  No weight records found for {animalTag}
                </Text>
                <Text variant="body2" color="neutral.400" style={styles.emptySubtext}>
                  Add the first weight record to start tracking this animal's growth.
                </Text>
              </View>
            )}
          </Card>
        </ScrollView>

        <View style={styles.footer}>
          <Button variant="outline" onPress={onClose} style={styles.button}>
            Close
          </Button>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
  },
  closeButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    minWidth: 120,
    padding: 12,
    alignItems: 'center',
  },
  tableCard: {
    padding: 16,
  },
  tableTitle: {
    marginBottom: 16,
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  emptyState: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptySubtext: {
    textAlign: 'center',
    marginTop: 8,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral[200],
  },
  button: {
    width: '100%',
  },
});