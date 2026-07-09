import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Platform } from 'react-native';
import { Card, CardContent } from '../../components/ui/Card';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { ErrorCard } from '../../components/ui/ErrorCard';
import { clusterService } from '../../services/api/clusterService';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../../constants/theme';
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
            <Card style={styles.card}><CardContent style={styles.content}>
              <View style={styles.row}>
                <View style={styles.icon}><Ionicons name="git-branch" size={20} color={colors.brand.cyan} /></View>
                <View style={styles.info}>
                  <Text style={styles.clusterId}>{item.id}</Text>
                  <Text style={styles.meta}>{item.case_count || 0} cases • {item.entity_count || 0} entities</Text>
                </View>
              </View>
              {item.label && <Text style={styles.label}>{item.label}</Text>}
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
  card: { marginBottom: spacing.md },
  content: { paddingVertical: spacing.md },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  icon: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(6,182,212,0.1)', justifyContent: 'center', alignItems: 'center' },
  info: { flex: 1 },
  clusterId: { fontSize: fontSize.base, fontWeight: fontWeight.semibold, color: colors.brand.cyan, fontFamily: 'monospace' },
  meta: { fontSize: fontSize.xs, color: colors.text.muted, marginTop: 4 },
  label: { fontSize: fontSize.sm, color: colors.text.secondary, marginTop: spacing.sm },
  p: { padding: spacing.lg },
  empty: { fontSize: fontSize.base, color: colors.text.muted, textAlign: 'center', paddingVertical: spacing['3xl'] },
});
