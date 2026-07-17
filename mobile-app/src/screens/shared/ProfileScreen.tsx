import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Alert, ScrollView } from 'react-native';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useAuthStore } from '../../stores/authStore';
import { colors, spacing, fontSize, fontWeight, borderRadius, shadows } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';

export function ProfileScreen() {
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: () => logout() },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* User card */}
        <Card style={styles.profileCard} variant="glow">
          <CardContent style={styles.profileContent}>
            <View style={[styles.avatarLarge, shadows.glow('rgba(6, 182, 212, 0.2)') as any]}>
              <Ionicons name="person" size={40} color={colors.brand.cyan} />
            </View>
            <Text style={styles.userName}>{user?.name || user?.email || 'User'}</Text>
            <Text style={styles.userEmail}>{user?.email}</Text>
            <View style={styles.roleBadge}>
              <Ionicons
                name={user?.role === 'INVESTIGATOR' ? 'shield-checkmark' : 'shield'}
                size={14}
                color={colors.brand.cyan}
              />
              <Text style={styles.roleText}>{user?.role}</Text>
            </View>
          </CardContent>
        </Card>

        {/* Info items */}
        <Card style={styles.menuCard}>
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIconBox}>
                <Ionicons name="information-circle-outline" size={20} color={colors.brand.cyan} />
            </View>
            <Text style={styles.menuText}>About KAVACH AI</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.text.muted} />
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIconBox}>
                <Ionicons name="help-circle-outline" size={20} color={colors.brand.cyan} />
            </View>
            <Text style={styles.menuText}>Help & Support</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.text.muted} />
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIconBox}>
                <Ionicons name="document-text-outline" size={20} color={colors.brand.cyan} />
            </View>
            <Text style={styles.menuText}>Privacy Policy</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.text.muted} />
          </TouchableOpacity>
        </Card>

        {/* Sign out */}
        <Button variant="danger" onPress={handleLogout} style={[styles.logoutBtn, shadows.glow('rgba(239, 68, 68, 0.3)') as any]}>
          Sign Out
        </Button>

        <Text style={styles.version}>KAVACH AI v1.0.0</Text>
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
  headerTitle: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.text.primary, letterSpacing: 0.5 },
  content: { padding: spacing.lg, gap: spacing.xl, paddingBottom: 100 },
  profileCard: { alignItems: 'center', backgroundColor: 'rgba(24, 24, 27, 0.7)' },
  profileContent: { alignItems: 'center', paddingVertical: spacing['2xl'] },
  avatarLarge: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(6, 182, 212, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.3)',
  },
  userName: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.text.primary, letterSpacing: 0.5 },
  userEmail: { fontSize: fontSize.sm, color: colors.text.secondary, marginTop: 4 },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: spacing.md,
    backgroundColor: 'rgba(6, 182, 212, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.3)',
  },
  roleText: { fontSize: fontSize.xs, color: colors.brand.cyan, fontWeight: fontWeight.bold, letterSpacing: 0.5 },
  menuCard: { backgroundColor: 'rgba(24, 24, 27, 0.7)' },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    gap: spacing.md,
  },
  menuIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuText: { flex: 1, fontSize: fontSize.base, color: colors.text.primary, fontWeight: '500' },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.05)' },
  logoutBtn: { marginTop: spacing.lg },
  version: { fontSize: fontSize.xs, color: colors.text.muted, textAlign: 'center', marginTop: spacing.xl },
});
