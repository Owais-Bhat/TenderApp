import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Dimensions,
  RefreshControl,
  Alert
} from 'react-native';
import {
  Appbar,
  Text,
  Surface,
  Button,
  Chip,
  Divider,
  ActivityIndicator,
  Card,
  IconButton,
  List
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTender } from '../../context/TenderContext';
import { useBid } from '../../context/BidContext';
import { useAuth } from '../../context/AuthContext';
import { StatusBar } from 'expo-status-bar';
import { format, formatDistanceToNow, parseISO, isAfter, isBefore } from 'date-fns';
import { useFocusEffect } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

const UserTenderDetailScreen = ({ route, navigation }) => {
  // Get the tender ID from route parameters
  const { tenderId } = route.params;
  
  // State variables
  const [tender, setTender] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userBids, setUserBids] = useState([]);
  const [allBidsCount, setAllBidsCount] = useState(0);
  const [lowestBid, setLowestBid] = useState(null);
  
  // Context
  const { getTenderById, getUserFavorites, addFavorite, removeFavorite } = useTender();
  const { getBidsByTender, getUserBidsByTender } = useBid();
  const { user } = useAuth();
  
  // State for favorite status
  const [isFavorite, setIsFavorite] = useState(false);
  
  // Load data when the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadData();
      return () => {
        // Cleanup if needed
      };
    }, [tenderId])
  );
  
  // Load data
  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load tender details
      const tenderData = await getTenderById(tenderId);
      setTender(tenderData);
      
      // Load bids for this tender
      const allBids = await getBidsByTender(tenderId);
      if (allBids) {
        setAllBidsCount(allBids.length);
        
        // Find lowest bid
        if (allBids.length > 0) {
          const lowest = allBids.reduce((min, bid) => 
            parseFloat(bid.amount) < parseFloat(min.amount) ? bid : min, allBids[0]);
          setLowestBid(lowest);
        }
      }
      
      // Load user's bids for this tender
      if (user) {
        const userBidsData = await getUserBidsByTender(tenderId, user.id);
        setUserBids(userBidsData || []);
      }
      
      // Check if tender is in user's favorites
      const favorites = await getUserFavorites(user.id);
      setIsFavorite(favorites.some(fav => fav.id === tenderId));
      
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load tender details');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  // Handle refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [tenderId]);
  
  // Handle favorite toggle
  const toggleFavorite = async () => {
    try {
      if (isFavorite) {
        await removeFavorite(user.id, tenderId);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        await addFavorite(user.id, tenderId);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error('Error toggling favorite:', error);
      Alert.alert('Error', 'Failed to update favorites');
    }
  };
  
  // Navigate to place bid screen
  const navigateToPlaceBid = () => {
    navigation.navigate('PlaceBid', { tenderId });
  };
  
  // Calculate tender status
  const getTenderStatus = () => {
    if (!tender) return 'unknown';
    
    const now = new Date();
    const startTime = parseISO(tender.startTime);
    const endTime = parseISO(tender.endTime);
    
    if (tender.cancelled) return 'cancelled';
    if (tender.completed) return 'completed';
    
    if (isBefore(now, startTime)) {
      return 'scheduled';
    } else if (isAfter(now, endTime)) {
      return 'ended';
    } else {
      return 'active';
    }
  };
  
  // Get status color
  const getStatusColor = () => {
    const status = getTenderStatus();
    
    switch (status) {
      case 'active':
        return '#2196f3';
      case 'scheduled':
        return '#ffa000';
      case 'ended':
      case 'completed':
        return '#4caf50';
      case 'cancelled':
        return '#f44336';
      default:
        return '#9e9e9e';
    }
  };
  
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar style="dark" />
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={styles.loadingText}>Loading tender details...</Text>
      </View>
    );
  }
  
  const tenderStatus = getTenderStatus();
  const statusColor = getStatusColor();
  const canBid = tenderStatus === 'active';
  
  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <Appbar.Header style={styles.appbar}>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Tender Details" subtitle={tender?.name || 'Loading...'} />
        <Appbar.Action
          icon={isFavorite ? 'heart' : 'heart-outline'}
          color={isFavorite ? '#f44336' : undefined}
          onPress={toggleFavorite}
        />
      </Appbar.Header>
      
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View>
          {tender && (
            <>
              <Surface style={styles.tenderInfoContainer}>
                <View style={styles.tenderHeader}>
                  <Text style={styles.tenderName}>{tender.name}</Text>
                  <Chip
                    mode="outlined"
                    style={[styles.statusChip, { borderColor: statusColor }]}
                    textStyle={{ color: statusColor }}
                  >
                    {tenderStatus.charAt(0).toUpperCase() + tenderStatus.slice(1)}
                  </Chip>
                </View>
                
                <Text style={styles.tenderDescription}>{tender.description}</Text>
                
                <Divider style={styles.divider} />
                
                <View style={styles.tenderDetails}>
                  <View style={styles.detailRow}>
                    <MaterialCommunityIcons name="bullhorn" size={20} color="#7f8c8d" />
                    <View style={styles.detailTextContainer}>
                      <Text style={styles.detailLabel}>Publisher</Text>
                      <Text style={styles.detailValue}>{tender.publisher || 'N/A'}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.detailRow}>
                    <MaterialCommunityIcons name="calendar-start" size={20} color="#7f8c8d" />
                    <View style={styles.detailTextContainer}>
                      <Text style={styles.detailLabel}>Start Time</Text>
                      <Text style={styles.detailValue}>
                        {format(parseISO(tender.startTime), 'PPp')}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.detailRow}>
                    <MaterialCommunityIcons name="calendar-end" size={20} color="#7f8c8d" />
                    <View style={styles.detailTextContainer}>
                      <Text style={styles.detailLabel}>End Time</Text>
                      <Text style={styles.detailValue}>
                        {format(parseISO(tender.endTime), 'PPp')}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.detailRow}>
                    <MaterialCommunityIcons name="clock-outline" size={20} color="#7f8c8d" />
                    <View style={styles.detailTextContainer}>
                      <Text style={styles.detailLabel}>Remaining Time</Text>
                      <Text style={styles.detailValue}>
                        {tenderStatus === 'active'
                          ? formatDistanceToNow(parseISO(tender.endTime), { addSuffix: true })
                          : tenderStatus === 'scheduled'
                          ? `Starts ${formatDistanceToNow(parseISO(tender.startTime), { addSuffix: true })}`
                          : 'Tender has ended'}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.detailRow}>
                    <MaterialCommunityIcons name="gavel" size={20} color="#7f8c8d" />
                    <View style={styles.detailTextContainer}>
                      <Text style={styles.detailLabel}>Total Bids</Text>
                      <Text style={styles.detailValue}>{allBidsCount}</Text>
                    </View>
                  </View>
                  
                  {lowestBid && (
                    <View style={styles.detailRow}>
                      <MaterialCommunityIcons name="trending-down" size={20} color="#7f8c8d" />
                      <View style={styles.detailTextContainer}>
                        <Text style={styles.detailLabel}>Lowest Bid</Text>
                        <Text style={styles.detailValue}>
                          ${parseFloat(lowestBid.amount).toLocaleString()}
                        </Text>
                      </View>
                    </View>
                  )}
                  
                  {tender.location && (
                    <View style={styles.detailRow}>
                      <MaterialCommunityIcons name="map-marker" size={20} color="#7f8c8d" />
                      <View style={styles.detailTextContainer}>
                        <Text style={styles.detailLabel}>Location</Text>
                        <Text style={styles.detailValue}>{tender.location}</Text>
                      </View>
                    </View>
                  )}
                  
                  {tender.category && (
                    <View style={styles.detailRow}>
                      <MaterialCommunityIcons name="tag" size={20} color="#7f8c8d" />
                      <View style={styles.detailTextContainer}>
                        <Text style={styles.detailLabel}>Category</Text>
                        <Text style={styles.detailValue}>{tender.category}</Text>
                      </View>
                    </View>
                  )}
                </View>
                
                {/* Documents Section */}
                {tender.documents && tender.documents.length > 0 && (
                  <>
                    <Divider style={styles.divider} />
                    <Text style={styles.sectionTitle}>Documents</Text>
                    
                    {tender.documents.map((doc, index) => (
                      <List.Item
                        key={index}
                        title={doc.name || `Document ${index + 1}`}
                        description={doc.description || 'Click to download'}
                        left={props => <List.Icon {...props} icon="file-document-outline" />}
                        right={props => <List.Icon {...props} icon="download" />}
                        onPress={() => {/* Handle document download */}}
                        style={styles.documentItem}
                      />
                    ))}
                  </>
                )}
              </Surface>
              
              {/* User's Bids Section */}
              {userBids.length > 0 && (
                <Surface style={styles.bidsContainer}>
                  <Text style={styles.sectionTitle}>Your Bids</Text>
                  
                  {userBids
                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                    .map((bid, index) => (
                      <Card key={bid.id} style={styles.bidCard}>
                        <Card.Content>
                          <View style={styles.bidHeader}>
                            <Text style={styles.bidAmount}>
                              ${parseFloat(bid.amount).toLocaleString()}
                            </Text>
                            <Text style={styles.bidDate}>
                              {formatDistanceToNow(parseISO(bid.createdAt), { addSuffix: true })}
                            </Text>
                          </View>
                          {bid.notes && <Text style={styles.bidNotes}>{bid.notes}</Text>}
                          
                          {bid.status && (
                            <Chip
                              mode="outlined"
                              style={[
                                styles.bidStatusChip,
                                {
                                  borderColor:
                                    bid.status === 'accepted'
                                      ? '#4caf50'
                                      : bid.status === 'rejected'
                                      ? '#f44336'
                                      : '#2196f3',
                                },
                              ]}
                              textStyle={{
                                color:
                                  bid.status === 'accepted'
                                    ? '#4caf50'
                                    : bid.status === 'rejected'
                                    ? '#f44336'
                                    : '#2196f3',
                              }}
                            >
                              {bid.status.charAt(0).toUpperCase() + bid.status.slice(1)}
                            </Chip>
                          )}
                        </Card.Content>
                      </Card>
                    ))}
                </Surface>
              )}
              
              {/* Bid Action Button */}
              <Surface style={styles.actionContainer}>
                {canBid ? (
                  <Button 
                    mode="contained" 
                    style={styles.bidButton}
                    icon="gavel"
                    onPress={navigateToPlaceBid}
                  >
                    {userBids.length > 0 ? 'Place Another Bid' : 'Place Bid'}
                  </Button>
                ) : (
                  <Text style={styles.cannotBidText}>
                    {tenderStatus === 'scheduled'
                      ? 'Bidding will be available once the tender starts'
                      : tenderStatus === 'cancelled'
                      ? 'This tender has been cancelled'
                      : 'Bidding period has ended'}
                  </Text>
                )}
              </Surface>
            </>
          )}
        </View>
      </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#7f8c8d',
  },
  tenderInfoContainer: {
    margin: 16,
    padding: 16,
    borderRadius: 10,
    elevation: 2,
    backgroundColor: 'white',
  },
  tenderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  tenderName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    flex: 1,
    marginRight: 8,
  },
  statusChip: {
    height: 28,
  },
  tenderDescription: {
    fontSize: 16,
    color: '#34495e',
    marginBottom: 16,
    lineHeight: 24,
  },
  divider: {
    marginVertical: 16,
  },
  tenderDetails: {
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 16,
    color: '#2c3e50',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 16,
  },
  documentItem: {
    backgroundColor: '#f5f5f5',
    marginBottom: 8,
    borderRadius: 8,
  },
  bidsContainer: {
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 10,
    elevation: 2,
    backgroundColor: 'white',
  },
  bidCard: {
    marginBottom: 12,
    backgroundColor: '#f5f5f5',
  },
  bidHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  bidAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  bidDate: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  bidNotes: {
    fontSize: 14,
    color: '#34495e',
    marginBottom: 12,
  },
  bidStatusChip: {
    alignSelf: 'flex-start',
  },
  actionContainer: {
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 10,
    elevation: 2,
    backgroundColor: 'white',
    marginBottom: 24,
  },
  bidButton: {
    paddingVertical: 8,
    backgroundColor: '#3498db',
  },
  cannotBidText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#7f8c8d',
    fontStyle: 'italic',
  },
});

export default UserTenderDetailScreen; 