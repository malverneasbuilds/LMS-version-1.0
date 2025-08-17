import { supabase } from '../lib/supabase';

/**
 * Automatic animal management rules
 */

// Helper function to calculate age from date of birth
export const calculateAge = (dateOfBirth: string): number => {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};

// Helper function to determine stock type based on sex and age
export const getStockType = (sex: string, dateOfBirth: string): string => {
  const age = calculateAge(dateOfBirth);
  
  if (sex === 'female') {
    if (age < 2) return 'heifer';
    return 'cow';
  } else {
    if (age < 2) return 'steer';
    return 'bull';
  }
};

// Rule: When a calf is added, automatically add it to herd register
export const addCalfToHerdRegister = async (calfRecord: any, userId: string) => {
  try {
    // Calculate birth date from age (approximate)
    const birthDate = new Date();
    birthDate.setMonth(birthDate.getMonth() - calfRecord.age);
    
    // Determine stock type based on sex and age
    const stockType = getStockType(calfRecord.sex, birthDate.toISOString().split('T')[0]);
    
    // Get parent animal to determine breed
    const { data: parentData } = await supabase
      .from('herd_register')
      .select('breed')
      .eq('tag_number', calfRecord.parent_tag)
      .eq('user_id', userId)
      .single();
    
    const herdRecord = {
      user_id: userId,
      tag_number: calfRecord.tag_number,
      breed: parentData?.breed || 'unknown',
      date_of_birth: birthDate.toISOString().split('T')[0],
      sex: calfRecord.sex,
      stock_type: stockType,
      source: 'born_on_farm',
    };
    
    const { error } = await supabase
      .from('herd_register')
      .insert([herdRecord]);
    
    if (error) {
      console.error('Error adding calf to herd register:', error);
    }
  } catch (err) {
    console.error('Error in addCalfToHerdRegister:', err);
  }
};

// Rule: Remove animal from herd register when marked as culled/dead
export const removeAnimalFromHerdRegister = async (animalTag: string, userId: string) => {
  try {
    const { error } = await supabase
      .from('herd_register')
      .delete()
      .eq('tag_number', animalTag)
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error removing animal from herd register:', error);
    }
  } catch (err) {
    console.error('Error in removeAnimalFromHerdRegister:', err);
  }
};

// Rule: Check if animal should be shown as weaned (faint/grey)
export const isAnimalWeaned = (weaningDate: string | null): boolean => {
  if (!weaningDate) return false;
  
  const today = new Date();
  const weanDate = new Date(weaningDate);
  
  return weanDate <= today;
};