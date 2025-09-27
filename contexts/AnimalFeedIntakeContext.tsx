import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

export interface AnimalFeedIntakeRecord {
  id: string;
  animal_tag: string;
  feed_type: string;
  amount_consumed: number;
  intake_date: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

interface AnimalFeedIntakeContextType {
  animalFeedIntakeData: AnimalFeedIntakeRecord[];
  loading: boolean;
  addRecord: (record: Omit<AnimalFeedIntakeRecord, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateRecord: (id: string, record: Partial<AnimalFeedIntakeRecord>) => Promise<void>;
  deleteRecord: (id: string) => Promise<void>;
  getAnimalFeedIntake: (animalTag: string, startDate?: string, endDate?: string) => AnimalFeedIntakeRecord[];
  getTotalFeedConsumed: (animalTag: string, startDate?: string, endDate?: string) => number;
  refreshData: () => Promise<void>;
}

const AnimalFeedIntakeContext = createContext<AnimalFeedIntakeContextType | undefined>(undefined);

export function AnimalFeedIntakeProvider({ children }: { children: React.ReactNode }) {
  const [animalFeedIntakeData, setAnimalFeedIntakeData] = useState<AnimalFeedIntakeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('animal_feed_intake')
        .select('*')
        .eq('user_id', user.id)
        .order('intake_date', { ascending: false });

      if (error) {
        console.error('Error fetching animal feed intake data:', error);
        setAnimalFeedIntakeData([]);
      } else {
        setAnimalFeedIntakeData(data || []);
      }
    } catch (err) {
      console.error('Error in fetchData:', err);
      setAnimalFeedIntakeData([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const addRecord = async (record: Omit<AnimalFeedIntakeRecord, 'id' | 'created_at' | 'updated_at'>) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('animal_feed_intake')
        .insert([{ ...record, user_id: user.id }]);

      if (error) {
        console.error('Error adding animal feed intake record:', error);
        throw error;
      }
      
      await fetchData();
    } catch (err) {
      console.error('Error in addRecord:', err);
      throw err;
    }
  };

  const updateRecord = async (id: string, record: Partial<AnimalFeedIntakeRecord>) => {
    try {
      const { error } = await supabase
        .from('animal_feed_intake')
        .update(record)
        .eq('id', id);

      if (error) {
        console.error('Error updating animal feed intake record:', error);
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
        .from('animal_feed_intake')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting animal feed intake record:', error);
        throw error;
      }
      
      await fetchData();
    } catch (err) {
      console.error('Error in deleteRecord:', err);
      throw err;
    }
  };

  const getAnimalFeedIntake = (animalTag: string, startDate?: string, endDate?: string): AnimalFeedIntakeRecord[] => {
    let filteredData = animalFeedIntakeData.filter(record => record.animal_tag === animalTag);
    
    if (startDate) {
      filteredData = filteredData.filter(record => record.intake_date >= startDate);
    }
    
    if (endDate) {
      filteredData = filteredData.filter(record => record.intake_date <= endDate);
    }
    
    return filteredData.sort((a, b) => new Date(a.intake_date).getTime() - new Date(b.intake_date).getTime());
  };

  const getTotalFeedConsumed = (animalTag: string, startDate?: string, endDate?: string): number => {
    const feedRecords = getAnimalFeedIntake(animalTag, startDate, endDate);
    return feedRecords.reduce((total, record) => total + record.amount_consumed, 0);
  };

  const refreshData = async () => {
    await fetchData();
  };

  return (
    <AnimalFeedIntakeContext.Provider
      value={{
        animalFeedIntakeData,
        loading,
        addRecord,
        updateRecord,
        deleteRecord,
        getAnimalFeedIntake,
        getTotalFeedConsumed,
        refreshData,
      }}
    >
      {children}
    </AnimalFeedIntakeContext.Provider>
  );
}

export function useAnimalFeedIntake() {
  const context = useContext(AnimalFeedIntakeContext);
  if (context === undefined) {
    throw new Error('useAnimalFeedIntake must be used within an AnimalFeedIntakeProvider');
  }
  return context;
}