import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { formatISO, addMinutes, parseISO, isPast, isWithinInterval, subMinutes } from 'date-fns';

const TenderContext = createContext();

export const useTender = () => useContext(TenderContext);

const generateId = (prefix = 'tender') => {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}-${Date.now()}`;
};

export const TenderProvider = ({ children }) => {
  const [tenders, setTenders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [bids, setBids] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load tenders
        const tendersData = await AsyncStorage.getItem('tenders');
        if (tendersData) {
          setTenders(JSON.parse(tendersData));
        }
        
        // Load notifications
        const notificationsData = await AsyncStorage.getItem('notifications');
        if (notificationsData) {
          setNotifications(JSON.parse(notificationsData));
        }
        
        // Load bids
        const bidsData = await AsyncStorage.getItem('bids');
        if (bidsData) {
          setBids(JSON.parse(bidsData));
        }
      } catch (error) {
        console.error('Failed to load data', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();

    // Set up a timer to check for tender status updates every minute
    const interval = setInterval(() => {
      checkTenderStatuses();
    }, 60000); // 60000 ms = 1 minute

    return () => clearInterval(interval);
  }, []);

  // Save tenders to AsyncStorage whenever they change
  useEffect(() => {
    const saveTenders = async () => {
      try {
        await AsyncStorage.setItem('tenders', JSON.stringify(tenders));
      } catch (error) {
        console.error('Failed to save tenders', error);
      }
    };

    if (tenders.length > 0) {
      saveTenders();
    }
  }, [tenders]);

  // Save notifications to AsyncStorage whenever they change
  useEffect(() => {
    const saveNotifications = async () => {
      try {
        await AsyncStorage.setItem('notifications', JSON.stringify(notifications));
      } catch (error) {
        console.error('Failed to save notifications', error);
      }
    };

    if (notifications.length > 0) {
      saveNotifications();
    }
  }, [notifications]);
  
  // Save bids to AsyncStorage whenever they change
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

  // Check if any tenders are ending soon and create notifications
  const checkTenderStatuses = () => {
    const now = new Date();
    const updatedTenders = [...tenders];
    let hasChanges = false;

    updatedTenders.forEach((tender, index) => {
      const endTime = parseISO(tender.endTime);
      
      // Check if tender is ending within the next 5 minutes
      if (isWithinInterval(now, {
        start: subMinutes(endTime, 5),
        end: endTime
      }) && !tender.notificationSent) {
        // Create a notification
        addNotification({
          id: generateId('notif'),
          title: 'Tender Ending Soon',
          message: `The tender "${tender.name}" is ending in less than 5 minutes!`,
          tenderId: tender.id,
          createdAt: formatISO(now),
          read: false
        });

        // Mark notification as sent
        updatedTenders[index] = {
          ...tender,
          notificationSent: true
        };
        
        hasChanges = true;
      }
    });

    if (hasChanges) {
      setTenders(updatedTenders);
    }
  };

  // Create a new tender
  const createTender = (tenderData) => {
    const newTender = {
      id: generateId('tender'),
      ...tenderData,
      createdAt: formatISO(new Date()),
      status: 'active',
      notificationSent: false
    };

    setTenders([...tenders, newTender]);
    return newTender;
  };
  
  // Create a new bid
  const createBid = (bidData) => {
    const newBid = {
      id: generateId('bid'),
      ...bidData,
      status: 'pending'
    };

    setBids([...bids, newBid]);
    
    // Create a notification
    addNotification({
      id: generateId('notif'),
      title: 'New Bid Received',
      message: `A new bid has been placed on tender: ${bidData.tenderId}`,
      type: 'new_bid',
      tenderId: bidData.tenderId,
      read: false,
      createdAt: new Date().toISOString()
    });
    
    return newBid;
  };

  // Get tender by ID
  const getTenderById = (tenderId) => {
    return tenders.find(tender => tender.id === tenderId);
  };

  // Get all tenders
  const getAllTenders = () => {
    return tenders;
  };

  // Get all active tenders
  const getActiveTenders = () => {
    const now = new Date();
    return tenders.filter(tender => {
      const startTime = parseISO(tender.startTime);
      const endTime = parseISO(tender.endTime);
      return !tender.cancelled && 
             !tender.completed && 
             isPast(startTime) &&
             !isPast(endTime);
    });
  };

  // Get all completed tenders
  const getCompletedTenders = () => {
    return tenders.filter(tender => tender.completed);
  };
  
  // Get the lowest bid for a tender
  const getLowestBid = (tenderId) => {
    const tenderBids = bids.filter(bid => bid.tenderId === tenderId);
    
    if (tenderBids.length === 0) {
      return null;
    }
    
    return tenderBids.reduce((lowest, current) => {
      return parseFloat(current.amount) < parseFloat(lowest.amount)
        ? current
        : lowest;
    }, tenderBids[0]);
  };

  // Update tender status
  const updateTenderStatus = (tenderId, status) => {
    const updatedTenders = tenders.map(tender => {
      if (tender.id === tenderId) {
        return {
          ...tender,
          ...status,
          updatedAt: formatISO(new Date())
        };
      }
      return tender;
    });
    
    setTenders(updatedTenders);
    return updatedTenders.find(tender => tender.id === tenderId);
  };

  // Cancel a tender
  const cancelTender = (tenderId) => {
    return updateTenderStatus(tenderId, { cancelled: true });
  };

  // Complete a tender
  const completeTender = (tenderId) => {
    return updateTenderStatus(tenderId, { completed: true });
  };

  // Delete a tender
  const deleteTender = (tenderId) => {
    // First, filter out the tender with the specified ID
    const updatedTenders = tenders.filter(tender => tender.id !== tenderId);
    
    // Also remove any bids associated with this tender
    const updatedBids = bids.filter(bid => bid.tenderId !== tenderId);
    
    setTenders(updatedTenders);
    setBids(updatedBids);
    
    // Create a notification about tender deletion
    addNotification({
      id: generateId('notif'),
      title: 'Tender Deleted',
      message: `A tender has been deleted by an administrator.`,
      type: 'tender_deleted',
      read: false,
      createdAt: new Date().toISOString()
    });
    
    return true;
  };

  // Extend tender deadline
  const extendTenderDeadline = (tenderId, newEndTime) => {
    const updatedTenders = tenders.map(tender => {
      if (tender.id === tenderId) {
        return {
          ...tender,
          endTime: formatISO(newEndTime),
          status: 'extended',
          updatedAt: formatISO(new Date())
        };
      }
      return tender;
    });
    
    setTenders(updatedTenders);
    
    // Create a notification about the extension
    addNotification({
      id: generateId('notif'),
      title: 'Tender Extended',
      message: `The tender "${updatedTenders.find(t => t.id === tenderId).name}" has been extended until ${newEndTime.toLocaleTimeString()}.`,
      tenderId: tenderId,
      createdAt: formatISO(new Date()),
      read: false
    });
    
    return updatedTenders.find(tender => tender.id === tenderId);
  };

  // Add a notification
  const addNotification = (notification) => {
    const newNotification = {
      id: notification.id || generateId('notif'),
      ...notification,
      createdAt: notification.createdAt || formatISO(new Date()),
      read: notification.read || false
    };
    
    setNotifications(prev => [...prev, newNotification]);
    return newNotification;
  };

  // Mark a notification as read
  const markNotificationAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: true } 
          : notification
      )
    );
  };

  // Get all unread notifications
  const getUnreadNotifications = () => {
    return notifications.filter(notification => !notification.read);
  };

  // Mark all notifications as read
  const markAllNotificationsAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  // Get user's favorite tenders
  const getUserFavorites = async (userId) => {
    try {
      const favoritesData = await AsyncStorage.getItem(`favorites_${userId}`);
      if (favoritesData) {
        const favoriteIds = JSON.parse(favoritesData);
        return tenders.filter(tender => favoriteIds.includes(tender.id));
      }
      return [];
    } catch (error) {
      console.error('Failed to get favorites', error);
      return [];
    }
  };

  // Add a tender to user's favorites
  const addFavorite = async (userId, tenderId) => {
    try {
      const favoritesData = await AsyncStorage.getItem(`favorites_${userId}`);
      let favorites = [];
      
      if (favoritesData) {
        favorites = JSON.parse(favoritesData);
      }
      
      if (!favorites.includes(tenderId)) {
        favorites.push(tenderId);
        await AsyncStorage.setItem(`favorites_${userId}`, JSON.stringify(favorites));
      }
      
      return true;
    } catch (error) {
      console.error('Failed to add favorite', error);
      return false;
    }
  };

  // Remove a tender from user's favorites
  const removeFavorite = async (userId, tenderId) => {
    try {
      const favoritesData = await AsyncStorage.getItem(`favorites_${userId}`);
      
      if (favoritesData) {
        const favorites = JSON.parse(favoritesData);
        const updatedFavorites = favorites.filter(id => id !== tenderId);
        await AsyncStorage.setItem(`favorites_${userId}`, JSON.stringify(updatedFavorites));
      }
      
      return true;
    } catch (error) {
      console.error('Failed to remove favorite', error);
      return false;
    }
  };

  return (
    <TenderContext.Provider
      value={{
        tenders,
        bids,
        loading,
        notifications,
        createTender,
        createBid,
        getTenderById,
        getAllTenders,
        getActiveTenders,
        getCompletedTenders,
        getLowestBid,
        updateTenderStatus,
        cancelTender,
        completeTender,
        deleteTender,
        extendTenderDeadline,
        addNotification,
        markNotificationAsRead,
        getUnreadNotifications,
        markAllNotificationsAsRead,
        getUserFavorites,
        addFavorite,
        removeFavorite
      }}
    >
      {children}
    </TenderContext.Provider>
  );
}; 