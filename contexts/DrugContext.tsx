import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

export interface DrugRecord {
  id: string;
  drug_name: string;
  expiry_date: string;
  quantity: string;
  date_received: string;
  unit_cost: number;
  withdrawal_period: string;
  created_at: string;
  updated_at: string;
}

interface DrugContextType {
  drugData: DrugRecord[];
  loading: boolean;
  addRecord: (record: Omit<DrugRecord, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateRecord: (id: string, record: Partial<DrugRecord>) => Promise<void>;
  deleteRecord: (id: string) => Promise<void>;
  refreshData: () => Promise<void>;
}

const DrugContext = createContext<DrugContextType | undefined>(undefined);

export function DrugProvider({ children }: { children: React.ReactNode }) {
  const [drugData, setDrugData] = useState<DrugRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('drug_register')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching drug data:', error);
        setDrugData([]);
      } else {
        setDrugData(data || []);
      }
    } catch (err) {
      console.error('Error in fetchData:', err);
      setDrugData([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const addRecord = async (record: Omit<DrugRecord, 'id' | 'created_at' | 'updated_at'>) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('drug_register')
        .insert([{ ...record, user_id: user.id }]);

      if (error) {
        console.error('Error adding drug record:', error);
        throw error;
      }
      
      await fetchData();
    } catch (err) {
      console.error('Error in addRecord:', err);
      throw err;
    }
  };

  const updateRecord = async (id: string, record: Partial<DrugRecord>) => {
    try {
      const { error } = await supabase
        .from('drug_register')
        .update(record)
        .eq('id', id);

      if (error) {
        console.error('Error updating drug record:', error);
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
        .from('drug_register')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting drug record:', error);
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
    <DrugContext.Provider
      value={{
        drugData,
        loading,
        addRecord,
        updateRecord,
        deleteRecord,
        refreshData,
      }}
    >
      {children}
    </DrugContext.Provider>
  );
}

export function useDrug() {
  const context = useContext(DrugContext);
  if (context === undefined) {
    throw new Error('useDrug must be used within a DrugProvider');
  }
  return context;
}