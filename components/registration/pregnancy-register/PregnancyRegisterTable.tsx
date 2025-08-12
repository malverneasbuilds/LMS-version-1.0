import React from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Text } from '../../typography/Text';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Plus, CreditCard as Edit, Trash2 } from 'lucide-react-native';
import Colors from '../../../constants/Colors';

interface PregnancyRecord {
  id: string;
  year_number: number;
  prebreeding_bcs: number;
  last_service_date: string;
  first_pd: string;
  second_pd: string;
  third_pd: string;
  gestation_period: number;
  expected_calving_date: string;
  actual_calving_date: string;
}

interface PregnancyRegisterTableProps {
  data: PregnancyRecord[];
  onAdd: () => void;
  onEdit: (record: PregnancyRecord) => void;
  onDelete: (id: string) => void;
}

export function PregnancyRegisterTable({ data, onAdd, onEdit, onDelete }: PregnancyRegisterTableProps) {
  const renderTable = () => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View style={styles.table}>
        {/* Header Row */}
        <View style={styles.headerRow}>
          <View style={[styles.cell, styles.rowHeaderCell]}>
            <Text variant="caption" weight="medium" color="neutral.600">
              Metric
            </Text>
          </View>
          {data.map((record) => (
            <View key={record.id} style={[styles.cell, styles.yearHeaderCell]}>
              <Text variant="caption" weight="medium" color="neutral.600">
                Year {record.year_number}
              </Text>
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => onEdit(record)}
                >
                  <Edit size={12} color={Colors.primary[500]} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => onDelete(record.id)}
                >
                  <Trash2 size={12} color={Colors.error[500]} />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* Data Rows */}
        {[
          { key: 'prebreeding_bcs', label: 'Prebreeding BCS' },
          { key: 'last_service_date', label: 'Last Service Date' },
          { key: 'first_pd', label: '1PD' },
          { key: 'second_pd', label: '2PD' },
          { key: 'third_pd', label: '3PD' },
          { key: 'gestation_period', label: 'Gestation Period' },
          { key: 'expected_calving_date', label: 'Expected Calving Date' },
          { key: 'actual_calving_date', label: 'Actual Calving Date' },
        ].map((row) => (
          <View key={row.key} style={styles.dataRow}>
            <View style={[styles.cell, styles.rowHeaderCell]}>
              <Text variant="caption" weight="medium">
                {row.label}
              </Text>
            </View>
            {data.map((record) => (
              <View key={`${record.id}-${row.key}`} style={styles.cell}>
                <Text variant="caption">
                  {record[row.key as keyof PregnancyRecord] || '-'}
                </Text>
              </View>
            ))}
          </View>
        ))}
      </View>
    </ScrollView>
  );

  return (
    <Card style={styles.container}>
      <View style={styles.header}>
        <Text variant="h6" weight="medium">
          Pregnancy & Calving Register
        </Text>
        <Button
          variant="primary"
          size="sm"
          startIcon={<Plus size={16} color={Colors.white} />}
          onPress={onAdd}
        >
          Add Year
        </Button>
      </View>
      {data.length > 0 ? (
        renderTable()
      ) : (
        <View style={styles.emptyState}>
          <Text variant="body" color="neutral.500">
            No pregnancy records found. Add a year to get started.
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
  },
  headerRow: {
    flexDirection: 'row',
    backgroundColor: Colors.neutral[100],
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
  },
  dataRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[100],
  },
  cell: {
    padding: 12,
    minWidth: 120,
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: Colors.neutral[200],
  },
  rowHeaderCell: {
    backgroundColor: Colors.neutral[50],
    minWidth: 160,
  },
  yearHeaderCell: {
    alignItems: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 4,
  },
  actionButton: {
    padding: 2,
  },
  emptyState: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
});