import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Surface, Text, Divider, Button } from 'react-native-paper';
import DemoDropdown from './DemoDropdown';

const DropdownExamples = () => {
  // Sample demo items for different dropdowns
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
  
  const departments = [
    'Engineering',
    'Finance',
    'Human Resources',
    'Information Technology',
    'Marketing',
    'Operations',
    'Research & Development',
    'Sales'
  ];
  
  const priorities = [
    'Low',
    'Medium',
    'High',
    'Urgent'
  ];
  
  const statuses = [
    'Draft',
    'Pending',
    'Active',
    'Under Review',
    'Completed',
    'Cancelled'
  ];
  
  // State for selected values
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  
  // Validation errors (for demonstration)
  const [errors, setErrors] = useState({});
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!selectedCategory) newErrors.category = 'Please select a category';
    if (!selectedDepartment) newErrors.department = 'Please select a department';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = () => {
    validateForm();
  };
  
  const resetForm = () => {
    setSelectedCategory('');
    setSelectedDepartment('');
    setSelectedPriority('');
    setSelectedStatus('');
    setErrors({});
  };

  return (
    <ScrollView style={styles.container}>
      <Surface style={styles.card}>
        <Text style={styles.title}>Dropdown Demo Examples</Text>
        <Divider style={styles.divider} />
        
        <Text style={styles.sectionTitle}>Category Selection</Text>
        <DemoDropdown 
          items={categories}
          value={selectedCategory}
          onValueChange={setSelectedCategory}
          placeholder="Select Category"
          error={errors.category}
        />
        
        <Text style={styles.sectionTitle}>Department Selection</Text>
        <DemoDropdown 
          items={departments}
          value={selectedDepartment}
          onValueChange={setSelectedDepartment}
          placeholder="Select Department"
          error={errors.department}
        />
        
        <Text style={styles.sectionTitle}>Priority Selection</Text>
        <DemoDropdown 
          items={priorities}
          value={selectedPriority}
          onValueChange={setSelectedPriority}
          placeholder="Select Priority"
        />
        
        <Text style={styles.sectionTitle}>Status Selection</Text>
        <DemoDropdown 
          items={statuses}
          value={selectedStatus}
          onValueChange={setSelectedStatus}
          placeholder="Select Status"
        />
        
        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            onPress={handleSubmit}
            style={styles.button}
          >
            Submit
          </Button>
          
          <Button
            mode="outlined"
            onPress={resetForm}
            style={styles.button}
          >
            Reset
          </Button>
        </View>
      </Surface>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  card: {
    margin: 16,
    padding: 16,
    borderRadius: 8,
    elevation: 2,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  divider: {
    marginBottom: 16,
    backgroundColor: '#e0e0e0',
    height: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    color: '#2c3e50',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  button: {
    flex: 1,
    marginHorizontal: 8,
  }
});

export default DropdownExamples; 