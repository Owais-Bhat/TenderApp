import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert
} from 'react-native';
import {
  Appbar,
  TextInput,
  Button,
  Text,
  Surface,
  HelperText,
  Chip
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { format, parseISO, isPast, differenceInMinutes } from 'date-fns';
import { useTender } from '../../context/TenderContext';
import { useAuth } from '../../context/AuthContext';
import { StatusBar } from 'expo-status-bar';

const SubmitBidScreen = ({ route, navigation }) => {
  const { tenderId } = route.params;
  const { tenders, submitBid } = useTender();
  const { user } = useAuth();
  const [tender, setTender] = useState(null);
  const [cost, setCost] = useState('');
  const [notes, setNotes] = useState('');
  const [costError, setCostError] = useState('');
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    // Get tender details
    const tenderData = tenders.find(t => t.id === tenderId);
    if (tenderData) {
      setTender(tenderData);
    }
  }, [tenderId, tenders]);
  
  // Determine if the tender is still active
  const isActive = () => {
    if (!tender) return false;
    const endTime = parseISO(tender.endTime);
    return !isPast(endTime) || tender.status === 'extended';
  };
  
  // Calculate time remaining
  const getTimeRemaining = () => {
    if (!tender) return '';
    
    const endTime = parseISO(tender.endTime);
    const now = new Date();
    
    if (isPast(endTime) && tender.status !== 'extended') {
      return 'Tender has ended';
    }
    
    const minutes = differenceInMinutes(endTime, now);
    
    if (minutes < 60) {
      return `${minutes} minute${minutes !== 1 ? 's' : ''} remaining`;
    }
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (hours < 24) {
      return `${hours} hour${hours !== 1 ? 's' : ''} ${remainingMinutes} minute${remainingMinutes !== 1 ? 's' : ''} remaining`;
    }
    
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    
    return `${days} day${days !== 1 ? 's' : ''} ${remainingHours} hour${remainingHours !== 1 ? 's' : ''} remaining`;
  };
  
  const validateCost = () => {
    if (!cost) {
      setCostError('Please enter a bid amount');
      return false;
    }
    
    const costValue = parseFloat(cost);
    if (isNaN(costValue) || costValue <= 0) {
      setCostError('Please enter a valid amount greater than 0');
      return false;
    }
    
    setCostError('');
    return true;
  };
  
  const handleSubmit = async () => {
    if (!isActive()) {
      Alert.alert('Cannot Submit', 'This tender has already ended.');
      return;
    }
    
    if (!validateCost()) {
      return;
    }
    
    setLoading(true);
    
    try {
      const bidData = {
        companyName: user.companyName || 'Company Name', // Fallback for demo
        cost: parseFloat(cost),
        notes: notes.trim(),
      };
      
      await submitBid(tenderId, bidData);
      
      Alert.alert(
        'Success',
        'Your quotation has been submitted successfully.',
        [
          { 
            text: 'View Tender',
            onPress: () => navigation.navigate('TenderDetail', { tenderId })
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to submit your quotation. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  if (!tender) {
    return (
      <View style={styles.container}>
        <Appbar.Header style={styles.appbar}>
          <Appbar.BackAction onPress={() => navigation.goBack()} />
          <Appbar.Content title="Submit Quotation" />
        </Appbar.Header>
        
        <View style={styles.errorContainer}>
          <MaterialCommunityIcons name="alert-circle-outline" size={60} color="#e74c3c" />
          <Text style={styles.errorText}>Tender not found or has been removed.</Text>
          <Button
            mode="contained"
            style={styles.errorButton}
            onPress={() => navigation.goBack()}
          >
            Go Back
          </Button>
        </View>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <Appbar.Header style={styles.appbar}>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Submit Quotation" />
      </Appbar.Header>
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidView}
      >
        <ScrollView style={styles.scrollView}>
          <Surface style={styles.tenderInfoSurface}>
            <Text style={styles.tenderName}>{tender.name}</Text>
            
            {!isActive() ? (
              <Chip
                mode="outlined"
                style={styles.endedChip}
                icon="close-circle-outline"
              >
                Tender has ended
              </Chip>
            ) : (
              <View style={styles.timeRemainingContainer}>
                <MaterialCommunityIcons name="clock-outline" size={20} color="#e67e22" />
                <Text style={styles.timeRemainingText}>
                  {getTimeRemaining()}
                </Text>
              </View>
            )}
          </Surface>
          
          <Surface style={styles.formSurface}>
            <Text style={styles.formTitle}>Your Quotation</Text>
            
            <TextInput
              label="Bid Amount ($)"
              value={cost}
              onChangeText={setCost}
              keyboardType="numeric"
              mode="outlined"
              disabled={!isActive() || loading}
              style={styles.input}
              error={!!costError}
              onBlur={validateCost}
              left={<TextInput.Icon icon="cash" />}
            />
            {costError ? <HelperText type="error">{costError}</HelperText> : null}
            
            <TextInput
              label="Additional Notes (Optional)"
              value={notes}
              onChangeText={setNotes}
              mode="outlined"
              multiline
              numberOfLines={4}
              disabled={!isActive() || loading}
              style={styles.notesInput}
              left={<TextInput.Icon icon="text-box-outline" />}
            />
            
            <Button
              mode="contained"
              style={styles.submitButton}
              loading={loading}
              disabled={!isActive() || loading}
              onPress={handleSubmit}
              icon="send"
            >
              Submit Quotation
            </Button>
            
            {!isActive() && (
              <View style={styles.disabledMessage}>
                <MaterialCommunityIcons name="information-outline" size={20} color="#e74c3c" />
                <Text style={styles.disabledText}>
                  This tender has ended and is no longer accepting quotations.
                </Text>
              </View>
            )}
          </Surface>
          
          <Surface style={styles.infoSurface}>
            <Text style={styles.infoTitle}>Important Information</Text>
            
            <View style={styles.infoItem}>
              <MaterialCommunityIcons name="information-outline" size={20} color="#3498db" />
              <Text style={styles.infoText}>
                All bids are final and cannot be modified after submission.
              </Text>
            </View>
            
            <View style={styles.infoItem}>
              <MaterialCommunityIcons name="clock-alert-outline" size={20} color="#3498db" />
              <Text style={styles.infoText}>
                If you submit a bid in the last 5 minutes before the tender ends, the tender deadline will be automatically extended.
              </Text>
            </View>
            
            <View style={styles.infoItem}>
              <MaterialCommunityIcons name="eye-outline" size={20} color="#3498db" />
              <Text style={styles.infoText}>
                All submitted bids are visible to other users.
              </Text>
            </View>
          </Surface>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  appbar: {
    backgroundColor: 'white',
    elevation: 0,
  },
  keyboardAvoidView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 20,
  },
  errorButton: {
    backgroundColor: '#3498db',
  },
  tenderInfoSurface: {
    margin: 16,
    padding: 16,
    borderRadius: 10,
    elevation: 2,
  },
  tenderName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  timeRemainingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  timeRemainingText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#e67e22',
    fontWeight: 'bold',
  },
  endedChip: {
    marginTop: 8,
    backgroundColor: '#f5f5f5',
    borderColor: '#e74c3c',
    alignSelf: 'flex-start',
  },
  formSurface: {
    margin: 16,
    padding: 16,
    borderRadius: 10,
    elevation: 2,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 16,
  },
  input: {
    marginBottom: 8,
    backgroundColor: 'white',
  },
  notesInput: {
    marginTop: 8,
    marginBottom: 16,
    backgroundColor: 'white',
  },
  submitButton: {
    backgroundColor: '#3498db',
    paddingVertical: 8,
  },
  disabledMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffebee',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  disabledText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#e74c3c',
  },
  infoSurface: {
    margin: 16,
    marginBottom: 32,
    padding: 16,
    borderRadius: 10,
    elevation: 1,
    backgroundColor: '#e8f4f8',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 12,
  },
  infoItem: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  infoText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#34495e',
  },
});

export default SubmitBidScreen; 