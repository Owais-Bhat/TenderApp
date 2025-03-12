import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ScrollView,
  Alert
} from 'react-native';
import {
  Appbar,
  Text,
  Surface,
  Divider,
  Chip,
  Button,
  Menu,
  IconButton,
  Portal,
  Dialog,
  ActivityIndicator,
  SegmentedButtons,
  Searchbar
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useTender } from '../../context/TenderContext';
import { useBid } from '../../context/BidContext';
import { StatusBar } from 'expo-status-bar';
import { formatDistanceToNow, format, parseISO } from 'date-fns';

const ManageBidsScreen = ({ navigation, route }) => {
  const { tenderId } = route.params;
  
  // State variables
  const [tender, setTender] = useState(null);
  const [bids, setBids] = useState([]);
  const [filteredBids, setFilteredBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('time');
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedBidId, setSelectedBidId] = useState(null);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [acceptDialogVisible, setAcceptDialogVisible] = useState(false);
  const [rejectDialogVisible, setRejectDialogVisible] = useState(false);
  
  // Context
  const { getTenderById } = useTender();
  const { getBidsByTender, acceptBid, rejectBid, deleteBid } = useBid();
  
  // Load data when the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadData();
      
      return () => {
        // Reset animations when screen is unfocused
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
      applyFilters(bidsData, searchQuery, sortBy);
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load bids. Please try again.');
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
  
  // Sort and filter functions
  const onChangeSearch = (query) => {
    setSearchQuery(query);
    applyFilters(bids, query, sortBy);
  };
  
  const onChangeSortBy = (value) => {
    setSortBy(value);
    applyFilters(bids, searchQuery, value);
  };
  
  const applyFilters = (bidsData, query, sort) => {
    let filtered = [...bidsData];
    
    // Apply search filter
    if (query) {
      filtered = filtered.filter(bid => {
        // Add null checks for bid.user
        const userName = bid.user?.name || '';
        const userEmail = bid.user?.email || '';
        const bidAmount = bid.amount?.toString() || '';
        
        return userName.toLowerCase().includes(query.toLowerCase()) ||
          userEmail.toLowerCase().includes(query.toLowerCase()) ||
          bidAmount.includes(query);
      });
    }
    
    // Apply sorting
    switch (sort) {
      case 'amount-asc':
        filtered.sort((a, b) => parseFloat(a.amount) - parseFloat(b.amount));
        break;
      case 'amount-desc':
        filtered.sort((a, b) => parseFloat(b.amount) - parseFloat(a.amount));
        break;
      case 'time':
      default:
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
    }
    
    setFilteredBids(filtered);
  };
  
  // Bid status functions
  const getBidStatus = (bid) => {
    if (bid.accepted) return 'accepted';
    if (bid.rejected) return 'rejected';
    return 'pending';
  };
  
  const getStatusChipProps = (status) => {
    switch (status) {
      case 'accepted':
        return {
          backgroundColor: '#e8f5e9',
          textColor: '#4caf50',
          icon: 'check-circle',
        };
      case 'rejected':
        return {
          backgroundColor: '#ffebee',
          textColor: '#f44336',
          icon: 'close-circle',
        };
      case 'pending':
      default:
        return {
          backgroundColor: '#e3f2fd',
          textColor: '#2196f3',
          icon: 'clock-outline',
        };
    }
  };
  
  // Dialog functions
  const showAcceptDialog = (bidId) => {
    setSelectedBidId(bidId);
    setAcceptDialogVisible(true);
  };
  
  const hideAcceptDialog = () => {
    setAcceptDialogVisible(false);
  };
  
  const confirmAccept = async () => {
    try {
      await acceptBid(selectedBidId);
      hideAcceptDialog();
      loadData();
      Alert.alert('Success', 'Bid has been accepted successfully');
    } catch (error) {
      console.error('Error accepting bid:', error);
      Alert.alert('Error', 'Failed to accept bid. Please try again.');
    }
  };
  
  const showRejectDialog = (bidId) => {
    setSelectedBidId(bidId);
    setRejectDialogVisible(true);
  };
  
  const hideRejectDialog = () => {
    setRejectDialogVisible(false);
  };
  
  const confirmReject = async () => {
    try {
      await rejectBid(selectedBidId);
      hideRejectDialog();
      loadData();
      Alert.alert('Success', 'Bid has been rejected successfully');
    } catch (error) {
      console.error('Error rejecting bid:', error);
      Alert.alert('Error', 'Failed to reject bid. Please try again.');
    }
  };
  
  const showDeleteDialog = (bidId) => {
    setSelectedBidId(bidId);
    setDeleteDialogVisible(true);
  };
  
  const hideDeleteDialog = () => {
    setDeleteDialogVisible(false);
  };
  
  const confirmDelete = async () => {
    try {
      await deleteBid(selectedBidId);
      hideDeleteDialog();
      loadData();
      Alert.alert('Success', 'Bid has been deleted successfully');
    } catch (error) {
      console.error('Error deleting bid:', error);
      Alert.alert('Error', 'Failed to delete bid. Please try again.');
    }
  };
  
  // Menu functions
  const openMenu = (bidId) => {
    setSelectedBidId(bidId);
    setMenuVisible(true);
  };
  
  const closeMenu = () => {
    setMenuVisible(false);
  };
  
  // Render functions
  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <MaterialCommunityIcons name="gavel" size={80} color="#bdc3c7" />
      <Text style={styles.emptyText}>No bids found</Text>
      {searchQuery ? (
        <Text style={styles.emptySubText}>
          Try changing the search criteria
        </Text>
      ) : (
        <Text style={styles.emptySubText}>
          There are no bids for this tender yet
        </Text>
      )}
      
      {searchQuery && (
        <Button
          mode="outlined"
          style={styles.emptyButton}
          onPress={() => {
            setSearchQuery('');
            applyFilters(bids, '', sortBy);
          }}
        >
          Clear Search
        </Button>
      )}
    </View>
  );
  
  const renderItem = ({ item }) => {
    const bid = item;
    const status = getBidStatus(bid);
    const { backgroundColor, textColor, icon } = getStatusChipProps(status);
    
    // Get user data with fallbacks for undefined
    const userName = bid.user?.name || 'Unknown Bidder';
    const userEmail = bid.user?.email || 'No email provided';
    
    return (
      <Surface style={styles.bidCard}>
        <View style={styles.cardHeader}>
          <Chip
            mode="outlined"
            style={[styles.statusChip, { backgroundColor }]}
            textStyle={{ color: textColor }}
            icon={() => (
              <MaterialCommunityIcons name={icon} size={16} color={textColor} />
            )}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Chip>
          <IconButton
            icon="dots-vertical"
            size={20}
            onPress={() => openMenu(bid.id)}
          />
        </View>
        
        <View style={styles.bidAmount}>
          <Text style={styles.currencySymbol}>$</Text>
          <Text style={styles.bidAmountText}>{parseFloat(bid.amount).toLocaleString()}</Text>
        </View>
        
        <Divider style={styles.divider} />
        
        <View style={styles.bidderInfo}>
          <View style={styles.bidderDetail}>
            <MaterialCommunityIcons name="account" size={18} color="#7f8c8d" />
            <Text style={styles.bidderName}>{userName}</Text>
          </View>
          
          <View style={styles.bidderDetail}>
            <MaterialCommunityIcons name="email-outline" size={18} color="#7f8c8d" />
            <Text style={styles.bidderEmail}>{userEmail}</Text>
          </View>
        </View>
        
        <View style={styles.bidMeta}>
          <View style={styles.metaItem}>
            <MaterialCommunityIcons name="clock-outline" size={16} color="#7f8c8d" />
            <Text style={styles.metaText}>
              Bid placed {formatDistanceToNow(parseISO(bid.createdAt), { addSuffix: true })}
            </Text>
          </View>
          
          {bid.accepted && bid.acceptedAt && (
            <View style={styles.metaItem}>
              <MaterialCommunityIcons name="check-circle" size={16} color="#4caf50" />
              <Text style={[styles.metaText, { color: '#4caf50' }]}>
                Accepted {formatDistanceToNow(parseISO(bid.acceptedAt), { addSuffix: true })}
              </Text>
            </View>
          )}
          
          {bid.rejected && bid.rejectedAt && (
            <View style={styles.metaItem}>
              <MaterialCommunityIcons name="close-circle" size={16} color="#f44336" />
              <Text style={[styles.metaText, { color: '#f44336' }]}>
                Rejected {formatDistanceToNow(parseISO(bid.rejectedAt), { addSuffix: true })}
              </Text>
            </View>
          )}
        </View>
        
        {status === 'pending' && (
          <View style={styles.actionButtons}>
            <Button
              mode="contained"
              style={[styles.actionButton, styles.acceptButton]}
              onPress={() => showAcceptDialog(bid.id)}
              icon="check"
            >
              Accept
            </Button>
            <Button
              mode="outlined"
              style={[styles.actionButton, styles.rejectButton]}
              onPress={() => showRejectDialog(bid.id)}
              icon="close"
            >
              Reject
            </Button>
          </View>
        )}
      </Surface>
    );
  };
  
  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <Appbar.Header style={styles.appbar}>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Manage Bids" subtitle={tender?.name || 'Loading...'} />
      </Appbar.Header>
      
      <View style={styles.filterContainer}>
        <Searchbar
          placeholder="Search bidder or amount..."
          onChangeText={onChangeSearch}
          value={searchQuery}
          style={styles.searchbar}
        />
        
        <SegmentedButtons
          value={sortBy}
          onValueChange={onChangeSortBy}
          buttons={[
            {
              value: 'time',
              label: 'Newest',
              icon: 'clock-outline',
            },
            {
              value: 'amount-asc',
              label: 'Lowest',
              icon: 'trending-up',
            },
            {
              value: 'amount-desc',
              label: 'Highest',
              icon: 'trending-down',
            },
          ]}
          style={styles.segmentedButtons}
        />
      </View>
      
      {tender && (
        <View style={styles.tenderInfoContainer}>
          <View style={styles.tenderInfoRow}>
            <Text style={styles.tenderInfoLabel}>Tender:</Text>
            <Text style={styles.tenderInfoValue}>{tender.name}</Text>
          </View>
          <View style={styles.tenderInfoRow}>
            <Text style={styles.tenderInfoLabel}>End Time:</Text>
            <Text style={styles.tenderInfoValue}>
              {format(parseISO(tender.endTime), 'PPpp')}
            </Text>
          </View>
          <View style={styles.tenderInfoRow}>
            <Text style={styles.tenderInfoLabel}>Buffer Time:</Text>
            <Text style={styles.tenderInfoValue}>{tender.bufferTime} minutes</Text>
          </View>
          <View style={styles.tenderInfoRow}>
            <Text style={styles.tenderInfoLabel}>Total Bids:</Text>
            <Text style={styles.tenderInfoValue}>{bids.length}</Text>
          </View>
        </View>
      )}
      
      <FlatList
        data={filteredBids}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={
          filteredBids.length === 0 ? { flex: 1 } : styles.listContent
        }
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={renderEmptyList}
      />
      
      <Portal>
        <Menu
          visible={menuVisible}
          onDismiss={closeMenu}
          anchor={{ x: 0, y: 0 }}
          style={styles.menu}
        >
          {filteredBids.find(bid => bid.id === selectedBidId)?.status !== 'accepted' && (
            <Menu.Item
              icon="check"
              onPress={() => {
                closeMenu();
                showAcceptDialog(selectedBidId);
              }}
              title="Accept Bid"
            />
          )}
          
          {filteredBids.find(bid => bid.id === selectedBidId)?.status !== 'rejected' && (
            <Menu.Item
              icon="close"
              onPress={() => {
                closeMenu();
                showRejectDialog(selectedBidId);
              }}
              title="Reject Bid"
            />
          )}
          
          <Divider />
          
          <Menu.Item
            icon="delete"
            onPress={() => {
              closeMenu();
              showDeleteDialog(selectedBidId);
            }}
            title="Delete Bid"
            titleStyle={{ color: '#e74c3c' }}
          />
        </Menu>
        
        <Dialog visible={acceptDialogVisible} onDismiss={hideAcceptDialog}>
          <Dialog.Title>Accept Bid</Dialog.Title>
          <Dialog.Content>
            <Text>Are you sure you want to accept this bid?</Text>
            <Text style={styles.dialogInfo}>
              Accepting this bid will automatically reject all other bids for this tender.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={hideAcceptDialog}>Cancel</Button>
            <Button onPress={confirmAccept}>Accept</Button>
          </Dialog.Actions>
        </Dialog>
        
        <Dialog visible={rejectDialogVisible} onDismiss={hideRejectDialog}>
          <Dialog.Title>Reject Bid</Dialog.Title>
          <Dialog.Content>
            <Text>Are you sure you want to reject this bid?</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={hideRejectDialog}>Cancel</Button>
            <Button onPress={confirmReject} textColor="#f44336">Reject</Button>
          </Dialog.Actions>
        </Dialog>
        
        <Dialog visible={deleteDialogVisible} onDismiss={hideDeleteDialog}>
          <Dialog.Title>Delete Bid</Dialog.Title>
          <Dialog.Content>
            <Text>Are you sure you want to delete this bid?</Text>
            <Text style={styles.dialogWarning}>
              This action cannot be undone.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={hideDeleteDialog}>Cancel</Button>
            <Button onPress={confirmDelete} textColor="#e74c3c">
              Delete
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
  filterContainer: {
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchbar: {
    marginBottom: 12,
    backgroundColor: '#f8f9fa',
    elevation: 0,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
  },
  segmentedButtons: {
    backgroundColor: '#f8f9fa',
  },
  tenderInfoContainer: {
    backgroundColor: 'white',
    padding: 16,
    margin: 16,
    marginTop: 0,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  tenderInfoRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  tenderInfoLabel: {
    fontWeight: 'bold',
    color: '#2c3e50',
    width: 100,
  },
  tenderInfoValue: {
    flex: 1,
    color: '#34495e',
  },
  listContent: {
    padding: 8,
  },
  bidCard: {
    margin: 8,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    backgroundColor: 'white',
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusChip: {
    height: 28,
  },
  bidAmount: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginTop: 4,
    marginRight: 2,
  },
  bidAmountText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  divider: {
    marginBottom: 16,
  },
  bidderInfo: {
    marginBottom: 16,
  },
  bidderDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  bidderName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginLeft: 8,
  },
  bidderEmail: {
    fontSize: 14,
    color: '#7f8c8d',
    marginLeft: 8,
  },
  bidMeta: {
    marginBottom: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  metaText: {
    fontSize: 12,
    color: '#7f8c8d',
    marginLeft: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  acceptButton: {
    backgroundColor: '#4caf50',
  },
  rejectButton: {
    borderColor: '#f44336',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginTop: 16,
  },
  emptySubText: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  emptyButton: {
    marginTop: 16,
  },
  menu: {
    marginTop: 40,
  },
  dialogInfo: {
    marginTop: 8,
    fontStyle: 'italic',
    color: '#3498db',
  },
  dialogWarning: {
    marginTop: 8,
    color: '#e74c3c',
    fontStyle: 'italic',
  },
});

export default ManageBidsScreen; 