import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from '../../typography/Text';
import { Card } from '../../ui/Card';
import { DataTable } from '../../tables/DataTable';
import { Button } from '../../ui/Button';
import { Plus, CreditCard as Edit, Trash2 } from 'lucide-react-native';
import Colors from '../../../constants/Colors';

interface HeatDetectionRecord {
  id: string;
  tag: string;
  stock_type: string;
  body_condition_score: number;
  heat_detection_date: string;
  observer: string;
  serviced_date: string;
  breeding_status: string;
  breeding_method: string;
  ai_technician: string;
  sire_id_straw_id: string;
  semen_viability: string;
  return_to_heat_date_1: string;
  date_served: string;
  breeding_method_2: string;
  sire_used: string;
  return_to_heat_date_2: string;
}

interface HeatDetectionTableProps {
  data: HeatDetectionRecord[];
  onAdd: () => void;
  onEdit: (record: HeatDetectionRecord) => void;
  onDelete: (id: string) => void;
}

export function HeatDetectionTable({ data, onAdd, onEdit, onDelete }: HeatDetectionTableProps) {
  const columns = [
    { key: 'tag', title: 'Tag', width: 80 },
    { key: 'stock_type', title: 'Stock Type', width: 100 },
    { 
      key: 'body_condition_score', 
      title: 'BCS', 
      width: 60,
      render: (value: number) => (
        <Text variant="caption">{value}</Text>
      )
    },
    { key: 'heat_detection_date', title: 'Heat Date', width: 100 },
    { key: 'observer', title: 'Observer', width: 100 },
    { key: 'serviced_date', title: 'Serviced Date', width: 110 },
    { key: 'breeding_status', title: 'Breeding Status', width: 120 },
    { key: 'breeding_method', title: 'Method 1', width: 100 },
    { key: 'ai_technician', title: 'AI Tech', width: 100 },
    { key: 'sire_id_straw_id', title: 'Sire/Straw ID', width: 120 },
    { key: 'semen_viability', title: 'Semen Viability', width: 120 },
    { key: 'return_to_heat_date_1', title: 'Return Heat 1', width: 120 },
    { key: 'date_served', title: 'Date Served', width: 110 },
    { key: 'breeding_method_2', title: 'Method 2', width: 100 },
    { key: 'sire_used', title: 'Sire Used', width: 100 },
    { key: 'return_to_heat_date_2', title: 'Return Heat 2', width: 120 },
    {
      key: 'actions',
      title: 'Actions',
      width: 120,
      render: (value: any, record: HeatDetectionRecord) => (
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
          Heat Detection & Breeding Record
        </Text>
        <Button
          variant="primary"
          size="sm"
          startIcon={<Plus size={16} color={Colors.white} />}
          onPress={onAdd}
        >
          Add Record
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