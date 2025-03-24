import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Button } from 'react-native-paper';

const EmptyState = ({
  title = 'No Data Found',
  message = 'There is no data to display at the moment.',
  icon,
  buttonText,
  onButtonPress
}) => {
  return (
    <View style={styles.container}>
      {icon && (
        <Image source={icon} style={styles.icon} resizeMode="contain" />
      )}
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {buttonText && onButtonPress && (
        <Button
          mode="contained"
          onPress={onButtonPress}
          style={styles.button}
        >
          {buttonText}
        </Button>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  icon: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    marginTop: 10,
  },
});

export default EmptyState;
