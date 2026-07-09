import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Platform } from 'react-native';
import { Card, CardContent } from '../../components/ui/Card';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { ErrorCard } from '../../components/ui/ErrorCard';
import { graphService } from '../../services/api/graphService';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../../constants/theme';
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
              <View style={styles.statBox}><Text style={styles.statValue}>{nodes.length}</Text><Text style={styles.statLabel}>Nodes</Text></View>
              <View style={styles.statBox}><Text style={styles.statValue}>{links.length}</Text><Text style={styles.statLabel}>Connections</Text></View>
            </View>
          }
          ListEmptyComponent={<Text style={styles.empty}>No network data available.</Text>}
          renderItem={({ item }) => (
            <Card style={styles.card}><CardContent style={styles.nodeRow}>
              <View style={[styles.nodeIcon, { backgroundColor: item.type === 'case' ? 'rgba(239,68,68,0.1)' : 'rgba(6,182,212,0.1)' }]}>
                <Ionicons name={item.type === 'case' ? 'document' : 'link'} size={18}
                  color={item.type === 'case' ? colors.status.critical : colors.brand.cyan} />
              </View>
              <View style={styles.nodeInfo}>
                <Text style={styles.nodeLabel}>{item.label || item.id}</Text>
                <Text style={styles.nodeType}>{item.type}</Text>
              </View>
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
  statsRow: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.xl },
  statBox: { flex: 1, backgroundColor: colors.surface.elevated, padding: spacing.lg, borderRadius: borderRadius.lg, borderWidth: 1, borderColor: colors.surface.raised, alignItems: 'center' },
  statValue: { fontSize: fontSize['2xl'], fontWeight: fontWeight.bold, color: colors.brand.cyan },
  statLabel: { fontSize: fontSize.xs, color: colors.text.muted, marginTop: 4 },
  card: { marginBottom: spacing.sm },
  nodeRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.md },
  nodeIcon: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  nodeInfo: { flex: 1 },
  nodeLabel: { fontSize: fontSize.base, fontWeight: fontWeight.medium, color: colors.text.primary },
  nodeType: { fontSize: fontSize.xs, color: colors.text.muted, marginTop: 2, textTransform: 'uppercase' },
  p: { padding: spacing.lg },
  empty: { fontSize: fontSize.base, color: colors.text.muted, textAlign: 'center', paddingVertical: spacing['3xl'] },
});
