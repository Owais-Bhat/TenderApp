import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Card, Text, Chip, Surface } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { format, parseISO, differenceInDays, isPast } from 'date-fns';

const TenderCard = ({ tender, onPress }) => {
  // Format dates
  const startDate = parseISO(tender.startTime);
  const endDate = parseISO(tender.endTime);
  
  // Calculate time remaining or if tender has ended
  const isEnded = isPast(endDate);
  const daysRemaining = differenceInDays(endDate, new Date());
  
  // Determine status for display
  const getStatusDetails = () => {
    if (tender.status === 'extended') {
      return {
        label: 'Extended',
        color: '#f39c12',
        backgroundColor: '#fff8e1'
      };
    } else if (isEnded) {
      return {
        label: 'Closed',
        color: '#7f8c8d',
        backgroundColor: '#f5f5f5'
      };
    } else if (daysRemaining <= 1) {
      return {
        label: 'Ending Soon',
        color: '#e74c3c',
        backgroundColor: '#ffebee'
      };
    } else {
      return {
        label: 'Active',
        color: '#2196f3',
        backgroundColor: '#e3f2fd'
      };
    }
  };
  
  const statusDetails = getStatusDetails();
  
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Surface style={styles.surface}>
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.header}>
              <Text style={styles.title} numberOfLines={2}>
                {tender.name}
              </Text>
              
              <Chip
                style={{ backgroundColor: statusDetails.backgroundColor }}
                textStyle={{ color: statusDetails.color }}
              >
                {statusDetails.label}
              </Chip>
            </View>
            
            <Text style={styles.reference}>
              Reference: {tender.referenceNumber}
            </Text>
            
            <View style={styles.metaContainer}>
              <View style={styles.metaItem}>
                <MaterialCommunityIcons name="tag-outline" size={16} color="#7f8c8d" />
                <Text style={styles.metaText}>
                  {tender.category}
                </Text>
              </View>
              
              <View style={styles.metaItem}>
                <MaterialCommunityIcons name="calendar-range" size={16} color="#7f8c8d" />
                <Text style={styles.metaText}>
                  {format(startDate, 'MMM dd')} - {format(endDate, 'MMM dd, yyyy')}
                </Text>
              </View>
              
              {tender.budget && (
                <View style={styles.metaItem}>
                  <MaterialCommunityIcons name="currency-usd" size={16} color="#7f8c8d" />
                  <Text style={styles.metaText}>
                    Budget: ${tender.budget.toLocaleString()}
                  </Text>
                </View>
              )}
              
              {!isEnded && (
                <View style={styles.metaItem}>
                  <MaterialCommunityIcons 
                    name="clock-outline" 
                    size={16} 
                    color={daysRemaining <= 1 ? '#e74c3c' : '#7f8c8d'} 
                  />
                  <Text 
                    style={[
                      styles.metaText, 
                      daysRemaining <= 1 ? styles.urgentText : null
                    ]}
                  >
                    {isEnded 
                      ? 'Tender closed' 
                      : daysRemaining < 1 
                        ? 'Closing today' 
                        : daysRemaining === 1 
                          ? 'Closing tomorrow' 
                          : `${daysRemaining} days remaining`}
                  </Text>
                </View>
              )}
            </View>
          </Card.Content>
        </Card>
      </Surface>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  surface: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    elevation: 4,
  },
  card: {
    borderRadius: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    flex: 1,
    marginRight: 8,
  },
  reference: {
    fontSize: 12,
    color: '#7f8c8d',
    marginBottom: 10,
  },
  metaContainer: {
    marginTop: 6,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  metaText: {
    fontSize: 14,
    color: '#7f8c8d',
    marginLeft: 8,
  },
  urgentText: {
    color: '#e74c3c',
    fontWeight: 'bold',
  },
});

export default TenderCard; 