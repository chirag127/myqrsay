import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const ErrorMessage = ({ error, style }) => {
  if (!error) return null;

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.text}>{error}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffebee',
    padding: 10,
    borderRadius: 5,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#ffcdd2',
  },
  text: {
    color: '#c62828',
    fontSize: 14,
  },
});

export default ErrorMessage;
