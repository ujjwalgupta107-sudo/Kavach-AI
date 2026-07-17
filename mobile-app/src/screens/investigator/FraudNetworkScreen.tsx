import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Platform } from 'react-native';
import { Card, CardContent } from '../../components/ui/Card';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { ErrorCard } from '../../components/ui/ErrorCard';
import { graphService } from '../../services/api/graphService';
import { colors, spacing, fontSize, fontWeight, borderRadius, shadows } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';

export function FraudNetworkScreen() {
  const [graphData, setGraphData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try { setLoading(true); const data = await graphService.getGraph(); setGraphData(data); }
      catch (e: any) { setError(e.message || 'Failed to load network'); }
      finally { setLoading(false); }
    }
    load();
  }, []);

  const nodes = graphData?.nodes || [];
  const links = graphData?.links || graphData?.edges || [];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Fraud Network</Text>
        <Text style={styles.subtitle}>Entity relationships and connected fraud infrastructure.</Text>
      </View>
      {loading ? <LoadingSpinner message="Loading network..." /> : error ? <View style={styles.p}><ErrorCard message={error} /></View> : (
        <FlatList
          data={nodes}
          keyExtractor={(item: any) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View style={styles.statsRow}>
              <View style={[styles.statBox, shadows.glow('rgba(6, 182, 212, 0.2)') as any]}>
                <Ionicons name="git-commit-outline" size={20} color={colors.brand.cyan} style={styles.statIcon} />
                <Text style={styles.statValue}>{nodes.length}</Text>
                <Text style={styles.statLabel}>Nodes</Text>
              </View>
              <View style={[styles.statBox, shadows.glow('rgba(6, 182, 212, 0.2)') as any]}>
                <Ionicons name="git-network-outline" size={20} color={colors.brand.cyan} style={styles.statIcon} />
                <Text style={styles.statValue}>{links.length}</Text>
                <Text style={styles.statLabel}>Connections</Text>
              </View>
            </View>
          }
          ListEmptyComponent={<Text style={styles.empty}>No network data available.</Text>}
          renderItem={({ item }) => (
            <Card style={styles.card} variant="glow">
              <CardContent style={styles.nodeRow}>
                <View style={[styles.nodeIcon, { backgroundColor: item.type === 'case' ? 'rgba(239,68,68,0.1)' : 'rgba(6,182,212,0.1)', borderColor: item.type === 'case' ? 'rgba(239,68,68,0.3)' : 'rgba(6,182,212,0.3)' }]}>
                  <Ionicons name={item.type === 'case' ? 'document' : 'link'} size={20}
                    color={item.type === 'case' ? colors.status.critical : colors.brand.cyan} />
                </View>
                <View style={styles.nodeInfo}>
                  <Text style={styles.nodeLabel}>{item.label || item.id}</Text>
                  <View style={styles.nodeTypeBadge}>
                    <Text style={styles.nodeType}>{item.type}</Text>
                  </View>
                </View>
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
  statsRow: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.xl },
  statBox: { flex: 1, backgroundColor: 'rgba(24, 24, 27, 0.8)', padding: spacing.lg, borderRadius: borderRadius.xl, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', alignItems: 'center' },
  statIcon: { marginBottom: 8, opacity: 0.8 },
  statValue: { fontSize: fontSize['3xl'], fontWeight: 'bold', color: colors.brand.cyan },
  statLabel: { fontSize: fontSize.xs, color: colors.text.muted, marginTop: 4, textTransform: 'uppercase', letterSpacing: 1 },
  card: { marginBottom: spacing.md, backgroundColor: 'rgba(24, 24, 27, 0.7)' },
  nodeRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.md },
  nodeIcon: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
  nodeInfo: { flex: 1 },
  nodeLabel: { fontSize: fontSize.base, fontWeight: 'bold', color: colors.text.primary },
  nodeTypeBadge: { alignSelf: 'flex-start', marginTop: 6, backgroundColor: 'rgba(255,255,255,0.05)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  nodeType: { fontSize: 10, color: colors.text.secondary, textTransform: 'uppercase', fontWeight: 'bold', letterSpacing: 0.5 },
  p: { padding: spacing.lg },
  empty: { fontSize: fontSize.base, color: colors.text.muted, textAlign: 'center', paddingVertical: spacing['3xl'] },
});
