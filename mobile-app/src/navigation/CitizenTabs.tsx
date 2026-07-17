import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { colors, shadows, borderRadius } from '../constants/theme';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ShieldHomeScreen } from '../screens/citizen/ShieldHomeScreen';
import { AnalyzeResultScreen } from '../screens/citizen/AnalyzeResultScreen';
import { ReportHistoryScreen } from '../screens/citizen/ReportHistoryScreen';
import { AssistantScreen } from '../screens/shared/AssistantScreen';
import { ProfileScreen } from '../screens/shared/ProfileScreen';

// Shield stack (Shield home + result detail)
export type ShieldStackParamList = {
  ShieldHome: undefined;
  AnalyzeResult: { resultData?: any; caseId?: string };
};

const ShieldStack = createNativeStackNavigator<ShieldStackParamList>();

function ShieldNavigator() {
  return (
    <ShieldStack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.surface.base },
      }}
    >
      <ShieldStack.Screen name="ShieldHome" component={ShieldHomeScreen} />
      <ShieldStack.Screen name="AnalyzeResult" component={AnalyzeResultScreen} />
    </ShieldStack.Navigator>
  );
}

// Report history stack
export type ReportsStackParamList = {
  ReportList: undefined;
  ReportResult: { resultData?: any; caseId?: string };
};

const ReportsStack = createNativeStackNavigator<ReportsStackParamList>();

function ReportsNavigator() {
  return (
    <ReportsStack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.surface.base },
      }}
    >
      <ReportsStack.Screen name="ReportList" component={ReportHistoryScreen} />
      <ReportsStack.Screen name="ReportResult" component={AnalyzeResultScreen} />
    </ReportsStack.Navigator>
  );
}

export type CitizenTabParamList = {
  Shield: undefined;
  Reports: undefined;
  Assistant: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<CitizenTabParamList>();

export function CitizenTabs() {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          bottom: Math.max(insets.bottom, 16),
          left: 20,
          right: 20,
          backgroundColor: colors.surface.overlay,
          borderRadius: borderRadius.full,
          height: 64,
          paddingBottom: 0,
          borderWidth: 1,
          borderColor: 'rgba(255, 255, 255, 0.1)',
          ...shadows.lg,
        },
        tabBarActiveTintColor: colors.brand.cyan,
        tabBarInactiveTintColor: colors.text.muted,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '700' as const,
          marginBottom: 8,
        },
        tabBarItemStyle: {
          paddingTop: 10,
        },
        tabBarBackground: () => (
          <View style={{ flex: 1, borderRadius: borderRadius.full, overflow: 'hidden' }} />
        ),
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'shield-outline';
          if (route.name === 'Shield') {
            iconName = focused ? 'shield' : 'shield-outline';
          } else if (route.name === 'Reports') {
            iconName = focused ? 'document-text' : 'document-text-outline';
          } else if (route.name === 'Assistant') {
            iconName = focused ? 'chatbubble-ellipses' : 'chatbubble-ellipses-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person-circle' : 'person-circle-outline';
          }
          return <Ionicons name={iconName} size={24} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Shield" component={ShieldNavigator} options={{ tabBarLabel: 'Shield' }} />
      <Tab.Screen name="Reports" component={ReportsNavigator} options={{ tabBarLabel: 'Reports' }} />
      <Tab.Screen name="Assistant" component={AssistantScreen} options={{ tabBarLabel: 'AI Chat' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarLabel: 'Profile' }} />
    </Tab.Navigator>
  );
}
