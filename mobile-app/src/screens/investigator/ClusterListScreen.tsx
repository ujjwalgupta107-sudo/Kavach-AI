import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Platform } from 'react-native';
import { Card, CardContent } from '../../components/ui/Card';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { ErrorCard } from '../../components/ui/ErrorCard';
import { clusterService } from '../../services/api/clusterService';
import { colors, spacing, fontSize, fontWeight, borderRadius, shadows } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';

export function ClusterListScreen() {
  const [clusters, setClusters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try { setLoading(true); const data = await clusterService.getClusters(); setClusters(data.items || data || []); }
      catch (e: any) { setError(e.message || 'Failed to load clusters'); }
      finally { setLoading(false); }
    }
    load();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Fraud Clusters</Text>
        <Text style={styles.subtitle}>Grouped fraud operations sharing common infrastructure.</Text>
      </View>
      {loading ? <LoadingSpinner message="Loading clusters..." /> : error ? <View style={styles.p}><ErrorCard message={error} /></View> : (
        <FlatList data={clusters} keyExtractor={item => item.id}
          contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}
          ListEmptyComponent={<Text style={styles.empty}>No clusters detected.</Text>}
          renderItem={({ item }) => (
            <Card style={styles.card} variant="glow">
              <CardContent style={styles.content}>
                <View style={styles.row}>
                  <View style={styles.icon}><Ionicons name="git-branch" size={24} color={colors.brand.cyan} /></View>
                  <View style={styles.info}>
                    <Text style={styles.clusterId}>{item.id}</Text>
                    <View style={styles.metaRow}>
                      <View style={styles.metaBadge}>
                        <Ionicons name="document-text-outline" size={12} color={colors.text.secondary} />
                        <Text style={styles.meta}>{item.case_count || 0} Cases</Text>
                      </View>
                      <View style={styles.metaBadge}>
                        <Ionicons name="people-outline" size={12} color={colors.text.secondary} />
                        <Text style={styles.meta}>{item.entity_count || 0} Entities</Text>
                      </View>
                    </View>
                  </View>
                </View>
                {item.label && (
                  <View style={styles.labelBox}>
                    <Text style={styles.label}>{item.label}</Text>
                  </View>
                )}
              </CardContent>
            </Card>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface.base },
  header: { paddingHorizontal: spacing.lg, paddingTop: Platform.OS === 'ios' ? 56 : 40, paddingBottom: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.surface.raised, backgroundColor: 'rgba(9, 9, 11, 0.95)' },
  title: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.text.primary, letterSpacing: 0.5 },
  subtitle: { fontSize: fontSize.sm, color: colors.text.secondary, marginTop: 4 },
  list: { padding: spacing.lg, paddingBottom: 100 },
  card: { marginBottom: spacing.md, backgroundColor: 'rgba(24, 24, 27, 0.7)' },
  content: { paddingVertical: spacing.md },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  icon: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(6,182,212,0.1)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(6,182,212,0.3)' },
  info: { flex: 1 },
  clusterId: { fontSize: fontSize.base, fontWeight: 'bold', color: colors.brand.cyan, fontFamily: 'monospace', letterSpacing: 0.5 },
  metaRow: { flexDirection: 'row', gap: spacing.sm, marginTop: 8 },
  metaBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(255,255,255,0.05)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  meta: { fontSize: 10, color: colors.text.secondary, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 0.5 },
  labelBox: { marginTop: spacing.md, backgroundColor: 'rgba(255,255,255,0.02)', padding: spacing.sm, borderRadius: borderRadius.sm, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  label: { fontSize: fontSize.sm, color: colors.text.primary, fontStyle: 'italic' },
  p: { padding: spacing.lg },
  empty: { fontSize: fontSize.base, color: colors.text.muted, textAlign: 'center', paddingVertical: spacing['3xl'] },
});
