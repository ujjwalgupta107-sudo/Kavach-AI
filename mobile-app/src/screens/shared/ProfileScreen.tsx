import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Alert } from 'react-native';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useAuthStore } from '../../stores/authStore';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../../constants/theme';
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

      <View style={styles.content}>
        {/* User card */}
        <Card style={styles.profileCard}>
          <CardContent style={styles.profileContent}>
            <View style={styles.avatarLarge}>
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
        <Card>
          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="information-circle-outline" size={22} color={colors.text.secondary} />
            <Text style={styles.menuText}>About KAVACH AI</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.text.muted} />
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="help-circle-outline" size={22} color={colors.text.secondary} />
            <Text style={styles.menuText}>Help & Support</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.text.muted} />
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="document-text-outline" size={22} color={colors.text.secondary} />
            <Text style={styles.menuText}>Privacy Policy</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.text.muted} />
          </TouchableOpacity>
        </Card>

        {/* Sign out */}
        <Button variant="danger" onPress={handleLogout} style={styles.logoutBtn}>
          Sign Out
        </Button>

        <Text style={styles.version}>KAVACH AI v1.0.0</Text>
      </View>
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
  },
  headerTitle: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.text.primary },
  content: { padding: spacing.lg, gap: spacing.xl },
  profileCard: { alignItems: 'center' },
  profileContent: { alignItems: 'center', paddingVertical: spacing['2xl'] },
  avatarLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(6, 182, 212, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  userName: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.text.primary },
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
    borderColor: 'rgba(6, 182, 212, 0.2)',
  },
  roleText: { fontSize: fontSize.xs, color: colors.brand.cyan, fontWeight: fontWeight.semibold },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    gap: spacing.md,
  },
  menuText: { flex: 1, fontSize: fontSize.base, color: colors.text.primary },
  divider: { height: 1, backgroundColor: colors.surface.raised },
  logoutBtn: { marginTop: spacing.sm },
  version: { fontSize: fontSize.xs, color: colors.text.muted, textAlign: 'center' },
});
