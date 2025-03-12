import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Surface, Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { formatDistanceToNow, parseISO } from 'date-fns';

const NotificationItem = ({ notification, onPress }) => {
  // Helper to determine icon based on notification type
  const getIcon = () => {
    switch (notification.type) {
      case 'new_tender':
        return 'file-document-outline';
      case 'tender_updated':
        return 'file-document-edit-outline';
      case 'tender_closed':
        return 'file-check-outline';
      case 'new_bid':
        return 'cash-multiple';
      case 'bid_accepted':
        return 'check-circle-outline';
      case 'bid_rejected':
        return 'close-circle-outline';
      default:
        return 'bell-outline';
    }
  };

  // Helper to determine background color based on notification type
  const getBackgroundColor = () => {
    switch (notification.type) {
      case 'new_tender':
        return '#e3f2fd';
      case 'tender_updated':
        return '#e8f5e9';
      case 'tender_closed':
        return '#f5f5f5';
      case 'new_bid':
        return '#fff8e1';
      case 'bid_accepted':
        return '#e8f5e9';
      case 'bid_rejected':
        return '#ffebee';
      default:
        return '#f5f5f5';
    }
  };

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Surface style={[
        styles.container,
        { backgroundColor: getBackgroundColor() },
        !notification.read && styles.unread
      ]}>
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons name={getIcon()} size={24} color="#3498db" />
        </View>
        
        <View style={styles.content}>
          <Text style={styles.title}>{notification.title}</Text>
          <Text style={styles.message}>{notification.message}</Text>
          <Text style={styles.time}>
            {formatDistanceToNow(parseISO(notification.createdAt), { addSuffix: true })}
          </Text>
        </View>
      </Surface>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 12,
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 8,
    elevation: 2,
  },
  unread: {
    borderLeftWidth: 4,
    borderLeftColor: '#3498db',
  },
  iconContainer: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'white',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#2c3e50',
    marginBottom: 4,
  },
  message: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 6,
  },
  time: {
    fontSize: 12,
    color: '#95a5a6',
  },
});

export default NotificationItem; 