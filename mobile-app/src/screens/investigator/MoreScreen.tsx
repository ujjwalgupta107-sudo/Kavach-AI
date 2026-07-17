import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Card } from '../../components/ui/Card';
import { colors, spacing, fontSize, fontWeight, borderRadius, shadows } from '../../constants/theme';
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
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {menuItems.map((item, index) => (
          <TouchableOpacity key={item.screen} onPress={() => navigation.navigate(item.screen)} activeOpacity={0.7}>
            <Card style={styles.card} variant="glow">
              <View style={styles.row}>
                <View style={[styles.iconBox, shadows.glow('rgba(6, 182, 212, 0.15)') as any]}>
                  <Ionicons name={item.icon} size={24} color={colors.brand.cyan} />
                </View>
                <View style={styles.info}>
                  <Text style={styles.label}>{item.label}</Text>
                  <Text style={styles.desc}>{item.desc}</Text>
                </View>
                <View style={styles.chevronBox}>
                  <Ionicons name="chevron-forward" size={18} color={colors.brand.cyan} />
                </View>
              </View>
            </Card>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface.base },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: Platform.OS === 'ios' ? 56 : 40,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.surface.raised,
    backgroundColor: 'rgba(9, 9, 11, 0.95)',
  },
  title: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.text.primary, letterSpacing: 0.5 },
  subtitle: { fontSize: fontSize.sm, color: colors.text.secondary, marginTop: 4 },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: 100 },
  card: { padding: 0, backgroundColor: 'rgba(24, 24, 27, 0.7)', overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', padding: spacing.lg, gap: spacing.md },
  iconBox: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: 'rgba(6, 182, 212, 0.1)',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(6, 182, 212, 0.3)',
  },
  info: { flex: 1 },
  label: { fontSize: fontSize.base, fontWeight: 'bold', color: colors.text.primary, letterSpacing: 0.5 },
  desc: { fontSize: fontSize.sm, color: colors.text.secondary, marginTop: 4 },
  chevronBox: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center', alignItems: 'center',
  },
});
