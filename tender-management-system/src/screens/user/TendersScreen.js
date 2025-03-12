import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Animated,
  Easing,
  RefreshControl,
  Dimensions
} from 'react-native';
import {
  Appbar,
  Text,
  Searchbar,
  Card,
  Chip,
  Button,
  IconButton,
  Divider,
  ActivityIndicator,
  Menu,
  Surface
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTender } from '../../context/TenderContext';
import { useAuth } from '../../context/AuthContext';
import { StatusBar } from 'expo-status-bar';
import { useFocusEffect } from '@react-navigation/native';
import { format, formatDistanceToNow, parseISO, isAfter, isBefore } from 'date-fns';
import TenderCard from '../../components/TenderCard';
import EmptyState from '../../components/EmptyState';

const { width } = Dimensions.get('window');

const TendersScreen = ({ navigation }) => {
  // State variables
  const [tenders, setTenders] = useState([]);
  const [filteredTenders, setFilteredTenders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMenuVisible, setFilterMenuVisible] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [favorites, setFavorites] = useState([]);
  
  // Context
  const { getAllTenders, getUserFavorites } = useTender();
  const { user } = useAuth();
  
  // Filter tenders based on search query and active filter
  useEffect(() => {
    if (tenders.length > 0) {
      let filtered = [...tenders];
      
      // Apply status filter
      if (selectedFilter !== 'all') {
        filtered = filtered.filter(tender => tender.status === selectedFilter);
      }
      
      // Apply search filter
      if (searchQuery) {
        const lowerCaseQuery = searchQuery.toLowerCase();
        filtered = filtered.filter(tender => {
          return (
            tender.name.toLowerCase().includes(lowerCaseQuery) ||
            tender.description.toLowerCase().includes(lowerCaseQuery) ||
            (tender.category && tender.category.toLowerCase().includes(lowerCaseQuery))
          );
        });
      }
      
      setFilteredTenders(filtered);
    } else {
      setFilteredTenders([]);
    }
  }, [searchQuery, tenders, selectedFilter]);

  // Load data when the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );
  
  // Load tender data
  const loadData = async () => {
    try {
      setLoading(true);
      
      // Get all tenders
      const tendersData = await getAllTenders();
      setTenders(tendersData);
      
      // Get user favorites
      if (user) {
        const favoritesData = await getUserFavorites(user.id);
        setFavorites(favoritesData.map(fav => fav.id));
      }
    } catch (error) {
      console.error('Error loading tenders:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  // Handle refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, []);
  
  // Update search query
  const onChangeSearch = (query) => {
    setSearchQuery(query);
  };
  
  // Toggle filter menu
  const toggleFilterMenu = () => {
    setFilterMenuVisible(!filterMenuVisible);
  };
  
  // Apply selected filter
  const applyFilter = (filter) => {
    setSelectedFilter(filter);
  };
  
  // Calculate tender status
  const getTenderStatus = (tender) => {
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
  
  // Get color based on tender status
  const getStatusColor = (status) => {
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
  
  // Get filter name for display
  const getFilterName = () => {
    switch (selectedFilter) {
      case 'all':
        return 'All Tenders';
      case 'active':
        return 'Active Tenders';
      case 'upcoming':
        return 'Upcoming Tenders';
      case 'ended':
        return 'Ended Tenders';
      case 'favorites':
        return 'Favorites';
      default:
        return 'All Tenders';
    }
  };
  
  // Navigate to tender details
  const navigateToTenderDetails = (tenderId) => {
    navigation.navigate('UserTenderDetail', { tenderId });
  };
  
  // Render each tender item
  const renderTenderItem = ({ item }) => {
    const status = getTenderStatus(item);
    const statusColor = getStatusColor(status);
    const isFavorite = favorites.includes(item.id);
    
    return (
      <Card style={styles.tenderCard} onPress={() => navigateToTenderDetails(item.id)}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleContainer}>
              <Text style={styles.cardTitle} numberOfLines={1}>{item.name}</Text>
              {isFavorite && (
                <MaterialCommunityIcons name="heart" size={16} color="#f44336" style={styles.favoriteIcon} />
              )}
            </View>
            <Chip
              mode="outlined"
              style={[styles.statusChip, { borderColor: statusColor }]}
              textStyle={{ color: statusColor }}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Chip>
          </View>
          
          <Text style={styles.tenderDescription} numberOfLines={2}>
            {item.description}
          </Text>
          
          <View style={styles.tenderDetails}>
            <View style={styles.detailItem}>
              <MaterialCommunityIcons name="calendar-clock" size={16} color="#7f8c8d" />
              <Text style={styles.detailText}>
                {status === 'active' 
                  ? `Ends ${formatDistanceToNow(parseISO(item.endTime), { addSuffix: true })}`
                  : status === 'scheduled'
                  ? `Starts ${formatDistanceToNow(parseISO(item.startTime), { addSuffix: true })}`
                  : `Ended ${formatDistanceToNow(parseISO(item.endTime), { addSuffix: true })}`
                }
              </Text>
            </View>
            
            {item.category && (
              <View style={styles.detailItem}>
                <MaterialCommunityIcons name="tag" size={16} color="#7f8c8d" />
                <Text style={styles.detailText}>{item.category}</Text>
              </View>
            )}
            
            {item.location && (
              <View style={styles.detailItem}>
                <MaterialCommunityIcons name="map-marker" size={16} color="#7f8c8d" />
                <Text style={styles.detailText}>{item.location}</Text>
              </View>
            )}
          </View>
        </Card.Content>
        
        <Card.Actions>
          <Button
            mode="text"
            onPress={() => navigateToTenderDetails(item.id)}
            style={styles.viewDetailsButton}
          >
            View Details
          </Button>
          {status === 'active' && (
            <Button
              mode="contained"
              onPress={() => navigation.navigate('PlaceBid', { tenderId: item.id })}
              style={styles.placeBidButton}
            >
              Place Bid
            </Button>
          )}
        </Card.Actions>
      </Card>
    );
  };
  
  // Render empty state
  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <MaterialCommunityIcons
        name={
          selectedFilter === 'favorites'
            ? 'heart-off'
            : selectedFilter === 'active'
            ? 'clipboard-text-off'
            : 'file-search-outline'
        }
        size={80}
        color="#bdc3c7"
      />
      <Text style={styles.emptyTitle}>
        {selectedFilter === 'favorites'
          ? 'No favorite tenders'
          : searchQuery
          ? 'No matching tenders'
          : 'No tenders available'}
      </Text>
      <Text style={styles.emptyDescription}>
        {selectedFilter === 'favorites'
          ? 'You haven\'t added any tenders to your favorites yet'
          : searchQuery
          ? 'Try adjusting your search criteria'
          : 'Check back later for new tenders'}
      </Text>
      {(selectedFilter !== 'all' || searchQuery !== '') && (
        <Button
          mode="outlined"
          style={styles.clearFilterButton}
          onPress={() => {
            setSelectedFilter('all');
            setSearchQuery('');
          }}
        >
          Clear Filters
        </Button>
      )}
    </View>
  );
  
  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <Appbar.Header style={styles.appbar}>
        <Appbar.Content title="Available Tenders" subtitle={getFilterName()} />
        <Appbar.Action icon="tune" onPress={toggleFilterMenu} />
      </Appbar.Header>
      
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search tenders..."
          onChangeText={onChangeSearch}
          value={searchQuery}
          style={styles.searchBar}
        />
        
        <Menu
          visible={filterMenuVisible}
          onDismiss={toggleFilterMenu}
          anchor={<View style={{ width: 1, height: 1 }} />}
          style={styles.filterMenu}
          contentStyle={styles.filterMenuContent}
        >
          <Menu.Item
            onPress={() => applyFilter('all')}
            title="All Tenders"
            leadingIcon="format-list-bulleted"
            titleStyle={selectedFilter === 'all' ? styles.selectedFilterText : null}
            style={selectedFilter === 'all' ? styles.selectedFilter : null}
          />
          <Menu.Item
            onPress={() => applyFilter('active')}
            title="Active Tenders"
            leadingIcon="clock-outline"
            titleStyle={selectedFilter === 'active' ? styles.selectedFilterText : null}
            style={selectedFilter === 'active' ? styles.selectedFilter : null}
          />
          <Menu.Item
            onPress={() => applyFilter('upcoming')}
            title="Upcoming Tenders"
            leadingIcon="calendar-arrow-right"
            titleStyle={selectedFilter === 'upcoming' ? styles.selectedFilterText : null}
            style={selectedFilter === 'upcoming' ? styles.selectedFilter : null}
          />
          <Menu.Item
            onPress={() => applyFilter('ended')}
            title="Ended Tenders"
            leadingIcon="calendar-check"
            titleStyle={selectedFilter === 'ended' ? styles.selectedFilterText : null}
            style={selectedFilter === 'ended' ? styles.selectedFilter : null}
          />
          <Menu.Item
            onPress={() => applyFilter('favorites')}
            title="Favorites"
            leadingIcon="heart"
            titleStyle={selectedFilter === 'favorites' ? styles.selectedFilterText : null}
            style={selectedFilter === 'favorites' ? styles.selectedFilter : null}
          />
        </Menu>
      </View>
      
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3498db" />
          <Text style={styles.loadingText}>Loading tenders...</Text>
        </View>
      ) : (
        <View style={styles.contentContainer}>
          <Surface style={styles.filterSurface}>
            <Text style={styles.resultsText}>
              {filteredTenders.length} {filteredTenders.length === 1 ? 'tender' : 'tenders'} found
            </Text>
            <View style={styles.activeFiltersContainer}>
              {selectedFilter !== 'all' && (
                <Chip
                  mode="outlined"
                  onClose={() => applyFilter('all')}
                  style={styles.filterChip}
                >
                  {getFilterName()}
                </Chip>
              )}
              {searchQuery ? (
                <Chip
                  mode="outlined"
                  onClose={() => onChangeSearch('')}
                  style={styles.filterChip}
                >
                  "{searchQuery}"
                </Chip>
              ) : null}
            </View>
          </Surface>
          
          <FlatList
            data={filteredTenders}
            renderItem={renderTenderItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContainer}
            ListEmptyComponent={renderEmptyList}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          />
        </View>
      )}
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
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    zIndex: 10,
  },
  searchBar: {
    elevation: 0,
    backgroundColor: '#f5f5f5',
  },
  filterMenu: {
    marginTop: 50,
    marginLeft: width - 220,
    width: 200,
  },
  filterMenuContent: {
    backgroundColor: 'white',
  },
  selectedFilter: {
    backgroundColor: '#e3f2fd',
  },
  selectedFilterText: {
    color: '#2196f3',
    fontWeight: 'bold',
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
  contentContainer: {
    flex: 1,
  },
  filterSurface: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    flexWrap: 'wrap',
  },
  resultsText: {
    color: '#7f8c8d',
    fontSize: 14,
  },
  activeFiltersContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  filterChip: {
    marginLeft: 8,
    marginBottom: 4,
    marginTop: 4,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  tenderCard: {
    marginBottom: 16,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  cardTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    flex: 1,
  },
  favoriteIcon: {
    marginLeft: 4,
  },
  statusChip: {
    height: 26,
  },
  tenderDescription: {
    fontSize: 14,
    color: '#34495e',
    marginBottom: 12,
    lineHeight: 20,
  },
  tenderDetails: {
    marginBottom: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailText: {
    fontSize: 12,
    color: '#7f8c8d',
    marginLeft: 4,
  },
  viewDetailsButton: {
    marginRight: 8,
  },
  placeBidButton: {
    backgroundColor: '#3498db',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 18,
    color: '#2c3e50',
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 24,
  },
  clearFilterButton: {
    borderColor: '#3498db',
  },
});

export default TendersScreen; 