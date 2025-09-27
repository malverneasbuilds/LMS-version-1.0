import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text } from '../../components/typography/Text';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { Card } from '../../components/ui/Card';
import { ProgressIndicator } from '../../components/metrics/ProgressIndicator';
import { PieChart } from '../../components/charts/PieChart';
import { ArrowRight, Package, TrendingUp, Scale, Activity } from 'lucide-react-native';
import Colors from '../../constants/Colors';
import { Stack, router } from 'expo-router';
import { useHerd } from '../../contexts/HerdContext';
import { useCalf } from '../../contexts/CalfContext';
import { useHealthRecord } from '../../contexts/HealthRecordContext';
import { useFeedInventory } from '../../contexts/FeedInventoryContext';
import { useWeightRecords } from '../../contexts/WeightRecordsContext';
import { useAnimalFeedIntake } from '../../contexts/AnimalFeedIntakeContext';
import { 
  calculateDLWG, 
  calculateADG, 
  calculateAverageBCS,
  calculateAverageWGM,
  getPerformanceColor 
} from '../../utils/calculations';

interface NutritionMetric {
  title: string;
  value: number;
  target: number;
  unit: string;
  description: string;
}

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
  const { herdData } = useHerd();
  const { calfData } = useCalf();
  const { healthRecordData } = useHealthRecord();
  const { feedInventoryData, feedConsumptionData } = useFeedInventory();
  const { weightRecordsData } = useWeightRecords();
  const { animalFeedIntakeData } = useAnimalFeedIntake();

  // Calculate total weight gain from all animals in the last 12 months
  const calculateTotalWeightGain = (): number => {
    const currentDate = new Date();
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(currentDate.getFullYear() - 1);
    
    let totalWeightGain = 0;
    
    // Group weight records by animal
    const animalWeights: { [key: string]: any[] } = {};
    weightRecordsData.forEach(record => {
      if (!animalWeights[record.animal_tag]) {
        animalWeights[record.animal_tag] = [];
      }
      animalWeights[record.animal_tag].push(record);
    });
    
    // Calculate weight gain for each animal in the last 12 months
    Object.values(animalWeights).forEach(records => {
      // Filter records from the last 12 months
      const recentRecords = records.filter(record => {
        const recordDate = new Date(record.weight_date);
        return recordDate >= oneYearAgo && recordDate <= currentDate;
      });
      
      if (recentRecords.length >= 2) {
        // Sort by date
        recentRecords.sort((a, b) => new Date(a.weight_date).getTime() - new Date(b.weight_date).getTime());
        
        // Calculate weight gain from first to last record in the period
        const firstRecord = recentRecords[0];
        const lastRecord = recentRecords[recentRecords.length - 1];
        const weightGain = lastRecord.weight - firstRecord.weight;
        
        if (weightGain > 0) {
          totalWeightGain += weightGain;
        }
      }
    });
    
    // If no weight records available, estimate based on herd size and average daily gain
    if (totalWeightGain === 0 && herdData.length > 0) {
      const estimatedDailyGain = 0.8; // kg per day per animal
      const daysInYear = 365;
      totalWeightGain = estimatedDailyGain * daysInYear * herdData.length;
    }
    
    return totalWeightGain;
  };

  // Calculate total feed consumption from all feed types in the last 12 months
  const calculateTotalFeedConsumption = (): number => {
    const currentDate = new Date();
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(currentDate.getFullYear() - 1);
    
    // Filter consumption records from the last 12 months
    const recentConsumption = feedConsumptionData.filter(record => {
      const consumptionDate = new Date(record.consumption_date);
      return consumptionDate >= oneYearAgo && consumptionDate <= currentDate;
    });
    
    // Sum all consumption amounts
    return recentConsumption.reduce((total, record) => total + record.amount_consumed, 0);
  };

  // Calculate Feed Conversion Ratio (FCR)
  const calculateFCR = (): number => {
    // Calculate average FCR from weight records
    const validFCRs = weightRecordsData
      .filter(record => record.fcr && record.fcr > 0 && record.fcr < 50) // Filter out invalid FCRs
      .map(record => record.fcr);
    
    return validFCRs.length > 0 ? validFCRs.reduce((sum, fcr) => sum + fcr, 0) / validFCRs.length : 0;
  };

  // Calculate nutrition metrics from actual data
  const calculateNutritionMetrics = (): NutritionMetric[] => {
    const wgm = calculateAverageWGM(weightRecordsData, herdData);
    const adg = calculateADG(calfData);
    const avgBCS = calculateAverageBCS(healthRecordData);
    const fcr = calculateFCR();
    
    // Calculate totals for display purposes
    const totalFeedConsumed = animalFeedIntakeData.reduce((sum, record) => sum + record.amount_consumed, 0);
    const totalWeightGain = calculateTotalWeightGain();

    return [
      {
        title: 'Weight Gain Metrics (WGM)',
        value: wgm,
        target: 1.0,
        unit: 'ratio',
        description: 'DLWG/ADG ratio - measures weight gain efficiency across all animals',
      },
      {
        title: 'Average Daily Gain (ADG)',
        value: adg,
        target: 1.5,
        unit: 'kg/day',
        description: 'Average daily gain for calves from birth to weaning',
      },
      {
        title: 'Feed Conversion Ratio (FCR)',
        value: fcr,
        target: 6.0,
        unit: 'ratio',
        description: 'Average FCR across all animals over 6 months - lower is better (6.0 or less is good)',
      },
      {
        title: 'Average Body Condition Score',
        value: avgBCS,
        target: 3.5,
        unit: '/5',
        description: 'Overall body condition of the herd',
      },
      {
        title: 'Feed Cost per kg Gain',
        value: totalFeedConsumed > 0 && totalWeightGain > 0 ? 
          (feedInventoryData.reduce((sum, item) => sum + item.total_price, 0) / totalWeightGain) : 0,
        target: 8.0,
        unit: '$/kg',
        description: 'Cost efficiency of feed conversion',
      },
      {
        title: 'Total Feed Consumed',
        value: totalFeedConsumed,
        target: herdData.length * 365 * 8, // 8kg per animal per day target
        unit: 'kg/year',
        description: 'Total feed consumption in the last 12 months',
      },
    ];
  };

  const nutritionMetrics = calculateNutritionMetrics();

  // Calculate feed distribution for pie chart
  const feedDistribution = feedInventoryData
    .filter(item => item.current_stock > 0)
    .map((item, index) => ({
      name: item.feed_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      population: item.current_stock,
      color: [
        Colors.primary[500], 
        Colors.success[500], 
        Colors.warning[500], 
        Colors.error[500], 
        Colors.secondary[500],
        Colors.accent[500]
      ][index % 6],
      legendFontColor: Colors.neutral[700],
    }));

  // Calculate feed consumption by category
  const feedConsumptionByCategory = feedInventoryData.reduce((acc, item) => {
    const consumed = item.initial_stock - item.current_stock;
    if (consumed > 0) {
      const category = item.category || 'other';
      acc[category] = (acc[category] || 0) + consumed;
    }
    return acc;
  }, {} as Record<string, number>);

  const consumptionDistribution = Object.entries(feedConsumptionByCategory).map(([category, amount], index) => ({
    name: category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
    population: amount,
    color: [
      Colors.primary[400], 
      Colors.success[400], 
      Colors.warning[400], 
      Colors.error[400], 
      Colors.secondary[400],
      Colors.accent[400]
    ][index % 6],
    legendFontColor: Colors.neutral[700],
  }));

  const [activeTab, setActiveTab] = useState('metrics');

  const renderMetrics = () => (
    <>
      <Text variant="h5" weight="medium" style={styles.sectionTitle}>
        Nutrition Performance Metrics
      </Text>
      <View style={styles.metricsContainer}>
        {nutritionMetrics.map((metric, index) => (
          <NutritionMetricCard key={index} metric={metric} />
        ))}
      </View>
    </>
  );

  const renderFeedInventory = () => (
    <>
      <Card style={styles.inventoryCard}>
        <View style={styles.inventoryHeader}>
          <View style={styles.inventoryTitleContainer}>
            <Package size={24} color={Colors.primary[500]} style={styles.inventoryIcon} />
            <Text variant="h5" weight="medium">
              Feed Inventory Overview
            </Text>
          </View>
          <TouchableOpacity 
            style={styles.inventoryButton}
            onPress={() => router.push('/screens/register')}
          >
            <Text variant="button" color="primary.500">View Inventory</Text>
            <ArrowRight size={20} color={Colors.primary[500]} />
          </TouchableOpacity>
        </View>
        <Text variant="body2" color="neutral.600" style={styles.inventoryDescription}>
          Manage your feed stock levels, track consumption, and monitor expiry dates.
        </Text>
        
        <View style={styles.inventoryStats}>
          <View style={styles.statItem}>
            <Text variant="h4" weight="bold" color="primary.500">
              {feedInventoryData.length}
            </Text>
            <Text variant="caption" color="neutral.600">
              Feed Types
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text variant="h4" weight="bold" color="warning.500">
              {feedInventoryData.filter(item => item.current_stock <= item.minimum_stock_level).length}
            </Text>
            <Text variant="caption" color="neutral.600">
              Low Stock
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text variant="h4" weight="bold" color="success.500">
              ${feedInventoryData.reduce((sum, item) => sum + (item.current_stock * item.cost_per_unit), 0).toFixed(0)}
            </Text>
            <Text variant="caption" color="neutral.600">
              Stock Value
            </Text>
          </View>
        </View>
      </Card>

      {feedDistribution.length > 0 && (
        <Card style={styles.chartCard}>
          <Text variant="h6" weight="medium" style={styles.chartTitle}>
            Current Feed Stock Distribution
          </Text>
          <PieChart data={feedDistribution} height={200} />
        </Card>
      )}

      {consumptionDistribution.length > 0 && (
        <Card style={styles.chartCard}>
          <Text variant="h6" weight="medium" style={styles.chartTitle}>
            Feed Consumption by Category
          </Text>
          <PieChart data={consumptionDistribution} height={200} />
        </Card>
      )}
    </>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'metrics':
        return renderMetrics();
      case 'inventory':
        return renderFeedInventory();
      default:
        return renderMetrics();
    }
  };

  return (
    <ScreenContainer style={styles.container}>
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'metrics' && styles.activeTab]}
          onPress={() => setActiveTab('metrics')}
        >
          <Text
            variant="body"
            weight={activeTab === 'metrics' ? 'medium' : 'regular'}
            color={activeTab === 'metrics' ? 'primary.500' : 'neutral.600'}
          >
            Performance
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'inventory' && styles.activeTab]}
          onPress={() => setActiveTab('inventory')}
        >
          <Text
            variant="body"
            weight={activeTab === 'inventory' ? 'medium' : 'regular'}
            color={activeTab === 'inventory' ? 'primary.500' : 'neutral.600'}
          >
            Feed Inventory
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderContent()}
      </ScrollView>
    </ScreenContainer>
  );
}

interface NutritionMetricCardProps {
  metric: NutritionMetric;
}

function NutritionMetricCard({ metric }: NutritionMetricCardProps) {
  // Determine if the metric is good, warning, or bad
  const getColor = () => {
    const isInverse = metric.title.includes('FCR') || metric.title.includes('Cost');
    return getPerformanceColor(metric.value, metric.target, isInverse);
  };

  // Calculate percentage of target
  const getPercentage = () => {
    // For FCR and cost metrics, calculate inversely (lower is better)
    if (metric.title.includes('FCR') || metric.title.includes('Cost')) {
      if (metric.value === 0) return 100;
      if (metric.target === 0) return 0;
      return Math.max(0, 100 - ((metric.value / metric.target) * 100));
    }
    
    // For other metrics, direct percentage
    return (metric.value / metric.target) * 100;
  };

  const getIcon = () => {
    if (metric.title.includes('Weight') || metric.title.includes('ADG') || metric.title.includes('DLWG')) {
      return <Scale size={20} color={getColor()} />;
    }
    if (metric.title.includes('FCR') || metric.title.includes('Cost')) {
      return <TrendingUp size={20} color={getColor()} />;
    }
    if (metric.title.includes('BCS') || metric.title.includes('Body')) {
      return <Activity size={20} color={getColor()} />;
    }
    return <Package size={20} color={getColor()} />;
  };

  return (
    <Card style={styles.metricCard}>
      <View style={styles.metricHeader}>
        <View style={styles.metricTitleContainer}>
          {getIcon()}
          <Text variant="body" weight="medium" style={styles.metricTitle}>
            {metric.title}
          </Text>
        </View>
        <View style={[styles.statusIndicator, { backgroundColor: getColor() }]} />
      </View>
      
      <View style={styles.metricValues}>
        <Text variant="h4" weight="bold" style={{ color: getColor() }}>
          {metric.value.toFixed(2)}
          <Text variant="body2" color="neutral.600">
            {' '}
            {metric.unit}
          </Text>
        </Text>
        <Text variant="body2" color="neutral.600">
          Target: {metric.target.toFixed(2)} {metric.unit.split('(')[0].trim()}
        </Text>
      </View>
      
      <Text variant="caption" color="neutral.500" style={styles.metricDescription}>
        {metric.description}
      </Text>
      
      <ProgressIndicator
        label="Performance"
        value={getPercentage()}
        max={100}
        color={getColor()}
        size="sm"
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral[50],
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
    backgroundColor: Colors.white,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: Colors.primary[500],
  },
  content: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  metricsContainer: {
    gap: 16,
  },
  metricCard: {
    padding: 16,
    borderRadius: 12,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  metricTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  metricTitle: {
    marginLeft: 8,
    flex: 1,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  metricValues: {
    marginBottom: 8,
  },
  metricDescription: {
    marginBottom: 12,
    lineHeight: 16,
  },
  inventoryCard: {
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    backgroundColor: Colors.primary[50],
    borderWidth: 1,
    borderColor: Colors.primary[100],
  },
  inventoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
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
  },
  inventoryDescription: {
    marginBottom: 16,
    lineHeight: 20,
  },
  inventoryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.primary[200],
  },
  statItem: {
    alignItems: 'center',
  },
  chartCard: {
    marginBottom: 16,
    padding: 16,
  },
  chartTitle: {
    marginBottom: 12,
    textAlign: 'center',
  },
});