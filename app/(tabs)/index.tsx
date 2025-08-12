import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Platform, Text as RNText } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { Redirect } from 'expo-router';

import { router } from 'expo-router';
import { Bell, Heart, Dna, Wheat, ChartBar as BarChart3, ClipboardList, File as FileEdit, ShoppingCart, Settings, User, TrendingUp } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Text } from '../../components/typography/Text';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { Picker } from '../../components/inputs/Picker';
import { Card } from '../../components/ui/Card';
import { useAuth } from '../../contexts/AuthContext';
import Colors from '../../constants/Colors';
import { ColorValue } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

interface NavigationCard {
  id: string;
  title: string;
  icon: React.ReactNode;
  description: string;
  route: string;
  color: string;
  gradient: readonly [ColorValue, ColorValue];
}

const speciesEmojis: Record<string, string> = {
  'goats': '🐐',
  'pigs': '🐷',
  'sheep': '🐑',
  'poultry': '🐔',
  'rabbits': '🐇',
  'beef-production': '🥩',
  'dairy-production': '🥛',
  'pen-fattening': '🐑',
};

const species = [
  { label: 'Beef Production', value: 'beef-production' },
  { label: 'Dairy Production', value: 'dairy-production' },
  { label: 'Pen Fattening', value: 'pen-fattening' },
  { label: 'Goats', value: 'goats' },
  { label: 'Pigs', value: 'pigs' },
  { label: 'Sheep', value: 'sheep' },
  { label: 'Poultry', value: 'poultry' },
  { label: 'Rabbits', value: 'rabbits' }
];

// Sample DLShift data for the chart
const dlshiftMonthlyData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  datasets: [
    {
      data: [65, 72, 68, 75, 82, 78, 80, 85, 82, 78, 80, 83],
    },
  ],
};

const dlshiftYearlyData = {
  labels: ['2020', '2021', '2022', '2023', '2024', '2025'],
  datasets: [
    {
      data: [58, 65, 70, 72, 78, 82],
    },
  ],
};

const categoryScores = {
  labels: ['Nutrition', 'Records', 'Genetics', 'Production', 'Health'],
  datasets: [
    {
      data: [85, 78, 92, 75, 88],
    },
  ],
};

const averageCategoryScore = Math.round(
  categoryScores.datasets[0].data.reduce((a, b) => a + b, 0) / 
  categoryScores.datasets[0].data.length
);

// Move renderNavigationCard outside component to avoid key prop warnings
const renderNavigationCard = ({ item }: { item: NavigationCard }) => (
  <TouchableOpacity
    style={styles.navCardContainer}
    onPress={() => router.push(item.route as any)}
    activeOpacity={0.7}
  >
    <LinearGradient
      colors={item.gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.cardGradient}
    >
      <View style={styles.cardContent}>
        <View style={styles.cardIcon}>{item.icon}</View>
        <View style={styles.cardTextContent}>
          <Text variant="h6" weight="bold" color="white" style={styles.cardTitle}>
            {item.title}
          </Text>
          <Text variant="caption" color="white" style={[styles.cardDescription, { opacity: 0.9 }]}>
            {item.description}
          </Text>
        </View>
      </View>
    </LinearGradient>
  </TouchableOpacity>
);

const navigationCards: NavigationCard[] = [
  {
    id: 'health',
    title: 'Health',
    icon: <Heart size={24} color={Colors.white} />,
    description: 'Monitor animal health and medical records',
    route: '/screens/health',
    color: Colors.error[500],
    gradient: [Colors.error[400], Colors.error[600]],
  },
  {
    id: 'genetics',
    title: 'Genetics',
    icon: <Dna size={24} color={Colors.white} />,
    description: 'Track breeding and genetic information',
    route: '/screens/genetics',
    color: Colors.primary[500],
    gradient: [Colors.primary[400], Colors.primary[600]],
  },
  {
    id: 'production',
    title: 'Production',
    icon: <BarChart3 size={24} color={Colors.white} />,
    description: 'Monitor growth and production metrics',
    route: '/screens/production',
    color: Colors.success[500],
    gradient: [Colors.success[400], Colors.success[600]],
  },
  {
    id: 'records',
    title: 'Records',
    icon: <ClipboardList size={24} color={Colors.white} />,
    description: 'Access and manage farm records',
    route: '/screens/records',
    color: Colors.secondary[500],
    gradient: [Colors.secondary[400], Colors.secondary[600]],
  },
  {
    id: 'nutrition',
    title: 'Nutrition',
    icon: <Wheat size={24} color={Colors.white} />,
    description: 'Manage feed and nutritional programs',
    route: '/screens/nutrition',
    color: Colors.accent[500],
    gradient: [Colors.accent[400], Colors.accent[600]],
  },
  {
    id: 'register',
    title: 'Register',
    icon: <FileEdit size={24} color={Colors.white} />,
    description: 'Register new animals and records',
    route: '/screens/register',
    color: Colors.neutral[500],
    gradient: [Colors.neutral[400], Colors.neutral[600]],
  },
  {
    id: 'marketplace',
    title: 'Marketplace',
    icon: <ShoppingCart size={24} color={Colors.white} />,
    description: 'Buy, sell, and trade livestock',
    route: '/screens/marketplace',
    color: Colors.success[600],
    gradient: [Colors.success[500], Colors.success[700]],
  },
  {
    id: 'settings',
    title: 'Settings',
    icon: <Settings size={24} color={Colors.white} />,
    description: 'Configure farm preferences',
    route: '/screens/settings',
    color: Colors.neutral[600],
    gradient: [Colors.neutral[500], Colors.neutral[700]],
  },
];

export default function HomeScreen() {
  const [selectedSpecies, setSelectedSpecies] = useState<string>('beef-cattle');
  const [activeSlide, setActiveSlide] = useState(0);
  const [timeframe, setTimeframe] = useState<'monthly' | 'yearly'>('monthly');
  const { user, loading } = useAuth();

  // Show loading while checking auth
  if (loading) {
    return (
      <ScreenContainer style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text variant="h6">Loading...</Text>
        </View>
      </ScreenContainer>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <ScreenContainer style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.userInfoContainer}>
            <View style={styles.avatar}>
              <User size={24} color={Colors.neutral[700]} />
            </View>
            <View style={styles.userTextContainer}>
              <Text variant="body2" color="neutral.600">
                Welcome back,
              </Text>
              <Text variant="h5" weight="bold">
                {user.user_metadata?.name || user.email}
              </Text>
            </View>
          </View>
          <View style={styles.headerIcons}>
            <TouchableOpacity style={styles.iconButton}>
              <View style={styles.notificationBadge} />
              <Bell size={24} color={Colors.neutral[700]} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.summaryContainer}>
          <LinearGradient
            colors={[Colors.primary[400], Colors.primary[600]]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.summaryGradient}
          >
            <View style={styles.summaryContent}>
              <View>
                <Text variant="h3" weight="bold" color="white">
                  247 {speciesEmojis[selectedSpecies]}
                </Text>
                <Text variant="body" color="white" style={{ opacity: 0.9 }}>
                  {species.find(s => s.value === selectedSpecies)?.label || 'Animals'}
                </Text>
              </View>
              <View>
                <Text variant="h3" weight="bold" color="white">
                  8
                </Text>
                <Text variant="body" color="white" style={{ opacity: 0.9 }}>
                  Tasks Today
                </Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        <View style={styles.filterContainer}>
          <Picker
            label="Select Species"
            value={selectedSpecies}
            onValueChange={setSelectedSpecies}
            items={species}
            style={styles.speciesPicker}
          />
        </View>

        <Card style={styles.dlshiftCard}>
          <View style={styles.dlshiftHeader}>
            <View>
              <Text variant="h6" weight="bold">
                DLShift Score
              </Text>
              <Text variant="h3" weight="bold" color="primary.500" style={styles.dlshiftScore}>
                {activeSlide === 0 ? '78' : averageCategoryScore}%
              </Text>
            </View>
            <View style={styles.dlshiftTrend}>
              <TrendingUp size={20} color={Colors.success[500]} />
              <Text variant="caption" color="success.500">
                {activeSlide === 0 ? '+5% this month' : `+3% from last period`}
              </Text>
            </View>
          </View>
          
          <View style={styles.timeframeSelector}>
            <TouchableOpacity
              onPress={() => setTimeframe('monthly')}
              style={[
                styles.timeframeButton,
                timeframe === 'monthly' && styles.activeTimeframe,
              ]}
            >
              <Text color={timeframe === 'monthly' ? 'primary.500' : 'neutral.600'}>Monthly</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setTimeframe('yearly')}
              style={[
                styles.timeframeButton,
                timeframe === 'yearly' && styles.activeTimeframe,
              ]}
            >
              <Text color={timeframe === 'yearly' ? 'primary.500' : 'neutral.600'}>Yearly</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.carouselContainer}>
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={(event) => {
                const slide = Math.round(event.nativeEvent.contentOffset.x / (Dimensions.get('window').width - 32));
                setActiveSlide(slide);
              }}
              scrollEventThrottle={16}
            >
              <View key="line-chart" style={styles.chartContainer}>
                <LineChart
                  data={timeframe === 'monthly' ? dlshiftMonthlyData : dlshiftYearlyData}
                  width={Dimensions.get('window').width - 70}
                  height={180}
                  chartConfig={{
                    backgroundColor: Colors.white,
                    backgroundGradientFrom: Colors.white,
                    backgroundGradientTo: Colors.white,
                    decimalPlaces: 0,
                    color: (opacity = 1) => Colors.primary[500],
                    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                    style: {
                      borderRadius: 16,
                    },
                  }}
                  bezier
                  style={{
                    marginVertical: 8,
                    borderRadius: 16,
                  }}
                />
              </View>
              
              <View key="bar-chart" style={styles.chartContainer}>
                <BarChart
                  data={categoryScores}
                  width={Dimensions.get('window').width - 100}
                  height={180}
                  yAxisLabel=""
                  yAxisSuffix="%"
                  yAxisInterval={1}
                  chartConfig={{
                    backgroundColor: Colors.white,
                    backgroundGradientFrom: Colors.white,
                    backgroundGradientTo: Colors.white,
                    decimalPlaces: 0,
                    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                    style: {
                      borderRadius: 16,
                    },
                    barPercentage: 0.5,
                    propsForLabels: {
                      fontSize: 10,
                    },
                  }}
                  style={{
                    marginVertical: 8,
                    borderRadius: 16,
                  }}
                />
              </View>
            </ScrollView>
            
            <View style={styles.paginationContainer}>
              {[0, 1].map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.paginationDot,
                    activeSlide === index && styles.paginationDotActive,
                  ]}
                />
              ))}
            </View>
          </View>
        </Card>

        <Text variant="h5" weight="bold" style={styles.sectionTitle}>
          Quick Access
        </Text>
        
        <View style={styles.gridContainer}>
          {navigationCards.map((item) => (
            <View key={item.id} style={styles.gridItem}>
              {renderNavigationCard({ item })}
            </View>
          ))}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral[50],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    marginTop: Platform.select({
      android: 16,
      default: 8,
    }),
    paddingHorizontal: 16,
  },
  userInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
    backgroundColor: Colors.neutral[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  userTextContainer: {
    justifyContent: 'center',
  },
  headerIcons: {
    flexDirection: 'row',
  },
  iconButton: {
    padding: 8,
    marginLeft: 8,
    position: 'relative',
    backgroundColor: Colors.white,
    borderRadius: 12,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  notificationBadge: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.error[500],
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 1,
  },
  summaryContainer: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  summaryGradient: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  summaryContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 24,
  },
  filterContainer: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  speciesPicker: {
    width: '100%',
  },
  dlshiftCard: {
    marginHorizontal: 16,
    marginBottom: 24,
    padding: 16,
    overflow: 'hidden',
  },
  carouselContainer: {
    marginTop: 8,
    marginHorizontal:-35
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  averageScore: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.neutral[300],
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: Colors.primary[500],
    width: 16,
  },
  timeframeSelector: {
    flexDirection: 'row',
    backgroundColor: Colors.neutral[100],
    borderRadius: 8,
    padding: 4,
    marginBottom: 12,
    alignSelf: 'flex-start',
  },
  timeframeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  activeTimeframe: {
    backgroundColor: Colors.white,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  dlshiftHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  dlshiftScore: {
    marginTop: 8,
  },
  dlshiftTrend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.success[50],
    padding: 8,
    borderRadius: 8,
  },
  chartContainer: {
    marginRight:35,
    marginVertical:8
  },
  sectionTitle: {
    marginTop: 8,
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  gridContainer: {
    paddingHorizontal: 12,
    marginBottom: 100, // Add padding for the tab bar
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  gridItem: {
    width: '50%',
    padding: 4,
  },
  navCardContainer: {
    flex: 1,
  },
  cardGradient: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  cardContent: {
    padding: 16,
    height: 140, // Fixed height for all cards
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTextContent: {
    flex: 1,
  },
  cardTitle: {
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 12,
    lineHeight: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});