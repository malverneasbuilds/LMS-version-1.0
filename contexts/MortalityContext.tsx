import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

export interface MortalityRecord {
  id: string;
  animal_tag: string;
  date_of_event: string;
  event_type: string;
  cause: string;
  weight: number;
  value: number;
  disposal_method: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

interface MortalityContextType {
  mortalityData: MortalityRecord[];
  loading: boolean;
  addRecord: (record: Omit<MortalityRecord, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateRecord: (id: string, record: Partial<MortalityRecord>) => Promise<void>;
  deleteRecord: (id: string) => Promise<void>;
  refreshData: () => Promise<void>;
}

const MortalityContext = createContext<MortalityContextType | undefined>(undefined);

export function MortalityProvider({ children }: { children: React.ReactNode }) {
  const [mortalityData, setMortalityData] = useState<MortalityRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('mortality_register')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching mortality data:', error);
        setMortalityData([]);
      } else {
        setMortalityData(data || []);
      }
    } catch (err) {
      console.error('Error in fetchData:', err);
      setMortalityData([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const addRecord = async (record: Omit<MortalityRecord, 'id' | 'created_at' | 'updated_at'>) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('mortality_register')
        .insert([{ ...record, user_id: user.id }]);

      if (error) {
        console.error('Error adding mortality record:', error);
        throw error;
      }
      
      await fetchData();
    } catch (err) {
      console.error('Error in addRecord:', err);
      throw err;
    }
  };

  const updateRecord = async (id: string, record: Partial<MortalityRecord>) => {
    try {
      const { error } = await supabase
        .from('mortality_register')
        .update(record)
        .eq('id', id);

      if (error) {
        console.error('Error updating mortality record:', error);
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
        .from('mortality_register')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting mortality record:', error);
        throw error;
      }
      
      await fetchData();
    } catch (err) {
      console.error('Error in deleteRecord:', err);
      throw err;
    }
  };

  const refreshData = async () => {
    await fetchData();
  };

  return (
    <MortalityContext.Provider
      value={{
        mortalityData,
        loading,
        addRecord,
        updateRecord,
        deleteRecord,
        refreshData,
      }}
    >
      {children}
    </MortalityContext.Provider>
  );
}

export function useMortality() {
  const context = useContext(MortalityContext);
  if (context === undefined) {
    throw new Error('useMortality must be used within a MortalityProvider');
  }
  return context;
}