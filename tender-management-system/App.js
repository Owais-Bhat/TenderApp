import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider as PaperProvider, DefaultTheme } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider } from './src/context/AuthContext';
import { TenderProvider } from './src/context/TenderContext';
import { BidProvider } from './src/context/BidContext';
import AppNavigator from './src/navigation/AppNavigator';
import 'react-native-gesture-handler';

// Custom theme
const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#3498db',
    accent: '#f1c40f',
    background: '#f8f9fa',
    surface: '#ffffff',
    text: '#2c3e50',
    error: '#e74c3c',
    success: '#2ecc71',
    info: '#3498db',
    warning: '#f39c12',
  },
  roundness: 10,
  animation: {
    scale: 1.0,
  },
};

export default function App() {
  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <AuthProvider>
          <TenderProvider>
            <BidProvider>
              <NavigationContainer>
                <AppNavigator />
              </NavigationContainer>
            </BidProvider>
          </TenderProvider>
        </AuthProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
} 