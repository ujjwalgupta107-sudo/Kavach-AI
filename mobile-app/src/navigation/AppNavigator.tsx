import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthStore } from '../stores/authStore';
import { AuthStack } from './AuthStack';
import { CitizenTabs } from './CitizenTabs';
import { InvestigatorTabs } from './InvestigatorTabs';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { View, StyleSheet, Text } from 'react-native';
import { colors } from '../constants/theme';

export type RootStackParamList = {
  Auth: undefined;
  CitizenMain: undefined;
  InvestigatorMain: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  const { isAuthenticated, isLoading, user, checkAuth } = useAuthStore();

  console.log("AppNavigator Render - isLoading:", isLoading, "isAuthenticated:", isAuthenticated, "user:", user);

  useEffect(() => {
    console.log("AppNavigator Mounted - trigger checkAuth");
    checkAuth();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingSpinner message="Initializing KAVACH..." />
      </View>
    );
  }

  const isInvestigator = user?.role === 'INVESTIGATOR' || user?.role === 'ADMIN';

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface.base }}>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {!isAuthenticated ? (
            <Stack.Screen name="Auth" component={AuthStack} />
          ) : isInvestigator ? (
            <Stack.Screen name="InvestigatorMain" component={InvestigatorTabs} />
          ) : (
            <Stack.Screen name="CitizenMain" component={CitizenTabs} />
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.surface.base,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
