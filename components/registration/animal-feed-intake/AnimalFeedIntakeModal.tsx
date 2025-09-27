import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Modal, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { Text } from '../../typography/Text';
import { TextField } from '../../inputs/TextField';
import { Picker } from '../../inputs/Picker';
import { DatePicker } from '../../inputs/DatePicker';
import { Button } from '../../ui/Button';
import { X, Utensils } from 'lucide-react-native';
import Colors from '../../../constants/Colors';
import { useHerd } from '../../../contexts/HerdContext';
import { useFeedInventory } from '../../../contexts/FeedInventoryContext';

interface AnimalFeedIntakeRecord {
  id: string;
  animal_tag: string;
  feed_type: string;
  amount_consumed: number;
  intake_date: string;
  notes: string;
}

interface AnimalFeedIntakeModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (record: Omit<AnimalFeedIntakeRecord, 'id'>) => void;
  editRecord?: AnimalFeedIntakeRecord | null;
  preselectedAnimal?: string;
}

export function AnimalFeedIntakeModal({ 
  visible, 
  onClose, 
  onSave, 
  editRecord, 
  preselectedAnimal 
}: AnimalFeedIntakeModalProps) {
  const { herdData } = useHerd();
  const { feedInventoryData } = useFeedInventory();
  const [formData, setFormData] = useState({
    animal_tag: '',
    feed_type: '',
    amount_consumed: 0,
    intake_date: null as Date | null,
    notes: '',
  });

  const animalOptions = herdData.map(animal => ({
    label: `${animal.tag_number} (${animal.breed}, ${animal.sex})`,
    value: animal.tag_number,
  }));

  // Create feed type options from available feed inventory
  const feedTypeOptions = [
    ...new Set(feedInventoryData.map(item => item.feed_type))
  ].map(feedType => ({
    label: feedType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
    value: feedType,
  }));

  // Add common feed types if inventory is empty
  const defaultFeedTypes = [
    { label: 'Dairy Meal', value: 'dairy_meal' },
    { label: 'Beef Fattener', value: 'beef_fattener' },
    { label: 'Hay', value: 'hay' },
    { label: 'Silage', value: 'silage' },
    { label: 'Concentrates', value: 'concentrates' },
    { label: 'Minerals', value: 'minerals' },
  ];

  const allFeedTypeOptions = feedTypeOptions.length > 0 ? feedTypeOptions : defaultFeedTypes;

  useEffect(() => {
    if (editRecord) {
      setFormData({
        animal_tag: editRecord.animal_tag,
        feed_type: editRecord.feed_type,
        amount_consumed: editRecord.amount_consumed,
        intake_date: new Date(editRecord.intake_date),
        notes: editRecord.notes,
      });
    } else if (preselectedAnimal) {
      setFormData({
        animal_tag: preselectedAnimal,
        feed_type: '',
        amount_consumed: 0,
        intake_date: new Date(),
        notes: '',
      });
    } else {
      setFormData({
        animal_tag: '',
        feed_type: '',
        amount_consumed: 0,
        intake_date: new Date(),
        notes: '',
      });
    }
  }, [editRecord, visible, preselectedAnimal]);

  const handleSave = () => {
    if (!formData.animal_tag || !formData.feed_type || formData.amount_consumed <= 0 || !formData.intake_date) {
      alert('Please fill in all required fields');
      return;
    }

    const recordToSave = {
      animal_tag: formData.animal_tag,
      feed_type: formData.feed_type,
      amount_consumed: formData.amount_consumed,
      intake_date: formData.intake_date?.toISOString().split('T')[0] || '',
      notes: formData.notes,
    };

    onSave(recordToSave);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Utensils size={24} color={Colors.primary[500]} />
            <View style={styles.headerText}>
              <Text variant="h5" weight="medium">
                {editRecord ? 'Edit Feed Intake' : 'Record Feed Intake'}
              </Text>
              <Text variant="body2" color="neutral.600">
                Track individual animal feed consumption
              </Text>
            </View>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color={Colors.neutral[600]} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          <Picker
            label="Animal Tag"
            value={formData.animal_tag}
            onValueChange={(value) => setFormData({ ...formData, animal_tag: value })}
            items={animalOptions}
          />

          <Picker
            label="Feed Type"
            value={formData.feed_type}
            onValueChange={(value) => setFormData({ ...formData, feed_type: value })}
            items={allFeedTypeOptions}
          />

          <TextField
            label="Amount Consumed (kg)"
            value={formData.amount_consumed.toString()}
            onChangeText={(text) => setFormData({ ...formData, amount_consumed: parseFloat(text) || 0 })}
            placeholder="Enter amount consumed in kg"
            keyboardType="numeric"
          />

          {/* Intake Date */}
          {Platform.OS === 'web' ? (
            <View style={{ marginBottom: 16 }}>
              <Text variant="body2" color="neutral.700" style={{ marginBottom: 8 }}>
                Intake Date
              </Text>
              <input
                type="date"
                value={formData.intake_date ? formData.intake_date.toISOString().split('T')[0] : ''}
                onChange={(e) => {
                  const date = e.target.value ? new Date(e.target.value) : null;
                  setFormData({ ...formData, intake_date: date });
                }}
                style={styles.webDateInput}
              />
            </View>
          ) : (
            <DatePicker
              label="Intake Date"
              value={formData.intake_date}
              onDateChange={(date) => setFormData({ ...formData, intake_date: date })}
              placeholder="Select intake date"
            />
          )}

          <TextField
            label="Notes"
            value={formData.notes}
            onChangeText={(text) => setFormData({ ...formData, notes: text })}
            placeholder="Enter additional notes (optional)"
            multiline
            numberOfLines={3}
          />
        </ScrollView>

        <View style={styles.footer}>
          <Button variant="outline" onPress={onClose} style={styles.button}>
            Cancel
          </Button>
          <Button variant="primary" onPress={handleSave} style={styles.button}>
            {editRecord ? 'Update' : 'Save'}
          </Button>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerText: {
    marginLeft: 12,
  },
  closeButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral[200],
  },
  button: {
    flex: 1,
  },
  webDateInput: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.neutral[300],
    width: "100%",
    fontSize: 16,
  },
});