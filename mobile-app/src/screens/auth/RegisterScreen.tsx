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
import { Ionicons } from '@expo/vector-icons';

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
          email: email.trim().toLowerCase(),
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
        <Card style={styles.card} variant="glow">
          <View style={styles.cardInner}>
            <View style={styles.header}>
               <Ionicons name="person-add-outline" size={32} color={colors.brand.cyan} />
               <Text style={styles.title}>Create Account</Text>
            </View>
            <Text style={styles.subtitle}>Join KAVACH to start your journey</Text>

            {error && (
              <View style={styles.errorBox}>
                <Ionicons name="warning" size={16} color={colors.status.critical} style={{ marginRight: 8 }} />
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
                    <Ionicons name="shield-outline" size={18} color={role === 'CITIZEN' ? colors.brand.cyan : colors.text.secondary} style={{ marginRight: 6 }}/>
                    <Text style={[styles.roleBtnText, role === 'CITIZEN' && styles.roleBtnTextActive]}>
                      Citizen
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.roleBtn, role === 'INVESTIGATOR' && styles.roleBtnActive]}
                    onPress={() => setRole('INVESTIGATOR')}
                  >
                    <Ionicons name="search-outline" size={18} color={role === 'INVESTIGATOR' ? colors.brand.cyan : colors.text.secondary} style={{ marginRight: 6 }}/>
                    <Text style={[styles.roleBtnText, role === 'INVESTIGATOR' && styles.roleBtnTextActive]}>
                      Investigator
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

              <Button onPress={handleSubmit} loading={loading} style={styles.submitButton} size="lg">
                {loading ? 'Registering...' : 'Register Account'}
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
    paddingVertical: spacing['4xl'],
  },
  card: {
    backgroundColor: 'rgba(24, 24, 27, 0.8)',
  },
  cardInner: {
    padding: spacing['2xl'],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  title: {
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.bold,
    color: colors.text.primary,
    marginLeft: spacing.sm,
  },
  subtitle: {
    fontSize: fontSize.sm,
    color: colors.text.muted,
    textAlign: 'center',
    marginBottom: spacing['2xl'],
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(244, 63, 94, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(244, 63, 94, 0.3)',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  errorText: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.status.critical,
  },
  form: {
    gap: spacing.lg,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: '500',
    color: colors.text.secondary,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  roleRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  roleBtn: {
    flex: 1,
    height: 48,
    flexDirection: 'row',
    backgroundColor: 'rgba(24, 24, 27, 0.5)',
    borderWidth: 1,
    borderColor: colors.surface.raised,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  roleBtnActive: {
    borderColor: colors.brand.cyan,
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
  },
  roleBtnText: {
    fontSize: fontSize.sm,
    color: colors.text.secondary,
    fontWeight: fontWeight.bold,
  },
  roleBtnTextActive: {
    color: colors.brand.cyan,
  },
  submitButton: {
    marginTop: spacing.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing['3xl'],
  },
  footerText: {
    fontSize: fontSize.sm,
    color: colors.text.secondary,
  },
  footerLink: {
    fontSize: fontSize.sm,
    color: colors.brand.cyan,
    fontWeight: fontWeight.bold,
  },
});
