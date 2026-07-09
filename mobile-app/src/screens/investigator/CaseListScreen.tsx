import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Card, CardContent } from '../../components/ui/Card';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { ErrorCard } from '../../components/ui/ErrorCard';
import { RiskBadge } from '../../components/ui/RiskBadge';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { caseService } from '../../services/api/caseService';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { CasesStackParamList } from '../../navigation/InvestigatorTabs';

type NavProp = NativeStackNavigationProp<CasesStackParamList, 'CaseList'>;

export function CaseListScreen() {
  const [cases, setCases] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigation = useNavigation<NavProp>();

  useEffect(() => {
    const fetchCases = async () => {
      try {
        setLoading(true);
        const data = await caseService.getCases();
        setCases(data.items || data || []);
      } catch (e: any) {
        setError(e.message || 'Failed to fetch cases');
      } finally {
        setLoading(false);
      }
    };
    fetchCases();
  }, []);

  const filteredCases = cases.filter(c =>
    !searchTerm ||
    c.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.report_location && c.report_location.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const renderCase = ({ item }: { item: any }) => (
    <TouchableOpacity onPress={() => navigation.navigate('CaseDetail', { caseId: item.id })}>
      <Card style={styles.caseCard}>
        <CardContent style={styles.caseContent}>
          <View style={styles.caseTop}>
            <View style={styles.caseIdRow}>
              <Text style={styles.caseId}>{item.id.substring(0, 8)}...</Text>
              {item.cluster_id && (
                <Text style={styles.clusterTag}>CLUSTER: {item.cluster_id.substring(0, 6)}</Text>
              )}
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.text.muted} />
          </View>
          <View style={styles.caseBottom}>
            <RiskBadge level={item.risk_level} compact />
            <Text style={styles.caseType}>{(item.scam_type || '').replace('_', ' ')}</Text>
            <Text style={styles.caseDate}>{new Date(item.created_at).toLocaleDateString()}</Text>
            <StatusBadge status={item.status} />
          </View>
        </CardContent>
      </Card>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Case Management</Text>
        <Text style={styles.subtitle}>View and manage reported fraud incidents.</Text>
      </View>

      {/* Search */}
      <View style={styles.searchBar}>
        <Ionicons name="search" size={16} color={colors.text.muted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search Case ID, Phone, UPI..."
          placeholderTextColor={colors.text.muted}
          value={searchTerm}
          onChangeText={setSearchTerm}
        />
        <Text style={styles.countText}>{filteredCases.length} cases</Text>
      </View>

      {loading ? (
        <LoadingSpinner message="Loading cases..." />
      ) : error ? (
        <View style={styles.errorWrapper}><ErrorCard message={error} /></View>
      ) : (
        <FlatList
          data={filteredCases}
          renderItem={renderCase}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={<Text style={styles.emptyText}>No cases found.</Text>}
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
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface.elevated,
    borderBottomWidth: 1,
    borderBottomColor: colors.surface.raised,
  },
  searchInput: {
    flex: 1,
    height: 36,
    fontSize: fontSize.sm,
    color: colors.text.primary,
  },
  countText: { fontSize: fontSize.xs, color: colors.text.muted },
  list: { padding: spacing.lg, paddingBottom: 100 },
  caseCard: { marginBottom: spacing.md },
  caseContent: { paddingVertical: spacing.md },
  caseTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  caseIdRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  caseId: { fontSize: fontSize.base, fontWeight: fontWeight.semibold, color: colors.text.primary, fontFamily: 'monospace' },
  clusterTag: { fontSize: 9, color: colors.brand.cyan, backgroundColor: 'rgba(6,182,212,0.1)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  caseBottom: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flexWrap: 'wrap' },
  caseType: { fontSize: fontSize.sm, color: colors.text.secondary },
  caseDate: { fontSize: fontSize.xs, color: colors.text.muted },
  errorWrapper: { padding: spacing.lg },
  emptyText: { fontSize: fontSize.base, color: colors.text.muted, textAlign: 'center', paddingVertical: spacing['3xl'] },
});
