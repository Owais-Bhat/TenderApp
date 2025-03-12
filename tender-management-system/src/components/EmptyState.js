import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const EmptyState = ({ 
  icon, 
  title, 
  message, 
  actionLabel, 
  onActionPress,
  style
}) => {
  return (
    <View style={[styles.container, style]}>
      <MaterialCommunityIcons
        name={icon || 'alert-circle-outline'}
        size={70}
        color="#bdc3c7"
      />
      
      <Text style={styles.title}>{title || 'Nothing to Show'}</Text>
      
      {message && <Text style={styles.message}>{message}</Text>}
      
      {actionLabel && onActionPress && (
        <Button 
          mode="contained" 
          onPress={onActionPress}
          style={styles.actionButton}
        >
          {actionLabel}
        </Button>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#34495e',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 20,
  },
  actionButton: {
    marginTop: 8,
    backgroundColor: '#3498db',
  },
});

export default EmptyState; 