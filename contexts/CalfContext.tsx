import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

export interface CalfRecord {
  id: string;
  tag_number: string;
  parent_tag: string;
  age: number;
  sex: string;
  birth_weight: number;
  weaning_weight: number;
  weaning_date: string;
  created_at: string;
  updated_at: string;
}

interface CalfContextType {
  calfData: CalfRecord[];
  loading: boolean;
  addRecord: (record: Omit<CalfRecord, 'id'>) => Promise<void>;
  updateRecord: (id: string, record: Partial<CalfRecord>) => Promise<void>;
  deleteRecord: (id: string) => Promise<void>;
  refreshData: () => Promise<void>;
}

const CalfContext = createContext<CalfContextType | undefined>(undefined);

export function CalfProvider({ children }: { children: React.ReactNode }) {
  const [calfData, setCalfData] = useState<CalfRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('calf_register')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching calf data:', error);
        throw error;
      }
      
      setCalfData(data || []);
    } catch (err) {
      console.error('Error in fetchData:', err);
      setCalfData([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

 
  const addRecord = async (record: Omit<CalfRecord, 'id' | 'created_at' | 'updated_at'>) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('calf_register')
        .insert([{ ...record, user_id: user.id }]);

      if (error) {
        console.error('Error adding calf record:', error);
        throw error;
      }
      
      await fetchData();
    } catch (err) {
      console.error('Error in addRecord:', err);
      throw err;
    }
  };

  const updateRecord = async (id: string, record: Partial<CalfRecord>) => {
    try {
      const { error } = await supabase
        .from('calf_register')
        .update(record)
        .eq('id', id);

      if (error) {
        console.error('Error updating calf record:', error);
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
        .from('calf_register')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting calf record:', error);
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
    <CalfContext.Provider
      value={{
        calfData,
        loading,
        addRecord,
        updateRecord,
        deleteRecord,
        refreshData,
      }}
    >
      {children}
    </CalfContext.Provider>
  );
}

export function useCalf() {
  const context = useContext(CalfContext);
  if (context === undefined) {
    throw new Error('useCalf must be used within a CalfProvider');
  }
  return context;
}