import { supabase } from '../lib/supabase';

// Diverse sample data for testing
const breeds = ['brahman', 'friesian', 'angus', 'jersey', 'mashona', 'ankole', 'cross'];
const sexes = ['male', 'female'];
const stockTypes = ['bull', 'heifer', 'cow', 'steer'];
const sources = ['purchased', 'born_on_farm', 'unknown'];
const deliveryTypes = ['normal', 'assisted', 'c_section'];
const pregnancySafetyOptions = ['safe', 'not_safe', 'use_with_caution'];
const drugTypes = ['antibiotic', 'vaccine', 'dewormer', 'vitamin', 'hormone', 'analgesic'];

// Generate random date within range
const getRandomDate = (startDate: Date, endDate: Date): string => {
  const start = startDate.getTime();
  const end = endDate.getTime();
  const randomTime = start + Math.random() * (end - start);
  return new Date(randomTime).toISOString().split('T')[0];
};

// Generate random number within range
const getRandomNumber = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Generate random decimal within range
const getRandomDecimal = (min: number, max: number, decimals: number = 2): number => {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
};

// Generate random element from array
const getRandomElement = <T>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)];
};

// Generate herd register dummy data
export const generateHerdData = (userId: string, count: number = 50) => {
  const herdData = [];
  
  for (let i = 1; i <= count; i++) {
    const sex = getRandomElement(sexes);
    const breed = getRandomElement(breeds);
    const source = getRandomElement(sources);
    
    // Generate age between 6 months and 10 years
    const ageInMonths = getRandomNumber(6, 120);
    const birthDate = new Date();
    birthDate.setMonth(birthDate.getMonth() - ageInMonths);
    
    // Determine stock type based on sex and age
    const age = Math.floor(ageInMonths / 12);
    let stockType;
    if (sex === 'female') {
      stockType = age < 2 ? 'heifer' : 'cow';
    } else {
      stockType = age < 2 ? 'steer' : 'bull';
    }
    
    herdData.push({
      user_id: userId,
      tag_number: `A${i.toString().padStart(3, '0')}`,
      breed,
      date_of_birth: birthDate.toISOString().split('T')[0],
      sex,
      stock_type: stockType,
      source,
    });
  }
  
  return herdData;
};

// Generate calf register dummy data
export const generateCalfData = (userId: string, herdData: any[], count: number = 20) => {
  const calfData = [];
  const femaleAnimals = herdData.filter(animal => animal.sex === 'female');
  
  for (let i = 1; i <= count; i++) {
    const parentAnimal = getRandomElement(femaleAnimals);
    const sex = getRandomElement(sexes);
    const ageInMonths = getRandomNumber(1, 18);
    const deliveryType = getRandomElement(deliveryTypes);
    const observer = getRandomElement(['John Smith', 'Mary Johnson', 'David Wilson', 'Sarah Brown']);
    
    // Generate weights based on age and sex
    const birthWeight = getRandomDecimal(25, 45);
    const weaningWeight = ageInMonths >= 6 ? getRandomDecimal(80, 150) : 0;
    const weaningDate = ageInMonths >= 6 ? getRandomDate(
      new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      new Date()
    ) : '';
    
    calfData.push({
      user_id: userId,
      tag_number: `${parentAnimal.tag_number}-C${i.toString().padStart(2, '0')}`,
      parent_tag: parentAnimal.tag_number,
      age: ageInMonths,
      sex,
      birth_weight: birthWeight,
      weaning_weight: weaningWeight,
      weaning_date: weaningDate,
      observer,
      delivery_type: deliveryType,
    });
  }
  
  return calfData;
};

// Generate drug register dummy data
export const generateDrugData = (userId: string, count: number = 15) => {
  const drugData = [];
  const drugNames = [
    'Penicillin', 'Oxytetracycline', 'Ivermectin', 'Vitamin B12', 
    'Iron Dextran', 'Dexamethasone', 'Flunixin', 'Ceftiofur',
    'Tulathromycin', 'Meloxicam', 'Doramectin', 'Levamisole',
    'Albendazole', 'Fenbendazole', 'Closantel'
  ];
  
  for (let i = 0; i < count; i++) {
    const drugName = drugNames[i];
    const drugType = getRandomElement(drugTypes);
    const pregnancySafety = getRandomElement(pregnancySafetyOptions);
    const inStock = Math.random() > 0.3; // 70% chance of being in stock
    const cost = getRandomDecimal(15, 200);
    const withdrawalPeriod = getRandomNumber(0, 28);
    
    // Generate expiry date 6 months to 3 years from now
    const expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + getRandomNumber(6, 36));
    
    drugData.push({
      user_id: userId,
      drug_name: drugName,
      drug_type: drugType,
      expiry_date: expiryDate.toISOString().split('T')[0],
      pregnancy_safety: pregnancySafety,
      in_stock: inStock,
      cost,
      withdrawal_period: withdrawalPeriod,
    });
  }
  
  return drugData;
};

// Generate mortality data
export const generateMortalityData = (userId: string, herdData: any[], count: number = 5) => {
  const mortalityData = [];
  const causes = ['Disease', 'Accident', 'Old Age', 'Predator', 'Unknown', 'Injury'];
  const disposalMethods = ['burial', 'burning', 'rendering', 'veterinary_disposal'];
  const eventTypes = ['death', 'cull', 'emergency_slaughter'];
  
  for (let i = 0; i < count; i++) {
    const animal = getRandomElement(herdData);
    const eventType = getRandomElement(eventTypes);
    const cause = getRandomElement(causes);
    const disposalMethod = getRandomElement(disposalMethods);
    const weight = getRandomDecimal(200, 600);
    const value = getRandomDecimal(500, 2000);
    
    // Generate event date within last 6 months
    const eventDate = getRandomDate(
      new Date(Date.now() - 180 * 24 * 60 * 60 * 1000), // 6 months ago
      new Date()
    );
    
    mortalityData.push({
      user_id: userId,
      animal_tag: animal.tag_number,
      date_of_event: eventDate,
      event_type: eventType,
      cause,
      weight,
      value,
      disposal_method: disposalMethod,
      notes: `${eventType} due to ${cause.toLowerCase()}`,
    });
  }
  
  return mortalityData;
};

// Generate sales data
export const generateSalesData = (userId: string, herdData: any[], count: number = 10) => {
  const salesData = [];
  const transactionTypes = ['sale', 'purchase'];
  const paymentMethods = ['cash', 'bank_transfer', 'check', 'credit'];
  const buyersSellers = ['Local Market', 'John Farmer', 'ABC Livestock', 'City Butchery', 'Export Company'];
  
  for (let i = 0; i < count; i++) {
    const animal = getRandomElement(herdData);
    const transactionType = getRandomElement(transactionTypes);
    const buyerSeller = getRandomElement(buyersSellers);
    const paymentMethod = getRandomElement(paymentMethods);
    const weight = getRandomDecimal(300, 700);
    const pricePerKg = getRandomDecimal(4, 8);
    const totalPrice = weight * pricePerKg;
    
    // Generate transaction date within last year
    const transactionDate = getRandomDate(
      new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), // 1 year ago
      new Date()
    );
    
    salesData.push({
      user_id: userId,
      animal_tag: animal.tag_number,
      transaction_date: transactionDate,
      transaction_type: transactionType,
      buyer_seller: buyerSeller,
      weight,
      price_per_kg: pricePerKg,
      total_price: totalPrice,
      payment_method: paymentMethod,
      notes: `${transactionType} transaction with ${buyerSeller}`,
    });
  }
  
  return salesData;
};

// Generate weight records data
export const generateWeightData = (userId: string, herdData: any[], count: number = 100) => {
  const weightData = [];
  
  // Generate multiple weight records per animal
  herdData.forEach(animal => {
    const numRecords = getRandomNumber(2, 6); // 2-6 weight records per animal
    
    for (let i = 0; i < numRecords; i++) {
      // Generate weight date within last year
      const weightDate = getRandomDate(
        new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), // 1 year ago
        new Date()
      );
      
      // Generate realistic weight based on animal type and age
      const age = calculateAge(animal.date_of_birth);
      let baseWeight;
      
      if (animal.sex === 'female') {
        baseWeight = age < 2 ? getRandomDecimal(150, 300) : getRandomDecimal(400, 600);
      } else {
        baseWeight = age < 2 ? getRandomDecimal(200, 400) : getRandomDecimal(500, 800);
      }
      
      // Add some variation
      const weight = baseWeight + getRandomDecimal(-50, 50);
      
      weightData.push({
        user_id: userId,
        animal_tag: animal.tag_number,
        weight_date: weightDate,
        weight: Math.max(weight, 50), // Minimum 50kg
        notes: i === 0 ? 'Initial weight record' : `Monthly weight check ${i + 1}`,
      });
    }
  });
  
  return weightData.slice(0, count); // Limit to requested count
};

// Generate health records data
export const generateHealthData = (userId: string, herdData: any[], count: number = 30) => {
  const healthData = [];
  const eventTypes = ['mass', 'individual'];
  const events = ['Vaccination', 'Deworming', 'Treatment', 'Health Check', 'Pregnancy Check'];
  const diagnoses = ['Healthy', 'Parasites', 'Infection', 'Injury', 'Pregnant', 'Nutritional Deficiency'];
  const treatments = ['Vaccine', 'Dewormer', 'Antibiotic', 'Vitamin Injection', 'Wound Care', 'Dietary Supplement'];
  const drugs = ['Ivermectin', 'Penicillin', 'Vitamin B12', 'Iron Dextran', 'Oxytetracycline'];
  const veterinarians = ['Dr. Smith', 'Dr. Johnson', 'Dr. Wilson', 'Farm Manager'];
  
  for (let i = 0; i < count; i++) {
    const eventType = getRandomElement(eventTypes);
    const event = getRandomElement(events);
    const diagnosis = getRandomElement(diagnoses);
    const treatment = getRandomElement(treatments);
    const drug = getRandomElement(drugs);
    const doneBy = getRandomElement(veterinarians);
    
    // Generate date within last year
    const date = getRandomDate(
      new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), // 1 year ago
      new Date()
    );
    
    let tag = '';
    if (eventType === 'individual') {
      const animal = getRandomElement(herdData);
      tag = animal.tag_number;
    }
    
    healthData.push({
      user_id: userId,
      date,
      event_type: eventType,
      event,
      tag,
      diagnosis,
      treatment,
      drug_administering: drug,
      special_notes: `${event} - ${diagnosis}`,
      done_by: doneBy,
    });
  }
  
  return healthData;
};

// Generate feed inventory dummy data
export const generateFeedInventoryData = (userId: string, count: number = 12) => {
  const feedInventoryData = [];
  const feedTypes = [
    'dairy_meal', 'beef_fattener', 'calf_starter', 'hay', 'silage', 
    'concentrates', 'minerals', 'salt', 'supplements', 'molasses', 'bran', 'maize'
  ];
  const brands = ['ProFeed', 'NutriMax', 'FarmBest', 'LivestockPlus', 'AgriNutrition', 'FeedMaster'];
  const categories = ['concentrate', 'roughage', 'supplement', 'mineral', 'medication', 'other'];
  const units = ['kg', 'bags', 'liters', 'tons'];
  const suppliers = ['Feed Supply Co.', 'Agricultural Supplies Ltd', 'Farm Direct', 'Livestock Nutrition Inc'];
  const storageLocations = ['Barn A', 'Barn B', 'Storage Shed', 'Feed Room', 'Silo 1', 'Silo 2'];
  
  for (let i = 0; i < count; i++) {
    const feedType = feedTypes[i];
    const brand = getRandomElement(brands);
    const category = getRandomElement(categories);
    const unit = getRandomElement(units);
    const supplier = getRandomElement(suppliers);
    const storageLocation = getRandomElement(storageLocations);
    
    // Generate realistic stock amounts based on feed type
    const initialStock = unit === 'tons' ? getRandomDecimal(1, 5) : 
                        unit === 'bags' ? getRandomNumber(10, 100) :
                        unit === 'liters' ? getRandomNumber(100, 1000) :
                        getRandomNumber(50, 500); // kg
    
    // Current stock should be less than initial (some consumption)
    const consumptionPercentage = getRandomDecimal(0.1, 0.7); // 10-70% consumed
    const currentStock = initialStock * (1 - consumptionPercentage);
    
    const costPerUnit = unit === 'tons' ? getRandomDecimal(800, 1500) :
                       unit === 'bags' ? getRandomDecimal(25, 80) :
                       unit === 'liters' ? getRandomDecimal(2, 8) :
                       getRandomDecimal(1.5, 5); // per kg
    
    const totalPrice = initialStock * costPerUnit;
    const minimumStockLevel = initialStock * 0.2; // 20% of initial stock
    
    // Generate dates
    const dateReceived = getRandomDate(
      new Date(Date.now() - 180 * 24 * 60 * 60 * 1000), // 6 months ago
      new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)   // 1 month ago
    );
    
    // Expiry date 6 months to 2 years from date received
    const expiryDate = new Date(dateReceived);
    expiryDate.setMonth(expiryDate.getMonth() + getRandomNumber(6, 24));
    
    feedInventoryData.push({
      user_id: userId,
      feed_type: feedType,
      brand,
      category,
      unit,
      initial_stock: initialStock,
      current_stock: currentStock,
      cost_per_unit: costPerUnit,
      total_price: totalPrice,
      supplier,
      batch_number: `BATCH-${getRandomNumber(1000, 9999)}`,
      storage_location: storageLocation,
      minimum_stock_level: minimumStockLevel,
      date_received: dateReceived,
      expiry_date: expiryDate.toISOString().split('T')[0],
    });
  }
  
  return feedInventoryData;
};

// Generate feed consumption records dummy data
export const generateFeedConsumptionData = (userId: string, feedInventoryData: any[], count: number = 50) => {
  const consumptionData = [];
  const consumptionTypes = ['daily_feeding', 'monthly_update', 'adjustment', 'waste'];
  const recordedBy = ['Farm Manager', 'John Smith', 'Mary Johnson', 'Feed Supervisor'];
  
  feedInventoryData.forEach(feedItem => {
    // Generate 2-5 consumption records per feed item
    const numRecords = getRandomNumber(2, 5);
    let remainingStock = feedItem.initial_stock;
    
    for (let i = 0; i < numRecords; i++) {
      // Generate consumption date between date received and now
      const startDate = new Date(feedItem.date_received);
      startDate.setDate(startDate.getDate() + (i * 30)); // Monthly intervals
      
      const consumptionDate = getRandomDate(
        startDate,
        new Date(Math.min(startDate.getTime() + 30 * 24 * 60 * 60 * 1000, Date.now()))
      );
      
      // Calculate consumption amount (10-30% of remaining stock)
      const consumptionPercentage = getRandomDecimal(0.1, 0.3);
      const amountConsumed = remainingStock * consumptionPercentage;
      remainingStock = Math.max(0, remainingStock - amountConsumed);
      
      const consumptionType = i === numRecords - 1 ? 'monthly_update' : getRandomElement(consumptionTypes);
      const recorder = getRandomElement(recordedBy);
      
      consumptionData.push({
        user_id: userId,
        feed_inventory_id: feedItem.id, // This will need to be updated after insertion
        consumption_date: consumptionDate,
        amount_consumed: amountConsumed,
        remaining_stock: remainingStock,
        consumption_type: consumptionType,
        notes: `${consumptionType.replace('_', ' ')} - ${amountConsumed.toFixed(1)} ${feedItem.unit} consumed`,
        recorded_by: recorder,
      });
    }
  });
  
  return consumptionData.slice(0, count);
};
// Main function to populate all dummy data
export const populateDummyData = async (userId: string) => {
  try {
    console.log('Generating dummy data...');
    
    // Generate and insert herd data
    const herdData = generateHerdData(userId, 50);
    const { error: herdError } = await supabase
      .from('herd_register')
      .insert(herdData);
    
    if (herdError) {
      console.error('Error inserting herd data:', herdError);
      return;
    }
    
    // Generate and insert calf data
    const calfData = generateCalfData(userId, herdData, 20);
    const { error: calfError } = await supabase
      .from('calf_register')
      .insert(calfData);
    
    if (calfError) {
      console.error('Error inserting calf data:', calfError);
    }
    
    // Generate and insert drug data
    const drugData = generateDrugData(userId, 15);
    const { error: drugError } = await supabase
      .from('drug_register')
      .insert(drugData);
    
    if (drugError) {
      console.error('Error inserting drug data:', drugError);
    }
    
    // Generate and insert mortality data
    const mortalityData = generateMortalityData(userId, herdData, 5);
    const { error: mortalityError } = await supabase
      .from('mortality_register')
      .insert(mortalityData);
    
    if (mortalityError) {
      console.error('Error inserting mortality data:', mortalityError);
    }
    
    // Generate and insert sales data
    const salesData = generateSalesData(userId, herdData, 10);
    const { error: salesError } = await supabase
      .from('sales_register')
      .insert(salesData);
    
    if (salesError) {
      console.error('Error inserting sales data:', salesError);
    }
    
    // Generate and insert weight data
    const weightData = generateWeightData(userId, herdData, 100);
    const { error: weightError } = await supabase
      .from('weight_records')
      .insert(weightData);
    
    if (weightError) {
      console.error('Error inserting weight data:', weightError);
    }
    
    // Generate and insert health data
    const healthData = generateHealthData(userId, herdData, 30);
    const { error: healthError } = await supabase
      .from('health_records')
      .insert(healthData);
    
    if (healthError) {
      console.error('Error inserting health data:', healthError);
    }
    
    // Generate and insert feed inventory data
    const feedInventoryData = generateFeedInventoryData(userId, 12);
    const { data: insertedFeedData, error: feedError } = await supabase
      .from('feed_inventory')
      .insert(feedInventoryData)
      .select('*');
    
    if (feedError) {
      console.error('Error inserting feed inventory data:', feedError);
    } else if (insertedFeedData) {
      // Generate consumption records with actual feed inventory IDs
      const consumptionData = generateFeedConsumptionData(userId, insertedFeedData, 50);
      const { error: consumptionError } = await supabase
        .from('feed_consumption_records')
        .insert(consumptionData);
      
      if (consumptionError) {
        console.error('Error inserting feed consumption data:', consumptionError);
      }
    }
    
    console.log('Dummy data generated successfully!');
  } catch (error) {
    console.error('Error generating dummy data:', error);
  }
};