import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

export interface HealthRecord {
  id: string;
  date: string;
  event_type: string;
  event: string;
  tag: string;
  diagnosis: string;
  treatment: string;
  drug_administering: string;
  special_notes: string;
  done_by: string;
  created_at: string;
  updated_at: string;
}

interface HealthRecordContextType {
  healthRecordData: HealthRecord[];
  loading: boolean;
  addRecord: (record: Omit<HealthRecord, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateRecord: (id: string, record: Partial<HealthRecord>) => Promise<void>;
  deleteRecord: (id: string) => Promise<void>;
  refreshData: () => Promise<void>;
}

const HealthRecordContext = createContext<HealthRecordContextType | undefined>(undefined);

export function HealthRecordProvider({ children }: { children: React.ReactNode }) {
  const [healthRecordData, setHealthRecordData] = useState<HealthRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('health_records')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching health record data:', error);
        setHealthRecordData([]);
      } else {
        setHealthRecordData(data || []);
      }
    } catch (err) {
      console.error('Error in fetchData:', err);
      setHealthRecordData([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const addRecord = async (record: Omit<HealthRecord, 'id' | 'created_at' | 'updated_at'>) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('health_records')
        .insert([{ ...record, user_id: user.id }]);

      if (error) {
        console.error('Error adding health record:', error);
        throw error;
      }
      
      await fetchData();
    } catch (err) {
      console.error('Error in addRecord:', err);
      throw err;
    }
  };

  const updateRecord = async (id: string, record: Partial<HealthRecord>) => {
    try {
      const { error } = await supabase
        .from('health_records')
        .update(record)
        .eq('id', id);

      if (error) {
        console.error('Error updating health record:', error);
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
        .from('health_records')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting health record:', error);
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
    <HealthRecordContext.Provider
      value={{
        healthRecordData,
        loading,
        addRecord,
        updateRecord,
        deleteRecord,
        refreshData,
      }}
    >
      {children}
    </HealthRecordContext.Provider>
  );
}

export function useHealthRecord() {
  const context = useContext(HealthRecordContext);
  if (context === undefined) {
    throw new Error('useHealthRecord must be used within a HealthRecordProvider');
  }
  return context;
}