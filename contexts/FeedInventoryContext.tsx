import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

export interface FeedInventoryRecord {
  id: string;
  feed_type: string;
  brand: string;
  category: string;
  unit: string;
  initial_stock: number;
  current_stock: number;
  cost_per_unit: number;
  total_price: number;
  supplier: string;
  batch_number: string;
  storage_location: string;
  minimum_stock_level: number;
  date_received: string;
  expiry_date: string;
  created_at: string;
  updated_at: string;
}

export interface FeedConsumptionRecord {
  id: string;
  feed_inventory_id: string;
  consumption_date: string;
  amount_consumed: number;
  remaining_stock: number;
  consumption_type: string;
  notes: string;
  recorded_by: string;
  created_at: string;
  updated_at: string;
}

interface FeedInventoryContextType {
  feedInventoryData: FeedInventoryRecord[];
  feedConsumptionData: FeedConsumptionRecord[];
  loading: boolean;
  addInventoryRecord: (record: Omit<FeedInventoryRecord, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateInventoryRecord: (id: string, record: Partial<FeedInventoryRecord>) => Promise<void>;
  deleteInventoryRecord: (id: string) => Promise<void>;
  addConsumptionRecord: (record: Omit<FeedConsumptionRecord, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateConsumptionRecord: (id: string, record: Partial<FeedConsumptionRecord>) => Promise<void>;
  deleteConsumptionRecord: (id: string) => Promise<void>;
  getConsumptionHistory: (feedInventoryId: string) => FeedConsumptionRecord[];
  getMonthlyConsumption: (feedInventoryId: string, year: number, month: number) => number;
  refreshData: () => Promise<void>;
}

const FeedInventoryContext = createContext<FeedInventoryContextType | undefined>(undefined);

export function FeedInventoryProvider({ children }: { children: React.ReactNode }) {
  const [feedInventoryData, setFeedInventoryData] = useState<FeedInventoryRecord[]>([]);
  const [feedConsumptionData, setFeedConsumptionData] = useState<FeedConsumptionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchInventoryData = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('feed_inventory')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching feed inventory data:', error);
        setFeedInventoryData([]);
      } else {
        setFeedInventoryData(data || []);
      }
    } catch (err) {
      console.error('Error in fetchInventoryData:', err);
      setFeedInventoryData([]);
    }
  };

  const fetchConsumptionData = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('feed_consumption_records')
        .select('*')
        .eq('user_id', user.id)
        .order('consumption_date', { ascending: false });

      if (error) {
        console.error('Error fetching feed consumption data:', error);
        setFeedConsumptionData([]);
      } else {
        setFeedConsumptionData(data || []);
      }
    } catch (err) {
      console.error('Error in fetchConsumptionData:', err);
      setFeedConsumptionData([]);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    await Promise.all([fetchInventoryData(), fetchConsumptionData()]);
    setLoading(false);
  };

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const addInventoryRecord = async (record: Omit<FeedInventoryRecord, 'id' | 'created_at' | 'updated_at'>) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('feed_inventory')
        .insert([{ ...record, user_id: user.id }]);

      if (error) {
        console.error('Error adding feed inventory record:', error);
        throw error;
      }
      
      await fetchInventoryData();
    } catch (err) {
      console.error('Error in addInventoryRecord:', err);
      throw err;
    }
  };

  const updateInventoryRecord = async (id: string, record: Partial<FeedInventoryRecord>) => {
    try {
      const { error } = await supabase
        .from('feed_inventory')
        .update(record)
        .eq('id', id);

      if (error) {
        console.error('Error updating feed inventory record:', error);
        throw error;
      }
      
      await fetchInventoryData();
    } catch (err) {
      console.error('Error in updateInventoryRecord:', err);
      throw err;
    }
  };

  const deleteInventoryRecord = async (id: string) => {
    try {
      // First delete all related consumption records
      await supabase
        .from('feed_consumption_records')
        .delete()
        .eq('feed_inventory_id', id);

      // Then delete the inventory record
      const { error } = await supabase
        .from('feed_inventory')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting feed inventory record:', error);
        throw error;
      }
      
      await fetchData();
    } catch (err) {
      console.error('Error in deleteInventoryRecord:', err);
      throw err;
    }
  };

  const addConsumptionRecord = async (record: Omit<FeedConsumptionRecord, 'id' | 'created_at' | 'updated_at'>) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('feed_consumption_records')
        .insert([{ ...record, user_id: user.id }]);

      if (error) {
        console.error('Error adding feed consumption record:', error);
        throw error;
      }
      
      await fetchData();
    } catch (err) {
      console.error('Error in addConsumptionRecord:', err);
      throw err;
    }
  };

  const updateConsumptionRecord = async (id: string, record: Partial<FeedConsumptionRecord>) => {
    try {
      const { error } = await supabase
        .from('feed_consumption_records')
        .update(record)
        .eq('id', id);

      if (error) {
        console.error('Error updating feed consumption record:', error);
        throw error;
      }
      
      await fetchData();
    } catch (err) {
      console.error('Error in updateConsumptionRecord:', err);
      throw err;
    }
  };

  const deleteConsumptionRecord = async (id: string) => {
    try {
      const { error } = await supabase
        .from('feed_consumption_records')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting feed consumption record:', error);
        throw error;
      }
      
      await fetchData();
    } catch (err) {
      console.error('Error in deleteConsumptionRecord:', err);
      throw err;
    }
  };

  const getConsumptionHistory = (feedInventoryId: string): FeedConsumptionRecord[] => {
    return feedConsumptionData
      .filter(record => record.feed_inventory_id === feedInventoryId)
      .sort((a, b) => new Date(b.consumption_date).getTime() - new Date(a.consumption_date).getTime());
  };

  const getMonthlyConsumption = (feedInventoryId: string, year: number, month: number): number => {
    const monthlyRecords = feedConsumptionData.filter(record => {
      const recordDate = new Date(record.consumption_date);
      return record.feed_inventory_id === feedInventoryId &&
             recordDate.getFullYear() === year &&
             recordDate.getMonth() === month - 1; // JavaScript months are 0-indexed
    });

    return monthlyRecords.reduce((total, record) => total + record.amount_consumed, 0);
  };

  const refreshData = async () => {
    await fetchData();
  };

  return (
    <FeedInventoryContext.Provider
      value={{
        feedInventoryData,
        feedConsumptionData,
        loading,
        addInventoryRecord,
        updateInventoryRecord,
        deleteInventoryRecord,
        addConsumptionRecord,
        updateConsumptionRecord,
        deleteConsumptionRecord,
        getConsumptionHistory,
        getMonthlyConsumption,
        refreshData,
      }}
    >
      {children}
    </FeedInventoryContext.Provider>
  );
}

export function useFeedInventory() {
  const context = useContext(FeedInventoryContext);
  if (context === undefined) {
    throw new Error('useFeedInventory must be used within a FeedInventoryProvider');
  }
  return context;
}