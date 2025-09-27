import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

export interface WeightRecord {
  id: string;
  animal_tag: string;
  weight_date: string;
  weight: number;
  feed_consumed: number;
  notes: string;
  created_at: string;
  updated_at: string;
}

interface WeightRecordsContextType {
  weightRecordsData: WeightRecord[];
  loading: boolean;
  addRecord: (record: Omit<WeightRecord, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateRecord: (id: string, record: Partial<WeightRecord>) => Promise<void>;
  deleteRecord: (id: string) => Promise<void>;
  getAnimalWeightHistory: (animalTag: string) => WeightRecord[];
  getLatestWeightForAnimal: (animalTag: string) => WeightRecord | null;
  calculateWeightGainForAnimal: (animalTag: string) => number;
  calculateFCRForAnimal: (animalTag: string) => number;
  refreshData: () => Promise<void>;
}

const WeightRecordsContext = createContext<WeightRecordsContextType | undefined>(undefined);

export function WeightRecordsProvider({ children }: { children: React.ReactNode }) {
  const [weightRecordsData, setWeightRecordsData] = useState<WeightRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('weight_records')
        .select('*')
        .eq('user_id', user.id)
        .order('weight_date', { ascending: false });

      if (error) {
        console.error('Error fetching weight records data:', error);
        setWeightRecordsData([]);
      } else {
        setWeightRecordsData(data || []);
      }
    } catch (err) {
      console.error('Error in fetchData:', err);
      setWeightRecordsData([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const addRecord = async (record: Omit<WeightRecord, 'id' | 'created_at' | 'updated_at'>) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('weight_records')
        .insert([{ ...record, user_id: user.id }]);

      if (error) {
        console.error('Error adding weight record:', error);
        throw error;
      }
      
      await fetchData();
    } catch (err) {
      console.error('Error in addRecord:', err);
      throw err;
    }
  };

  const updateRecord = async (id: string, record: Partial<WeightRecord>) => {
    try {
      const { error } = await supabase
        .from('weight_records')
        .update(record)
        .eq('id', id);

      if (error) {
        console.error('Error updating weight record:', error);
        throw error;
      }
      
      await fetchData();
    } catch (err) {
      console.error('Error in updateRecord:', err);
      throw err;
    }
  };

  const deleteRecord = async (id: string) => {
    try {
      const { error } = await supabase
        .from('weight_records')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting weight record:', error);
        throw error;
      }
      
      await fetchData();
    } catch (err) {
      console.error('Error in deleteRecord:', err);
      throw err;
    }
  };

  const getAnimalWeightHistory = (animalTag: string): WeightRecord[] => {
    return weightRecordsData
      .filter(record => record.animal_tag === animalTag)
      .sort((a, b) => new Date(a.weight_date).getTime() - new Date(b.weight_date).getTime());
  };

  const getLatestWeightForAnimal = (animalTag: string): WeightRecord | null => {
    const animalRecords = weightRecordsData
      .filter(record => record.animal_tag === animalTag)
      .sort((a, b) => new Date(b.weight_date).getTime() - new Date(a.weight_date).getTime());
    
    return animalRecords.length > 0 ? animalRecords[0] : null;
  };

  const calculateWeightGainForAnimal = (animalTag: string): number => {
    const history = getAnimalWeightHistory(animalTag);
    if (history.length < 2) return 0;
    
    const firstRecord = history[0];
    const lastRecord = history[history.length - 1];
    
    return lastRecord.weight - firstRecord.weight;
  };

  const calculateFCRForAnimal = (animalTag: string): number => {
    const history = getAnimalWeightHistory(animalTag);
    if (history.length < 2) return 0;
    
    // Get the last two records to calculate monthly FCR
    const sortedHistory = history.sort((a, b) => new Date(b.weight_date).getTime() - new Date(a.weight_date).getTime());
    const latestRecord = sortedHistory[0];
    const previousRecord = sortedHistory[1];
    
    const weightGain = latestRecord.weight - previousRecord.weight;
    const feedConsumed = latestRecord.feed_consumed || 0;
    
    // FCR = Feed Consumed / Weight Gain
    return weightGain > 0 ? feedConsumed / weightGain : 0;
  };

  const refreshData = async () => {
    await fetchData();
  };

  return (
    <WeightRecordsContext.Provider
      value={{
        weightRecordsData,
        loading,
        addRecord,
        updateRecord,
        deleteRecord,
        getAnimalWeightHistory,
        getLatestWeightForAnimal,
        calculateWeightGainForAnimal,
        calculateFCRForAnimal,
        refreshData,
      }}
    >
      {children}
    </WeightRecordsContext.Provider>
  );
}

export function useWeightRecords() {
  const context = useContext(WeightRecordsContext);
  if (context === undefined) {
    throw new Error('useWeightRecords must be used within a WeightRecordsProvider');
  }
  return context;
}