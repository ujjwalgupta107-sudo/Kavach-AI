import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/theme';

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
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface.elevated,
          borderTopColor: colors.surface.raised,
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: colors.brand.cyan,
        tabBarInactiveTintColor: colors.text.muted,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600' as const,
        },
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
          return <Ionicons name={iconName} size={22} color={color} />;
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
