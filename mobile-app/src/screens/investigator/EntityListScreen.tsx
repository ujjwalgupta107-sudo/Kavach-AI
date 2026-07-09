import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Platform } from 'react-native';
import { Card, CardContent } from '../../components/ui/Card';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { ErrorCard } from '../../components/ui/ErrorCard';
import { RiskBadge } from '../../components/ui/RiskBadge';
import { entityService } from '../../services/api/entityService';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../../constants/theme';

export function EntityListScreen() {
  const [entities, setEntities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try { setLoading(true); const data = await entityService.getEntities(); setEntities(data || []); }
      catch (e: any) { setError(e.message || 'Failed to load entities'); }
      finally { setLoading(false); }
    }
    load();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Tracked Entities</Text>
        <Text style={styles.subtitle}>Phone numbers, UPI IDs, domains tracked across cases.</Text>
      </View>
      {loading ? <LoadingSpinner message="Loading entities..." /> : error ? <View style={styles.p}><ErrorCard message={error} /></View> : (
        <FlatList data={entities} keyExtractor={item => item.id}
          contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}
          ListEmptyComponent={<Text style={styles.empty}>No entities tracked.</Text>}
          renderItem={({ item }) => (
            <Card style={styles.card}><CardContent style={styles.row}>
              <View style={styles.badge}><Text style={styles.badgeText}>{item.type}</Text></View>
              <View style={styles.info}><Text style={styles.value}>{item.value}</Text>
                <Text style={styles.meta}>{item.connected_case_ids?.length || 0} linked cases</Text>
              </View>
              {item.risk_score > 0 && <Text style={styles.risk}>{(item.risk_score * 100).toFixed(0)}%</Text>}
            </CardContent></Card>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0b1120' },
  header: { paddingHorizontal: spacing.lg, paddingTop: Platform.OS === 'ios' ? 56 : 40, paddingBottom: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.surface.raised, backgroundColor: colors.surface.base },
  title: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.text.primary },
  subtitle: { fontSize: fontSize.sm, color: colors.text.secondary, marginTop: 4 },
  list: { padding: spacing.lg, paddingBottom: 100 },
  card: { marginBottom: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.md },
  badge: { backgroundColor: colors.surface.base, paddingHorizontal: 8, paddingVertical: 3, borderRadius: borderRadius.sm, borderWidth: 1, borderColor: colors.surface.raised },
  badgeText: { fontSize: 9, fontWeight: fontWeight.bold, color: colors.text.muted, textTransform: 'uppercase', fontFamily: 'monospace' },
  info: { flex: 1 },
  value: { fontSize: fontSize.base, fontWeight: fontWeight.medium, color: colors.text.primary },
  meta: { fontSize: fontSize.xs, color: colors.text.muted, marginTop: 2 },
  risk: { fontSize: fontSize.sm, fontWeight: fontWeight.bold, color: colors.status.warning },
  p: { padding: spacing.lg },
  empty: { fontSize: fontSize.base, color: colors.text.muted, textAlign: 'center', paddingVertical: spacing['3xl'] },
});
