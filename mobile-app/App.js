import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Saari screens ke imports (FIXED: Added AnalysisScreen import)
import HomeScreen from './src/screens/HomeScreen';
import ScanScreen from './src/screens/ScanScreen';
import ReportScreen from './src/screens/ReportScreen';

import AnalysisScreen from './src/screens/AnalysisScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="Home"
        screenOptions={{
          headerStyle: { backgroundColor: '#020617' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      >
        <Stack.Screen 
          name="Home" 
          component={HomeScreen} 
          options={{ title: '🛡️ KAVACH AI ENGINE' }} 
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
          name="Analysis" 
          component={AnalysisScreen} 
          options={{ title: '🧠 AI ENGINE INSIGHT' }} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}