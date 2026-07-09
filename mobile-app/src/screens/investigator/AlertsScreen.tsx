import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Card, CardContent } from '../../components/ui/Card';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { ErrorCard } from '../../components/ui/ErrorCard';
import { alertService } from '../../services/api/alertService';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';

export function AlertsScreen() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigation = useNavigation<any>();

  useEffect(() => {
    async function loadAlerts() {
      try {
        setLoading(true);
        const data = await alertService.getAlerts();
        setAlerts(data.items || data || []);
      } catch (err: any) {
        setError(err.message || 'Failed to load alerts');
      } finally {
        setLoading(false);
      }
    }
    loadAlerts();
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return colors.status.critical;
      case 'HIGH': return colors.status.warning;
      default: return colors.status.info;
    }
  };

  const renderAlert = ({ item }: { item: any }) => {
    const sevColor = getSeverityColor(item.severity);
    return (
      <Card style={[styles.alertCard, item.status !== 'READ' && { borderLeftWidth: 4, borderLeftColor: colors.status.critical }]}>
        <CardContent style={styles.alertContent}>
          <View style={styles.alertRow}>
            <View style={[styles.iconCircle, { backgroundColor: `${sevColor}15` }]}>
              <Ionicons name="alert-circle" size={20} color={sevColor} />
            </View>
            <View style={styles.alertInfo}>
              <View style={styles.alertMeta}>
                <View style={[styles.sevBadge, { backgroundColor: `${sevColor}20` }]}>
                  <Text style={[styles.sevText, { color: sevColor }]}>{item.severity}</Text>
                </View>
                <Text style={styles.alertTime}>{new Date(item.created_at || Date.now()).toLocaleString()}</Text>
              </View>
              <Text style={styles.alertTitle}>{item.title || item.alert_type}</Text>
              <Text style={styles.alertCase}>
                Related: <Text style={styles.alertCaseId}>{item.case_id || item.entity_id || 'System'}</Text>
              </Text>
            </View>
          </View>
          {item.case_id && (
            <TouchableOpacity
              style={styles.investigateBtn}
              onPress={() => navigation.navigate('Cases', { screen: 'CaseDetail', params: { caseId: item.case_id } })}
            >
              <Text style={styles.investigateBtnText}>Investigate</Text>
            </TouchableOpacity>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Alert Centre</Text>
        <Text style={styles.subtitle}>Automated intelligence notifications and pattern detections.</Text>
      </View>

      {loading ? (
        <LoadingSpinner message="Loading alerts..." />
      ) : error ? (
        <View style={styles.errorWrapper}><ErrorCard message={error} /></View>
      ) : (
        <FlatList
          data={alerts}
          renderItem={renderAlert}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="checkmark-circle-outline" size={48} color={colors.text.muted} />
              <Text style={styles.emptyText}>No active alerts.</Text>
            </View>
          }
        />
      )}
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
  list: { padding: spacing.lg, paddingBottom: 100 },
  alertCard: { marginBottom: spacing.md },
  alertContent: { paddingVertical: spacing.md },
  alertRow: { flexDirection: 'row', gap: spacing.md },
  iconCircle: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  alertInfo: { flex: 1 },
  alertMeta: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: 4 },
  sevBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 3 },
  sevText: { fontSize: 9, fontWeight: fontWeight.bold, textTransform: 'uppercase' },
  alertTime: { fontSize: fontSize.xs, color: colors.text.muted },
  alertTitle: { fontSize: fontSize.base, fontWeight: fontWeight.semibold, color: colors.text.primary, lineHeight: 22 },
  alertCase: { fontSize: fontSize.sm, color: colors.text.muted, marginTop: 4 },
  alertCaseId: { color: colors.brand.cyan },
  investigateBtn: {
    alignSelf: 'flex-end',
    marginTop: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderWidth: 1,
    borderColor: colors.surface.raised,
    borderRadius: borderRadius.md,
  },
  investigateBtnText: { fontSize: fontSize.sm, color: colors.text.primary },
  errorWrapper: { padding: spacing.lg },
  emptyState: { alignItems: 'center', paddingVertical: spacing['5xl'] },
  emptyText: { fontSize: fontSize.base, color: colors.text.muted, marginTop: spacing.md },
});
