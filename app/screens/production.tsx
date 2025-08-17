import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from '../../components/typography/Text';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { Card } from '../../components/ui/Card';
import { ProgressIndicator } from '../../components/metrics/ProgressIndicator';
import Colors from '../../constants/Colors';
import { Stack } from 'expo-router';
import { useHerd } from '../../contexts/HerdContext';
import { useCalf } from '../../contexts/CalfContext';
import { useMortality } from '../../contexts/MortalityContext';
import { 
  calculateCalfCropPercentage, 
  calculateMortalityRate, 
  calculateWeaningRate,
  calculateADG,
  getPerformanceColor 
} from '../../utils/calculations';

interface ProductionMetric {
  title: string;
  value: number;
  target: number;
  unit: string;
}




export default function ProductionScreen() {
  return (
    <>
      <Stack.Screen
        options={{
          title: 'Production',
        }}
      />
      <ProductionContent />
    </>
  );
}

function ProductionContent() {
  const { herdData } = useHerd();
  const { calfData } = useCalf();
  const { mortalityData } = useMortality();

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

  // Calculate production metrics from actual data
  const calculateProductionMetrics = (): ProductionMetric[] => {
    const totalHerd = herdData.length;
    const totalCalves = calfData.length;
    const totalMortalities = mortalityData.length;
    
    // Use calculation utilities
    const calfCropPercentage = calculateCalfCropPercentage(herdData, calfData);
    const avgDailyGain = calculateADG(calfData);
    const mortalityRate = calculateMortalityRate(herdData, mortalityData);
    const weaningRate = calculateWeaningRate(calfData);
    
    const calfMortalities = mortalityData.filter(record => {
      const animal = herdData.find(a => a.tag_number === record.animal_tag);
      return animal && calculateAge(animal.date_of_birth) < 1;
    }).length;
    
    const calfMortalityRate = totalCalves > 0 ? (calfMortalities / totalCalves) * 100 : 0;

    return [
      {
        title: 'Calf Crop %',
        value: calfCropPercentage,
        target: 95,
        unit: '%',
      },
      {
        title: 'Average Daily Gain (ADG)',
        value: avgDailyGain || 0.8,
        target: 1.5,
        unit: 'kg/day',
      },
      {
        title: 'Calf Mortality Rate',
        value: calfMortalityRate,
        target: 3,
        unit: '%',
      },
      {
        title: 'Herd Mortality Rate',
        value: mortalityRate,
        target: 1,
        unit: '%',
      },
      {
        title: 'Weaning Rate',
        value: weaningRate,
        target: 90,
        unit: '%',
      },
      {
        title: 'Total Herd Size',
        value: totalHerd,
        target: 250,
        unit: 'animals',
      },
    ];
  };

  const productionMetrics = calculateProductionMetrics();


  const renderContent = () => (
    <>
      <Text variant="h5" weight="medium" style={styles.sectionTitle}>
        Production Metrics
      </Text>
      <View style={styles.metricsContainer}>
        {productionMetrics.map((metric, index) => (
          <ProductionMetricCard key={index} metric={metric} />
        ))}
      </View>
    </>
  );

  return (
    <ScreenContainer style={styles.container}>
      {renderContent()}
    </ScreenContainer>
  );
}

interface ProductionMetricCardProps {
  metric: ProductionMetric;
}

function ProductionMetricCard({ metric }: ProductionMetricCardProps) {
  // Determine if the metric is good, warning, or bad
  const getColor = () => {
    const isInverse = metric.title.includes('Mortality');
    return getPerformanceColor(metric.value, metric.target, isInverse);
  };

  // Calculate percentage of target
  const getPercentage = () => {
    // For mortality rates, calculate inversely
    if (metric.title.includes('Mortality')) {
      // If value is 0, it's 100% of target (best case)
      if (metric.value === 0) return 100;
      // If target is 0, it's 0% of target (impossible case)
      if (metric.target === 0) return 0;
      // Otherwise, invert the percentage
      return Math.max(0, 100 - ((metric.value / metric.target) * 100));
    }
    
    // For other metrics, direct percentage
    return (metric.value / metric.target) * 100;
  };

  return (
    <Card style={styles.metricCard}>
      <View style={styles.metricHeader}>
        <Text variant="body" weight="medium">
          {metric.title}
        </Text>
        <View style={[styles.statusIndicator, { backgroundColor: getColor() }]} />
      </View>
      <View style={styles.metricValues}>
        <Text variant="h5" weight="bold" color={getColor()}>
          {metric.unit === '%' ? metric.value.toFixed(2) : metric.value}
          <Text variant="body2" color="neutral.600">
            {' '}
            {metric.unit}
          </Text>
        </Text>
        <Text variant="body2" color="neutral.600">
          Target: {metric.unit === '%' ? metric.target.toFixed(2) : metric.target} {metric.unit}
        </Text>
      </View>
      <ProgressIndicator
        label="Progress to Target"
        value={getPercentage()}
        max={100}
        color={getColor()}
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral[50],
  },

  sectionTitle: {
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  metricsContainer: {
    paddingHorizontal: 16,
  },
  metricCard: {
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  metricValues: {
    marginBottom: 12,
  },

});