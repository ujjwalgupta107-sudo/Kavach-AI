import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { colors, shadows, borderRadius } from '../constants/theme';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DashboardScreen } from '../screens/investigator/DashboardScreen';
import { CaseListScreen } from '../screens/investigator/CaseListScreen';
import { CaseDetailScreen } from '../screens/investigator/CaseDetailScreen';
import { AlertsScreen } from '../screens/investigator/AlertsScreen';
import { AssistantScreen } from '../screens/shared/AssistantScreen';
import { ProfileScreen } from '../screens/shared/ProfileScreen';
import { EntityListScreen } from '../screens/investigator/EntityListScreen';
import { ClusterListScreen } from '../screens/investigator/ClusterListScreen';
import { FraudNetworkScreen } from '../screens/investigator/FraudNetworkScreen';
import { MoreScreen } from '../screens/investigator/MoreScreen';

// Cases stack with drill-down
export type CasesStackParamList = {
  CaseList: undefined;
  CaseDetail: { caseId: string };
};

const CasesStack = createNativeStackNavigator<CasesStackParamList>();

function CasesNavigator() {
  return (
    <CasesStack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.surface.base },
      }}
    >
      <CasesStack.Screen name="CaseList" component={CaseListScreen} />
      <CasesStack.Screen name="CaseDetail" component={CaseDetailScreen} />
    </CasesStack.Navigator>
  );
}

// More stack (entities, clusters, network, profile)
export type MoreStackParamList = {
  MoreMenu: undefined;
  Entities: undefined;
  Clusters: undefined;
  FraudNetwork: undefined;
  ProfileScreen: undefined;
};

const MoreStack = createNativeStackNavigator<MoreStackParamList>();

function MoreNavigator() {
  return (
    <MoreStack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.surface.base },
      }}
    >
      <MoreStack.Screen name="MoreMenu" component={MoreScreen} />
      <MoreStack.Screen name="Entities" component={EntityListScreen} />
      <MoreStack.Screen name="Clusters" component={ClusterListScreen} />
      <MoreStack.Screen name="FraudNetwork" component={FraudNetworkScreen} />
      <MoreStack.Screen name="ProfileScreen" component={ProfileScreen} />
    </MoreStack.Navigator>
  );
}

export type InvestigatorTabParamList = {
  Dashboard: undefined;
  Cases: undefined;
  Alerts: undefined;
  Assistant: undefined;
  More: undefined;
};

const Tab = createBottomTabNavigator<InvestigatorTabParamList>();

export function InvestigatorTabs() {
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
          let iconName: keyof typeof Ionicons.glyphMap = 'grid-outline';
          if (route.name === 'Dashboard') {
            iconName = focused ? 'grid' : 'grid-outline';
          } else if (route.name === 'Cases') {
            iconName = focused ? 'folder-open' : 'folder-open-outline';
          } else if (route.name === 'Alerts') {
            iconName = focused ? 'notifications' : 'notifications-outline';
          } else if (route.name === 'Assistant') {
            iconName = focused ? 'chatbubble-ellipses' : 'chatbubble-ellipses-outline';
          } else if (route.name === 'More') {
            iconName = focused ? 'ellipsis-horizontal-circle' : 'ellipsis-horizontal-circle-outline';
          }
          return <Ionicons name={iconName} size={24} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Cases" component={CasesNavigator} />
      <Tab.Screen name="Alerts" component={AlertsScreen} />
      <Tab.Screen name="Assistant" component={AssistantScreen} options={{ tabBarLabel: 'AI Chat' }} />
      <Tab.Screen name="More" component={MoreNavigator} />
    </Tab.Navigator>
  );
}
