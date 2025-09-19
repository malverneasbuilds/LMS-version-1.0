import React from 'react';
import { View, StyleSheet, Modal, ScrollView, TouchableOpacity } from 'react-native';
import { Text } from '../../typography/Text';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { X, TrendingUp, TrendingDown, Minus, Plus } from 'lucide-react-native';
import Colors from '../../../constants/Colors';

interface WeightRecord {
  id: string;
  animal_tag: string;
  weight_date: string;
  weight: number;
  notes: string;
}

interface AnimalWeightHistoryModalProps {
  visible: boolean;
  onClose: () => void;
  animalTag: string;
  weightRecords: WeightRecord[];
  onAddWeight: () => void;
}

export function AnimalWeightHistoryModal({ 
  visible, 
  onClose, 
  animalTag, 
  weightRecords,
  onAddWeight 
}: AnimalWeightHistoryModalProps) {
  // Sort records by date (newest first)
  const sortedRecords = weightRecords
    .filter(record => record.animal_tag === animalTag)
    .sort((a, b) => new Date(b.weight_date).getTime() - new Date(a.weight_date).getTime());

  // Calculate weight trends
  const getWeightTrend = (currentWeight: number, previousWeight: number) => {
    if (currentWeight > previousWeight) {
      return { icon: <TrendingUp size={16} color={Colors.success[500]} />, color: Colors.success[500] };
    } else if (currentWeight < previousWeight) {
      return { icon: <TrendingDown size={16} color={Colors.error[500]} />, color: Colors.error[500] };
    } else {
      return { icon: <Minus size={16} color={Colors.neutral[500]} />, color: Colors.neutral[500] };
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

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

        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text variant="caption" color="neutral.600">Total Records</Text>
              <Text variant="h6" weight="bold" color="primary.500">
                {sortedRecords.length}
              </Text>
            </View>
            {sortedRecords.length > 0 && (
              <View style={styles.summaryItem}>
                <Text variant="caption" color="neutral.600">Latest Weight</Text>
                <Text variant="h6" weight="bold">
                  {sortedRecords[0].weight} kg
                </Text>
              </View>
            )}
            {sortedRecords.length > 1 && (
              <View style={styles.summaryItem}>
                <Text variant="caption" color="neutral.600">Weight Change</Text>
                <View style={styles.trendContainer}>
                  {getWeightTrend(sortedRecords[0].weight, sortedRecords[1].weight).icon}
                  <Text 
                    variant="body2" 
                    weight="medium"
                    style={{ color: getWeightTrend(sortedRecords[0].weight, sortedRecords[1].weight).color }}
                  >
                    {Math.abs(sortedRecords[0].weight - sortedRecords[1].weight).toFixed(1)} kg
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>

        <ScrollView style={styles.content}>
          {sortedRecords.length > 0 ? (
            sortedRecords.map((record, index) => (
              <Card key={record.id} style={styles.recordCard}>
                <View style={styles.recordHeader}>
                  <View>
                    <Text variant="h6" weight="medium">
                      {record.weight} kg
                    </Text>
                    <Text variant="caption" color="neutral.600">
                      {formatDate(record.weight_date)}
                    </Text>
                  </View>
                  {index < sortedRecords.length - 1 && (
                    <View style={styles.trendIndicator}>
                      {getWeightTrend(record.weight, sortedRecords[index + 1].weight).icon}
                      <Text 
                        variant="caption"
                        style={{ 
                          color: getWeightTrend(record.weight, sortedRecords[index + 1].weight).color 
                        }}
                      >
                        {record.weight > sortedRecords[index + 1].weight ? '+' : ''}
                        {(record.weight - sortedRecords[index + 1].weight).toFixed(1)} kg
                      </Text>
                    </View>
                  )}
                </View>
                {record.notes && (
                  <Text variant="body2" color="neutral.600" style={styles.notes}>
                    {record.notes}
                  </Text>
                )}
              </Card>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text variant="h6" color="neutral.500">
                No weight records found
              </Text>
              <Text variant="body2" color="neutral.400" style={styles.emptyDescription}>
                Start tracking this animal's weight by adding the first record.
              </Text>
            </View>
          )}
        </ScrollView>

        <View style={styles.footer}>
          <Button
            variant="primary"
            onPress={onAddWeight}
            style={styles.addButton}
            startIcon={<Plus size={20} color={Colors.white} />}
          >
            Add Weight Record
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
  summaryCard: {
    backgroundColor: Colors.primary[50],
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.primary[100],
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  recordCard: {
    marginBottom: 12,
    padding: 16,
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  trendIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.neutral[50],
    padding: 8,
    borderRadius: 8,
  },
  notes: {
    marginTop: 8,
    fontStyle: 'italic',
  },
  emptyState: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyDescription: {
    textAlign: 'center',
    marginTop: 8,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral[200],
  },
  addButton: {
    width: '100%',
  },
});