import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

export interface HerdRecord {
  id: string;
  tag_number: string;
  breed: string;
  date_of_birth: string;
  sex: string;
  stock_type?: string;
  source?: string;
  created_at: string;
  updated_at: string;
}

interface HerdContextType {
  herdData: HerdRecord[];
  loading: boolean;
  error: string | null;
  addRecord: (record: Omit<HerdRecord, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateRecord: (id: string, record: Partial<HerdRecord>) => Promise<void>;
  deleteRecord: (id: string) => Promise<void>;
}

const HerdContext = createContext<HerdContextType | undefined>(undefined);

export const useHerd = () => {
  const context = useContext(HerdContext);
  if (context === undefined) {
    throw new Error('useHerd must be used within a HerdProvider');
  }
  return context;
};

interface HerdProviderProps {
  children: ReactNode;
}

export const HerdProvider: React.FC<HerdProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [herdData, setHerdData] = useState<HerdRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHerdRecords = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!user) return;
      
      const { data, error } = await supabase
        .from('herd_register')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching herd data:', error);
        throw error;
      }
      
      setHerdData(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error in fetchHerdRecords:', err);
      setHerdData([]);
    } finally {
      setLoading(false);
    }
  };

  const addRecord = async (record: Omit<HerdRecord, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setLoading(true);
      setError(null);

      if (!user) return;

      const { error } = await supabase
        .from('herd_register')
        .insert([{ ...record, user_id: user.id }]);

      if (error) {
        console.error('Error adding herd record:', error);
        throw error;
      }
      
      await fetchHerdRecords();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error in addRecord:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateRecord = async (id: string, record: Partial<HerdRecord>) => {
    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase
        .from('herd_register')
        .update(record)
        .eq('id', id);

      if (error) {
        console.error('Error updating herd record:', error);
        throw error;
      }
      
      await fetchHerdRecords();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error in updateRecord:', err);
    } finally {
      setLoading(false);
    }
  };

  const deleteRecord = async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase
        .from('herd_register')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting herd record:', error);
        throw error;
      }
      
      await fetchHerdRecords();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error in deleteRecord:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchHerdRecords();
    }
  }, [user]);

  const value: HerdContextType = {
    herdData,
    loading,
    error,
    addRecord,
    updateRecord,
    deleteRecord,
  };

  return (
    <HerdContext.Provider value={value}>
      {children}
    </HerdContext.Provider>
  );
};