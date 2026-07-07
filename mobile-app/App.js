import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthProvider, useAuth } from './src/context/AuthContext';

// Import Screens
import HomeScreen from './src/screens/HomeScreen';
import ScanScreen from './src/screens/ScanScreen';
import ReportScreen from './src/screens/ReportScreen';
import GraphScreen from './src/screens/GraphScreen';
import AnalysisScreen from './src/screens/AnalysisScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';

const Stack = createNativeStackNavigator();

function AppNavigator() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00F2FE" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: '#020617' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      >
        {!isAuthenticated ? (
          // Auth flow screens
          <>
            <Stack.Screen 
              name="Login" 
              component={LoginScreen} 
              options={{ headerShown: false }} 
            />
            <Stack.Screen 
              name="Register" 
              component={RegisterScreen} 
              options={{ headerShown: false }} 
            />
          </>
        ) : (
          // App main flow screens
          <>
            <Stack.Screen 
              name="Home" 
              component={HomeScreen} 
              options={{ title: '🛡️ KAVACH SYSTEM CONTROL' }} 
            />
            <Stack.Screen 
              name="Scan" 
              component={ScanScreen} 
              options={{ title: '🧠 LIVE INTERCEPT' }} 
            />
            <Stack.Screen 
              name="Report" 
              component={ReportScreen} 
              options={{ title: '🚨 THREAT REGISTRY' }} 
            />
            <Stack.Screen 
              name="Graph" 
              component={GraphScreen} 
              options={{ title: '📊 COGNITIVE GRAPH' }} 
            />
            <Stack.Screen 
              name="Analysis" 
              component={AnalysisScreen} 
              options={{ title: '🧠 AI ENGINE INSIGHT' }} 
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#020617',
    justifyContent: 'center',
    alignItems: 'center',
  },
});