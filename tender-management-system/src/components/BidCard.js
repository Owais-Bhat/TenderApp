import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, Avatar, Paragraph } from 'react-native-paper';
import { formatDistanceToNow, parseISO } from 'date-fns';

const BidCard = ({ bid, isLowest = false, onPress }) => {
  return (
    <Card 
      style={[
        styles.card, 
        isLowest && styles.lowestCard
      ]}
      onPress={onPress}
    >
      <Card.Content>
        <View style={styles.header}>
          <View style={styles.userInfo}>
            <Avatar.Icon size={40} icon="account" style={styles.avatar} />
            <View>
              <Text style={styles.userName}>{bid.user?.name || 'Anonymous'}</Text>
              <Text style={styles.time}>
                {formatDistanceToNow(parseISO(bid.createdAt), { addSuffix: true })}
              </Text>
            </View>
          </View>
          
          <View style={styles.amountContainer}>
            <Text style={[styles.amount, isLowest && styles.lowestAmount]}>
              ${bid.amount.toLocaleString()}
            </Text>
            {isLowest && (
              <Text style={styles.lowestLabel}>Lowest</Text>
            )}
          </View>
        </View>
        
        {bid.proposal && (
          <View style={styles.proposalContainer}>
            <Paragraph style={styles.proposal} numberOfLines={3}>
              {bid.proposal}
            </Paragraph>
          </View>
        )}
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
  },
  lowestCard: {
    backgroundColor: '#e8f8f5',
    borderLeftWidth: 4,
    borderLeftColor: '#2ecc71',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    backgroundColor: '#3498db',
    marginRight: 12,
  },
  userName: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#2c3e50',
  },
  time: {
    fontSize: 12,
    color: '#95a5a6',
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  lowestAmount: {
    color: '#27ae60',
  },
  lowestLabel: {
    fontSize: 12,
    color: '#27ae60',
    fontWeight: 'bold',
  },
  proposalContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  proposal: {
    fontSize: 14,
    color: '#34495e',
    lineHeight: 20,
  },
});

export default BidCard; 