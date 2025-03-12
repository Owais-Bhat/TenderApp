import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Alert, SafeAreaView } from 'react-native';
import { TextInput, Button, Text, HelperText, Checkbox, Divider } from 'react-native-paper';
import { Ionicons} from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { StatusBar } from 'expo-status-bar';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  
  const { login } = useAuth();
  
  const validateEmail = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setEmailError('Email is required');
      return false;
    } else if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email');
      return false;
    }
    setEmailError('');
    return true;
  };
  
  const validatePassword = () => {
    if (!password) {
      setPasswordError('Password is required');
      return false;
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return false;
    }
    setPasswordError('');
    return true;
  };
  
  const handleLogin = async () => {
    const isEmailValid = validateEmail();
    const isPasswordValid = validatePassword();
    
    if (isEmailValid && isPasswordValid) {
      setLoading(true);
      try {
        // For demo purposes, we're doing a simple login
        // In a real app, this would be an API call
        const userData = {
          email,
          password,
          role: isAdmin ? 'admin' : 'user',
          name: email.split('@')[0], // Just for demo purposes
        };
        
        const success = await login(userData);
        
        if (!success) {
          Alert.alert(
            "Login Failed", 
            "Please check your credentials and try again.",
            [{ text: "OK" }]
          );
        }
      } catch (error) {
        Alert.alert(
          "Login Error", 
          `An error occurred: ${error.message}`,
          [{ text: "OK" }]
        );
      } finally {
        setLoading(false);
      }
    }
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.logoContainer}>
            <Ionicons name="briefcase-outline" size={80} color="#3498db" />
            <Text style={styles.logoText}>Tender Management System</Text>
          </View>
          
          <View style={styles.formContainer}>
            <Text style={styles.header}>Login</Text>
            
            <TextInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              mode="outlined"
              style={styles.input}
              keyboardType="email-address"
              autoCapitalize="none"
              left={<TextInput.Icon icon="email" />}
              error={!!emailError}
              onBlur={validateEmail}
            />
            {emailError ? <HelperText type="error">{emailError}</HelperText> : null}
            
            <TextInput
              label="Password"
              value={password}
              onChangeText={setPassword}
              mode="outlined"
              style={styles.input}
              secureTextEntry={secureTextEntry}
              autoCapitalize="none"
              left={<TextInput.Icon icon="lock" />}
              right={
                <TextInput.Icon
                  icon={secureTextEntry ? "eye-off" : "eye"}
                  onPress={() => setSecureTextEntry(!secureTextEntry)}
                />
              }
              error={!!passwordError}
              onBlur={validatePassword}
            />
            {passwordError ? <HelperText type="error">{passwordError}</HelperText> : null}
            
            <View style={styles.checkboxContainer}>
              <View style={{  backgroundColor: "#BCCCDC" , borderRadius: 50 }}>
                <Checkbox
                status={isAdmin ? 'checked' : 'unchecked'}
                onPress={() => setIsAdmin(!isAdmin)}
                color="#3498db"
               
                 

              />
              </View>
              <Text style={styles.checkboxLabel}>Login as Admin</Text>
            </View>
            
            <Button
              mode="contained"
              style={styles.button}
              onPress={handleLogin}
              loading={loading}
              disabled={loading}
            >
              Login
            </Button>
            
            <View style={styles.footer}>
              <Text style={styles.footerText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={styles.footerLink}>Register</Text>
              </TouchableOpacity>
            </View>
            
            
           
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
    marginBottom: 20,
  },
  logoText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
    color: '#2c3e50',
    textAlign: 'center',
  },
  formContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    margin: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#2c3e50',
    textAlign: 'center',
  },
  input: {
    marginBottom: 5,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
    
  },
  checkboxLabel: {
    marginLeft: 8,
    color: '#7f8c8d',
    
  },
  button: {
    marginTop: 20,
    paddingVertical: 8,
    backgroundColor: '#3498db',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  footerText: {
    color: '#7f8c8d',
  },
  footerLink: {
    color: '#3498db',
    fontWeight: 'bold',
  },
  divider: {
    marginVertical: 20,
  },
  demoContainer: {
    padding: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 5,
  },
  demoTitle: {
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#3498db',
    textAlign: 'center',
  },
  demoAccount: {
    flexDirection: 'row',
    marginVertical: 2,
  },
  demoLabel: {
    fontWeight: 'bold',
  },
});

export default LoginScreen; 
