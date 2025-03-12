import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert
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
  Switch,
  ActivityIndicator
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTender } from '../../context/TenderContext';
import { format, parseISO } from 'date-fns';
import { StatusBar } from 'expo-status-bar';

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

const EditTenderScreen = ({ navigation, route }) => {
  const { tenderId } = route.params;
  const { getTenderById, updateTenderStatus } = useTender();
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [requirements, setRequirements] = useState('');
  const [budget, setBudget] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
  const [category, setCategory] = useState('');
  const [department, setDepartment] = useState('');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [deliveryTimeline, setDeliveryTimeline] = useState('');
  const [addToFeatured, setAddToFeatured] = useState(false);
  
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [categoryMenuVisible, setCategoryMenuVisible] = useState(false);
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [showConfirmation, setShowConfirmation] = useState(false);
  
  // Load tender data when component mounts
  useEffect(() => {
    const loadTender = async () => {
      try {
        const tender = await getTenderById(tenderId);
        if (tender) {
          setName(tender.name || '');
          setDescription(tender.description || '');
          setRequirements(tender.requirements || '');
          setBudget(tender.budget ? tender.budget.toString() : '');
          setStartDate(parseISO(tender.startTime));
          setEndDate(parseISO(tender.endTime));
          setCategory(tender.category || '');
          setDepartment(tender.department || '');
          setReferenceNumber(tender.referenceNumber || '');
          setDeliveryTimeline(tender.deliveryTimeline || '');
          setAddToFeatured(tender.featured || false);
        } else {
          Alert.alert('Error', 'Tender not found');
          navigation.goBack();
        }
      } catch (error) {
        console.error('Error loading tender:', error);
        Alert.alert('Error', 'Failed to load tender details');
        navigation.goBack();
      } finally {
        setInitialLoading(false);
      }
    };
    
    loadTender();
  }, [tenderId]);
  
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
  
  const handleUpdateTender = async () => {
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
        updatedAt: new Date().toISOString()
      };
      
      await updateTenderStatus(tenderId, tenderData);
      setShowConfirmation(true);
    } catch (error) {
      console.error('Error updating tender:', error);
      Alert.alert('Error', 'Failed to update tender');
    } finally {
      setLoading(false);
    }
  };
  
  const handleConfirmationClose = () => {
    setShowConfirmation(false);
    navigation.navigate('AdminTenderDetail', { tenderId });
  };
  
  if (initialLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={styles.loadingText}>Loading tender details...</Text>
      </View>
    );
  }
  
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 80}
    >
      <StatusBar style="light" />
      <Appbar.Header style={styles.appbar}>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Edit Tender" />
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
              <TouchableOpacity
                onPress={() => setCategoryMenuVisible(true)}
                style={styles.dropdownButton}
              >
                <Text style={errors.category ? styles.errorText : null}>
                  {category || 'Select Category'}
                </Text>
                <MaterialCommunityIcons name="menu-down" size={24} color="#7f8c8d" />
              </TouchableOpacity>
              {errors.category && <HelperText type="error">{errors.category}</HelperText>}
              
              <Menu
                visible={categoryMenuVisible}
                onDismiss={() => setCategoryMenuVisible(false)}
                anchor={<View />}
                style={styles.menu}
              >
                {categories.map((cat) => (
                  <Menu.Item
                    key={cat}
                    title={cat}
                    onPress={() => {
                      setCategory(cat);
                      setCategoryMenuVisible(false);
                    }}
                  />
                ))}
              </Menu>
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
              onPress={handleUpdateTender}
              style={styles.submitButton}
              loading={loading}
              disabled={loading}
            >
              Update Tender
            </Button>
            
            <Button
              mode="outlined"
              onPress={() => navigation.goBack()}
              style={styles.cancelButton}
              disabled={loading}
            >
              Cancel
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
            <Paragraph>Tender has been updated successfully!</Paragraph>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#7f8c8d',
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
  cancelButton: {
    borderColor: '#7f8c8d',
  },
});

export default EditTenderScreen; 