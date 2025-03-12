import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Appbar, Button, Text } from 'react-native-paper';
import { useTender } from '../../context/TenderContext';
import { useFocusEffect } from '@react-navigation/native';
import NotificationItem from '../../components/NotificationItem';
import EmptyState from '../../components/EmptyState';
import { StatusBar } from 'expo-status-bar';

const NotificationsScreen = ({ navigation }) => {
  const { notifications, markNotificationAsRead } = useTender();
  const [refreshing, setRefreshing] = useState(false);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  
  // Update filtered notifications when notifications change
  useEffect(() => {
    // Sort notifications by date (newest first)
    const sorted = [...notifications].sort((a, b) => {
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
    setFilteredNotifications(sorted);
  }, [notifications]);
  
  // Refresh data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      refreshNotifications();
    }, [])
  );
  
  const refreshNotifications = () => {
    setRefreshing(true);
    // In a real app, we'd make an API call here
    // For this demo, we're just using the data from context
    setRefreshing(false);
  };
  
  const handleNotificationPress = (notification) => {
    markNotificationAsRead(notification.id);
    
    if (notification.tenderId) {
      navigation.navigate('Tenders', {
        screen: 'TenderDetail',
        params: { tenderId: notification.tenderId }
      });
    }
  };
  
  const markAllAsRead = () => {
    filteredNotifications.forEach(notification => {
      if (!notification.read) {
        markNotificationAsRead(notification.id);
      }
    });
  };
  
  const renderEmptyState = () => {
    return (
      <EmptyState
        icon="bell-outline"
        title="No Notifications"
        message="You don't have any notifications yet. We'll notify you about important tender updates."
      />
    );
  };
  
  const getUnreadCount = () => {
    return filteredNotifications.filter(notification => !notification.read).length;
  };
  
  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <Appbar.Header style={styles.appbar}>
        <Appbar.Content title="Notifications" />
        {getUnreadCount() > 0 && (
          <Appbar.Action
            icon="check-all"
            onPress={markAllAsRead}
            disabled={refreshing}
          />
        )}
      </Appbar.Header>
      
      <Text style={styles.headerText}>
        {getUnreadCount() > 0 
          ? `You have ${getUnreadCount()} unread notification${getUnreadCount() > 1 ? 's' : ''}` 
          : 'All caught up!'}
      </Text>
      
      {getUnreadCount() > 0 && (
        <Button 
          mode="text"
          compact
          onPress={markAllAsRead}
          style={styles.markAllButton}
        >
          Mark all as read
        </Button>
      )}
      
      <FlatList
        data={filteredNotifications}
        renderItem={({ item, index }) => (
          <NotificationItem
            notification={item}
            onPress={() => handleNotificationPress(item)}
            index={index}
          />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={
          filteredNotifications.length === 0 ? styles.emptyList : styles.list
        }
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refreshNotifications}
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
  headerText: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  markAllButton: {
    marginLeft: 8,
  },
  list: {
    paddingTop: 8,
    paddingBottom: 20,
  },
  emptyList: {
    flexGrow: 1,
  },
});

export default NotificationsScreen;