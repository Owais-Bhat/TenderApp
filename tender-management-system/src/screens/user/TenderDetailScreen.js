import React, { useEffect, useState } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator 
} from 'react-native';
import { 
  Appbar, 
  Surface, 
  Text, 
  Title, 
  Divider, 
  Button, 
  Chip,
  Card,
  Paragraph,
  Avatar
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTender } from '../../context/TenderContext';
import { formatDistance, formatDistanceToNow, parseISO, isPast } from 'date-fns';
import { StatusBar } from 'expo-status-bar';

const TenderDetailScreen = ({ route, navigation }) => {
  const { tenderId } = route.params;
  const { getTenderById, bids, getLowestBid } = useTender();
  const [tender, setTender] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lowestBid, setLowestBid] = useState(null);
  
  useEffect(() => {
    // Load the tender data
    const loadTender = async () => {
      try {
        const tenderData = await getTenderById(tenderId);
        setTender(tenderData);
        
        if (tenderData) {
          const lowest = getLowestBid(tenderId);
          setLowestBid(lowest);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error loading tender details:', error);
        setLoading(false);
      }
    };
    
    loadTender();
  }, [tenderId, bids]);
  
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498db" />
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
  
  const getTimeRemaining = () => {
    const endTime = parseISO(tender.endTime);
    
    if (isPast(endTime)) {
      return 'Tender has closed';
    }
    
    return `Closes ${formatDistance(new Date(), endTime, { addSuffix: true })}`;
  };
  
  const getRemainingTimeStyle = () => {
    const endTime = parseISO(tender.endTime);
    
    if (isPast(endTime)) {
      return styles.closed;
    }
    
    // Calculate the difference in hours
    const diffInHours = (endTime - new Date()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return styles.urgent;
    } else if (diffInHours < 72) {
      return styles.warning;
    } else {
      return styles.normal;
    }
  };
  
  const isTenderClosed = () => {
    return isPast(parseISO(tender.endTime));
  };
  
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <Appbar.Header style={styles.appbar}>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Tender Details" />
      </Appbar.Header>
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <Surface style={styles.tenderHeaderCard}>
            <View style={styles.tenderHeader}>
              <Text style={styles.tenderTitle}>{tender.name}</Text>
              <Chip 
                style={[styles.statusChip, { backgroundColor: tender.status === 'active' ? '#e3f2fd' : '#f5f5f5' }]}
                textStyle={{ color: tender.status === 'active' ? '#2196f3' : '#7f8c8d' }}
              >
                {tender.status === 'active' ? 'Active' : 'Closed'}
              </Chip>
            </View>
            
            <Text style={styles.tenderRef}>Reference: {tender.referenceNumber}</Text>
            
            <View style={styles.metaContainer}>
              <View style={styles.metaItem}>
                <MaterialCommunityIcons name="clock-outline" size={18} color="#7f8c8d" />
                <Text style={[styles.metaText, getRemainingTimeStyle()]}>
                  {getTimeRemaining()}
                </Text>
              </View>
              
              <View style={styles.metaItem}>
                <MaterialCommunityIcons name="calendar-range" size={18} color="#7f8c8d" />
                <Text style={styles.metaText}>
                  Published {formatDistanceToNow(parseISO(tender.createdAt), { addSuffix: true })}
                </Text>
              </View>
              
              <View style={styles.metaItem}>
                <MaterialCommunityIcons name="tag-outline" size={18} color="#7f8c8d" />
                <Text style={styles.metaText}>
                  Category: {tender.category}
                </Text>
              </View>
              
              <View style={styles.metaItem}>
                <MaterialCommunityIcons name="office-building" size={18} color="#7f8c8d" />
                <Text style={styles.metaText}>
                  Department: {tender.department}
                </Text>
              </View>
            </View>
          </Surface>
          
          <Surface style={styles.section}>
            <Title style={styles.sectionTitle}>Description</Title>
            <Divider style={styles.divider} />
            <Text style={styles.description}>{tender.description}</Text>
          </Surface>
          
          <Surface style={styles.section}>
            <Title style={styles.sectionTitle}>Requirements</Title>
            <Divider style={styles.divider} />
            {tender.requirements ? (
              <Text style={styles.description}>{tender.requirements}</Text>
            ) : (
              <Text style={styles.emptyText}>No specific requirements provided</Text>
            )}
          </Surface>
          
          <Surface style={styles.section}>
            <Title style={styles.sectionTitle}>Budget & Timeline</Title>
            <Divider style={styles.divider} />
            
            <View style={styles.infoContainer}>
              {tender.budget && (
                <View style={styles.infoItem}>
                  <MaterialCommunityIcons name="currency-usd" size={20} color="#3498db" />
                  <View style={styles.infoTextContainer}>
                    <Text style={styles.infoLabel}>Budget</Text>
                    <Text style={styles.infoValue}>${tender.budget.toLocaleString()}</Text>
                  </View>
                </View>
              )}
              
              <View style={styles.infoItem}>
                <MaterialCommunityIcons name="clock-start" size={20} color="#3498db" />
                <View style={styles.infoTextContainer}>
                  <Text style={styles.infoLabel}>Start Date</Text>
                  <Text style={styles.infoValue}>{new Date(tender.startTime).toLocaleDateString()}</Text>
                </View>
              </View>
              
              <View style={styles.infoItem}>
                <MaterialCommunityIcons name="clock-end" size={20} color="#3498db" />
                <View style={styles.infoTextContainer}>
                  <Text style={styles.infoLabel}>End Date</Text>
                  <Text style={styles.infoValue}>{new Date(tender.endTime).toLocaleDateString()}</Text>
                </View>
              </View>
              
              {tender.deliveryTimeline && (
                <View style={styles.infoItem}>
                  <MaterialCommunityIcons name="calendar-clock" size={20} color="#3498db" />
                  <View style={styles.infoTextContainer}>
                    <Text style={styles.infoLabel}>Delivery Timeline</Text>
                    <Text style={styles.infoValue}>{tender.deliveryTimeline}</Text>
                  </View>
                </View>
              )}
            </View>
          </Surface>
          
          {lowestBid && (
            <Surface style={styles.section}>
              <Title style={styles.sectionTitle}>Current Lowest Bid</Title>
              <Divider style={styles.divider} />
              
              <Card style={styles.bidCard}>
                <Card.Content>
                  <View style={styles.bidHeader}>
                    <View style={styles.bidUserInfo}>
                      <Avatar.Icon size={40} icon="account" style={styles.bidUserAvatar} />
                      <View>
                        <Text style={styles.bidUserName}>{lowestBid.user?.name || 'Anonymous User'}</Text>
                        <Text style={styles.bidTime}>
                          Bid placed {formatDistanceToNow(parseISO(lowestBid.createdAt), { addSuffix: true })}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.bidAmount}>
                      <Text style={styles.bidAmountValue}>${lowestBid.amount.toLocaleString()}</Text>
                      <Text style={styles.bidAmountLabel}>Lowest Bid</Text>
                    </View>
                  </View>
                  
                  {lowestBid.proposal && (
                    <View style={styles.bidProposal}>
                      <Paragraph style={styles.bidProposalText}>
                        {lowestBid.proposal.length > 150
                          ? `${lowestBid.proposal.substring(0, 150)}...`
                          : lowestBid.proposal}
                      </Paragraph>
                    </View>
                  )}
                </Card.Content>
              </Card>
            </Surface>
          )}
          
          <View style={styles.actionContainer}>
            <Button
              mode="contained"
              icon="currency-usd"
              style={[styles.actionButton, { opacity: isTenderClosed() ? 0.5 : 1 }]}
              disabled={isTenderClosed()}
              onPress={() => navigation.navigate('PlaceBid', { tenderId: tender.id })}
            >
              {isTenderClosed() ? 'Bidding Closed' : 'Place Bid'}
            </Button>
            
            <Button
              mode="outlined"
              icon="share-variant"
              style={styles.actionButton}
              onPress={() => {
                // Share functionality would go here
                console.log('Share tender:', tender.id);
              }}
            >
              Share Tender
            </Button>
          </View>
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
    marginBottom: 16,
  },
  errorButton: {
    backgroundColor: '#3498db',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  tenderHeaderCard: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    elevation: 4,
  },
  tenderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  tenderTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    flex: 1,
    marginRight: 12,
  },
  statusChip: {
    height: 28,
  },
  tenderRef: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 12,
  },
  metaContainer: {
    marginTop: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  metaText: {
    fontSize: 14,
    marginLeft: 8,
    color: '#7f8c8d',
  },
  normal: {
    color: '#7f8c8d',
  },
  warning: {
    color: '#f39c12',
  },
  urgent: {
    color: '#e74c3c',
  },
  closed: {
    color: '#95a5a6',
  },
  section: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  divider: {
    marginVertical: 12,
    backgroundColor: '#e0e0e0',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#2c3e50',
  },
  emptyText: {
    fontSize: 16,
    color: '#95a5a6',
    fontStyle: 'italic',
  },
  infoContainer: {
    marginTop: 8,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  infoTextContainer: {
    marginLeft: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginTop: 2,
  },
  bidCard: {
    backgroundColor: '#f5f9fc',
    marginTop: 8,
  },
  bidHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bidUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bidUserAvatar: {
    backgroundColor: '#3498db',
    marginRight: 12,
  },
  bidUserName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  bidTime: {
    fontSize: 12,
    color: '#95a5a6',
  },
  bidAmount: {
    alignItems: 'flex-end',
  },
  bidAmountValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#27ae60',
  },
  bidAmountLabel: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  bidProposal: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  bidProposalText: {
    color: '#2c3e50',
    fontSize: 14,
    lineHeight: 20,
  },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
  },
});

export default TenderDetailScreen; 