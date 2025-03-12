import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Text, Menu, HelperText } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

/**
 * Reusable dropdown component with demo items
 * @param {Object} props
 * @param {Array} props.items - Array of items to display in dropdown
 * @param {string} props.value - Currently selected value
 * @param {Function} props.onValueChange - Function called when value changes
 * @param {string} props.placeholder - Placeholder text when no value is selected
 * @param {string} props.error - Error message
 * @param {Object} props.style - Additional styles for the container
 */
const DemoDropdown = ({ 
  items = [], 
  value, 
  onValueChange, 
  placeholder = 'Select an option',
  error,
  style
}) => {
  const [menuVisible, setMenuVisible] = useState(false);

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity
        onPress={() => setMenuVisible(true)}
        style={[styles.dropdownButton, error ? styles.errorBorder : null]}
      >
        <Text style={error ? styles.errorText : null}>
          {value || placeholder}
        </Text>
        <MaterialCommunityIcons name="menu-down" size={24} color="#7f8c8d" />
      </TouchableOpacity>
      
      {error && <HelperText type="error">{error}</HelperText>}
      
      <Menu
        visible={menuVisible}
        onDismiss={() => setMenuVisible(false)}
        anchor={<View />}
        style={styles.menu}
      >
        {items.map((item) => (
          <Menu.Item
            key={item}
            title={item}
            onPress={() => {
              onValueChange(item);
              setMenuVisible(false);
            }}
          />
        ))}
      </Menu>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  dropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#bdc3c7',
    borderRadius: 4,
    padding: 12,
    backgroundColor: 'white',
    marginBottom: 8,
  },
  menu: {
    marginTop: 46,
  },
  errorText: {
    color: '#e74c3c',
  },
  errorBorder: {
    borderColor: '#e74c3c',
  },
});

export default DemoDropdown; 