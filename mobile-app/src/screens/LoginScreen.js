import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useAuth } from '../context/AuthContext';
import * as Haptics from 'expo-haptics';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [focusedField, setFocusedField] = useState(null); // 'email' or 'password'
  const { login, loading } = useAuth();

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Validation Error', 'Please fill in all fields.');
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const result = await login(email.trim(), password);
    if (result.success) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Authentication Failed', result.error || 'Check email or password.');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      {/* Decorative Glow Blobs */}
      <View style={[styles.glowBlob, styles.blobCyan]} />
      <View style={[styles.glowBlob, styles.blobPurple]} />

      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <View style={styles.logoContainer}>
          <View style={styles.iconWrapper}>
            <MaterialCommunityIcons name="shield-key" size={54} color="#00F2FE" />
          </View>
          <Text style={styles.title}>KAVACH <Text style={styles.glowText}>AI</Text></Text>
          <Text style={styles.subtitle}>Citizen Protection & Fraud Intelligence</Text>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.inputLabel}>Email Address</Text>
          <View style={[
            styles.inputWrapper, 
            focusedField === 'email' && styles.inputWrapperFocused
          ]}>
            <MaterialCommunityIcons 
              name="email-outline" 
              size={20} 
              color={focusedField === 'email' ? '#00F2FE' : '#64748B'} 
              style={styles.inputIcon} 
            />
            <TextInput
              style={styles.input}
              placeholder="name@kavach.ai"
              placeholderTextColor="#475569"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              value={email}
              onChangeText={setEmail}
              onFocus={() => setFocusedField('email')}
              onBlur={() => setFocusedField(null)}
            />
          </View>

          <Text style={styles.inputLabel}>Password</Text>
          <View style={[
            styles.inputWrapper, 
            focusedField === 'password' && styles.inputWrapperFocused
          ]}>
            <MaterialCommunityIcons 
              name="lock-outline" 
              size={20} 
              color={focusedField === 'password' ? '#00F2FE' : '#64748B'} 
              style={styles.inputIcon} 
            />
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor="#475569"
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              value={password}
              onChangeText={setPassword}
              onFocus={() => setFocusedField('password')}
              onBlur={() => setFocusedField(null)}
            />
          </View>

          <TouchableOpacity style={styles.loginButton} onPress={handleLogin} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.loginButtonText}>AUTHENTICATE SECURE SESSION</Text>
            )}
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>New to KAVACH Shield?</Text>
            <TouchableOpacity onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              navigation.navigate('Register');
            }}>
              <Text style={styles.registerText}>Create Account</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#040814', // Ultra deep obsidian blue space
  },
  glowBlob: {
    position: 'absolute',
    borderRadius: 150,
    opacity: 0.04,
  },
  blobCyan: {
    width: 250,
    height: 250,
    backgroundColor: '#00F2FE',
    top: -50,
    right: -50,
  },
  blobPurple: {
    width: 300,
    height: 300,
    backgroundColor: '#A855F7',
    bottom: -80,
    left: -80,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconWrapper: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(0, 242, 254, 0.03)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(0, 242, 254, 0.2)',
    marginBottom: 20,
    shadowColor: '#00F2FE',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  title: {
    fontSize: 30,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 1.5,
  },
  glowText: {
    color: '#00F2FE',
    textShadowColor: 'rgba(0, 242, 254, 0.8)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  subtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 8,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  formContainer: {
    backgroundColor: 'rgba(11, 19, 43, 0.6)', // Glassmorphism container fill
    padding: 26,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(30, 41, 59, 0.8)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
  inputLabel: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '800',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#020617',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#1E293B',
    marginBottom: 22,
    paddingHorizontal: 14,
    height: 52,
  },
  inputWrapperFocused: {
    borderColor: '#00F2FE',
    shadowColor: '#00F2FE',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: '100%',
    color: '#fff',
    fontSize: 15,
    fontWeight: '500',
  },
  loginButton: {
    backgroundColor: '#0284C7',
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#0284C7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  loginButtonText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 13,
    letterSpacing: 0.8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 22,
  },
  footerText: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '500',
  },
  registerText: {
    color: '#00F2FE',
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 6,
    textShadowColor: 'rgba(0, 242, 254, 0.4)',
    textShadowRadius: 4,
  },
});
