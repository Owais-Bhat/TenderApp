import React, { useEffect } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../context/AuthContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Auth Screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import SplashScreen from '../screens/SplashScreen';

// User Screens
import TenderListScreen from '../screens/user/TenderListScreen';
import TenderDetailScreen from '../screens/user/TenderDetailScreen';
import SubmitBidScreen from '../screens/user/SubmitBidScreen';
import UserProfileScreen from '../screens/user/UserProfileScreen';
import NotificationsScreen from '../screens/user/NotificationsScreen';
import PlaceBidScreen from '../screens/user/PlaceBidScreen';

// Admin Screens
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import CreateTenderScreen from '../screens/admin/CreateTenderScreen';
import EditTenderScreen from '../screens/admin/EditTenderScreen';
import ManageTendersScreen from '../screens/admin/ManageTendersScreen';
import ManageBidsScreen from '../screens/admin/ManageBidsScreen';
import AdminTenderDetailScreen from '../screens/admin/AdminTenderDetailScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Auth Navigator
const AuthNavigator = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
    }}
  >
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
  </Stack.Navigator>
);

// User Tab Navigator
const UserTabNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconName;

        if (route.name === 'Tenders') {
          iconName = focused ? 'file-document' : 'file-document-outline';
        } else if (route.name === 'Notifications') {
          iconName = focused ? 'bell' : 'bell-outline';
        } else if (route.name === 'Profile') {
          iconName = focused ? 'account' : 'account-outline';
        }

        return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: '#3498db',
      tabBarInactiveTintColor: 'gray',
      headerShown: false,
    })}
  >
    <Tab.Screen name="Tenders" component={UserTenderStackNavigator} />
    <Tab.Screen name="Notifications" component={NotificationsScreen} />
    <Tab.Screen name="Profile" component={UserProfileScreen} />
  </Tab.Navigator>
);

// User Tender Stack Navigator
const UserTenderStackNavigator = () => (
  <Stack.Navigator>
    <Stack.Screen name="TenderList" component={TenderListScreen} options={{headerShown: false }} />
    <Stack.Screen name="TenderDetail" component={TenderDetailScreen} options={{ headerShown: false }} />
    <Stack.Screen name="SubmitBid" component={SubmitBidScreen} options={{ headerShown: false }} />
    <Stack.Screen name="PlaceBid" component={PlaceBidScreen} options={{ headerShown: false }} />
  </Stack.Navigator>
);

// Admin Tab Navigator
const AdminTabNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconName;

        if (route.name === 'Dashboard') {
          iconName = focused ? 'view-dashboard' : 'view-dashboard-outline';
        } else if (route.name === 'Manage') {
          iconName = focused ? 'format-list-bulleted' : 'format-list-bulleted-square';
        } else if (route.name === 'Profile') {
          iconName = focused ? 'account' : 'account-outline';
        }

        return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: '#3498db',
      tabBarInactiveTintColor: 'gray',
      headerShown: false,
    })}
  >
    <Tab.Screen name="Dashboard" component={AdminDashboardScreen} />
    <Tab.Screen name="Manage" component={AdminStackNavigator} />
    <Tab.Screen name="Profile" component={UserProfileScreen} />
  </Tab.Navigator>
);

// Admin Stack Navigator
const AdminStackNavigator = () => (
  <Stack.Navigator>
    <Stack.Screen name="ManageTenders" component={ManageTendersScreen} options={{headerShown: false }} />
    <Stack.Screen name="CreateTender" component={CreateTenderScreen} options={{ headerShown: false }} />
    <Stack.Screen name="EditTender" component={EditTenderScreen} options={{ headerShown: false }} />
    <Stack.Screen name="AdminTenderDetail" component={AdminTenderDetailScreen} options={{ headerShown: false}} />
    <Stack.Screen name="ManageBids" component={ManageBidsScreen} options={{headerShown: false }} />
    <Stack.Screen name="TenderSettings" component={ManageTendersScreen} options={{ headerShown: false }} />
  </Stack.Navigator>
);

// Main Navigator
const AppNavigator = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <SplashScreen />;
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      {!user ? (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      ) : (
        <Stack.Screen 
          name="Main" 
          component={user.isAdmin ? AdminTabNavigator : UserTabNavigator} 
        />
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator; 