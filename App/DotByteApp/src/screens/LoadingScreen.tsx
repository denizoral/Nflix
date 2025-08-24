import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';

const LoadingScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>DotByte</Text>
      <ActivityIndicator size="large" color="#e50914" style={styles.spinner} />
      <Text style={styles.subtitle}>Loading...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#e50914',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    marginTop: 20,
  },
  spinner: {
    marginVertical: 20,
  },
});

export default LoadingScreen;