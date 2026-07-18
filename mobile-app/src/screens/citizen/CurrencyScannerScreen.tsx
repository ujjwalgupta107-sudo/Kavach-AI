import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../../components/ui/Card';
import { apiClient } from '../../services/api/client';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../../constants/theme';

export function CurrencyScannerScreen() {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<any>(null);

  const simulateScan = async () => {
    setScanning(true);
    setResult(null);
    try {
      // Simulate API call to our new mock endpoint
      const response = await apiClient.post<any>('/api/v1/analysis/counterfeit');
      setResult(response);
    } catch (error) {
      Alert.alert('Error', 'Failed to connect to scanner service.');
    } finally {
      setScanning(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerBox}>
        <Text style={styles.title}>Currency Scanner</Text>
        <Text style={styles.subtitle}>
          Scan Indian Currency Notes (FICN) to instantly detect counterfeits using computer vision and AI.
        </Text>
      </View>

      {!result ? (
        <Card style={styles.scanCard}>
          {scanning ? (
            <View style={styles.scanningBox}>
              <ActivityIndicator size="large" color={colors.brand.cyan} />
              <Text style={styles.scanningText}>Analyzing microprints & UV features...</Text>
            </View>
          ) : (
            <View style={styles.idleBox}>
              <View style={styles.cameraIconBox}>
                <Ionicons name="camera" size={40} color={colors.text.muted} />
              </View>
              <Text style={styles.instructionTitle}>Place note in frame</Text>
              <Text style={styles.instructionSubtitle}>
                Ensure good lighting and keep the note flat to analyze the security thread and watermark.
              </Text>
              
              <TouchableOpacity
                onPress={simulateScan}
                style={styles.scanBtn}
              >
                <Ionicons name="scan" size={20} color="#0F172A" style={{ marginRight: spacing.sm }} />
                <Text style={styles.scanBtnText}>Start AI Scan</Text>
              </TouchableOpacity>
            </View>
          )}
        </Card>
      ) : (
        <Card style={styles.resultCard}>
          <View style={styles.resultHeader}>
            <Ionicons name="warning" size={28} color={colors.status.critical} style={{ marginRight: 12 }} />
            <View>
              <Text style={styles.resultStatusText}>{result.status}</Text>
              <Text style={styles.resultConfidenceText}>Confidence: {(result.confidence * 100).toFixed(1)}%</Text>
            </View>
          </View>
          
          <Text style={styles.anomaliesTitle}>Detected Anomalies:</Text>
          <View style={styles.anomaliesBox}>
            {result.details.map((detail: string, index: number) => (
              <View key={index} style={styles.anomalyItem}>
                <Text style={styles.bulletPoint}>•</Text>
                <Text style={styles.anomalyText}>{detail}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.recommendedTitle}>Recommended Action:</Text>
          <View style={styles.recommendedBox}>
            <Text style={styles.recommendedText}>{result.action_required}</Text>
          </View>

          <TouchableOpacity
            onPress={() => setResult(null)}
            style={styles.scanAnotherBtn}
          >
            <Text style={styles.scanAnotherText}>Scan Another Note</Text>
          </TouchableOpacity>
        </Card>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface.base,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
  },
  headerBox: {
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: 28, // approximation of text-3xl
    fontWeight: fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    color: colors.text.secondary,
    fontSize: fontSize.base,
  },
  scanCard: {
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: 'rgba(24, 24, 27, 0.5)', // bg-surface-elevated/50
    borderColor: colors.surface.raised,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  scanningBox: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  scanningText: {
    color: colors.brand.cyan,
    marginTop: spacing.md,
    fontWeight: '500',
  },
  idleBox: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  cameraIconBox: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.surface.raised,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  instructionTitle: {
    color: colors.text.primary,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  instructionSubtitle: {
    color: colors.text.muted,
    textAlign: 'center',
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  scanBtn: {
    backgroundColor: colors.brand.cyan,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.full,
    flexDirection: 'row',
    alignItems: 'center',
  },
  scanBtnText: {
    color: '#0F172A',
    fontWeight: 'bold',
  },
  resultCard: {
    padding: spacing.lg,
    backgroundColor: 'rgba(24, 24, 27, 0.8)', // bg-surface-elevated/80
    borderColor: 'rgba(244, 63, 94, 0.3)', // border-status-critical/30
    borderWidth: 1,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.surface.raised,
    paddingBottom: spacing.md,
  },
  resultStatusText: {
    color: colors.status.critical,
    fontSize: fontSize.xl,
    fontWeight: 'bold',
  },
  resultConfidenceText: {
    color: colors.text.secondary,
  },
  anomaliesTitle: {
    color: colors.text.primary,
    fontWeight: '600',
    marginBottom: spacing.md,
    fontSize: fontSize.lg,
  },
  anomaliesBox: {
    backgroundColor: 'rgba(39, 39, 42, 0.3)', // bg-surface-raised/30
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  anomalyItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  bulletPoint: {
    color: colors.status.critical,
    marginRight: spacing.sm,
  },
  anomalyText: {
    color: colors.text.secondary,
    flex: 1,
  },
  recommendedTitle: {
    color: colors.text.primary,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  recommendedBox: {
    backgroundColor: 'rgba(244, 63, 94, 0.1)', // bg-status-critical/10
    borderWidth: 1,
    borderColor: 'rgba(244, 63, 94, 0.3)', // border-status-critical/30
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  recommendedText: {
    color: colors.status.critical,
    fontWeight: '500',
  },
  scanAnotherBtn: {
    borderWidth: 1,
    borderColor: colors.surface.raised,
    paddingVertical: 12,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  scanAnotherText: {
    color: colors.text.primary,
    fontWeight: '500',
  },
});
