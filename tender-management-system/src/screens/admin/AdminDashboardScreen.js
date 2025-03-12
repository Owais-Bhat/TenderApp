import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { 
  Appbar, 
  Text, 
  Card, 
  Title, 
  Button, 
  Surface, 
  Divider, 
  ActivityIndicator 
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTender } from '../../context/TenderContext';
import { useAuth } from '../../context/AuthContext';
import { useFocusEffect } from '@react-navigation/native';
import { isPast, parseISO, formatDistance } from 'date-fns';
import { StatusBar } from 'expo-status-bar';

const AdminDashboardScreen = ({ navigation }) => {
  const { tenders, bids, getActiveTenders, getCompletedTenders, getLowestBid } = useTender();
  const { user } = useAuth();
  
  const [activeTendersCount, setActiveTendersCount] = useState(0);
  const [completedTendersCount, setCompletedTendersCount] = useState(0);
  const [totalBidsCount, setTotalBidsCount] = useState(0);
  const [recentTenders, setRecentTenders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Load dashboard data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadDashboardData();
    }, [tenders, bids])
  );
  
  const loadDashboardData = () => {
    setLoading(true);
    
    try {
      // Get active tenders count
      const activeTenders = getActiveTenders() || [];
      setActiveTendersCount(activeTenders.length);
      
      // Get completed tenders count
      const completedTenders = getCompletedTenders() || [];
      setCompletedTendersCount(completedTenders.length);
      
      // Get total bids count
      setTotalBidsCount(bids?.length || 0);
      
      // Get recent tenders (last 5)
      const recent = [...(tenders || [])]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);
      setRecentTenders(recent);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const getTenderStatus = (tender) => {
    const endTime = parseISO(tender.endTime);
    
    if (tender.status === 'extended') {
      return 'Extended';
    } else if (isPast(endTime)) {
      return 'Closed';
    } else {
      return 'Active';
    }
  };
  
  const getTimeSince = (dateString) => {
    return formatDistance(parseISO(dateString), new Date(), { addSuffix: true });
  };
  
  const getBidsCount = (tenderId) => {
    return bids && Array.isArray(bids) 
      ? bids.filter(bid => bid.tenderId === tenderId).length
      : 0;
  };
  
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={styles.loadingText}>Loading dashboard data...</Text>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <Appbar.Header style={styles.appbar}>
        <Appbar.Content title="Admin Dashboard" />
      </Appbar.Header>
      
      <ScrollView style={styles.scrollView}>
        <View>
          <View style={styles.welcomeContainer}>
            <Text style={styles.welcomeText}>Welcome back, {user?.name || 'Admin'}!</Text>
            <Text style={styles.welcomeSubtext}>Here's an overview of your tender management system</Text>
          </View>
          
          <View style={styles.statsContainer}>
            <Card style={[styles.statCard, { backgroundColor: '#e3f2fd' }]}>
              <Card.Content style={styles.statCardContent}>
                <MaterialCommunityIcons name="file-document" size={30} color="#3498db" />
                <View style={styles.statTextContainer}>
                  <Text style={styles.statNumber}>{activeTendersCount}</Text>
                  <Text style={styles.statLabel}>Active Tenders</Text>
                </View>
              </Card.Content>
            </Card>
            
            <Card style={[styles.statCard, { backgroundColor: '#f5f5f5' }]}>
              <Card.Content style={styles.statCardContent}>
                <MaterialCommunityIcons name="file-check" size={30} color="#7f8c8d" />
                <View style={styles.statTextContainer}>
                  <Text style={styles.statNumber}>{completedTendersCount}</Text>
                  <Text style={styles.statLabel}>Completed Tenders</Text>
                </View>
              </Card.Content>
            </Card>
            
            <Card style={[styles.statCard, { backgroundColor: '#e8f5e9' }]}>
              <Card.Content style={styles.statCardContent}>
                <MaterialCommunityIcons name="cash-multiple" size={30} color="#2ecc71" />
                <View style={styles.statTextContainer}>
                  <Text style={styles.statNumber}>{totalBidsCount}</Text>
                  <Text style={styles.statLabel}>Total Quotations</Text>
                </View>
              </Card.Content>
            </Card>
          </View>
          
          <Surface style={styles.actionContainer}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.actionButtonsContainer}>
              <Button
                mode="contained"
                icon="plus"
                style={[styles.actionButton, { backgroundColor: '#3498db' }]}
                onPress={() => navigation.navigate('Manage', { screen: 'CreateTender' })}
              >
                Create New Tender
              </Button>
              
              <Button
                mode="outlined"
                icon="format-list-bulleted"
                style={styles.actionButton}
                onPress={() => navigation.navigate('Manage', { screen: 'ManageTenders' })}
              >
                Manage Tenders
              </Button>
            </View>
          </Surface>
          
          <Surface style={styles.recentContainer}>
            <View style={styles.recentHeader}>
              <Text style={styles.sectionTitle}>Recent Tenders</Text>
              <Button
                mode="text"
                compact
                onPress={() => navigation.navigate('Manage', { screen: 'ManageTenders' })}
              >
                View All
              </Button>
            </View>
            
            {recentTenders.length > 0 ? (
              <>
                {recentTenders.map((tender, index) => (
                  <React.Fragment key={tender.id}>
                    <Surface style={styles.recentItemContainer}>
                      <View style={styles.recentItemHeader}>
                        <View style={styles.recentItemTitleContainer}>
                          <Text style={styles.recentItemTitle} numberOfLines={1}>
                            {tender.name}
                          </Text>
                          <Text 
                            style={[
                              styles.recentItemStatus,
                              getTenderStatus(tender) === 'Active' ? styles.statusActive :
                              getTenderStatus(tender) === 'Extended' ? styles.statusExtended :
                              styles.statusClosed
                            ]}
                          >
                            {getTenderStatus(tender)}
                          </Text>
                        </View>
                        <Text style={styles.recentItemTime}>
                          Created {getTimeSince(tender.createdAt)}
                        </Text>
                      </View>
                      
                      <View style={styles.recentItemFooter}>
                        <View style={styles.recentItemStat}>
                          <MaterialCommunityIcons name="cash-multiple" size={16} color="#7f8c8d" />
                          <Text style={styles.recentItemStatText}>
                            {getBidsCount(tender.id)} Quotation{getBidsCount(tender.id) !== 1 ? 's' : ''}
                          </Text>
                        </View>
                        
                        <Button
                          mode="text"
                          compact
                          onPress={() => navigation.navigate('Manage', { 
                            screen: 'AdminTenderDetail', 
                            params: { tenderId: tender.id } 
                          })}
                        >
                          View Details
                        </Button>
                      </View>
                    </Surface>
                    {index < recentTenders.length - 1 && <Divider style={styles.divider} />}
                  </React.Fragment>
                ))}
              </>
            ) : (
              <View style={styles.emptyContainer}>
                <MaterialCommunityIcons name="file-document-outline" size={40} color="#bdc3c7" />
                <Text style={styles.emptyText}>No tenders have been created yet</Text>
                <Button
                  mode="contained"
                  style={styles.emptyButton}
                  onPress={() => navigation.navigate('Manage', { screen: 'CreateTender' })}
                >
                  Create First Tender
                </Button>
              </View>
            )}
          </Surface>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#7f8c8d',
  },
  scrollView: {
    flex: 1,
  },
  welcomeContainer: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  welcomeSubtext: {
    fontSize: 16,
    color: '#7f8c8d',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  statCard: {
    flex: 1,
    marginHorizontal: 4,
    elevation: 2,
  },
  statCardContent: {
    padding: 12,
    alignItems: 'center',
  },
  statTextContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  statLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 4,
  },
  actionContainer: {
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    borderRadius: 10,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 16,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  recentContainer: {
    margin: 16,
    padding: 16,
    borderRadius: 10,
    elevation: 2,
    marginBottom: 32,
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  recentItemContainer: {
    padding: 12,
    borderRadius: 6,
    backgroundColor: '#f8f9fa',
    marginVertical: 6,
  },
  recentItemHeader: {
    marginBottom: 8,
  },
  recentItemTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  recentItemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    flex: 1,
  },
  recentItemStatus: {
    fontSize: 12,
    fontWeight: 'bold',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: 'hidden',
    marginLeft: 8,
  },
  statusActive: {
    backgroundColor: '#e3f2fd',
    color: '#3498db',
  },
  statusExtended: {
    backgroundColor: '#fff8e1',
    color: '#f39c12',
  },
  statusClosed: {
    backgroundColor: '#f5f5f5',
    color: '#7f8c8d',
  },
  recentItemTime: {
    fontSize: 12,
    color: '#95a5a6',
  },
  recentItemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recentItemStat: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recentItemStatText: {
    fontSize: 14,
    color: '#7f8c8d',
    marginLeft: 6,
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 16,
    color: '#7f8c8d',
    marginTop: 12,
    marginBottom: 16,
  },
  emptyButton: {
    backgroundColor: '#3498db',
  },
});

export default AdminDashboardScreen; 