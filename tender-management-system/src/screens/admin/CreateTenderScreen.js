import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity
} from 'react-native';
import {
  Appbar,
  TextInput,
  Button,
  Text,
  HelperText,
  Surface,
  Chip,
  Divider,
  Headline,
  Menu,
  Dialog,
  Portal,
  Paragraph,
  Switch
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTender } from '../../context/TenderContext';
import { format } from 'date-fns';
import { StatusBar } from 'expo-status-bar';
import DemoDropdown from '../../components/DemoDropdown';

const categories = [
  'Construction', 
  'IT Services', 
  'Procurement', 
  'Consulting', 
  'Maintenance',
  'Professional Services',
  'Healthcare',
  'Transportation',
  'Education',
  'Other'
];

const CreateTenderScreen = ({ navigation }) => {
  const { createTender } = useTender();
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [requirements, setRequirements] = useState('');
  const [budget, setBudget] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)); // Default 7 days from now
  const [category, setCategory] = useState('');
  const [department, setDepartment] = useState('');
  const [referenceNumber, setReferenceNumber] = useState(`TMS-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`);
  const [deliveryTimeline, setDeliveryTimeline] = useState('');
  const [addToFeatured, setAddToFeatured] = useState(false);
  
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!name.trim()) newErrors.name = 'Name is required';
    if (!description.trim()) newErrors.description = 'Description is required';
    if (!category.trim()) newErrors.category = 'Category is required';
    if (!department.trim()) newErrors.department = 'Department is required';
    if (!referenceNumber.trim()) newErrors.referenceNumber = 'Reference number is required';
    
    // Budget validation (optional but must be a number if provided)
    if (budget && isNaN(parseFloat(budget))) {
      newErrors.budget = 'Budget must be a valid number';
    }
    
    // Date validation
    if (endDate <= startDate) {
      newErrors.endDate = 'End date must be after start date';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleCreateTender = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      const tenderData = {
        name,
        description,
        requirements,
        budget: budget ? parseFloat(budget) : null,
        startTime: startDate.toISOString(),
        endTime: endDate.toISOString(),
        category,
        department,
        referenceNumber,
        deliveryTimeline,
        featured: addToFeatured,
        status: 'active'
      };
      
      await createTender(tenderData);
      setShowConfirmation(true);
    } catch (error) {
      console.error('Error creating tender:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const resetForm = () => {
    setName('');
    setDescription('');
    setRequirements('');
    setBudget('');
    setStartDate(new Date());
    setEndDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
    setCategory('');
    setDepartment('');
    setReferenceNumber(`TMS-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`);
    setDeliveryTimeline('');
    setAddToFeatured(false);
    setErrors({});
  };
  
  const handleConfirmationClose = () => {
    setShowConfirmation(false);
    resetForm();
    navigation.navigate('ManageTenders');
  };
  
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 80}
    >
      <StatusBar style="light" />
      <Appbar.Header style={styles.appbar}>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Create Tender" />
      </Appbar.Header>
      
      <ScrollView style={styles.scrollView}>
        <Surface style={styles.formContainer}>
          <Headline style={styles.headline}>Tender Information</Headline>
          <Divider style={styles.divider} />
          
          <TextInput
            label="Tender Name"
            value={name}
            onChangeText={setName}
            style={styles.input}
            mode="outlined"
            error={!!errors.name}
          />
          {errors.name && <HelperText type="error">{errors.name}</HelperText>}
          
          <TextInput
            label="Reference Number"
            value={referenceNumber}
            onChangeText={setReferenceNumber}
            style={styles.input}
            mode="outlined"
            error={!!errors.referenceNumber}
          />
          {errors.referenceNumber && <HelperText type="error">{errors.referenceNumber}</HelperText>}
          
          <View style={styles.row}>
            <View style={styles.halfInput}>
              <DemoDropdown
                items={categories}
                value={category}
                onValueChange={setCategory}
                placeholder="Select Category"
                error={errors.category}
                style={{ marginBottom: 0 }}
              />
            </View>
            
            <View style={styles.halfInput}>
              <TextInput
                label="Department"
                value={department}
                onChangeText={setDepartment}
                style={styles.input}
                mode="outlined"
                error={!!errors.department}
              />
              {errors.department && <HelperText type="error">{errors.department}</HelperText>}
            </View>
          </View>
          
          <TextInput
            label="Description"
            value={description}
            onChangeText={setDescription}
            style={styles.input}
            mode="outlined"
            multiline
            numberOfLines={4}
            error={!!errors.description}
          />
          {errors.description && <HelperText type="error">{errors.description}</HelperText>}
          
          <TextInput
            label="Requirements (Optional)"
            value={requirements}
            onChangeText={setRequirements}
            style={styles.input}
            mode="outlined"
            multiline
            numberOfLines={4}
          />
          
          <TextInput
            label="Budget Amount (Optional)"
            value={budget}
            onChangeText={setBudget}
            style={styles.input}
            mode="outlined"
            keyboardType="numeric"
            error={!!errors.budget}
            left={<TextInput.Affix text="$" />}
          />
          {errors.budget && <HelperText type="error">{errors.budget}</HelperText>}
          
          <TextInput
            label="Delivery Timeline (Optional)"
            value={deliveryTimeline}
            onChangeText={setDeliveryTimeline}
            style={styles.input}
            mode="outlined"
            placeholder="e.g. 30 days after award"
          />
          
          <Headline style={styles.sectionHeadline}>Timeline</Headline>
          <Divider style={styles.divider} />
          
          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Text style={styles.label}>Start Date</Text>
              <TouchableOpacity
                style={styles.datePickerButton}
                onPress={() => setShowStartDatePicker(true)}
              >
                <MaterialCommunityIcons name="calendar" size={24} color="#3498db" />
                <Text style={styles.dateText}>{format(startDate, 'MMM dd, yyyy')}</Text>
              </TouchableOpacity>
              
              {showStartDatePicker && (
                <DateTimePicker
                  value={startDate}
                  mode="date"
                  display="default"
                  onChange={(event, selectedDate) => {
                    setShowStartDatePicker(false);
                    if (selectedDate) {
                      setStartDate(selectedDate);
                    }
                  }}
                />
              )}
            </View>
            
            <View style={styles.halfInput}>
              <Text style={styles.label}>End Date</Text>
              <TouchableOpacity
                style={[styles.datePickerButton, errors.endDate && styles.errorBorder]}
                onPress={() => setShowEndDatePicker(true)}
              >
                <MaterialCommunityIcons name="calendar" size={24} color="#3498db" />
                <Text style={styles.dateText}>{format(endDate, 'MMM dd, yyyy')}</Text>
              </TouchableOpacity>
              {errors.endDate && <HelperText type="error">{errors.endDate}</HelperText>}
              
              {showEndDatePicker && (
                <DateTimePicker
                  value={endDate}
                  mode="date"
                  display="default"
                  minimumDate={new Date()}
                  onChange={(event, selectedDate) => {
                    setShowEndDatePicker(false);
                    if (selectedDate) {
                      setEndDate(selectedDate);
                    }
                  }}
                />
              )}
            </View>
          </View>
          
          <View style={styles.featuredContainer}>
            <Text style={styles.label}>Add to Featured Tenders</Text>
            <Switch
              value={addToFeatured}
              onValueChange={setAddToFeatured}
              color="#3498db"
            />
          </View>
          
          <View style={styles.actionsContainer}>
            <Button
              mode="contained"
              onPress={handleCreateTender}
              style={styles.submitButton}
              loading={loading}
              disabled={loading}
            >
              Create Tender
            </Button>
            
            <Button
              mode="outlined"
              onPress={resetForm}
              style={styles.resetButton}
              disabled={loading}
            >
              Reset Form
            </Button>
          </View>
        </Surface>
      </ScrollView>
      
      <Portal>
        <Dialog
          visible={showConfirmation}
          onDismiss={handleConfirmationClose}
        >
          <Dialog.Title>Success</Dialog.Title>
          <Dialog.Content>
            <Paragraph>The tender has been created successfully!</Paragraph>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={handleConfirmationClose}>Continue</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  appbar: {
    backgroundColor: '#3498db',
  },
  scrollView: {
    flex: 1,
  },
  formContainer: {
    margin: 16,
    padding: 16,
    borderRadius: 8,
    elevation: 2,
    marginBottom: 24,
  },
  headline: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  sectionHeadline: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginTop: 24,
    marginBottom: 8,
  },
  divider: {
    marginBottom: 16,
    backgroundColor: '#e0e0e0',
    height: 1,
  },
  input: {
    marginBottom: 16,
    backgroundColor: 'white',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  halfInput: {
    width: '48%',
  },
  dropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#bdc3c7',
    borderRadius: 4,
    padding: 12,
    backgroundColor: 'white',
    marginBottom: 8,
  },
  menu: {
    marginTop: 46,
  },
  label: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 8,
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#bdc3c7',
    borderRadius: 4,
    padding: 12,
    backgroundColor: 'white',
  },
  dateText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#2c3e50',
  },
  errorText: {
    color: '#e74c3c',
  },
  errorBorder: {
    borderColor: '#e74c3c',
  },
  featuredContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 16,
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  actionsContainer: {
    marginTop: 24,
  },
  submitButton: {
    marginBottom: 12,
    backgroundColor: '#3498db',
    padding: 8,
  },
  resetButton: {
    borderColor: '#7f8c8d',
  },
});

export default CreateTenderScreen; 