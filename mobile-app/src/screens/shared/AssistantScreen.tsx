import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useAuthStore } from '../../stores/authStore';
import { apiClient } from '../../services/api/client';
import { colors, spacing, fontSize, fontWeight, borderRadius, shadows } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { ChatMessage } from '../../types';

export function AssistantScreen() {
  const { user, language } = useAuthStore();
  const isCitizen = user?.role === 'CITIZEN';
  const insets = useSafeAreaInsets();
  
  const bottomPadding = Math.max(insets.bottom, 16) + 74;

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: isCitizen
        ? 'Hello Citizen. I am the KAVACH AI assistant. I can guide you on reporting scams and staying safe. How can I help?'
        : 'Hello Investigator. I am the KAVACH AI assistant. I have access to all cases, entity graphs, and live alerts. How can I assist you today?',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (flatListRef.current && messages.length > 0) {
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { id: Date.now().toString() + Math.random().toString(36), role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      const data = await apiClient.post<any>('/api/v1/assistant/chat', { message: userMsg, language });
      setMessages(prev => [...prev, { id: Date.now().toString() + Math.random().toString(36), role: 'assistant', content: data.reply }]);
    } catch (error) {
      setMessages(prev => [
        ...prev,
        { id: Date.now().toString() + Math.random().toString(36), role: 'assistant', content: 'Connection Error: Could not reach the assistant service.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isUser = item.role === 'user';
    return (
      <View style={[styles.msgRow, isUser && styles.msgRowUser]}>
        <View style={[styles.avatar, isUser ? styles.avatarUser : styles.avatarBot]}>
          <Ionicons
            name={isUser ? 'person' : 'hardware-chip'}
            size={18}
            color={isUser ? colors.white : colors.brand.cyan}
          />
        </View>
        <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleBot, !isUser && (shadows.glow('rgba(56, 189, 248, 0.05)') as any)]}>
          <Text style={[styles.msgText, isUser && styles.msgTextUser]}>{item.content}</Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <Ionicons name="sparkles" size={24} color={colors.brand.cyan} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>KAVACH AI Assistant</Text>
          <Text style={styles.headerSubtitle}>
            {isCitizen ? 'Your safety companion.' : 'Your intelligent investigation partner.'}
          </Text>
        </View>
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.messageList}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={
          loading ? (
            <View style={[styles.msgRow]}>
              <View style={[styles.avatar, styles.avatarBot]}>
                <Ionicons name="hardware-chip" size={18} color={colors.brand.cyan} />
              </View>
              <View style={[styles.bubble, styles.bubbleBot, styles.typingBubble]}>
                <View style={styles.typingDots}>
                  {[0, 1, 2].map(i => (
                    <View key={i} style={styles.dot} />
                  ))}
                </View>
              </View>
            </View>
          ) : null
        }
      />

      {/* Input */}
      <View style={styles.inputBar}>
        <TextInput
          style={styles.textInput}
          value={input}
          onChangeText={setInput}
          placeholder="Ask about cases, entities, or safety..."
          placeholderTextColor={colors.text.muted}
          editable={!loading}
          returnKeyType="send"
          onSubmitEditing={handleSend}
        />
        <TouchableOpacity
          style={[styles.sendBtn, (!input.trim() || loading) && styles.sendBtnDisabled]}
          onPress={handleSend}
          disabled={!input.trim() || loading}
        >
          <Ionicons name="send" size={20} color={colors.white} />
        </TouchableOpacity>
      </View>
      <Text style={[styles.disclaimer, { paddingBottom: bottomPadding }]}>AI Assistant can make mistakes. Verify critical intelligence.</Text>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface.base },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingTop: Platform.OS === 'ios' ? 56 : 40,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.surface.raised,
    backgroundColor: 'rgba(9, 9, 11, 0.95)',
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(6, 182, 212, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.3)',
  },
  headerTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.text.primary, letterSpacing: 0.5 },
  headerSubtitle: { fontSize: fontSize.sm, color: colors.text.secondary },
  messageList: { padding: spacing.lg, paddingBottom: spacing.xl },
  msgRow: { flexDirection: 'row', alignItems: 'flex-end', gap: spacing.md, marginBottom: spacing.lg, maxWidth: '85%' },
  msgRowUser: { alignSelf: 'flex-end', flexDirection: 'row-reverse' },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  avatarUser: { backgroundColor: colors.brand.blue, borderColor: colors.brand.blue },
  avatarBot: {
    backgroundColor: 'rgba(6, 182, 212, 0.1)',
    borderColor: 'rgba(6, 182, 212, 0.3)',
  },
  bubble: {
    maxWidth: '85%',
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
  },
  bubbleUser: {
    backgroundColor: colors.brand.blue,
    borderBottomRightRadius: 4,
  },
  bubbleBot: {
    backgroundColor: 'rgba(24, 24, 27, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    borderBottomLeftRadius: 4,
  },
  msgText: { fontSize: fontSize.base, color: colors.text.primary, lineHeight: 24 },
  msgTextUser: { color: colors.white },
  typingBubble: { paddingVertical: spacing.lg, paddingHorizontal: spacing.xl },
  typingDots: { flexDirection: 'row', gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.brand.cyan, opacity: 0.6 },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface.base,
    borderTopWidth: 1,
    borderTopColor: colors.surface.raised,
  },
  textInput: {
    flex: 1,
    height: 48,
    backgroundColor: 'rgba(24, 24, 27, 0.5)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.lg,
    fontSize: fontSize.base,
    color: colors.text.primary,
  },
  sendBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.brand.blue,
    justifyContent: 'center',
    alignItems: 'center',
    ...(shadows.glow('rgba(59, 130, 246, 0.4)') as any),
  },
  sendBtnDisabled: { opacity: 0.5 },
  disclaimer: {
    fontSize: fontSize.xs,
    color: colors.text.muted,
    textAlign: 'center',
    paddingBottom: Platform.OS === 'ios' ? 24 : 8,
    paddingTop: 4,
    backgroundColor: colors.surface.base,
  },
});
