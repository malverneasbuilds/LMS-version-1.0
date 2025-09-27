import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

export interface AnimalFCRRecord {
  id: string;
  animal_tag: string;
  period_start_date: string;
  period_end_date: string;
  induction_weight: number;
  final_weight: number;
  total_weight_gain: number;
  total_feed_consumed: number;
  fcr_value: number;
  calculation_date: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

interface AnimalFCRContextType {
  animalFCRData: AnimalFCRRecord[];
  loading: boolean;
  calculateAndStoreFCR: (animalTag: string, periodMonths?: number) => Promise<void>;
  getAnimalFCR: (animalTag: string, periodMonths?: number) => AnimalFCRRecord | null;
  getAverageHerdFCR: (periodMonths?: number) => number;
  refreshData: () => Promise<void>;
}

const AnimalFCRContext = createContext<AnimalFCRContextType | undefined>(undefined);

export function AnimalFCRProvider({ children }: { children: React.ReactNode }) {
  const [animalFCRData, setAnimalFCRData] = useState<AnimalFCRRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('animal_fcr_records')
        .select('*')
        .eq('user_id', user.id)
        .order('calculation_date', { ascending: false });

      if (error) {
        console.error('Error fetching animal FCR data:', error);
        setAnimalFCRData([]);
      } else {
        setAnimalFCRData(data || []);
      }
    } catch (err) {
      console.error('Error in fetchData:', err);
      setAnimalFCRData([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const calculateAndStoreFCR = async (animalTag: string, periodMonths: number = 6) => {
    if (!user) return;

    try {
      const { error } = await supabase.rpc('calculate_and_store_animal_fcr', {
        p_user_id: user.id,
        p_animal_tag: animalTag,
        p_period_months: periodMonths,
      });

      if (error) {
        console.error('Error calculating and storing FCR:', error);
        throw error;
      }
      
      await fetchData();
    } catch (err) {
      console.error('Error in calculateAndStoreFCR:', err);
      throw err;
    }
  };

  const getAnimalFCR = (animalTag: string, periodMonths: number = 6): AnimalFCRRecord | null => {
    // Find the most recent FCR record for the animal within the specified period
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(endDate.getMonth() - periodMonths);

    const animalRecords = animalFCRData
      .filter(record => 
        record.animal_tag === animalTag &&
        new Date(record.period_start_date) >= startDate &&
        new Date(record.period_end_date) <= endDate
      )
      .sort((a, b) => new Date(b.calculation_date).getTime() - new Date(a.calculation_date).getTime());

    return animalRecords.length > 0 ? animalRecords[0] : null;
  };

  const getAverageHerdFCR = (periodMonths: number = 6): number => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(endDate.getMonth() - periodMonths);

    const validFCRs = animalFCRData
      .filter(record => 
        new Date(record.period_start_date) >= startDate &&
        new Date(record.period_end_date) <= endDate &&
        record.fcr_value > 0 &&
        record.fcr_value < 50 // Filter out unrealistic FCRs
      )
      .map(record => record.fcr_value);

    return validFCRs.length > 0 
      ? validFCRs.reduce((sum, fcr) => sum + fcr, 0) / validFCRs.length 
      : 0;
  };

  const refreshData = async () => {
    await fetchData();
  };

  return (
    <AnimalFCRContext.Provider
      value={{
        animalFCRData,
        loading,
        calculateAndStoreFCR,
        getAnimalFCR,
        getAverageHerdFCR,
        refreshData,
      }}
    >
      {children}
    </AnimalFCRContext.Provider>
  );
}

export function useAnimalFCR() {
  const context = useContext(AnimalFCRContext);
  if (context === undefined) {
    throw new Error('useAnimalFCR must be used within an AnimalFCRProvider');
  }
  return context;
}