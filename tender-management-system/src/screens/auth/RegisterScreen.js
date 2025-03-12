import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { TextInput, Button, Text, HelperText, Checkbox, Divider } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { StatusBar } from 'expo-status-bar';

const RegisterScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [secureConfirmTextEntry, setSecureConfirmTextEntry] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [companyNameError, setCompanyNameError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  
  const { register } = useAuth();
  
  const validateName = () => {
    if (!name) {
      setNameError('Name is required');
      return false;
    }
    setNameError('');
    return true;
  };
  
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
  
  const validateCompanyName = () => {
    if (!companyName) {
      setCompanyNameError('Company name is required');
      return false;
    }
    setCompanyNameError('');
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
  
  const validateConfirmPassword = () => {
    if (!confirmPassword) {
      setConfirmPasswordError('Confirm password is required');
      return false;
    } else if (confirmPassword !== password) {
      setConfirmPasswordError('Passwords do not match');
      return false;
    }
    setConfirmPasswordError('');
    return true;
  };
  
  const handleRegister = async () => {
    const isNameValid = validateName();
    const isEmailValid = validateEmail();
    const isCompanyNameValid = validateCompanyName();
    const isPasswordValid = validatePassword();
    const isConfirmPasswordValid = validateConfirmPassword();
    
    if (isNameValid && isEmailValid && isCompanyNameValid && isPasswordValid && isConfirmPasswordValid) {
      setLoading(true);
      try {
        // For demo purposes, we're doing a simple registration
        // In a real app, this would be an API call
        const userData = {
          name,
          email,
          companyName,
          password, 
          confirmPassword,
          role: isAdmin ? 'admin' : 'user',
          isAdmin: isAdmin
        };
        
        const success = await register(userData);
        
        if (!success) {
          Alert.alert(
            "Registration Failed", 
            "This email may already be registered or there was an error.",
            [{ text: "OK" }]
          );
        }
      } catch (error) {
        Alert.alert(
          "Registration Error", 
          `An error occurred: ${error.message}`,
          [{ text: "OK" }]
        );
      } finally {
        setLoading(false);
      }
    }
  };
  
  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.formContainer}>
            <View style={styles.logoContainer}>
              <MaterialCommunityIcons name="account-plus" size={50} color="#3498db" />
              <Text style={styles.header}>Create Account</Text>
            </View>
            
            <TextInput
              label="Full Name"
              value={name}
              onChangeText={setName}
              mode="outlined"
              style={styles.input}
              left={<TextInput.Icon icon="account" />}
              error={!!nameError}
              onBlur={validateName}
            />
            {nameError ? <HelperText type="error">{nameError}</HelperText> : null}
            
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
              label="Company Name"
              value={companyName}
              onChangeText={setCompanyName}
              mode="outlined"
              style={styles.input}
              left={<TextInput.Icon icon="office-building" />}
              error={!!companyNameError}
              onBlur={validateCompanyName}
            />
            {companyNameError ? <HelperText type="error">{companyNameError}</HelperText> : null}
            
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
            
            <TextInput
              label="Confirm Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              mode="outlined"
              style={styles.input}
              secureTextEntry={secureConfirmTextEntry}
              autoCapitalize="none"
              left={<TextInput.Icon icon="lock-check" />}
              right={
                <TextInput.Icon
                  icon={secureConfirmTextEntry ? "eye-off" : "eye"}
                  onPress={() => setSecureConfirmTextEntry(!secureConfirmTextEntry)}
                />
              }
              error={!!confirmPasswordError}
              onBlur={validateConfirmPassword}
            />
            {confirmPasswordError ? <HelperText type="error">{confirmPasswordError}</HelperText> : null}
            
            <View style={styles.checkboxContainer}>
              <View style={{  backgroundColor: "#BCCCDC" , borderRadius: 50 }}>
              <Checkbox
                status={isAdmin ? 'checked' : 'unchecked'}
                onPress={() => setIsAdmin(!isAdmin)}
                color="#3498db"
              />
              </View>
              <Text style={styles.checkboxLabel}>Register as Admin</Text>
            </View>
            
            <Button
              mode="contained"
              style={styles.button}
              onPress={handleRegister}
              loading={loading}
              disabled={loading}
            >
              Register
            </Button>
            
            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.footerLink}>Login</Text>
              </TouchableOpacity>
            </View>
            
            <Divider style={styles.divider} />
            
           
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
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
    justifyContent: 'center',
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  formContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 20,
    color: '#2c3e50',
    textAlign: 'center',
  },
  input: {
    marginBottom: 5,
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
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  checkboxLabel: {
    marginLeft: 8,
    color: '#7f8c8d',
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
  demoText: {
    textAlign: 'center',
    fontSize: 12,
    color: '#7f8c8d',
  },
});

export default RegisterScreen; 
