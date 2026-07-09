import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform,
  TouchableOpacity,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { API_BASE_URL } from '../../services/api/client';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../../constants/theme';
import { AuthStackParamList } from '../../navigation/AuthStack';

type RegisterNavProp = NativeStackNavigationProp<AuthStackParamList, 'Register'>;

export function RegisterScreen() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'CITIZEN' | 'INVESTIGATOR'>('CITIZEN');
  const [investigatorCode, setInvestigatorCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation<RegisterNavProp>();

  const handleSubmit = async () => {
    setError(null);

    if (!fullName.trim() || !email.trim() || !password.trim()) {
      setError('All fields are required.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          full_name: fullName,
          password,
          role,
          ...(role === 'INVESTIGATOR' && { investigator_code: investigatorCode }),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || errorData.detail || 'Registration failed');
      }

      navigation.navigate('Login');
    } catch (err: any) {
      setError(err.message || 'An error occurred during registration.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Card style={styles.card}>
          <View style={styles.cardInner}>
            <Text style={styles.title}>Create KAVACH Account</Text>

            {error && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <View style={styles.form}>
              <Input
                label="Full Name"
                placeholder="Enter your name"
                value={fullName}
                onChangeText={setFullName}
              />

              <Input
                label="Email"
                placeholder="Enter your email"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                autoCorrect={false}
              />

              <Input
                label="Password"
                placeholder="••••••••"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />

              <Input
                label="Confirm Password"
                placeholder="••••••••"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
              />

              {/* Role selector */}
              <View>
                <Text style={styles.label}>Account Type</Text>
                <View style={styles.roleRow}>
                  <TouchableOpacity
                    style={[styles.roleBtn, role === 'CITIZEN' && styles.roleBtnActive]}
                    onPress={() => setRole('CITIZEN')}
                  >
                    <Text style={[styles.roleBtnText, role === 'CITIZEN' && styles.roleBtnTextActive]}>
                      🛡️ Citizen
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.roleBtn, role === 'INVESTIGATOR' && styles.roleBtnActive]}
                    onPress={() => setRole('INVESTIGATOR')}
                  >
                    <Text style={[styles.roleBtnText, role === 'INVESTIGATOR' && styles.roleBtnTextActive]}>
                      🔍 Investigator
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {role === 'INVESTIGATOR' && (
                <Input
                  label="Authorization Code"
                  placeholder="Enter access code"
                  value={investigatorCode}
                  onChangeText={setInvestigatorCode}
                />
              )}

              <Button onPress={handleSubmit} loading={loading} style={styles.submitButton}>
                {loading ? 'Registering...' : 'Register'}
              </Button>
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.footerLink}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface.base,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.xl,
  },
  card: {
    backgroundColor: 'rgba(30, 41, 59, 0.7)',
  },
  cardInner: {
    padding: spacing['2xl'],
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing['2xl'],
  },
  errorBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.5)',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  errorText: {
    fontSize: fontSize.sm,
    color: colors.status.critical,
  },
  form: {
    gap: spacing.lg,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.text.secondary,
    marginBottom: 6,
  },
  roleRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  roleBtn: {
    flex: 1,
    height: 44,
    backgroundColor: colors.surface.base,
    borderWidth: 1,
    borderColor: colors.surface.raised,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  roleBtnActive: {
    borderColor: colors.brand.cyan,
    backgroundColor: 'rgba(6, 182, 212, 0.1)',
  },
  roleBtnText: {
    fontSize: fontSize.sm,
    color: colors.text.secondary,
    fontWeight: fontWeight.medium,
  },
  roleBtnTextActive: {
    color: colors.brand.cyan,
  },
  submitButton: {
    marginTop: spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing['2xl'],
  },
  footerText: {
    fontSize: fontSize.sm,
    color: colors.text.secondary,
  },
  footerLink: {
    fontSize: fontSize.sm,
    color: colors.brand.cyan,
    fontWeight: fontWeight.medium,
  },
});
