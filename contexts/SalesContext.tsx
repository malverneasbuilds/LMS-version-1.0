import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

export interface SalesRecord {
  id: string;
  animal_tag: string;
  transaction_date: string;
  transaction_type: string;
  buyer_seller: string;
  weight: number;
  price_per_kg: number;
  total_price: number;
  payment_method: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

interface SalesContextType {
  salesData: SalesRecord[];
  loading: boolean;
  addRecord: (record: Omit<SalesRecord, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateRecord: (id: string, record: Partial<SalesRecord>) => Promise<void>;
  deleteRecord: (id: string) => Promise<void>;
  refreshData: () => Promise<void>;
}

const SalesContext = createContext<SalesContextType | undefined>(undefined);

export function SalesProvider({ children }: { children: React.ReactNode }) {
  const [salesData, setSalesData] = useState<SalesRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('sales_register')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching sales data:', error);
        setSalesData([]);
      } else {
        setSalesData(data || []);
      }
    } catch (err) {
      console.error('Error in fetchData:', err);
      setSalesData([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const addRecord = async (record: Omit<SalesRecord, 'id' | 'created_at' | 'updated_at'>) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('sales_register')
        .insert([{ ...record, user_id: user.id }]);

      if (error) {
        console.error('Error adding sales record:', error);
        throw error;
      }
      
      await fetchData();
    } catch (err) {
      console.error('Error in addRecord:', err);
      throw err;
    }
  };

  const updateRecord = async (id: string, record: Partial<SalesRecord>) => {
    try {
      const { error } = await supabase
        .from('sales_register')
        .update(record)
        .eq('id', id);

      if (error) {
        console.error('Error updating sales record:', error);
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
        .from('sales_register')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting sales record:', error);
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
    <SalesContext.Provider
      value={{
        salesData,
        loading,
        addRecord,
        updateRecord,
        deleteRecord,
        refreshData,
      }}
    >
      {children}
    </SalesContext.Provider>
  );
}

export function useSales() {
  const context = useContext(SalesContext);
  if (context === undefined) {
    throw new Error('useSales must be used within a SalesProvider');
  }
  return context;
}