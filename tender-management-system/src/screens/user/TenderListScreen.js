import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Searchbar, Appbar } from 'react-native-paper';
import { useTender } from '../../context/TenderContext';
import { useFocusEffect } from '@react-navigation/native';
import TenderCard from '../../components/TenderCard';
import EmptyState from '../../components/EmptyState';
import { StatusBar } from 'expo-status-bar';

const TenderListScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const { getActiveTenders, tenders, loading } = useTender();
  const [filteredTenders, setFilteredTenders] = useState([]);
  
  // Filter tenders based on search query
  useEffect(() => {
    if (tenders.length > 0) {
      const active = getActiveTenders();
      
      if (searchQuery) {
        const filtered = active.filter(tender => {
          const lowerCaseQuery = searchQuery.toLowerCase();
          return (
            tender.name.toLowerCase().includes(lowerCaseQuery) ||
            tender.description.toLowerCase().includes(lowerCaseQuery)
          );
        });
        setFilteredTenders(filtered);
      } else {
        setFilteredTenders(active);
      }
    } else {
      setFilteredTenders([]);
    }
  }, [searchQuery, tenders, getActiveTenders]);

  // Refresh data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      refreshTenders();
    }, [])
  );

  const refreshTenders = () => {
    setRefreshing(true);
    // In a real app, we'd make an API call here
    // For this demo, we're just using the data from context
    setRefreshing(false);
  };

  const handleTenderPress = (tender) => {
    navigation.navigate('TenderDetail', { tenderId: tender.id });
  };

  const renderEmptyState = () => {
    if (loading) {
      return null; // Loading state handled elsewhere
    }
    
    if (searchQuery && filteredTenders.length === 0) {
      return (
        <EmptyState
          icon="text-search"
          title="No matches found"
          message={`We couldn't find any tenders matching "${searchQuery}"`}
          actionLabel="Clear Search"
          onActionPress={() => setSearchQuery('')}
        />
      );
    }
    
    return (
      <EmptyState
        icon="briefcase-search-outline"
        title="No active tenders"
        message="There are no active tenders available at the moment. Please check back later."
      />
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <Appbar.Header style={styles.appbar}>
        <Appbar.Content title="Available Tenders" />
      </Appbar.Header>
      
      <Searchbar
        placeholder="Search tenders..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchbar}
        iconColor="#3498db"
      />
      
      <FlatList
        data={filteredTenders}
        renderItem={({ item, index }) => (
          <TenderCard
            tender={item}
            onPress={() => handleTenderPress(item)}
            index={index}
          />
        )}
        keyExtractor={item => item.id}
        contentContainerStyle={filteredTenders.length ? styles.list : styles.emptyList}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refreshTenders}
            colors={['#3498db']}
            tintColor="#3498db"
          />
        }
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
  searchbar: {
    marginHorizontal: 16,
    marginBottom: 16,
    elevation: 2,
    backgroundColor: 'white',
  },
  list: {
    paddingTop: 16,
    paddingBottom: 80,
  },
  emptyList: {
    flexGrow: 1,
  },
});

export default TenderListScreen; 