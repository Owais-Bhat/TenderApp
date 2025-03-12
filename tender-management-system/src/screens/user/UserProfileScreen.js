import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import {
  Appbar,
  Text,
  TextInput,
  Button,
  Surface,
  Divider,
  Avatar,
  IconButton,
  Portal,
  Dialog,
  ActivityIndicator,
  HelperText,
  useTheme,
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { StatusBar } from 'expo-status-bar';
import * as ImagePicker from 'expo-image-picker';

const UserProfileScreen = ({ navigation }) => {
  const { user, updateUserProfile, logout, isAdmin } = useAuth();
  const theme = useTheme();
  
  // User data state
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [company, setCompany] = useState(user?.company || '');
  const [profilePicture, setProfilePicture] = useState(user?.profilePicture || null);
  
  // UI state
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [logoutDialogVisible, setLogoutDialogVisible] = useState(false);
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  
  useEffect(() => {
    // Request permission for image picker
    (async () => {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission needed', 'Sorry, we need camera roll permissions to change your profile picture.');
        }
      }
    })();
  }, []);
  
  // Validation functions
  const validateName = () => {
    if (!name.trim()) {
      setNameError('Name is required');
      return false;
    }
    setNameError('');
    return true;
  };
  
  const validateEmail = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      setEmailError('Email is required');
      return false;
    } else if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email');
      return false;
    }
    setEmailError('');
    return true;
  };
  
  // Handle image picker
  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });
      
      if (!result.canceled) {
        setProfilePicture(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };
  
  // Toggle edit mode
  const toggleEditMode = () => {
    if (isEditing) {
      // Cancel editing and reset values
      setName(user?.name || '');
      setEmail(user?.email || '');
      setPhone(user?.phone || '');
      setCompany(user?.company || '');
      setProfilePicture(user?.profilePicture || null);
      setNameError('');
      setEmailError('');
    }
    setIsEditing(!isEditing);
  };
  
  // Save profile changes
  const saveProfile = async () => {
    const isNameValid = validateName();
    const isEmailValid = validateEmail();
    
    if (isNameValid && isEmailValid) {
      setLoading(true);
      try {
        const updatedUser = {
          ...user,
          name,
          email,
          phone,
          company,
          profilePicture,
        };
        
        const success = await updateUserProfile(updatedUser);
        
        if (success) {
          setIsEditing(false);
          Alert.alert('Success', 'Profile updated successfully');
        } else {
          Alert.alert('Error', 'Failed to update profile. Please try again.');
        }
      } catch (error) {
        Alert.alert('Error', 'An unexpected error occurred. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };
  
  // Logout dialog functions
  const showLogoutDialog = () => setLogoutDialogVisible(true);
  const hideLogoutDialog = () => setLogoutDialogVisible(false);
  
  const handleLogout = async () => {
    try {
      await logout();
      hideLogoutDialog();
    } catch (error) {
      Alert.alert('Error', 'Failed to log out. Please try again.');
    }
  };
  
  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="My Profile" />
        {isEditing ? (
          <>
            <Appbar.Action icon="check" onPress={saveProfile} disabled={loading} />
            <Appbar.Action icon="close" onPress={toggleEditMode} />
          </>
        ) : (
          <Appbar.Action icon="pencil" onPress={toggleEditMode} />
        )}
      </Appbar.Header>
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidView}
      >
        <ScrollView style={styles.scrollView}>
          <Surface style={styles.profileCard}>
            <View style={styles.profileHeader}>
              <TouchableOpacity
                style={styles.avatarContainer}
                onPress={isEditing ? pickImage : null}
                disabled={!isEditing}
              >
                {profilePicture ? (
                  <Avatar.Image
                    size={100}
                    source={{ uri: profilePicture }}
                    style={styles.avatar}
                  />
                ) : (
                  <Avatar.Icon
                    size={100}
                    icon="account"
                    style={styles.avatar}
                    color="#fff"
                  />
                )}
                {isEditing && (
                  <View style={styles.editOverlay}>
                    <MaterialCommunityIcons name="camera" size={24} color="#fff" />
                  </View>
                )}
              </TouchableOpacity>
              
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{user.name}</Text>
                <Text style={styles.userRole}>{isAdmin ? 'Administrator' : 'Regular User'}</Text>
              </View>
            </View>
            
            <Divider style={styles.divider} />
            
            <View style={styles.formContainer}>
              <TextInput
                label="Full Name"
                value={name}
                onChangeText={setName}
                mode="outlined"
                disabled={!isEditing}
                error={!!nameError}
                onBlur={validateName}
                left={<TextInput.Icon icon="account" />}
              />
              {nameError ? <HelperText type="error">{nameError}</HelperText> : null}
              
              <TextInput
                label="Email"
                value={email}
                onChangeText={setEmail}
                mode="outlined"
                disabled={!isEditing}
                error={!!emailError}
                onBlur={validateEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                left={<TextInput.Icon icon="email" />}
                style={styles.input}
              />
              {emailError ? <HelperText type="error">{emailError}</HelperText> : null}
              
              <TextInput
                label="Phone Number"
                value={phone}
                onChangeText={setPhone}
                mode="outlined"
                disabled={!isEditing}
                keyboardType="phone-pad"
                left={<TextInput.Icon icon="phone" />}
                style={styles.input}
              />
              
              <TextInput
                label="Company"
                value={company}
                onChangeText={setCompany}
                mode="outlined"
                disabled={!isEditing}
                left={<TextInput.Icon icon="office-building" />}
                style={styles.input}
              />
            </View>
          </Surface>
          
          <Surface style={[styles.actionsCard, styles.logoutCard]}>
            <Button
              mode="contained"
              onPress={showLogoutDialog}
              icon="logout"
              style={styles.logoutButton}
              contentStyle={styles.logoutButtonContent}
              labelStyle={styles.logoutButtonLabel}
            >
              Logout
            </Button>
          </Surface>
        </ScrollView>
      </KeyboardAvoidingView>
      
      <Portal>
        <Dialog visible={logoutDialogVisible} onDismiss={hideLogoutDialog}>
          <Dialog.Title>Confirm Logout</Dialog.Title>
          <Dialog.Content>
            <Text>Are you sure you want to log out?</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={hideLogoutDialog}>Cancel</Button>
            <Button onPress={handleLogout}>Logout</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f6fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
  },
  keyboardAvoidView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  profileCard: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 4,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    backgroundColor: '#3498db',
  },
  editOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 20,
    padding: 8,
  },
  userInfo: {
    alignItems: 'center',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userRole: {
    fontSize: 16,
    color: '#666',
  },
  divider: {
    marginVertical: 16,
  },
  formContainer: {
    gap: 16,
  },
  input: {
    marginTop: 8,
  },
  actionsCard: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 4,
  },
  logoutCard: {
    marginTop: 0,
  },
  logoutButton: {
    backgroundColor: '#e74c3c',
  },
  logoutButtonContent: {
    height: 48,
  },
  logoutButtonLabel: {
    fontSize: 16,
  },
});

export default UserProfileScreen; 