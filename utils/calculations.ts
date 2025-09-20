import { HerdRecord } from '../contexts/HerdContext';
import { CalfRecord } from '../contexts/CalfContext';
import { MortalityRecord } from '../contexts/MortalityContext';
import { HealthRecord } from '../contexts/HealthRecordContext';

// Calculate Daily Live Weight Gain (DLWG)
export const calculateDLWG = (weightRecords: any[]): number => {
  if (weightRecords.length < 2) return 0;
  
  // Sort by date
  const sortedRecords = weightRecords.sort((a, b) => 
    new Date(a.weight_date).getTime() - new Date(b.weight_date).getTime()
  );
  
  const firstRecord = sortedRecords[0];
  const lastRecord = sortedRecords[sortedRecords.length - 1];
  
  const weightGain = lastRecord.weight - firstRecord.weight;
  const daysDiff = Math.abs(
    (new Date(lastRecord.weight_date).getTime() - new Date(firstRecord.weight_date).getTime()) 
    / (1000 * 60 * 60 * 24)
  );
  
  return daysDiff > 0 ? weightGain / daysDiff : 0;
};

// Calculate Average Daily Gain (ADG)
export const calculateADG = (calfData: CalfRecord[]): number => {
  const calvesWithWeights = calfData.filter(calf => 
    calf.birth_weight > 0 && calf.weaning_weight > 0 && calf.weaning_date
  );
  
  if (calvesWithWeights.length === 0) return 0;
  
  const totalGain = calvesWithWeights.reduce((sum, calf) => {
    const weightGain = calf.weaning_weight - calf.birth_weight;
    const ageInDays = calf.age * 30; // Approximate days
    return sum + (weightGain / ageInDays);
  }, 0);
  
  return totalGain / calvesWithWeights.length;
};

// Calculate Feed Conversion Ratio (FCR)

// Calculate Body Condition Score (BCS) average
export const calculateAverageBCS = (healthRecords: HealthRecord[]): number => {
  const bcsRecords = healthRecords.filter(record => 
    record.diagnosis?.toLowerCase().includes('bcs') || 
    record.diagnosis?.toLowerCase().includes('body condition')
  );
  
  if (bcsRecords.length === 0) return 3.5; // Default value
  
  const bcsValues = bcsRecords
    .map(record => {
      const match = record.diagnosis?.match(/(\d+\.?\d*)/);
      return match ? parseFloat(match[1]) : null;
    })
    .filter(val => val !== null && val >= 1 && val <= 5);
  
  if (bcsValues.length === 0) return 3.5;
  
  return bcsValues.reduce((sum, val) => sum + val!, 0) / bcsValues.length;
};

// Calculate conception rate
export const calculateConceptionRate = (herdData: HerdRecord[], pregnancyData: any[]): number => {
  const femaleAnimals = herdData.filter(animal => animal.sex === 'female').length;
  const pregnantAnimals = pregnancyData.filter(record => record.first_pd).length;
  
  return femaleAnimals > 0 ? (pregnantAnimals / femaleAnimals) * 100 : 0;
};

// Calculate calving percentage
export const calculateCalvingPercentage = (herdData: HerdRecord[], calfData: CalfRecord[]): number => {
  const femaleAnimals = herdData.filter(animal => animal.sex === 'female').length;
  const calvesThisYear = calfData.filter(calf => {
    const currentYear = new Date().getFullYear();
    const calfYear = new Date().getFullYear(); // Assuming current year for demo
    return calfYear === currentYear;
  }).length;
  
  return femaleAnimals > 0 ? (calvesThisYear / femaleAnimals) * 100 : 0;
};

// Calculate calving interval (days)
export const calculateCalvingInterval = (pregnancyData: any[]): number => {
  if (pregnancyData.length < 2) return 365; // Default 365 days
  
  const calvingDates = pregnancyData
    .filter(record => record.actual_calving_date)
    .map(record => new Date(record.actual_calving_date))
    .sort((a, b) => a.getTime() - b.getTime());
  
  if (calvingDates.length < 2) return 365;
  
  const intervals = [];
  for (let i = 1; i < calvingDates.length; i++) {
    const interval = Math.abs(
      (calvingDates[i].getTime() - calvingDates[i - 1].getTime()) / (1000 * 60 * 60 * 24)
    );
    intervals.push(interval);
  }
  
  return intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
};

// Calculate calf crop percentage
export const calculateCalfCropPercentage = (herdData: HerdRecord[], calfData: CalfRecord[]): number => {
  const femaleAnimals = herdData.filter(animal => animal.sex === 'female').length;
  const totalCalves = calfData.length;
  
  return femaleAnimals > 0 ? (totalCalves / femaleAnimals) * 100 : 0;
};

// Calculate mortality rates
export const calculateMortalityRate = (herdData: HerdRecord[], mortalityData: MortalityRecord[]): number => {
  const totalAnimals = herdData.length;
  const totalMortalities = mortalityData.length;
  
  return totalAnimals > 0 ? (totalMortalities / totalAnimals) * 100 : 0;
};

// Calculate weaning rate
export const calculateWeaningRate = (calfData: CalfRecord[]): number => {
  const totalCalves = calfData.length;
  const weanedCalves = calfData.filter(calf => calf.weaning_date).length;
  
  return totalCalves > 0 ? (weanedCalves / totalCalves) * 100 : 0;
};

// Get performance color based on value and thresholds
export const getPerformanceColor = (value: number, target: number, isInverse: boolean = false): string => {
  const percentage = (value / target) * 100;
  
  if (isInverse) {
    // For metrics where lower is better (like mortality)
    if (percentage <= 50) return '#10B981'; // Green
    if (percentage <= 100) return '#F59E0B'; // Yellow
    return '#EF4444'; // Red
  } else {
    // For metrics where higher is better
    if (percentage >= 90) return '#10B981'; // Green
    if (percentage >= 70) return '#F59E0B'; // Yellow
    return '#EF4444'; // Red
  }
};

// Calculate 42-day in-calf rate
export const calculate42DayInCalfRate = (pregnancyData: any[]): number => {
  const totalServed = pregnancyData.length;
  const pregnantAt42Days = pregnancyData.filter(record => {
    if (!record.last_service_date || !record.first_pd) return false;
    
    const serviceDate = new Date(record.last_service_date);
    const pdDate = new Date(record.first_pd);
    const daysDiff = Math.abs((pdDate.getTime() - serviceDate.getTime()) / (1000 * 60 * 60 * 24));
    
    return daysDiff <= 42;
  }).length;
  
  return totalServed > 0 ? (pregnantAt42Days / totalServed) * 100 : 0;
};

// Calculate 100-day in-calf rate
export const calculate100DayInCalfRate = (pregnancyData: any[]): number => {
  const totalServed = pregnancyData.length;
  const pregnantAt100Days = pregnancyData.filter(record => {
    if (!record.last_service_date || !record.second_pd) return false;
    
    const serviceDate = new Date(record.last_service_date);
    const pdDate = new Date(record.second_pd);
    const daysDiff = Math.abs((pdDate.getTime() - serviceDate.getTime()) / (1000 * 60 * 60 * 24));
    
    return daysDiff <= 100;
  }).length;
  
  return totalServed > 0 ? (pregnantAt100Days / totalServed) * 100 : 0;
};