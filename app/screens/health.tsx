import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Text } from '../../components/typography/Text';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { Activity, ArrowRight } from 'lucide-react-native';
import { Card } from '../../components/ui/Card';
import { CheckCircle2, XCircle, ArrowLeft } from 'lucide-react-native';
import Colors from '../../constants/Colors';
import { Stack } from 'expo-router';

interface HealthMetric {
  title: string;
  score: number;
  percentage: number;
  passed: boolean;
  color: string;
}

const farmHealthMetrics: HealthMetric[] = [
  {
    title: 'Overall Farm Health Score',
    score: 85,
    percentage: 85,
    passed: true,
    color: Colors.primary[500],
  },
  {
    title: 'Biosecurity Rating',
    score: 4.2,
    percentage: 84,
    passed: true,
    color: Colors.success[500],
  },
  {
    title: 'Deworming Practice',
    score: 3.8,
    percentage: 76,
    passed: true,
    color: Colors.warning[500],
  },
  {
    title: 'Antihelminthic Rating',
    score: 4.5,
    percentage: 90,
    passed: true,
    color: Colors.accent[500],
  },
  {
    title: 'Antimicrobial Usage',
    score: 2.1,
    percentage: 42,
    passed: false,
    color: Colors.error[500],
  },
  {
    title: 'Vaccination Coverage',
    score: 4.2,
    percentage: 84,
    passed: true,
    color: Colors.secondary[500],
  },
  {
    title: 'Continued Professional Development',
    score: 4.8,
    percentage: 96,
    passed: true,
    color: Colors.success[600],
  },
  {
    title: 'Drug Box',
    score: 3.5,
    percentage: 70,
    passed: true,
    color: Colors.primary[400],
  },
];

const animalHealthRecords = [
  { id: '1', animalId: 'A1001', date: '2025-06-15', treatment: 'Deworming', status: 'Completed' },
  { id: '2', animalId: 'A1002', date: '2025-06-16', treatment: 'Vaccination', status: 'Scheduled' },
  { id: '3', animalId: 'A1003', date: '2025-06-17', treatment: 'Hoof Trimming', status: 'Pending' },
  { id: '4', animalId: 'A1004', date: '2025-06-18', treatment: 'Health Check', status: 'Completed' },
];

export default function HealthScreen() {
  return (
    <>
      <Stack.Screen
        options={{
          title: 'Health'
        }}
      />
      <HealthContent />
    </>
  );
}

function HealthContent() {
  const renderMetricCard = (metric: HealthMetric) => (
    <Card key={metric.title} style={styles.card}>
      <View style={styles.cardHeader}>
        <Text variant="h6" weight="bold" style={styles.cardTitle}>
          {metric.title}
        </Text>
        {metric.passed ? (
          <CheckCircle2 size={24} color={Colors.success[500]} />
        ) : (
          <XCircle size={24} color={Colors.error[500]} />
        )}
      </View>

      <View style={styles.metricsContainer}>
        <View style={styles.scoreContainer}>
          <Text variant="h3" weight="bold" color={metric.color}>
            {metric.score.toFixed(1)}
          </Text>
          <Text variant="caption" color="neutral.500">
            Score
          </Text>
        </View>

        <View style={styles.percentageContainer}>
          <View style={[styles.percentageBar, { backgroundColor: Colors.neutral[100] }]}>
            <View
              style={[
                styles.percentageFill,
                {
                  backgroundColor: metric.color,
                  width: `${metric.percentage}%`,
                },
              ]}
            />
          </View>
          <Text variant="body2" color="neutral.500">
            {metric.percentage}%
          </Text>
        </View>
      </View>
    </Card>
  );

  return (
    <ScreenContainer>
      <ScrollView showsVerticalScrollIndicator={false} style={styles.container}>
        {/* Farm Health Analysis Section */}
        <View style={styles.section}>
          <Text variant="h5" weight="bold" style={styles.sectionTitle}>
            Farm Health Analysis
          </Text>
          {farmHealthMetrics.map(renderMetricCard)}
        </View>

        {/* Animal Health Records Navigation Card */}
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
              <Activity size={24} color={Colors.primary[500]} style={styles.inventoryIcon} />
              <Text variant="h5" weight="medium">
                Animal Health Records
              </Text>
            </View>
            <TouchableOpacity 
              style={styles.inventoryButton}
              onPress={() => router.push('./register')}
            >
              <Text variant="button" color="primary.500">View Records</Text>
              <ArrowRight size={20} color={Colors.primary[500]} />
            </TouchableOpacity>
          </View>
          <Text variant="body2" color="neutral.600" style={styles.inventoryDescription}>
            Access and manage comprehensive health records, treatments, and medical history for your livestock.
          </Text>
        </Card>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  backButton: {
    marginLeft: 8,
    padding: 8,
  },
  container: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    marginBottom: 16,
    color: Colors.primary[900],
  },
  sectionSubtitle: {
    marginBottom: 12,
  },
  title: {
    marginBottom: 24,
  },
  card: {
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
  },
  recordsCard: {
    borderRadius: 12,
    padding: 0,
    overflow: 'hidden',
  },
  recordsHeader: {
    flexDirection: 'row',
    backgroundColor: Colors.neutral[100],
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
  },
  recordHeaderCell: {
    flex: 1,
    color: Colors.neutral[600],
  },
  recordRow: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[100],
    alignItems: 'center',
  },
  recordCell: {
    flex: 1,
    color: Colors.neutral[800],
  },
  statusContainer: {
    flex: 1,
    alignItems: 'flex-start',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    flex: 1,
    marginRight: 16,
  },
  metricsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  scoreContainer: {
    alignItems: 'center',
    width: 80,
  },
  percentageContainer: {
    flex: 1,
  },
  percentageBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: 4,
    overflow: 'hidden',
  },
  percentageFill: {
    height: 8,
    borderRadius: 4,
    marginTop: 4,
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
    marginTop: 4,
    lineHeight: 20,
  },
});
