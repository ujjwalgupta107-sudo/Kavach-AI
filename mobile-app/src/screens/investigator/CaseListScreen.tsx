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
import { colors, spacing, fontSize, fontWeight, borderRadius, shadows } from '../../constants/theme';
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
      <Card style={styles.caseCard} variant="glow">
        <CardContent style={styles.caseContent}>
          <View style={styles.caseTop}>
            <View style={styles.caseIdRow}>
              <Ionicons name="document-text" size={16} color={colors.brand.cyan} />
              <Text style={styles.caseId}>{item.id.substring(0, 8)}...</Text>
              {item.cluster_id && (
                <View style={styles.clusterTag}>
                  <Ionicons name="git-network" size={10} color={colors.brand.cyan} style={{ marginRight: 4 }}/>
                  <Text style={styles.clusterTagText}>{item.cluster_id.substring(0, 6)}</Text>
                </View>
              )}
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.text.muted} />
          </View>
          <View style={styles.caseBottom}>
            <RiskBadge level={item.risk_level} compact />
            <StatusBadge status={item.status} />
            <View style={styles.caseTypeWrapper}>
                <Text style={styles.caseType}>{(item.scam_type || '').replace('_', ' ')}</Text>
            </View>
            <Text style={styles.caseDate}>{new Date(item.created_at).toLocaleDateString()}</Text>
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
      <View style={styles.searchBarContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color={colors.brand.cyan} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search Case ID, Phone, UPI..."
            placeholderTextColor={colors.text.muted}
            value={searchTerm}
            onChangeText={setSearchTerm}
          />
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{filteredCases.length}</Text>
          </View>
        </View>
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
  searchBarContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface.base,
    borderBottomWidth: 1,
    borderBottomColor: colors.surface.raised,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: 'rgba(24, 24, 27, 0.5)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: borderRadius.full,
    ...shadows.glow('rgba(56, 189, 248, 0.1)'),
  },
  searchInput: {
    flex: 1,
    height: 36,
    fontSize: fontSize.sm,
    color: colors.text.primary,
  },
  countBadge: {
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
  },
  countText: { fontSize: fontSize.xs, color: colors.brand.cyan, fontWeight: 'bold' },
  list: { padding: spacing.lg, paddingBottom: 100 },
  caseCard: {
    marginBottom: spacing.md,
    backgroundColor: 'rgba(24, 24, 27, 0.7)',
  },
  caseContent: { paddingVertical: spacing.md },
  caseTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  caseIdRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  caseId: { fontSize: fontSize.base, fontWeight: fontWeight.bold, color: colors.text.primary, fontFamily: 'monospace', letterSpacing: 0.5 },
  clusterTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
  },
  clusterTagText: { fontSize: 10, color: colors.brand.cyan, fontWeight: 'bold', fontFamily: 'monospace' },
  caseBottom: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flexWrap: 'wrap' },
  caseTypeWrapper: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  caseType: { fontSize: fontSize.xs, color: colors.text.secondary, textTransform: 'capitalize' },
  caseDate: { fontSize: fontSize.xs, color: colors.text.muted, marginLeft: 'auto' },
  errorWrapper: { padding: spacing.lg },
  emptyText: { fontSize: fontSize.base, color: colors.text.muted, textAlign: 'center', paddingVertical: spacing['3xl'] },
});
