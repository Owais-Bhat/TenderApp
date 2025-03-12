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
  Text,
  TextInput,
  Button,
  Surface,
  Divider,
  HelperText,
  Title,
  Subheading,
  Dialog,
  Portal,
  Paragraph,
  Caption
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTender } from '../../context/TenderContext';
import { useAuth } from '../../context/AuthContext';
import { formatDistanceToNow, parseISO, format, isPast, differenceInMinutes } from 'date-fns';
import { StatusBar } from 'expo-status-bar';

const PlaceBidScreen = ({ route, navigation }) => {
  const { tenderId } = route.params;
  const { createBid, getTenderById, getLowestBid } = useTender();
  const { user } = useAuth();
  
  const [tender, setTender] = useState(null);
  const [amount, setAmount] = useState('');
  const [proposal, setProposal] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [loadingTender, setLoadingTender] = useState(true);
  const [lowestBid, setLowestBid] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  
  useEffect(() => {
    const loadData = async () => {
      try {
        const tenderData = await getTenderById(tenderId);
        setTender(tenderData);
        
        // Get lowest bid
        const lowest = getLowestBid(tenderId);
        setLowestBid(lowest);
        
        setLoadingTender(false);
      } catch (error) {
        console.error('Error loading tender:', error);
        Alert.alert('Error', 'Failed to load tender details');
        setLoadingTender(false);
      }
    };
    
    loadData();
  }, [tenderId]);
  
  const validateForm = () => {
    const newErrors = {};
    
    // Validate bid amount (required and must be a number)
    if (!amount.trim()) {
      newErrors.amount = 'Bid amount is required';
    } else if (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      newErrors.amount = 'Bid amount must be a positive number';
    }
    
    // Validate proposal (required)
    if (!proposal.trim()) {
      newErrors.proposal = 'Proposal is required';
    }
    
    // Validate delivery time (required)
    if (!deliveryTime.trim()) {
      newErrors.deliveryTime = 'Delivery timeline is required';
    }
    
    // Validate terms acceptance
    if (!termsAccepted) {
      newErrors.terms = 'You must accept the terms and conditions';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handlePlaceBid = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      const bidData = {
        tenderId,
        user: {
          id: user.id,
          name: user.name,
          email: user.email
        },
        amount: parseFloat(amount),
        proposal,
        deliveryTimeline: deliveryTime,
        createdAt: new Date().toISOString()
      };
      
      await createBid(bidData);
      setShowConfirmation(true);
    } catch (error) {
      console.error('Error placing bid:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleConfirmationClose = () => {
    setShowConfirmation(false);
    navigation.navigate('TenderDetail', { tenderId });
  };
  
  if (loadingTender) {
    return (
      <View style={styles.loadingContainer}>
        <MaterialCommunityIcons name="loading" size={40} color="#3498db" />
        <Text style={styles.loadingText}>Loading tender details...</Text>
      </View>
    );
  }
  
  if (!tender) {
    return (
      <View style={styles.errorContainer}>
        <MaterialCommunityIcons name="alert" size={50} color="#e74c3c" />
        <Text style={styles.errorText}>Tender not found</Text>
        <Button 
          mode="contained" 
          onPress={() => navigation.goBack()}
          style={styles.errorButton}
        >
          Go Back
        </Button>
      </View>
    );
  }
  
  // Check if the tender has ended
  const isTenderClosed = isPast(parseISO(tender.endTime));
  
  if (isTenderClosed) {
    return (
      <View style={styles.errorContainer}>
        <MaterialCommunityIcons name="clock-end" size={50} color="#e74c3c" />
        <Text style={styles.errorText}>This tender has closed</Text>
        <Text style={styles.errorSubtext}>
          Bidding for this tender ended {formatDistanceToNow(parseISO(tender.endTime), { addSuffix: true })}
        </Text>
        <Button 
          mode="contained" 
          onPress={() => navigation.navigate('TenderDetail', { tenderId })}
          style={styles.errorButton}
        >
          View Tender Details
        </Button>
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
        <Appbar.Content title="Place Bid" />
      </Appbar.Header>
      
      <ScrollView style={styles.scrollView}>
        <Surface style={styles.tenderCard}>
          <Title style={styles.tenderTitle}>{tender.name}</Title>
          <Caption style={styles.tenderRef}>Reference: {tender.referenceNumber}</Caption>
          
          <View style={styles.metaItem}>
            <MaterialCommunityIcons name="clock-outline" size={16} color="#7f8c8d" />
            <Text style={styles.metaText}>
              Closes {formatDistanceToNow(parseISO(tender.endTime), { addSuffix: true })}
            </Text>
          </View>
          
          {tender.budget && (
            <View style={styles.metaItem}>
              <MaterialCommunityIcons name="currency-usd" size={16} color="#7f8c8d" />
              <Text style={styles.metaText}>
                Budget: ${tender.budget.toLocaleString()}
              </Text>
            </View>
          )}
          
          {lowestBid && (
            <View style={styles.lowestBidContainer}>
              <MaterialCommunityIcons name="trophy-outline" size={20} color="#27ae60" />
              <View style={styles.lowestBidInfo}>
                <Text style={styles.lowestBidLabel}>Current Lowest Bid</Text>
                <Text style={styles.lowestBidAmount}>${lowestBid.amount.toLocaleString()}</Text>
              </View>
            </View>
          )}
        </Surface>
        
        <Surface style={styles.formCard}>
          <Subheading style={styles.formTitle}>Your Bid Details</Subheading>
          <Divider style={styles.divider} />
          
          <TextInput
            label="Bid Amount ($)"
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
            style={styles.input}
            mode="outlined"
            error={!!errors.amount}
            left={<TextInput.Affix text="$" />}
          />
          {errors.amount && <HelperText type="error">{errors.amount}</HelperText>}
          
          <TextInput
            label="Proposal"
            value={proposal}
            onChangeText={setProposal}
            style={styles.input}
            mode="outlined"
            multiline
            numberOfLines={6}
            error={!!errors.proposal}
          />
          {errors.proposal && <HelperText type="error">{errors.proposal}</HelperText>}
          
          <TextInput
            label="Delivery Timeline"
            value={deliveryTime}
            onChangeText={setDeliveryTime}
            style={styles.input}
            mode="outlined"
            placeholder="e.g. 30 days after award"
            error={!!errors.deliveryTime}
          />
          {errors.deliveryTime && <HelperText type="error">{errors.deliveryTime}</HelperText>}
          
          <TouchableOpacity 
            style={styles.termsContainer}
            onPress={() => setTermsAccepted(!termsAccepted)}
          >
            <MaterialCommunityIcons 
              name={termsAccepted ? "checkbox-marked" : "checkbox-blank-outline"} 
              size={24} 
              color={termsAccepted ? "#3498db" : "#7f8c8d"} 
            />
            <Text style={[styles.termsText, errors.terms && styles.errorText]}>
              I agree to the terms and conditions of this tender
            </Text>
          </TouchableOpacity>
          {errors.terms && <HelperText type="error">{errors.terms}</HelperText>}
          
          <Button
            mode="contained"
            style={styles.submitButton}
            loading={loading}
            disabled={loading}
            onPress={handlePlaceBid}
          >
            Submit Bid
          </Button>
          
          <Button
            mode="outlined"
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
            disabled={loading}
          >
            Cancel
          </Button>
        </Surface>
      </ScrollView>
      
      <Portal>
        <Dialog visible={showConfirmation} onDismiss={handleConfirmationClose}>
          <Dialog.Title>Bid Submitted</Dialog.Title>
          <Dialog.Content>
            <Paragraph>
              Your bid of ${parseFloat(amount).toLocaleString()} has been successfully submitted for this tender.
            </Paragraph>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#7f8c8d',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#2c3e50',
    marginTop: 12,
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 16,
  },
  errorButton: {
    backgroundColor: '#3498db',
  },
  scrollView: {
    flex: 1,
  },
  tenderCard: {
    margin: 16,
    padding: 16,
    borderRadius: 8,
    elevation: 2,
  },
  tenderTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  tenderRef: {
    fontSize: 12,
    color: '#7f8c8d',
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  metaText: {
    fontSize: 14,
    color: '#7f8c8d',
    marginLeft: 8,
  },
  lowestBidContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fff4',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  lowestBidInfo: {
    marginLeft: 12,
  },
  lowestBidLabel: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  lowestBidAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#27ae60',
  },
  formCard: {
    margin: 16,
    padding: 16,
    borderRadius: 8,
    elevation: 2,
    marginBottom: 24,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  divider: {
    marginBottom: 16,
    backgroundColor: '#e0e0e0',
  },
  input: {
    marginBottom: 16,
    backgroundColor: 'white',
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  termsText: {
    marginLeft: 8,
    color: '#2c3e50',
    flex: 1,
  },
  submitButton: {
    marginBottom: 12,
    backgroundColor: '#3498db',
    padding: 4,
  },
  cancelButton: {
    borderColor: '#7f8c8d',
  },
});

export default PlaceBidScreen; 