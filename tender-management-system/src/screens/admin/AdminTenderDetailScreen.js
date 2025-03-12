import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Dimensions,
  Alert
} from 'react-native';
import {
  Appbar,
  Text,
  Divider,
  Button,
  Chip,
  ProgressBar,
  Portal,
  Dialog,
  Menu,
  IconButton,
  Surface,
  ActivityIndicator,
  List
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useTender } from '../../context/TenderContext';
import { useBid } from '../../context/BidContext';
import { StatusBar } from 'expo-status-bar';
import { format, formatDistanceToNow, parseISO, isAfter, isBefore } from 'date-fns';
import { BarChart, LineChart, PieChart } from 'react-native-chart-kit';

const { width } = Dimensions.get('window');

const AdminTenderDetailScreen = ({ navigation, route }) => {
  const { tenderId } = route.params;
  
  // State variables
  const [tender, setTender] = useState(null);
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [cancelDialogVisible, setCancelDialogVisible] = useState(false);
  const [completeDialogVisible, setCompleteDialogVisible] = useState(false);
  
  // Screen dimensions
  const width = Dimensions.get('window').width - 32;
  
  // Context
  const { getTenderById, deleteTender, cancelTender, completeTender } = useTender();
  const { getBidsByTender } = useBid();
  
  // Load data when the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadData();
      
      return () => {
        // Cleanup if needed
      };
    }, [tenderId])
  );
  
  // Load data from API
  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load tender details
      const tenderData = await getTenderById(tenderId);
      setTender(tenderData);
      
      // Load bids for tender
      const bidsData = await getBidsByTender(tenderId);
      setBids(bidsData);
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load tender details. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  // Refresh data
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [tenderId]);
  
  // Menu functions
  const openMenu = () => {
    setMenuVisible(true);
  };
  
  const closeMenu = () => {
    setMenuVisible(false);
  };
  
  // Dialog functions
  const showDeleteDialog = () => {
    setDeleteDialogVisible(true);
  };
  
  const hideDeleteDialog = () => {
    setDeleteDialogVisible(false);
  };
  
  const confirmDelete = async () => {
    try {
      await deleteTender(tenderId);
      hideDeleteDialog();
      navigation.goBack();
      Alert.alert('Success', 'Tender has been deleted successfully');
    } catch (error) {
      console.error('Error deleting tender:', error);
      Alert.alert('Error', 'Failed to delete tender. Please try again.');
    }
  };
  
  const showCancelDialog = () => {
    setCancelDialogVisible(true);
  };
  
  const hideCancelDialog = () => {
    setCancelDialogVisible(false);
  };
  
  const confirmCancel = async () => {
    try {
      await cancelTender(tenderId);
      hideCancelDialog();
      loadData();
      Alert.alert('Success', 'Tender has been cancelled successfully');
    } catch (error) {
      console.error('Error cancelling tender:', error);
      Alert.alert('Error', 'Failed to cancel tender. Please try again.');
    }
  };
  
  const showCompleteDialog = () => {
    setCompleteDialogVisible(true);
  };
  
  const hideCompleteDialog = () => {
    setCompleteDialogVisible(false);
  };
  
  const confirmComplete = async () => {
    try {
      await completeTender(tenderId);
      hideCompleteDialog();
      loadData();
      Alert.alert('Success', 'Tender has been marked as completed');
    } catch (error) {
      console.error('Error completing tender:', error);
      Alert.alert('Error', 'Failed to complete tender. Please try again.');
    }
  };
  
  // Helper functions
  const getTenderStatus = () => {
    if (!tender) return '';
    
    if (tender.cancelled) return 'cancelled';
    if (tender.completed) return 'completed';
    
    const now = new Date();
    const startTime = parseISO(tender.startTime);
    const endTime = parseISO(tender.endTime);
    
    if (isBefore(now, startTime)) {
      return 'scheduled';
    } else if (isAfter(now, endTime)) {
      return 'ended';
    } else {
      return 'active';
    }
  };
  
  const getStatusChipProps = () => {
    const status = getTenderStatus();
    
    switch (status) {
      case 'active':
        return {
          backgroundColor: '#e3f2fd',
          textColor: '#2196f3',
          icon: 'currency-usd',
          label: 'Active',
        };
      case 'scheduled':
        return {
          backgroundColor: '#fff8e1',
          textColor: '#ffa000',
          icon: 'clock-outline',
          label: 'Scheduled',
        };
      case 'ended':
        return {
          backgroundColor: '#e8f5e9',
          textColor: '#4caf50',
          icon: 'calendar-check',
          label: 'Ended',
        };
      case 'completed':
        return {
          backgroundColor: '#e8f5e9',
          textColor: '#4caf50',
          icon: 'check-circle',
          label: 'Completed',
        };
      case 'cancelled':
        return {
          backgroundColor: '#ffebee',
          textColor: '#f44336',
          icon: 'cancel',
          label: 'Cancelled',
        };
      default:
        return {
          backgroundColor: '#f5f5f5',
          textColor: '#9e9e9e',
          icon: 'help-circle-outline',
          label: 'Unknown',
        };
    }
  };
  
  // Chart data
  const getBidChartData = () => {
    if (!bids || bids.length === 0) {
      return {
        labels: ['No Data'],
        datasets: [
          {
            data: [0],
          },
        ],
      };
    }
    
    // Sort bids by date
    const sortedBids = [...bids].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    
    // Get labels (day of month) and data (amount)
    const labels = sortedBids.map(bid => format(parseISO(bid.createdAt), 'd'));
    const data = sortedBids.map(bid => parseFloat(bid.amount));
    
    return {
      labels,
      datasets: [{ data }],
    };
  };
  
  const getBidStatusData = () => {
    if (!bids || bids.length === 0) {
      return [
        { name: 'No Data', population: 1, color: '#bdc3c7', legendFontColor: '#7F7F7F', legendFontSize: 12 },
      ];
    }
    
    const accepted = bids.filter(bid => bid.accepted).length;
    const rejected = bids.filter(bid => bid.rejected).length;
    const pending = bids.filter(bid => !bid.accepted && !bid.rejected).length;
    
    return [
      { name: 'Accepted', population: accepted || 0, color: '#4caf50', legendFontColor: '#7F7F7F', legendFontSize: 12 },
      { name: 'Rejected', population: rejected || 0, color: '#f44336', legendFontColor: '#7F7F7F', legendFontSize: 12 },
      { name: 'Pending', population: pending || 0, color: '#2196f3', legendFontColor: '#7F7F7F', legendFontSize: 12 },
    ];
  };
  
  // Navigation functions
  const navigateToManageBids = () => {
    navigation.navigate('ManageBids', { tenderId });
  };
  
  const navigateToEditTender = () => {
    navigation.navigate('EditTender', { tenderId });
  };
  
  const chartConfig = {
    backgroundColor: 'white',
    backgroundGradientFrom: 'white',
    backgroundGradientTo: 'white',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(52, 152, 219, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(44, 62, 80, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: '#3498db',
    },
  };
  
  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar style="dark" />
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={styles.loadingText}>Loading tender details...</Text>
      </View>
    );
  }
  
  const { backgroundColor, textColor, icon, label } = getStatusChipProps();
  const status = getTenderStatus();
  const winningBid = bids && bids.length > 0 ? bids.find(bid => bid.accepted) : null;
  
  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <Appbar.Header style={styles.appbar}>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Tender Details" />
        <Appbar.Action icon="dots-vertical" onPress={openMenu} />
      </Appbar.Header>
      
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {tender && (
          <>
            <Surface style={styles.headerContainer}>
              <View style={styles.tenderHeader}>
                <Chip
                  mode="outlined"
                  style={[styles.statusChip, { backgroundColor }]}
                  textStyle={{ color: textColor }}
                  icon={() => (
                    <MaterialCommunityIcons name={icon} size={16} color={textColor} />
                  )}
                >
                  {label}
                </Chip>
                
                <Text style={styles.tenderName}>{tender.name}</Text>
                <Text style={styles.tenderDescription}>{tender.description}</Text>
                
                <Divider style={styles.divider} />
                
                <View style={styles.tenderMeta}>
                  <View style={styles.metaRow}>
                    <View style={styles.metaItem}>
                      <MaterialCommunityIcons name="calendar-start" size={20} color="#7f8c8d" />
                      <View style={styles.metaTextContainer}>
                        <Text style={styles.metaLabel}>Start Time</Text>
                        <Text style={styles.metaValue}>
                          {format(parseISO(tender.startTime), 'PPp')}
                        </Text>
                      </View>
                    </View>
                    
                    <View style={styles.metaItem}>
                      <MaterialCommunityIcons name="calendar-end" size={20} color="#7f8c8d" />
                      <View style={styles.metaTextContainer}>
                        <Text style={styles.metaLabel}>End Time</Text>
                        <Text style={styles.metaValue}>
                          {format(parseISO(tender.endTime), 'PPp')}
                        </Text>
                      </View>
                    </View>
                  </View>
                  
                  <View style={styles.metaRow}>
                    <View style={styles.metaItem}>
                      <MaterialCommunityIcons name="av-timer" size={20} color="#7f8c8d" />
                      <View style={styles.metaTextContainer}>
                        <Text style={styles.metaLabel}>Buffer Time</Text>
                        <Text style={styles.metaValue}>{tender.bufferTime} minutes</Text>
                      </View>
                    </View>
                    
                    <View style={styles.metaItem}>
                      <MaterialCommunityIcons name="gavel" size={20} color="#7f8c8d" />
                      <View style={styles.metaTextContainer}>
                        <Text style={styles.metaLabel}>Total Bids</Text>
                        <Text style={styles.metaValue}>{bids.length}</Text>
                      </View>
                    </View>
                  </View>
                </View>
                
                {status === 'active' && (
                  <View style={styles.progressContainer}>
                    <Text style={styles.progressText}>Tender Progress</Text>
                    <ProgressBar
                      progress={Math.min(
                        (new Date() - parseISO(tender.startTime)) /
                          (parseISO(tender.endTime) - parseISO(tender.startTime)),
                        1
                      )}
                      color="#3498db"
                      style={styles.progressBar}
                    />
                    <Text style={styles.progressSubtext}>
                      {formatDistanceToNow(parseISO(tender.endTime), { addSuffix: true })}
                    </Text>
                  </View>
                )}
                
                {winningBid && (
                  <Surface style={styles.winningBidContainer}>
                    <Text style={styles.winningBidTitle}>Winning Bid</Text>
                    <View style={styles.winningBidContent}>
                      <MaterialCommunityIcons name="trophy" size={36} color="#f1c40f" style={styles.trophyIcon} />
                      <View style={styles.winningBidDetails}>
                        <Text style={styles.winningBidAmount}>
                          ${parseFloat(winningBid.amount).toLocaleString()}
                        </Text>
                        <Text style={styles.winningBidUser}>{winningBid.user.name}</Text>
                        <Text style={styles.winningBidDate}>
                          Accepted {formatDistanceToNow(parseISO(winningBid.acceptedAt), { addSuffix: true })}
                        </Text>
                      </View>
                    </View>
                  </Surface>
                )}
                
                <View style={styles.actionButtons}>
                  <Button
                    mode="contained"
                    icon="gavel"
                    style={styles.actionButton}
                    onPress={navigateToManageBids}
                  >
                    Manage Bids
                  </Button>
                  
                  {(status === 'scheduled' || status === 'active') && (
                    <Button
                      mode="outlined"
                      icon="pencil"
                      style={styles.actionButton}
                      onPress={navigateToEditTender}
                    >
                      Edit Tender
                    </Button>
                  )}
                </View>
              </View>
            </Surface>
            
            <Surface style={styles.statsContainer}>
              <Text style={styles.sectionTitle}>Bids Overview</Text>
              {bids.length > 0 ? (
                <>
                  <Text style={styles.chartTitle}>Bid Amounts Over Time</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <LineChart
                      data={getBidChartData()}
                      width={Math.max(width, bids.length * 50)}
                      height={220}
                      chartConfig={chartConfig}
                      bezier
                      style={styles.chart}
                    />
                  </ScrollView>
                  
                  <Divider style={styles.divider} />
                  
                  <Text style={styles.chartTitle}>Bid Status Distribution</Text>
                  <PieChart
                    data={getBidStatusData()}
                    width={width}
                    height={220}
                    chartConfig={chartConfig}
                    accessor="population"
                    backgroundColor="transparent"
                    paddingLeft="15"
                    absolute
                  />
                </>
              ) : (
                <View style={styles.emptyChartContainer}>
                  <MaterialCommunityIcons name="chart-line" size={60} color="#bdc3c7" />
                  <Text style={styles.emptyChartText}>No bids yet</Text>
                  <Text style={styles.emptyChartSubtext}>
                    Charts will appear once bids are received
                  </Text>
                </View>
              )}
            </Surface>
            
            <Surface style={styles.recentBidsContainer}>
              <Text style={styles.sectionTitle}>Recent Bids</Text>
              {bids.length > 0 ? (
                bids
                  .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                  .slice(0, 5)
                  .map((bid) => (
                    <List.Item
                      key={bid.id}
                      title={`$${parseFloat(bid.amount).toLocaleString()}`}
                      description={`${bid.user?.name || 'Unknown Bidder'} • ${formatDistanceToNow(parseISO(bid.createdAt), { addSuffix: true })}`}
                      left={props => 
                        <MaterialCommunityIcons
                          {...props}
                          name={
                            bid.accepted
                              ? 'check-circle'
                              : bid.rejected
                              ? 'close-circle'
                              : 'clock-outline'
                          }
                          size={24}
                          color={
                            bid.accepted
                              ? '#4caf50'
                              : bid.rejected
                              ? '#f44336'
                              : '#2196f3'
                          }
                          style={styles.bidIcon}
                        />
                      }
                      right={props => <Text {...props} style={styles.bidStatus}>
                        {bid.accepted ? 'Accepted' : bid.rejected ? 'Rejected' : 'Pending'}
                      </Text>}
                    />
                  ))
              ) : (
                <View style={styles.emptyBidsContainer}>
                  <MaterialCommunityIcons name="gavel" size={60} color="#bdc3c7" />
                  <Text style={styles.emptyBidsText}>No bids yet</Text>
                  <Text style={styles.emptyBidsSubtext}>
                    Bids will appear here once they are received
                  </Text>
                </View>
              )}
              
              {bids.length > 5 && (
                <Button
                  mode="text"
                  onPress={navigateToManageBids}
                  style={styles.viewAllButton}
                >
                  View all bids
                </Button>
              )}
            </Surface>
            
            {(status === 'active' || status === 'scheduled') && (
              <Surface style={styles.actionsContainer}>
                <Text style={styles.sectionTitle}>Administrative Actions</Text>
                
                {status === 'active' && (
                  <Button
                    mode="contained"
                    icon="check-circle"
                    style={[styles.adminButton, styles.completeButton]}
                    onPress={showCompleteDialog}
                  >
                    Mark as Completed
                  </Button>
                )}
                
                <Button
                  mode="outlined"
                  icon="cancel"
                  style={[styles.adminButton, styles.cancelButton]}
                  onPress={showCancelDialog}
                >
                  Cancel Tender
                </Button>
                
                <Button
                  mode="outlined"
                  icon="delete"
                  style={[styles.adminButton, styles.deleteButton]}
                  onPress={showDeleteDialog}
                >
                  Delete Tender
                </Button>
              </Surface>
            )}
          </>
        )}
      </ScrollView>
      
      <Portal>
        <Menu
          visible={menuVisible}
          onDismiss={closeMenu}
          anchor={{ x: 0, y: 0 }}
          style={styles.menu}
        >
          <Menu.Item
            icon="gavel"
            onPress={() => {
              closeMenu();
              navigateToManageBids();
            }}
            title="Manage Bids"
          />
          
          {(status === 'scheduled' || status === 'active') && (
            <Menu.Item
              icon="pencil"
              onPress={() => {
                closeMenu();
                navigateToEditTender();
              }}
              title="Edit Tender"
            />
          )}
          
          {status === 'active' && (
            <Menu.Item
              icon="check-circle"
              onPress={() => {
                closeMenu();
                showCompleteDialog();
              }}
              title="Mark as Completed"
            />
          )}
          
          {(status === 'active' || status === 'scheduled') && (
            <Menu.Item
              icon="cancel"
              onPress={() => {
                closeMenu();
                showCancelDialog();
              }}
              title="Cancel Tender"
            />
          )}
          
          <Divider />
          
          <Menu.Item
            icon="delete"
            onPress={() => {
              closeMenu();
              showDeleteDialog();
            }}
            title="Delete Tender"
            titleStyle={{ color: '#e74c3c' }}
          />
        </Menu>
        
        <Dialog visible={deleteDialogVisible} onDismiss={hideDeleteDialog}>
          <Dialog.Title>Delete Tender</Dialog.Title>
          <Dialog.Content>
            <Text>Are you sure you want to delete this tender?</Text>
            <Text style={styles.dialogWarning}>
              This action cannot be undone and all associated bids will be deleted as well.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={hideDeleteDialog}>Cancel</Button>
            <Button onPress={confirmDelete} textColor="#e74c3c">
              Delete
            </Button>
          </Dialog.Actions>
        </Dialog>
        
        <Dialog visible={cancelDialogVisible} onDismiss={hideCancelDialog}>
          <Dialog.Title>Cancel Tender</Dialog.Title>
          <Dialog.Content>
            <Text>Are you sure you want to cancel this tender?</Text>
            <Text style={styles.dialogWarning}>
              This will stop the tender process immediately and notify all bidders.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={hideCancelDialog}>No</Button>
            <Button onPress={confirmCancel} textColor="#f44336">
              Yes, Cancel
            </Button>
          </Dialog.Actions>
        </Dialog>
        
        <Dialog visible={completeDialogVisible} onDismiss={hideCompleteDialog}>
          <Dialog.Title>Complete Tender</Dialog.Title>
          <Dialog.Content>
            <Text>Are you sure you want to mark this tender as completed?</Text>
            <Text style={styles.dialogInfo}>
              This will end the tender process immediately, even if the end date has not been reached.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={hideCompleteDialog}>No</Button>
            <Button onPress={confirmComplete}>
              Yes, Complete
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
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
  headerContainer: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    backgroundColor: 'white',
  },
  tenderHeader: {
    marginBottom: 8,
  },
  statusChip: {
    height: 28,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  tenderName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
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
  tenderMeta: {
    marginBottom: 16,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  metaItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  metaTextContainer: {
    marginLeft: 8,
    flex: 1,
  },
  metaLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    marginBottom: 2,
  },
  metaValue: {
    fontSize: 14,
    color: '#2c3e50',
    fontWeight: '500',
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2c3e50',
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  progressSubtext: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 4,
    textAlign: 'center',
  },
  winningBidContainer: {
    backgroundColor: '#fef9e7',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#f9e79f',
  },
  winningBidTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#f39c12',
    marginBottom: 8,
  },
  winningBidContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trophyIcon: {
    marginRight: 16,
  },
  winningBidDetails: {
    flex: 1,
  },
  winningBidAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  winningBidUser: {
    fontSize: 16,
    color: '#34495e',
  },
  winningBidDate: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  statsContainer: {
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    backgroundColor: 'white',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#7f8c8d',
    marginBottom: 8,
  },
  chart: {
    borderRadius: 8,
    marginVertical: 8,
  },
  emptyChartContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyChartText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginTop: 16,
  },
  emptyChartSubtext: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
    marginTop: 8,
  },
  recentBidsContainer: {
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    backgroundColor: 'white',
  },
  bidIcon: {
    margin: 8,
  },
  bidStatus: {
    fontSize: 12,
    fontWeight: '500',
  },
  emptyBidsContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyBidsText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginTop: 16,
  },
  emptyBidsSubtext: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
    marginTop: 8,
  },
  viewAllButton: {
    marginTop: 8,
  },
  actionsContainer: {
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    backgroundColor: 'white',
    marginBottom: 32,
  },
  adminButton: {
    marginBottom: 12,
  },
  completeButton: {
    backgroundColor: '#4caf50',
  },
  cancelButton: {
    borderColor: '#f44336',
  },
  deleteButton: {
    borderColor: '#e74c3c',
  },
  menu: {
    marginTop: 40,
  },
  dialogWarning: {
    marginTop: 8,
    color: '#e74c3c',
    fontStyle: 'italic',
  },
  dialogInfo: {
    marginTop: 8,
    fontStyle: 'italic',
    color: '#3498db',
  },
});

export default AdminTenderDetailScreen; 