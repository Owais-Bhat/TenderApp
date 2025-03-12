import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ScrollView
} from 'react-native';
import {
  Appbar,
  Searchbar,
  Text,
  Chip,
  Surface,
  FAB,
  Divider,
  Menu,
  ActivityIndicator,
  Portal,
  Dialog,
  Button,
  IconButton
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useTender } from '../../context/TenderContext';
import { StatusBar } from 'expo-status-bar';
import { formatDistanceToNow, parseISO, isAfter, isBefore } from 'date-fns';

const ManageTendersScreen = ({ navigation }) => {
  // State variables
  const [tenders, setTenders] = useState([]);
  const [filteredTenders, setFilteredTenders] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedTenderId, setSelectedTenderId] = useState(null);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [searchVisible, setSearchVisible] = useState(false);
  const [filtersVisible, setFiltersVisible] = useState(false);
  
  // Context
  const { getAllTenders, deleteTender } = useTender();
  
  // Load tenders when the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadTenders();
      
      return () => {
        // Reset animations when screen is unfocused
      };
    }, [])
  );
  
  // Load tenders from API
  const loadTenders = async () => {
    try {
      setLoading(true);
      const data = await getAllTenders();
      setTenders(data);
      applyFilters(data, searchQuery, activeFilter);
    } catch (error) {
      console.error('Error loading tenders:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  // Refresh tenders
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadTenders();
  }, []);
  
  // Calculate tender status
  const getTenderStatus = (tender) => {
    const now = new Date();
    const startTime = parseISO(tender.startTime);
    const endTime = parseISO(tender.endTime);
    
    if (isBefore(now, startTime)) {
      return 'scheduled';
    } else if (isAfter(now, endTime)) {
      return 'completed';
    } else {
      return 'active';
    }
  };
  
  // Get chip color based on status
  const getStatusChipProps = (status) => {
    switch (status) {
      case 'active':
        return {
          backgroundColor: '#e3f2fd',
          textColor: '#2196f3',
          icon: 'currency-usd',
        };
      case 'scheduled':
        return {
          backgroundColor: '#fff8e1',
          textColor: '#ffa000',
          icon: 'clock-outline',
        };
      case 'completed':
        return {
          backgroundColor: '#e8f5e9',
          textColor: '#4caf50',
          icon: 'check-circle-outline',
        };
      default:
        return {
          backgroundColor: '#f5f5f5',
          textColor: '#9e9e9e',
          icon: 'help-circle-outline',
        };
    }
  };
  
  // Search and filter functions
  const onChangeSearch = (query) => {
    setSearchQuery(query);
    applyFilters(tenders, query, activeFilter);
  };
  
  const changeFilter = (filter) => {
    setActiveFilter(filter);
    applyFilters(tenders, searchQuery, filter);
  };
  
  const applyFilters = (tendersData, query, filter) => {
    let filtered = [...tendersData];
    
    // Apply search filter
    if (query) {
      filtered = filtered.filter(
        (tender) =>
          tender.name.toLowerCase().includes(query.toLowerCase()) ||
          tender.description.toLowerCase().includes(query.toLowerCase())
      );
    }
    
    // Apply status filter
    if (filter !== 'all') {
      filtered = filtered.filter((tender) => {
        const status = getTenderStatus(tender);
        return status === filter;
      });
    }
    
    // Sort by creation date (newest first)
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    setFilteredTenders(filtered);
  };
  
  // Dialog functions
  const showDeleteDialog = (tenderId) => {
    setSelectedTenderId(tenderId);
    setDeleteDialogVisible(true);
  };
  
  const hideDeleteDialog = () => {
    setDeleteDialogVisible(false);
  };
  
  const confirmDelete = async () => {
    try {
      await deleteTender(selectedTenderId);
      hideDeleteDialog();
      loadTenders();
    } catch (error) {
      console.error('Error deleting tender:', error);
    }
  };
  
  // Menu functions
  const openMenu = (tenderId) => {
    setSelectedTenderId(tenderId);
    setMenuVisible(true);
  };
  
  const closeMenu = () => {
    setMenuVisible(false);
  };
  
  // Navigation functions
  const viewTenderDetails = (tenderId) => {
    navigation.navigate('AdminTenderDetail', { tenderId });
  };
  
  const editTender = (tenderId) => {
    navigation.navigate('EditTender', { tenderId });
  };
  
  const manageBids = (tenderId) => {
    navigation.navigate('ManageBids', { tenderId });
  };
  
  // Render functions
  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <MaterialCommunityIcons name="file-search-outline" size={80} color="#bdc3c7" />
      <Text style={styles.emptyText}>No tenders found</Text>
      {activeFilter !== 'all' && (
        <Text style={styles.emptySubText}>
          Try changing the filter or search criteria
        </Text>
      )}
      <Button
        mode="outlined"
        style={styles.emptyButton}
        onPress={() => {
          setSearchQuery('');
          setActiveFilter('all');
          applyFilters(tenders, '', 'all');
        }}
      >
        Clear Filters
      </Button>
    </View>
  );
  
  const renderItem = ({ item }) => {
    const status = getTenderStatus(item);
    const { backgroundColor, textColor, icon } = getStatusChipProps(status);
    const bidCount = item.bids?.length || 0;
    
    return (
      <Surface style={styles.tenderCard}>
        <TouchableOpacity
          style={styles.cardContent}
          onPress={() => viewTenderDetails(item.id)}
          activeOpacity={0.7}
        >
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
              onPress={() => openMenu(item.id)}
            />
          </View>
          
          <Text style={styles.tenderName}>{item.name}</Text>
          <Text style={styles.tenderDescription} numberOfLines={2}>
            {item.description}
          </Text>
          
          <Divider style={styles.divider} />
          
          <View style={styles.tenderMeta}>
            <View style={styles.metaItem}>
              <MaterialCommunityIcons name="clock-outline" size={16} color="#7f8c8d" />
              <Text style={styles.metaText}>
                {status === 'completed'
                  ? 'Ended '
                  : status === 'active'
                  ? 'Ends '
                  : 'Starts '}
                {formatDistanceToNow(
                  parseISO(status === 'scheduled' ? item.startTime : item.endTime),
                  { addSuffix: true }
                )}
              </Text>
            </View>
            
            <View style={styles.metaItem}>
              <MaterialCommunityIcons name="gavel" size={16} color="#7f8c8d" />
              <Text style={styles.metaText}>
                {bidCount} {bidCount === 1 ? 'Bid' : 'Bids'}
              </Text>
            </View>
          </View>
          
          <View style={styles.actionButtons}>
            <Button
              mode="outlined"
              compact
              style={styles.actionButton}
              onPress={() => viewTenderDetails(item.id)}
              icon="eye"
            >
              View
            </Button>
            <Button
              mode="outlined"
              compact
              style={styles.actionButton}
              onPress={() => manageBids(item.id)}
              icon="gavel"
            >
              Bids
            </Button>
          </View>
        </TouchableOpacity>
      </Surface>
    );
  };
  
  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <Appbar.Header style={styles.appbar}>
        <Appbar.Content title="Manage Tenders" />
        <View style={styles.appbarActions}>
          <Appbar.Action icon="magnify" onPress={() => setSearchVisible(!searchVisible)} />
          <Appbar.Action icon="filter-variant" onPress={() => setFiltersVisible(!filtersVisible)} />
          <Appbar.Action icon="tune" onPress={() => navigation.navigate('ManageTenders')} />
        </View>
      </Appbar.Header>
      
      <Searchbar
        placeholder="Search tenders..."
        onChangeText={onChangeSearch}
        value={searchQuery}
        style={styles.searchbar}
      />
      
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={[
              styles.filterChip,
              activeFilter === 'all' && styles.activeFilterChip,
            ]}
            onPress={() => changeFilter('all')}
          >
            <Text
              style={[
                styles.filterText,
                activeFilter === 'all' && styles.activeFilterText,
              ]}
            >
              All
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.filterChip,
              activeFilter === 'active' && styles.activeFilterChip,
            ]}
            onPress={() => changeFilter('active')}
          >
            <MaterialCommunityIcons
              name="currency-usd"
              size={16}
              color={activeFilter === 'active' ? '#2196f3' : '#7f8c8d'}
              style={styles.filterIcon}
            />
            <Text
              style={[
                styles.filterText,
                activeFilter === 'active' && styles.activeFilterText,
              ]}
            >
              Active
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.filterChip,
              activeFilter === 'scheduled' && styles.activeFilterChip,
            ]}
            onPress={() => changeFilter('scheduled')}
          >
            <MaterialCommunityIcons
              name="clock-outline"
              size={16}
              color={activeFilter === 'scheduled' ? '#ffa000' : '#7f8c8d'}
              style={styles.filterIcon}
            />
            <Text
              style={[
                styles.filterText,
                activeFilter === 'scheduled' && styles.activeFilterText,
              ]}
            >
              Scheduled
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.filterChip,
              activeFilter === 'completed' && styles.activeFilterChip,
            ]}
            onPress={() => changeFilter('completed')}
          >
            <MaterialCommunityIcons
              name="check-circle-outline"
              size={16}
              color={activeFilter === 'completed' ? '#4caf50' : '#7f8c8d'}
              style={styles.filterIcon}
            />
            <Text
              style={[
                styles.filterText,
                activeFilter === 'completed' && styles.activeFilterText,
              ]}
            >
              Completed
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
      
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3498db" />
          <Text style={styles.loadingText}>Loading tenders...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredTenders}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={
            filteredTenders.length === 0 ? { flex: 1 } : styles.listContent
          }
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={renderEmptyList}
        />
      )}
      
      <Portal>
        <Menu
          visible={menuVisible}
          onDismiss={closeMenu}
          anchor={{ x: 0, y: 0 }}
          style={styles.menu}
        >
          <Menu.Item
            icon="pencil"
            onPress={() => {
              closeMenu();
              editTender(selectedTenderId);
            }}
            title="Edit Tender"
          />
          <Menu.Item
            icon="gavel"
            onPress={() => {
              closeMenu();
              manageBids(selectedTenderId);
            }}
            title="Manage Bids"
          />
          <Divider />
          <Menu.Item
            icon="delete"
            onPress={() => {
              closeMenu();
              showDeleteDialog(selectedTenderId);
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
      </Portal>
      
      <FAB
        style={styles.fab}
        icon="plus"
        label="New Tender"
        onPress={() => navigation.navigate('CreateTender')}
      />
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
  appbarActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchbar: {
    marginHorizontal: 16,
    marginTop: 8,
    backgroundColor: 'white',
    elevation: 2,
    borderRadius: 8,
  },
  filterContainer: {
    paddingHorizontal: 8,
    paddingVertical: 12,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 8,
    borderRadius: 20,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  activeFilterChip: {
    backgroundColor: '#e3f2fd',
    borderColor: '#2196f3',
  },
  filterIcon: {
    marginRight: 4,
  },
  filterText: {
    color: '#7f8c8d',
    fontWeight: '500',
  },
  activeFilterText: {
    color: '#2196f3',
    fontWeight: 'bold',
  },
  listContent: {
    padding: 8,
    paddingBottom: 80, // Extra space for FAB
  },
  tenderCard: {
    marginHorizontal: 8,
    marginVertical: 8,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
  },
  cardContent: {
    padding: 16,
    backgroundColor: 'white',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusChip: {
    height: 28,
  },
  tenderName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  tenderDescription: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 8,
  },
  divider: {
    marginVertical: 12,
  },
  tenderMeta: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  metaText: {
    fontSize: 12,
    color: '#7f8c8d',
    marginLeft: 4,
  },
  actionButtons: {
    flexDirection: 'row',
  },
  actionButton: {
    marginRight: 8,
    borderColor: '#bdc3c7',
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
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#3498db',
  },
  menu: {
    marginTop: 40,
  },
  dialogWarning: {
    marginTop: 8,
    color: '#e74c3c',
    fontStyle: 'italic',
  },
});

export default ManageTendersScreen; 