import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Card } from '../../components/ui/Card';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { MoreStackParamList } from '../../navigation/InvestigatorTabs';

type NavProp = NativeStackNavigationProp<MoreStackParamList, 'MoreMenu'>;

const menuItems = [
  { label: 'Entities', icon: 'people-outline' as const, screen: 'Entities' as const, desc: 'Tracked phone numbers, UPI IDs, domains' },
  { label: 'Fraud Clusters', icon: 'git-branch-outline' as const, screen: 'Clusters' as const, desc: 'Grouped fraud operations' },
  { label: 'Fraud Network', icon: 'git-network-outline' as const, screen: 'FraudNetwork' as const, desc: 'Entity relationship graph' },
  { label: 'Profile & Settings', icon: 'person-circle-outline' as const, screen: 'ProfileScreen' as const, desc: 'Account info and sign out' },
];

export function MoreScreen() {
  const navigation = useNavigation<NavProp>();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>More Tools</Text>
        <Text style={styles.subtitle}>Additional intelligence and settings.</Text>
      </View>
      <View style={styles.content}>
        {menuItems.map((item) => (
          <TouchableOpacity key={item.screen} onPress={() => navigation.navigate(item.screen)}>
            <Card style={styles.card}>
              <View style={styles.row}>
                <View style={styles.iconBox}>
                  <Ionicons name={item.icon} size={24} color={colors.brand.cyan} />
                </View>
                <View style={styles.info}>
                  <Text style={styles.label}>{item.label}</Text>
                  <Text style={styles.desc}>{item.desc}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.text.muted} />
              </View>
            </Card>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0b1120' },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: Platform.OS === 'ios' ? 56 : 40,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.surface.raised,
    backgroundColor: colors.surface.base,
  },
  title: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.text.primary },
  subtitle: { fontSize: fontSize.sm, color: colors.text.secondary, marginTop: 4 },
  content: { padding: spacing.lg, gap: spacing.md },
  card: { padding: 0 },
  row: { flexDirection: 'row', alignItems: 'center', padding: spacing.lg, gap: spacing.md },
  iconBox: {
    width: 48, height: 48, borderRadius: borderRadius.lg,
    backgroundColor: 'rgba(6, 182, 212, 0.1)',
    justifyContent: 'center', alignItems: 'center',
  },
  info: { flex: 1 },
  label: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.text.primary },
  desc: { fontSize: fontSize.sm, color: colors.text.muted, marginTop: 2 },
});
