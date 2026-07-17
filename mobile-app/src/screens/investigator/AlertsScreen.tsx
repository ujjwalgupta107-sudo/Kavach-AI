import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Card, CardContent } from '../../components/ui/Card';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { ErrorCard } from '../../components/ui/ErrorCard';
import { alertService } from '../../services/api/alertService';
import { colors, spacing, fontSize, fontWeight, borderRadius, shadows } from '../../constants/theme';
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
      <Card
        style={[
          styles.alertCard,
          item.status !== 'READ' && { borderLeftWidth: 4, borderLeftColor: sevColor }
        ]}
        variant="glow"
      >
        <CardContent style={styles.alertContent}>
          <View style={styles.alertRow}>
            <View style={[styles.iconCircle, { backgroundColor: `${sevColor}15`, borderColor: `${sevColor}30` }]}>
              <Ionicons name="alert-circle" size={24} color={sevColor} />
            </View>
            <View style={styles.alertInfo}>
              <View style={styles.alertMeta}>
                <View style={[styles.sevBadge, { backgroundColor: `${sevColor}20`, borderColor: `${sevColor}40` }]}>
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
              <Ionicons name="search" size={14} color={colors.brand.cyan} style={{ marginRight: 6 }}/>
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
              <Ionicons name="checkmark-circle-outline" size={64} color={'rgba(255,255,255,0.1)'} />
              <Text style={styles.emptyText}>No active alerts.</Text>
            </View>
          }
        />
      )}
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
  list: { padding: spacing.lg, paddingBottom: 100 },
  alertCard: { marginBottom: spacing.md, backgroundColor: 'rgba(24, 24, 27, 0.7)' },
  alertContent: { paddingVertical: spacing.md },
  alertRow: { flexDirection: 'row', gap: spacing.md },
  iconCircle: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
  alertInfo: { flex: 1 },
  alertMeta: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: 8 },
  sevBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, borderWidth: 1 },
  sevText: { fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 0.5 },
  alertTime: { fontSize: fontSize.xs, color: colors.text.muted },
  alertTitle: { fontSize: fontSize.base, fontWeight: 'bold', color: colors.text.primary, lineHeight: 22 },
  alertCase: { fontSize: fontSize.sm, color: colors.text.muted, marginTop: 6 },
  alertCaseId: { color: colors.brand.cyan, fontFamily: 'monospace', fontWeight: 'bold' },
  investigateBtn: {
    flexDirection: 'row',
    alignSelf: 'flex-end',
    alignItems: 'center',
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: 'rgba(56, 189, 248, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.2)',
    borderRadius: borderRadius.md,
  },
  investigateBtnText: { fontSize: fontSize.sm, color: colors.brand.cyan, fontWeight: 'bold' },
  errorWrapper: { padding: spacing.lg },
  emptyState: { alignItems: 'center', paddingVertical: spacing['5xl'] },
  emptyText: { fontSize: fontSize.base, color: colors.text.muted, marginTop: spacing.md },
});
