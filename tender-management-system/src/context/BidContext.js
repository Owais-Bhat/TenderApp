import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTender } from './TenderContext';

const BidContext = createContext();

export const useBid = () => useContext(BidContext);

// Add custom ID generator
const generateId = (prefix = 'bid') => {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}-${Date.now()}`;
};

export const BidProvider = ({ children }) => {
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addNotification } = useTender();

  // Load bids from storage on init
  useEffect(() => {
    const loadBids = async () => {
      try {
        const storedBids = await AsyncStorage.getItem('bids');
        if (storedBids) {
          setBids(JSON.parse(storedBids));
        }
      } catch (error) {
        console.error('Failed to load bids', error);
      } finally {
        setLoading(false);
      }
    };

    loadBids();
  }, []);

  // Save bids to storage whenever they change
  useEffect(() => {
    const saveBids = async () => {
      try {
        await AsyncStorage.setItem('bids', JSON.stringify(bids));
      } catch (error) {
        console.error('Failed to save bids', error);
      }
    };

    if (bids.length > 0) {
      saveBids();
    }
  }, [bids]);

  // Create a new bid
  const createBid = async (bidData) => {
    try {
      const newBid = {
        id: generateId('bid'),
        ...bidData,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setBids((prevBids) => [...prevBids, newBid]);

      // Create a notification for the tender owner
      if (addNotification) {
        addNotification({
          userId: 'admin', // Assuming admin gets notifications for all bids
          title: 'New Bid Received',
          message: `A new bid has been placed on tender: ${bidData.tenderId}`,
          type: 'bid',
          tenderId: bidData.tenderId,
          read: false,
          createdAt: new Date().toISOString(),
        });
      }

      return newBid;
    } catch (error) {
      console.error('Failed to create bid', error);
      throw error;
    }
  };

  // Update a bid's status
  const updateBidStatus = async (bidId, status) => {
    try {
      setBids((prevBids) =>
        prevBids.map((bid) =>
          bid.id === bidId
            ? {
                ...bid,
                status,
                updatedAt: new Date().toISOString(),
              }
            : bid
        )
      );

      // Find the updated bid to create notification
      const updatedBid = bids.find((bid) => bid.id === bidId);
      
      if (updatedBid && addNotification) {
        addNotification({
          userId: updatedBid.userId,
          title: `Bid ${status.charAt(0).toUpperCase() + status.slice(1)}`,
          message: `Your bid on tender has been ${status}`,
          type: 'bid_status',
          tenderId: updatedBid.tenderId,
          read: false,
          createdAt: new Date().toISOString(),
        });
      }

      return true;
    } catch (error) {
      console.error('Failed to update bid status', error);
      throw error;
    }
  };

  // Get all bids for a specific tender
  const getBidsByTender = async (tenderId) => {
    try {
      return bids.filter((bid) => bid.tenderId === tenderId);
    } catch (error) {
      console.error('Failed to get bids by tender', error);
      throw error;
    }
  };

  // Get a user's bids for a specific tender
  const getUserBidsByTender = async (tenderId, userId) => {
    try {
      return bids.filter(
        (bid) => bid.tenderId === tenderId && bid.userId === userId
      );
    } catch (error) {
      console.error('Failed to get user bids by tender', error);
      throw error;
    }
  };

  // Get all bids for a specific user
  const getUserBids = async (userId) => {
    try {
      return bids.filter((bid) => bid.userId === userId);
    } catch (error) {
      console.error('Failed to get user bids', error);
      throw error;
    }
  };

  // Get a specific bid by ID
  const getBidById = async (bidId) => {
    try {
      return bids.find((bid) => bid.id === bidId);
    } catch (error) {
      console.error('Failed to get bid by ID', error);
      throw error;
    }
  };

  // Get the lowest bid for a tender
  const getLowestBid = async (tenderId) => {
    try {
      const tenderBids = bids.filter((bid) => bid.tenderId === tenderId);
      
      if (tenderBids.length === 0) {
        return null;
      }
      
      return tenderBids.reduce((lowest, current) => {
        return parseFloat(current.amount) < parseFloat(lowest.amount)
          ? current
          : lowest;
      }, tenderBids[0]);
    } catch (error) {
      console.error('Failed to get lowest bid', error);
      throw error;
    }
  };

  // Accept a bid (and reject all others)
  const acceptBid = async (bidId, tenderId) => {
    try {
      // First, reject all other bids for this tender
      setBids((prevBids) =>
        prevBids.map((bid) =>
          bid.tenderId === tenderId && bid.id !== bidId
            ? {
                ...bid,
                status: 'rejected',
                updatedAt: new Date().toISOString(),
              }
            : bid
        )
      );

      // Then, accept the selected bid
      return await updateBidStatus(bidId, 'accepted');
    } catch (error) {
      console.error('Failed to accept bid', error);
      throw error;
    }
  };

  // Reject a specific bid
  const rejectBid = async (bidId) => {
    try {
      return await updateBidStatus(bidId, 'rejected');
    } catch (error) {
      console.error('Failed to reject bid', error);
      throw error;
    }
  };

  // Get bid statistics for a tender
  const getTenderBidStats = async (tenderId) => {
    try {
      const tenderBids = bids.filter((bid) => bid.tenderId === tenderId);
      
      if (tenderBids.length === 0) {
        return {
          count: 0,
          lowest: null,
          highest: null,
          average: 0,
        };
      }
      
      const amounts = tenderBids.map((bid) => parseFloat(bid.amount));
      const lowest = Math.min(...amounts);
      const highest = Math.max(...amounts);
      const sum = amounts.reduce((total, amount) => total + amount, 0);
      const average = sum / amounts.length;
      
      return {
        count: tenderBids.length,
        lowest,
        highest,
        average,
      };
    } catch (error) {
      console.error('Failed to get tender bid stats', error);
      throw error;
    }
  };

  return (
    <BidContext.Provider
      value={{
        bids,
        loading,
        createBid,
        updateBidStatus,
        getBidsByTender,
        getUserBidsByTender,
        getUserBids,
        getBidById,
        getLowestBid,
        acceptBid,
        rejectBid,
        getTenderBidStats,
      }}
    >
      {children}
    </BidContext.Provider>
  );
}; 