import { HerdRecord } from '../contexts/HerdContext';
import { CalfRecord } from '../contexts/CalfContext';
import { MortalityRecord } from '../contexts/MortalityContext';
import { HealthRecord } from '../contexts/HealthRecordContext';

// Calculate Weight Gain Metrics (WGM) for individual animals
export const calculateAnimalWGM = (
  animalTag: string, 
  weightRecords: { animal_tag: string; weight_date: string; weight: number }[],
  dateOfBirth: string
): number => {
  const animalRecords = weightRecords
    .filter(record => record.animal_tag === animalTag)
    .sort((a, b) => new Date(a.weight_date).getTime() - new Date(b.weight_date).getTime());
  
  if (animalRecords.length < 2) return 0;
  
  const firstRecord = animalRecords[0];
  const lastRecord = animalRecords[animalRecords.length - 1];
  
  // Calculate age in days from birth to last weight record
  const birthDate = new Date(dateOfBirth);
  const lastWeightDate = new Date(lastRecord.weight_date);
  const ageInDays = Math.abs((lastWeightDate.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24));
  
  if (ageInDays === 0) return 0;
  
  // Calculate DLWG: (current weight - previous weight) / age in days
  const weightGain = lastRecord.weight - firstRecord.weight;
  const dlwg = weightGain / ageInDays;
  
  // Calculate ADG for this specific animal (using birth weight if available)
  // For now, we'll use a simplified ADG calculation
  const daysBetweenRecords = Math.abs(
    (new Date(lastRecord.weight_date).getTime() - new Date(firstRecord.weight_date).getTime()) 
    / (1000 * 60 * 60 * 24)
  );
  const adg = daysBetweenRecords > 0 ? weightGain / daysBetweenRecords : 0;
  
  // WGM = DLWG / ADG
  return adg > 0 ? dlwg / adg : 0;
};

// Calculate average WGM across all animals
export const calculateAverageWGM = (
  weightRecords: { animal_tag: string; weight_date: string; weight: number }[],
  herdData: { tag_number: string; date_of_birth: string }[]
): number => {
  if (weightRecords.length < 2) return 0;
  
  const animalWGMs: number[] = [];
  
  // Calculate WGM for each animal that has weight records
  herdData.forEach(animal => {
    const animalRecords = weightRecords.filter(record => record.animal_tag === animal.tag_number);
    
    if (animalRecords.length >= 2) {
      const wgm = calculateAnimalWGM(animal.tag_number, weightRecords, animal.date_of_birth);
      if (wgm > 0 && !isNaN(wgm) && isFinite(wgm)) {
        animalWGMs.push(wgm);
      }
    }
  });
  
  // Return average WGM across all animals
  return animalWGMs.length > 0 ? animalWGMs.reduce((sum, wgm) => sum + wgm, 0) / animalWGMs.length : 0;
};

// Calculate Daily Live Weight Gain (DLWG) for individual animal
export const calculateAnimalDLWG = (
  animalTag: string,
  weightRecords: { animal_tag: string; weight_date: string; weight: number }[],
  dateOfBirth: string
): number => {
  const animalRecords = weightRecords
    .filter(record => record.animal_tag === animalTag)
    .sort((a, b) => new Date(a.weight_date).getTime() - new Date(b.weight_date).getTime());
  
  if (animalRecords.length < 2) return 0;
  
  const firstRecord = animalRecords[0];
  const lastRecord = animalRecords[animalRecords.length - 1];
  
  // Calculate age in days from birth to last weight record
  const birthDate = new Date(dateOfBirth);
  const lastWeightDate = new Date(lastRecord.weight_date);
  const ageInDays = Math.abs((lastWeightDate.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24));
  
  if (ageInDays === 0) return 0;
  
  // DLWG = (current weight - previous weight) / age in days
  const weightGain = lastRecord.weight - firstRecord.weight;
  return weightGain / ageInDays;
};

// Calculate average DLWG across all animals (for backward compatibility)
export const calculateDLWG = (
  weightRecords: { animal_tag: string; weight_date: string; weight: number }[],
  herdData: { tag_number: string; date_of_birth: string }[]
): number => {
  if (weightRecords.length < 2) return 0;
  
  const animalDLWGs: number[] = [];
  
  // Calculate DLWG for each animal that has weight records
  herdData.forEach(animal => {
    const dlwg = calculateAnimalDLWG(animal.tag_number, weightRecords, animal.date_of_birth);
    if (dlwg > 0 && !isNaN(dlwg) && isFinite(dlwg)) {
      animalDLWGs.push(dlwg);
    }
  });
  
  return animalDLWGs.length > 0 ? animalDLWGs.reduce((sum, dlwg) => sum + dlwg, 0) / animalDLWGs.length : 0;
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
// Calculate individual animal FCR
export const calculateAnimalFCR = (
  animalTag: string,
  startDate: string,
  endDate: string,
  weightRecords: { animal_tag: string; weight_date: string; weight: number }[],
  feedIntakeRecords: { animal_tag: string; intake_date: string; amount_consumed: number }[]
): { fcr: number; totalFeedConsumed: number; weightGain: number } => {
  // Get weight records for the animal within the period
  const animalWeights = weightRecords
    .filter(record => 
      record.animal_tag === animalTag &&
      record.weight_date >= startDate &&
      record.weight_date <= endDate
    )
    .sort((a, b) => new Date(a.weight_date).getTime() - new Date(b.weight_date).getTime());

  // Get feed intake records for the animal within the period
  const animalFeedIntake = feedIntakeRecords
    .filter(record => 
      record.animal_tag === animalTag &&
      record.intake_date >= startDate &&
      record.intake_date <= endDate
    );

  // Calculate total feed consumed
  const totalFeedConsumed = animalFeedIntake.reduce((sum, record) => sum + record.amount_consumed, 0);

  // Calculate weight gain (final weight - induction weight)
  let weightGain = 0;
  if (animalWeights.length >= 2) {
    const inductionWeight = animalWeights[0].weight; // First weight in period
    const finalWeight = animalWeights[animalWeights.length - 1].weight; // Last weight in period
    weightGain = finalWeight - inductionWeight;
  }

  // Calculate FCR
  const fcr = weightGain > 0 ? totalFeedConsumed / weightGain : 0;

  return {
    fcr,
    totalFeedConsumed,
    weightGain,
  };
};

// Calculate average FCR across all animals in the herd
export const calculateAverageHerdFCR = (
  startDate: string,
  endDate: string,
  herdData: { tag_number: string }[],
  weightRecords: { animal_tag: string; weight_date: string; weight: number }[],
  feedIntakeRecords: { animal_tag: string; intake_date: string; amount_consumed: number }[]
): number => {
  const animalFCRs: number[] = [];

  herdData.forEach(animal => {
    const { fcr } = calculateAnimalFCR(
      animal.tag_number,
      startDate,
      endDate,
      weightRecords,
      feedIntakeRecords
    );

    // Only include valid FCRs (positive and reasonable values)
    if (fcr > 0 && fcr < 50 && !isNaN(fcr) && isFinite(fcr)) {
      animalFCRs.push(fcr);
    }
  });

  return animalFCRs.length > 0 ? animalFCRs.reduce((sum, fcr) => sum + fcr, 0) / animalFCRs.length : 0;
};