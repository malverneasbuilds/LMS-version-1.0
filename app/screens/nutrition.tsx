import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Package, ArrowRight } from 'lucide-react-native';
import { Text } from '../../components/typography/Text';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { Card } from '../../components/ui/Card';
import { DataTable } from '../../components/tables/DataTable';
import Colors from '../../constants/Colors';
import { Stack } from 'expo-router';

interface NutritionMetric {
  id: string;
  category: string;
  result: number | string;
  target: number | string;
  status: 'pass' | 'fail' | 'warning';
}

const nutritionMetrics: NutritionMetric[] = [
  {
    id: '1',
    category: 'Weight Gain Matrix',
    result: '0.8 kg/day',
    target: '1.0 kg/day',
    status: 'warning',
  },
  {
    id: '2',
    category: 'Body Condition Score',
    result: '3.5',
    target: '3.0-3.5',
    status: 'pass',
  },
  {
    id: '3',
    category: 'Nutritional Deficiencies',
    result: 'Moderate',
    target: 'Minimal',
    status: 'warning',
  },
  {
    id: '6',
    category: 'Feed Conversion Ratio',
    result: '6.5:1',
    target: '6.0:1',
    status: 'warning',
  },
  {
    id: '4',
    category: 'Growth Rate Perception',
    result: 'Good',
    target: 'Excellent',
    status: 'warning',
  },
  {
    id: '5',
    category: 'Nutritional Management',
    result: 'Structured',
    target: 'Structured',
    status: 'pass',
  },
];

const columns = [
  {
    key: 'category',
    title: 'Category',
    width: 150,
  },
  {
    key: 'result',
    title: 'Result',
    width: 100,
  },
  {
    key: 'target',
    title: 'Target',
    width: 100,
  },
  {
    key: 'status',
    title: 'Status',
    width: 80,
    align: 'center' as const,
    render: (value: string) => (
      <View
        style={[
          styles.statusIndicator,
          value === 'pass'
            ? styles.passStatus
            : value === 'warning'
            ? styles.warningStatus
            : styles.failStatus,
        ]}
      >
        <Text
          variant="caption"
          weight="medium"
          color={value === 'pass' ? 'success.700' : value === 'warning' ? 'warning.700' : 'error.700'}
        >
          {value.toUpperCase()}
        </Text>
      </View>
    ),
  },
];

export default function NutritionScreen() {
  return (
    <>
      <Stack.Screen
        options={{
          title: 'Nutrition',
        }}
      />
      <NutritionContent />
    </>
  );
}

function NutritionContent() {
  return (
    <ScreenContainer style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.card}>
          <Text variant="h5" weight="medium" style={styles.cardTitle}>
            Nutrition Assessment
          </Text>
          <Text variant="body" color="neutral.600" style={styles.cardDescription}>
            Review your livestock's nutritional metrics and make adjustments as needed.
          </Text>
          <View style={styles.tableContainer}>
            <DataTable columns={columns} data={nutritionMetrics} />
          </View>
        </Card>

        <Card style={{
          marginBottom: 16,
          borderRadius: 12,
          padding: 16,
          backgroundColor: Colors.primary[50],
          borderWidth: 1,
          borderColor: Colors.primary[100],
        }}>
          <View style={styles.inventoryHeader}>
            <View style={styles.inventoryTitleContainer}>
              <Package size={24} color={Colors.primary[500]} style={styles.inventoryIcon} />
              <Text variant="h5" weight="medium">
                Nutrition Inventory & Management
              </Text>
            </View>
            <TouchableOpacity 
              style={styles.inventoryButton}
              onPress={() => router.push('/(tabs)/tasks')}
            >
              <Text variant="button" color="primary.500">View Inventory</Text>
              <ArrowRight size={20} color={Colors.primary[500]} />
            </TouchableOpacity>
          </View>
          <Text variant="body2" color="neutral.600" style={styles.inventoryDescription}>
            Track and manage your feed inventory, monitor consumption rates, and plan feed requirements.
          </Text>
        </Card>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral[50],
  },
  content: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
  },

  inventoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  inventoryTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  inventoryIcon: {
    marginRight: 12,
  },
  inventoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.primary[200],
  },
  inventoryDescription: {
    marginTop: 8,
    lineHeight: 20,
  },
  cardTitle: {
    marginBottom: 8,
  },
  cardDescription: {
    marginBottom: 16,
  },
  tableContainer: {
    marginTop: 8,
  },
  statusIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  passStatus: {
    backgroundColor: Colors.success[100],
  },
  warningStatus: {
    backgroundColor: Colors.warning[100],
  },
  failStatus: {
    backgroundColor: Colors.error[100],
  },
});