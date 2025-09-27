import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Text } from '../../components/typography/Text';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import Colors from '../../constants/Colors';
import { Stack } from 'expo-router';
import { useHerd } from '../../contexts/HerdContext';
import { useCalf } from '../../contexts/CalfContext';
import { PieChart } from '../../components/charts/PieChart';
import { Picker } from '../../components/inputs/Picker';
import { useDrug } from '../../contexts/DrugContext';
import { useMortality } from '../../contexts/MortalityContext';
import { useSales } from '../../contexts/SalesContext';
import { useHealthRecord } from '../../contexts/HealthRecordContext';
import { useFeedInventory } from '../../contexts/FeedInventoryContext';
import { useAnimalFeedIntake } from '../../contexts/AnimalFeedIntakeContext';
import { useAnimalFCR } from '../../contexts/AnimalFCRContext';

// Import all the table components
import { HerdRegisterTable } from '../../components/registration/herd-register/HerdRegisterTable';
import { HerdRegisterModal } from '../../components/registration/herd-register/HerdRegisterModal';
import { CalfRegisterTable } from '../../components/registration/calf-register/CalfRegisterTable';
import { CalfRegisterModal } from '../../components/registration/calf-register/CalfRegisterModal';
import { DrugRegisterTable } from '../../components/registration/drug-register/DrugRegisterTable';
import { DrugRegisterModal } from '../../components/registration/drug-register/DrugRegisterModal';
import { HeatDetectionTable } from '../../components/registration/heat-detection/HeatDetectionTable';
import { HeatDetectionModal } from '../../components/registration/heat-detection/HeatDetectionModal';
import { MortalityRegisterTable } from '../../components/registration/mortality-register/MortalityRegisterTable';
import { MortalityRegisterModal } from '../../components/registration/mortality-register/MortalityRegisterModal';
import { PregnancyRegisterTable } from '../../components/registration/pregnancy-register/PregnancyRegisterTable';
import { PregnancyRegisterModal } from '../../components/registration/pregnancy-register/PregnancyRegisterModal';
import { SalesRegisterTable } from '../../components/registration/sales-register/SalesRegisterTable';
import { SalesRegisterModal } from '../../components/registration/sales-register/SalesRegisterModal';
import { BreedingSoundnessTable } from '../../components/registration/breeding-soundness/BreedingSoundnessTable';
import { BreedingSoundnessModal } from '../../components/registration/breeding-soundness/BreedingSoundnessModal';
import { FeedInventoryTable } from '../../components/registration/feed-inventory/FeedInventoryTable';
import { FeedInventoryModal } from '../../components/registration/feed-inventory/FeedInventoryModal';
import { HealthRecordTable } from '../../components/registration/health-record/HealthRecordTable';
import { HealthRecordModal } from '../../components/registration/health-record/HealthRecordModal';
import { WeightRecordsTable } from '../../components/registration/weight-records/WeightRecordsTable';
import { WeightRecordsModal } from '../../components/registration/weight-records/WeightRecordsModal';
import { AnimalWeightHistoryModal } from '../../components/registration/weight-records/AnimalWeightHistoryModal';
import { AnimalFeedIntakeModal } from '../../components/registration/animal-feed-intake/AnimalFeedIntakeModal';
import { AnimalFCRTable } from '../../components/registration/animal-fcr/AnimalFCRTable';

// Sample data for registers not yet connected to context
const sampleData = {
  drug: [],
  heatDetection: [],
  mortality: [],
  pregnancy: [],
  sales: [],
  breedingSoundness: [],
  feedInventory: [],
  healthRecord: [],
  weightRecords: [],
};

export default function RegisterScreen() {
  return (
    <>
      <Stack.Screen
        options={{
          title: 'Register',
        }}
      />
      <RegisterContent />
    </>
  );
}

function RegisterContent() {
  const { herdData, addRecord: addHerdRecord, updateRecord: updateHerdRecord, deleteRecord: deleteHerdRecord } = useHerd();
  const { calfData, addRecord: addCalfRecord, updateRecord: updateCalfRecord, deleteRecord: deleteCalfRecord } = useCalf();
  
  // Filters for Herd at a Glance
  const [selectedBreed, setSelectedBreed] = useState('all');
  const [selectedSource, setSelectedSource] = useState('all');
  const [chartSlideIndex, setChartSlideIndex] = useState(0);
  
  const { drugData, addRecord: addDrugRecord, updateRecord: updateDrugRecord, deleteRecord: deleteDrugRecord } = useDrug();
  const { mortalityData, addRecord: addMortalityRecord, updateRecord: updateMortalityRecord, deleteRecord: deleteMortalityRecord } = useMortality();
  const { salesData, addRecord: addSalesRecord, updateRecord: updateSalesRecord, deleteRecord: deleteSalesRecord } = useSales();
  const { healthRecordData, addRecord: addHealthRecord, updateRecord: updateHealthRecord, deleteRecord: deleteHealthRecord } = useHealthRecord();
  const { feedInventoryData, addInventoryRecord: addFeedRecord, updateInventoryRecord: updateFeedRecord, deleteInventoryRecord: deleteFeedRecord } = useFeedInventory();
  const { addRecord: addFeedIntakeRecord } = useAnimalFeedIntake();
  const { calculateAndStoreFCR } = useAnimalFCR();
  
  const [activeTab, setActiveTab] = useState('herd');
  
  // Modal states for each register
  const [herdModalVisible, setHerdModalVisible] = useState(false);
  const [calfModalVisible, setCalfModalVisible] = useState(false);
  const [drugModalVisible, setDrugModalVisible] = useState(false);
  const [heatDetectionModalVisible, setHeatDetectionModalVisible] = useState(false);
  const [mortalityModalVisible, setMortalityModalVisible] = useState(false);
  const [pregnancyModalVisible, setPregnancyModalVisible] = useState(false);
  const [salesModalVisible, setSalesModalVisible] = useState(false);
  const [breedingSoundnessModalVisible, setBreedingSoundnessModalVisible] = useState(false);
  const [feedInventoryModalVisible, setFeedInventoryModalVisible] = useState(false);
  const [healthRecordModalVisible, setHealthRecordModalVisible] = useState(false);
  const [weightRecordsModalVisible, setWeightRecordsModalVisible] = useState(false);
  const [weightHistoryModalVisible, setWeightHistoryModalVisible] = useState(false);
  const [selectedAnimalForWeight, setSelectedAnimalForWeight] = useState<string>('');
  const [feedIntakeModalVisible, setFeedIntakeModalVisible] = useState(false);
  const [selectedAnimalForFeed, setSelectedAnimalForFeed] = useState<string>('');
  
  // Edit record states
  const [editingHerdRecord, setEditingHerdRecord] = useState(null);
  const [editingCalfRecord, setEditingCalfRecord] = useState(null);
  const [editingDrugRecord, setEditingDrugRecord] = useState(null);
  const [editingHeatDetectionRecord, setEditingHeatDetectionRecord] = useState(null);
  const [editingMortalityRecord, setEditingMortalityRecord] = useState(null);
  const [editingPregnancyRecord, setEditingPregnancyRecord] = useState(null);
  const [editingSalesRecord, setEditingSalesRecord] = useState(null);
  const [editingBreedingSoundnessRecord, setEditingBreedingSoundnessRecord] = useState(null);
  const [editingFeedInventoryRecord, setEditingFeedInventoryRecord] = useState(null);
  const [editingHealthRecord, setEditingHealthRecord] = useState(null);
  const [editingWeightRecord, setEditingWeightRecord] = useState(null);

  // Data states for registers not yet connected to contexts
  const [heatDetectionData, setHeatDetectionData] = useState(sampleData.heatDetection);
  const [pregnancyData, setPregnancyData] = useState(sampleData.pregnancy);
  const [breedingSoundnessData, setBreedingSoundnessData] = useState(sampleData.breedingSoundness);
  const [weightRecordsData, setWeightRecordsData] = useState(sampleData.weightRecords);

  // Helper function to calculate age from date of birth
  const calculateAge = (dateOfBirth: string): number => {
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
  const getStockType = (animal: any): string => {
    const age = calculateAge(animal.date_of_birth);
    
    if (animal.sex === 'female') {
      if (age < 2) return 'female_calf';
      if (age < 3) return 'heifer';
      return 'cow';
    } else {
      if (age < 2) return 'male_calf';
      if (age < 3) return 'steer';
      return 'bull';
    }
  };

  // Filter herd data based on selected filters
  const filteredHerdData = herdData.filter(animal => {
    if (selectedBreed !== 'all' && animal.breed !== selectedBreed) return false;
    // Note: Source filtering would require additional data about whether animal was born or purchased
    // For now, we'll assume all animals are "born" unless we have purchase records
    return true;
  });

  // Calculate stats
  const stats = {
    cows: filteredHerdData.filter(animal => getStockType(animal) === 'cow').length,
    bulls: filteredHerdData.filter(animal => getStockType(animal) === 'bull').length,
    heifers: filteredHerdData.filter(animal => getStockType(animal) === 'heifer').length,
    steers: filteredHerdData.filter(animal => getStockType(animal) === 'steer').length,
    maleCalves: filteredHerdData.filter(animal => getStockType(animal) === 'male_calf').length,
    femaleCalves: filteredHerdData.filter(animal => getStockType(animal) === 'female_calf').length,
  };

  // Prepare chart data
  const breedDistribution = Object.entries(
    filteredHerdData.reduce((acc, animal) => {
      acc[animal.breed] = (acc[animal.breed] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([breed, count], index) => ({
    name: breed.charAt(0).toUpperCase() + breed.slice(1),
    population: count,
    color: [Colors.success[500], Colors.primary[500], Colors.warning[500], Colors.error[500], Colors.secondary[500]][index % 5],
    legendFontColor: Colors.neutral[700],
  }));

  const stockTypeDistribution = [
    { name: 'Cows', population: stats.cows, color: Colors.primary[500], legendFontColor: Colors.neutral[700] },
    { name: 'Bulls', population: stats.bulls, color: Colors.error[500], legendFontColor: Colors.neutral[700] },
    { name: 'Heifers', population: stats.heifers, color: Colors.warning[500], legendFontColor: Colors.neutral[700] },
    { name: 'Steers', population: stats.steers, color: Colors.secondary[500], legendFontColor: Colors.neutral[700] },
    { name: 'Male Calves', population: stats.maleCalves, color: Colors.success[500], legendFontColor: Colors.neutral[700] },
    { name: 'Female Calves', population: stats.femaleCalves, color: Colors.accent[500], legendFontColor: Colors.neutral[700] },
  ].filter(item => item.population > 0);

  const ageDistribution = Object.entries(
    filteredHerdData.reduce((acc, animal) => {
      const age = calculateAge(animal.date_of_birth);
      const ageGroup = age < 1 ? '< 1 year' : age < 2 ? '1-2 years' : age < 5 ? '2-5 years' : '5+ years';
      acc[ageGroup] = (acc[ageGroup] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([ageGroup, count], index) => ({
    name: ageGroup,
    population: count,
    color: [Colors.primary[400], Colors.success[400], Colors.warning[400], Colors.error[400]][index % 4],
    legendFontColor: Colors.neutral[700],
  }));

  // Get unique breeds for filter
  const breedOptions = [
    { label: 'All', value: 'all' },
    ...Array.from(new Set(herdData.map(animal => animal.breed))).map(breed => ({
      label: breed.charAt(0).toUpperCase() + breed.slice(1),
      value: breed,
    })),
  ];

  const sourceOptions = [
    { label: 'All', value: 'all' },
    { label: 'Born', value: 'born' },
    { label: 'Purchased', value: 'purchased' },
  ];

  // Prepare charts array for horizontal scrolling
  const charts = [
    ...(breedDistribution.length > 0 ? [{
      id: 'breed',
      title: 'Breed Distribution',
      data: breedDistribution
    }] : []),
    ...(stockTypeDistribution.length > 0 ? [{
      id: 'stock',
      title: 'Stock Type Breakdown',
      data: stockTypeDistribution
    }] : []),
    ...(ageDistribution.length > 0 ? [{
      id: 'age',
      title: 'Age Distribution',
      data: ageDistribution
    }] : [])
  ];

  const screenWidth = Dimensions.get('window').width;

  // Herd Register handlers
  const handleAddHerd = () => {
    setEditingHerdRecord(null);
    setHerdModalVisible(true);
  };

  const handleEditHerd = (record: any) => {
    setEditingHerdRecord(record);
    setHerdModalVisible(true);
  };

  const handleDeleteHerd = async (id: string) => {
    await deleteHerdRecord(id);
  };

  const handleSaveHerd = async (record: any) => {
    if (editingHerdRecord) {
      await updateHerdRecord(editingHerdRecord.id, record);
    } else {
      await addHerdRecord(record);
    }
  };

  // Calf Register handlers
  const handleAddCalf = () => {
    setEditingCalfRecord(null);
    setCalfModalVisible(true);
  };

  const handleEditCalf = (record: any) => {
    setEditingCalfRecord(record);
    setCalfModalVisible(true);
  };

  const handleDeleteCalf = async (id: string) => {
    await deleteCalfRecord(id);
  };

  const handleSaveCalf = async (record: any) => {
    if (editingCalfRecord) {
      await updateCalfRecord(editingCalfRecord.id, record);
    } else {
      await addCalfRecord(record);
    }
  };

  // Drug Register handlers
  const handleAddDrug = () => {
    setEditingDrugRecord(null);
    setDrugModalVisible(true);
  };

  const handleEditDrug = (record: any) => {
    setEditingDrugRecord(record);
    setDrugModalVisible(true);
  };

  const handleDeleteDrug = (id: string) => {
    deleteDrugRecord(id);
  };

  const handleSaveDrug = (record: any) => {
    if (editingDrugRecord) {
      updateDrugRecord(editingDrugRecord.id, record);
    } else {
      addDrugRecord(record);
    }
  };

  // Heat Detection handlers
  const handleAddHeatDetection = () => {
    setEditingHeatDetectionRecord(null);
    setHeatDetectionModalVisible(true);
  };

  const handleEditHeatDetection = (record: any) => {
    setEditingHeatDetectionRecord(record);
    setHeatDetectionModalVisible(true);
  };

  const handleDeleteHeatDetection = (id: string) => {
    setHeatDetectionData(heatDetectionData.filter(item => item.id !== id));
  };

  const handleSaveHeatDetection = (record: any) => {
    if (editingHeatDetectionRecord) {
      setHeatDetectionData(heatDetectionData.map(item => 
        item.id === editingHeatDetectionRecord.id ? { ...record, id: editingHeatDetectionRecord.id } : item
      ));
    } else {
      setHeatDetectionData([...heatDetectionData, { ...record, id: Date.now().toString() }]);
    }
  };

  // Mortality Register handlers
  const handleAddMortality = () => {
    setEditingMortalityRecord(null);
    setMortalityModalVisible(true);
  };

  const handleEditMortality = (record: any) => {
    setEditingMortalityRecord(record);
    setMortalityModalVisible(true);
  };

  const handleDeleteMortality = (id: string) => {
    deleteMortalityRecord(id);
  };

  const handleSaveMortality = (record: any) => {
    if (editingMortalityRecord) {
      updateMortalityRecord(editingMortalityRecord.id, record);
    } else {
      addMortalityRecord(record);
    }
  };

  // Pregnancy Register handlers
  const handleAddPregnancy = () => {
    setEditingPregnancyRecord(null);
    setPregnancyModalVisible(true);
  };

  const handleEditPregnancy = (record: any) => {
    setEditingPregnancyRecord(record);
    setPregnancyModalVisible(true);
  };

  const handleDeletePregnancy = (id: string) => {
    setPregnancyData(pregnancyData.filter(item => item.id !== id));
  };

  const handleSavePregnancy = (record: any) => {
    if (editingPregnancyRecord) {
      setPregnancyData(pregnancyData.map(item => 
        item.id === editingPregnancyRecord.id ? { ...record, id: editingPregnancyRecord.id } : item
      ));
    } else {
      setPregnancyData([...pregnancyData, { ...record, id: Date.now().toString() }]);
    }
  };

  // Sales Register handlers
  const handleAddSales = () => {
    setEditingSalesRecord(null);
    setSalesModalVisible(true);
  };

  const handleEditSales = (record: any) => {
    setEditingSalesRecord(record);
    setSalesModalVisible(true);
  };

  const handleDeleteSales = (id: string) => {
    deleteSalesRecord(id);
  };

  const handleSaveSales = (record: any) => {
    if (editingSalesRecord) {
      updateSalesRecord(editingSalesRecord.id, record);
    } else {
      addSalesRecord(record);
    }
  };

  // Breeding Soundness handlers
  const handleAddBreedingSoundness = () => {
    setEditingBreedingSoundnessRecord(null);
    setBreedingSoundnessModalVisible(true);
  };

  const handleEditBreedingSoundness = (record: any) => {
    setEditingBreedingSoundnessRecord(record);
    setBreedingSoundnessModalVisible(true);
  };

  const handleDeleteBreedingSoundness = (id: string) => {
    setBreedingSoundnessData(breedingSoundnessData.filter(item => item.id !== id));
  };

  const handleSaveBreedingSoundness = (record: any) => {
    if (editingBreedingSoundnessRecord) {
      setBreedingSoundnessData(breedingSoundnessData.map(item => 
        item.id === editingBreedingSoundnessRecord.id ? { ...record, id: editingBreedingSoundnessRecord.id } : item
      ));
    } else {
      setBreedingSoundnessData([...breedingSoundnessData, { ...record, id: Date.now().toString() }]);
    }
  };

  // Feed Inventory handlers
  const handleAddFeedInventory = () => {
    setEditingFeedInventoryRecord(null);
    setFeedInventoryModalVisible(true);
  };

  const handleEditFeedInventory = (record: any) => {
    setEditingFeedInventoryRecord(record);
    setFeedInventoryModalVisible(true);
  };

  const handleDeleteFeedInventory = (id: string) => {
    setFeedInventoryData(feedInventoryData.filter(item => item.id !== id));
  };

  const handleSaveFeedInventory = (record: any) => {
    if (editingFeedInventoryRecord) {
      updateFeedRecord(editingFeedInventoryRecord.id, record);
    } else {
      addFeedRecord(record);
    }
  };

  // Health Record handlers
  const handleAddHealthRecord = () => {
    setEditingHealthRecord(null);
    setHealthRecordModalVisible(true);
  };

  const handleEditHealthRecord = (record: any) => {
    setEditingHealthRecord(record);
    setHealthRecordModalVisible(true);
  };

  const handleDeleteHealthRecord = (id: string) => {
    deleteHealthRecord(id);
  };

  const handleSaveHealthRecord = (record: any) => {
    if (editingHealthRecord) {
      updateHealthRecord(editingHealthRecord.id, record);
    } else {
      addHealthRecord(record);
    }
  };

  // Weight Records handlers
  const handleAddWeightRecord = () => {
    setEditingWeightRecord(null);
    setSelectedAnimalForWeight('');
    setWeightRecordsModalVisible(true);
  };

  const handleAddWeightForAnimal = (animalTag: string) => {
    setEditingWeightRecord(null);
    setSelectedAnimalForWeight(animalTag);
    setWeightRecordsModalVisible(true);
  };

  const handleViewAnimalWeights = (animalTag: string) => {
    setSelectedAnimalForWeight(animalTag);
    setWeightHistoryModalVisible(true);
  };
  const handleEditWeightRecord = (record: any) => {
    setEditingWeightRecord(record);
    setWeightRecordsModalVisible(true);
  };

  const handleDeleteWeightRecord = (id: string) => {
    setWeightRecordsData(weightRecordsData.filter(item => item.id !== id));
  };

  const handleSaveWeightRecord = (record: any) => {
    // The modal now handles saving directly to the database
    // This function can be used for additional logic if needed
    console.log('Weight record saved:', record);
  };

  // Feed Intake handlers
  const handleAddFeedIntakeForAnimal = (animalTag: string) => {
    setSelectedAnimalForFeed(animalTag);
    setFeedIntakeModalVisible(true);
  };

  const handleSaveFeedIntake = async (record: any) => {
    await addFeedIntakeRecord(record);
    // Auto-calculate FCR after adding feed intake
    try {
      await calculateAndStoreFCR(record.animal_tag);
    } catch (error) {
      console.error('Error calculating FCR:', error);
    }
    setFeedIntakeModalVisible(false);
  };

  const tabs = [
    { id: 'herd', title: 'Herd Register' },
    { id: 'calf', title: 'Calf Register' },
    { id: 'drug', title: 'Drug Register' },
    { id: 'mortality', title: 'Cull & Mortalities' },
    { id: 'pregnancy', title: 'Pregnancy & Calving' },
    { id: 'sales', title: 'Sales & Purchases' },
    { id: 'breeding', title: 'Bull Breeding Soundness' },
    { id: 'feed', title: 'Feed Inventory' },
    { id: 'health', title: 'Health Record' },
    { id: 'heat', title: 'Heat Detection' },
    { id: 'weight', title: 'Weight Records' },
    { id: 'fcr', title: 'Feed Conversion Ratio' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'herd':
        return (
          <>
            <HerdRegisterTable
              data={herdData}
              onAdd={handleAddHerd}
              onEdit={handleEditHerd}
              onDelete={handleDeleteHerd}
            />
            <HerdRegisterModal
              visible={herdModalVisible}
              onClose={() => setHerdModalVisible(false)}
              onSave={handleSaveHerd}
              editRecord={editingHerdRecord}
            />
          </>
        );
      case 'calf':
        return (
          <>
            <CalfRegisterTable
              data={calfData}
              onAdd={handleAddCalf}
              onEdit={handleEditCalf}
              onDelete={handleDeleteCalf}
            />
            <CalfRegisterModal
              visible={calfModalVisible}
              onClose={() => setCalfModalVisible(false)}
              onSave={handleSaveCalf}
              editRecord={editingCalfRecord}
            />
          </>
        );
      case 'drug':
        return (
          <>
            <DrugRegisterTable
              data={drugData}
              onAdd={handleAddDrug}
              onEdit={handleEditDrug}
              onDelete={handleDeleteDrug}
            />
            <DrugRegisterModal
              visible={drugModalVisible}
              onClose={() => setDrugModalVisible(false)}
              onSave={handleSaveDrug}
              editRecord={editingDrugRecord}
            />
          </>
        );
      case 'heat':
        return (
          <>
            <HeatDetectionTable
              data={heatDetectionData}
              onAdd={handleAddHeatDetection}
              onEdit={handleEditHeatDetection}
              onDelete={handleDeleteHeatDetection}
            />
            <HeatDetectionModal
              visible={heatDetectionModalVisible}
              onClose={() => setHeatDetectionModalVisible(false)}
              onSave={handleSaveHeatDetection}
              editRecord={editingHeatDetectionRecord}
            />
          </>
        );
      case 'mortality':
        return (
          <>
            <MortalityRegisterTable
              data={mortalityData}
              onAdd={handleAddMortality}
              onEdit={handleEditMortality}
              onDelete={handleDeleteMortality}
            />
            <MortalityRegisterModal
              visible={mortalityModalVisible}
              onClose={() => setMortalityModalVisible(false)}
              onSave={handleSaveMortality}
              editRecord={editingMortalityRecord}
            />
          </>
        );
      case 'pregnancy':
        return (
          <>
            <PregnancyRegisterTable
              data={pregnancyData}
              onAdd={handleAddPregnancy}
              onEdit={handleEditPregnancy}
              onDelete={handleDeletePregnancy}
            />
            <PregnancyRegisterModal
              visible={pregnancyModalVisible}
              onClose={() => setPregnancyModalVisible(false)}
              onSave={handleSavePregnancy}
              editRecord={editingPregnancyRecord}
            />
          </>
        );
      case 'sales':
        return (
          <>
            <SalesRegisterTable
              data={salesData}
              onAdd={handleAddSales}
              onEdit={handleEditSales}
              onDelete={handleDeleteSales}
            />
            <SalesRegisterModal
              visible={salesModalVisible}
              onClose={() => setSalesModalVisible(false)}
              onSave={handleSaveSales}
              editRecord={editingSalesRecord}
            />
          </>
        );
      case 'breeding':
        return (
          <>
            <BreedingSoundnessTable
              data={breedingSoundnessData}
              onAdd={handleAddBreedingSoundness}
              onEdit={handleEditBreedingSoundness}
              onDelete={handleDeleteBreedingSoundness}
            />
            <BreedingSoundnessModal
              visible={breedingSoundnessModalVisible}
              onClose={() => setBreedingSoundnessModalVisible(false)}
              onSave={handleSaveBreedingSoundness}
              editRecord={editingBreedingSoundnessRecord}
            />
          </>
        );
      case 'feed':
        return (
          <>
            <FeedInventoryTable
              data={feedInventoryData}
              onAdd={handleAddFeedInventory}
              onEdit={handleEditFeedInventory}
              onDelete={handleDeleteFeedInventory}
            />
            <FeedInventoryModal
              visible={feedInventoryModalVisible}
              onClose={() => setFeedInventoryModalVisible(false)}
              onSave={handleSaveFeedInventory}
              editRecord={editingFeedInventoryRecord}
            />
          </>
        );
      case 'health':
        return (
          <>
            <HealthRecordTable
              data={healthRecordData}
              onAdd={handleAddHealthRecord}
              onEdit={handleEditHealthRecord}
              onDelete={handleDeleteHealthRecord}
            />
            <HealthRecordModal
              visible={healthRecordModalVisible}
              onClose={() => setHealthRecordModalVisible(false)}
              onSave={handleSaveHealthRecord}
              editRecord={editingHealthRecord}
            />
          </>
        );
      case 'weight':
        return (
          <>
            <WeightRecordsTable
              data={weightRecordsData}
              onAdd={handleAddWeightRecord}
              onEdit={handleEditWeightRecord}
              onDelete={handleDeleteWeightRecord}
              onAddWeight={handleAddWeightForAnimal}
              onViewWeights={handleViewAnimalWeights}
              onAddFeedIntake={handleAddFeedIntakeForAnimal}
            />
            <WeightRecordsModal
              visible={weightRecordsModalVisible}
              onClose={() => setWeightRecordsModalVisible(false)}
              onSave={handleSaveWeightRecord}
              editRecord={editingWeightRecord}
              preselectedAnimal={selectedAnimalForWeight}
            />
            <AnimalWeightHistoryModal
              visible={weightHistoryModalVisible}
              onClose={() => setWeightHistoryModalVisible(false)}
              animalTag={selectedAnimalForWeight}
              onAddWeight={() => {
                setWeightHistoryModalVisible(false);
                handleAddWeightForAnimal(selectedAnimalForWeight);
              }}
            />
            <AnimalFeedIntakeModal
              visible={feedIntakeModalVisible}
              onClose={() => setFeedIntakeModalVisible(false)}
              onSave={handleSaveFeedIntake}
              preselectedAnimal={selectedAnimalForFeed}
            />
          </>
        );
      case 'fcr':
        return (
          <>
            <AnimalFCRTable
              onAddFeedIntake={handleAddFeedIntakeForAnimal}
            />
            <AnimalFeedIntakeModal
              visible={feedIntakeModalVisible}
              onClose={() => setFeedIntakeModalVisible(false)}
              onSave={handleSaveFeedIntake}
              preselectedAnimal={selectedAnimalForFeed}
            />
          </>
        );
      default:
        return (
          <View style={styles.placeholderContainer}>
            <Text variant="h6" color="neutral.500">
              {tabs.find(tab => tab.id === activeTab)?.title} - Coming Soon
            </Text>
            <Text variant="body2" color="neutral.400" style={styles.placeholderText}>
              This register will be implemented in the next update.
            </Text>
          </View>
        );
    }
  };

  return (
    <ScreenContainer style={styles.container}>
      {/* Herd at a Glance Section */}
      <View style={styles.herdGlanceContainer}>
        <Text variant="h5" weight="medium" style={styles.herdGlanceTitle}>
          Herd at a Glance
        </Text>
        
        {/* Filters */}
        <View style={styles.filtersContainer}>
          <View style={styles.filterItem}>
            <Picker
              label="Breed"
              value={selectedBreed}
              onValueChange={setSelectedBreed}
              items={breedOptions}
              style={styles.filterPicker}
            />
          </View>
          <View style={styles.filterItem}>
            <Picker
              label="Source"
              value={selectedSource}
              onValueChange={setSelectedSource}
              items={sourceOptions}
              style={styles.filterPicker}
            />
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text variant="h3" weight="bold" color="primary.500">
              {stats.cows}
            </Text>
            <Text variant="caption" color="neutral.600">
              Cows
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text variant="h3" weight="bold" color="error.500">
              {stats.bulls}
            </Text>
            <Text variant="caption" color="neutral.600">
              Bulls
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text variant="h3" weight="bold" color="warning.500">
              {stats.heifers}
            </Text>
            <Text variant="caption" color="neutral.600">
              Heifers
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text variant="h3" weight="bold" color="secondary.500">
              {stats.steers}
            </Text>
            <Text variant="caption" color="neutral.600">
              Steers
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text variant="h3" weight="bold" color="success.500">
              {stats.maleCalves}
            </Text>
            <Text variant="caption" color="neutral.600">
              Male Calves
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text variant="h3" weight="bold" color="accent.500">
              {stats.femaleCalves}
            </Text>
            <Text variant="caption" color="neutral.600">
              Female Calves
            </Text>
          </View>
        </View>

        {/* Charts */}
        {charts.length > 0 && (
          <View style={styles.chartsContainer}>
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={(event) => {
                const slide = Math.round(event.nativeEvent.contentOffset.x / screenWidth);
                setChartSlideIndex(slide);
              }}
              scrollEventThrottle={16}
              style={styles.chartsScrollView}
            >
              {charts.map((chart) => (
                <View key={chart.id} style={[styles.chartSlide, { width: screenWidth - 32 }]}>
                  <Text variant="h6" weight="medium" style={styles.chartTitle}>
                    {chart.title}
                  </Text>
                  <PieChart data={chart.data} height={200} />
                </View>
              ))}
            </ScrollView>
            
            {charts.length > 1 && (
              <View style={styles.paginationContainer}>
                {charts.map((_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.paginationDot,
                      chartSlideIndex === index && styles.paginationDotActive,
                    ]}
                  />
                ))}
              </View>
            )}
          </View>
        )}
      </View>

      <View style={styles.tabsContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsScrollContent}
          style={styles.tabsScrollView}
        >
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tab, activeTab === tab.id && styles.activeTab]}
              onPress={() => setActiveTab(tab.id)}
            >
              <Text
                variant="body2"
                weight={activeTab === tab.id ? 'medium' : 'regular'}
                color={activeTab === tab.id ? 'primary.500' : 'neutral.600'}
                style={styles.tabText}
              >
                {tab.title}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        
        {/* Scroll indicator */}
        <View style={styles.scrollIndicator}>
          <View style={styles.scrollIndicatorDot} />
          <View style={styles.scrollIndicatorDot} />
          <View style={styles.scrollIndicatorDot} />
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderContent()}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral[50],
  },
  tabsContainer: {
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
    paddingVertical: 8,
  },
  tabsScrollView: {
    maxHeight: 60,
  },
  tabsScrollContent: {
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  tab: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'transparent',
    minWidth: 100,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: Colors.primary[50],
    borderColor: Colors.primary[200],
  },
  tabText: {
    textAlign: 'center',
  },
  scrollIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 4,
    gap: 4,
  },
  scrollIndicatorDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.neutral[400],
  },
  content: {
    flex: 1,
    padding: 16,
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  placeholderText: {
    textAlign: 'center',
    marginTop: 8,
  },
  herdGlanceContainer: {
    backgroundColor: Colors.white,
    padding: 16,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
  },
  herdGlanceTitle: {
    marginBottom: 16,
  },
  filtersContainer: {
    flexDirection: 'row',
    marginBottom: 24,
    gap: 16,
  },
  filterItem: {
    flex: 1,
  },
  filterPicker: {
    marginBottom: 0,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
  },
  statItem: {
    width: '33.33%',
    alignItems: 'center',
    paddingVertical: 12,
  },
  chartsContainer: {
    marginBottom: 24,
  },
  chartsScrollView: {
    marginHorizontal: -16,
  },
  chartSlide: {
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  chartTitle: {
    marginBottom: 12,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.neutral[300],
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: Colors.primary[500],
    width: 16,
  },
});