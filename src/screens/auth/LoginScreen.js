import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import AuthShell from '../../components/AuthShell';
import Notice from '../../components/Notice';
import { Button, TextField } from '../../components/ui';
import { useApp } from '../../store/AppContext';
import { colors, spacing } from '../../theme/theme';

export default function LoginScreen({ navigation }) {
  const { login, authLoading, authError } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [validationError, setValidationError] = useState('');

  const handleSubmit = () => {
    const cleanEmail = email.trim();
    if (!cleanEmail || !password) {
      setValidationError('Enter the email address and password for your Memento account.');
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(cleanEmail)) {
      setValidationError('That email address does not look valid. Check it and try again.');
      return;
    }
    setValidationError('');
    login(cleanEmail, password);
  };

  return (
    <AuthShell
      eyebrow="Your account"
      title="Welcome back"
      subtitle="Sign in, then choose the loved one whose memorial you want to manage."
    >
      <TextField
        label="Email"
        icon="mail"
        placeholder="you@example.com"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={(text) => { setEmail(text); setValidationError(''); }}
      />
      <TextField
        label="Password"
        icon="lock"
        placeholder="Enter your password"
        secureTextEntry
        value={password}
        onChangeText={(text) => { setPassword(text); setValidationError(''); }}
      />
      <Pressable onPress={() => navigation.navigate('Forgot')} style={styles.forgot}>
        <Text style={styles.forgotText}>Forgot password?</Text>
      </Pressable>

      {validationError ? (
        <Notice title="Check your sign-in details" message={validationError} tone="error" />
      ) : authError ? (
        <Notice title="Sign-in failed" message={authError} tone="error" />
      ) : null}

      <Button label="Log In" onPress={handleSubmit} disabled={authLoading} loading={authLoading} />

      <View style={styles.footer}>
        <Text style={styles.muted}>New to Memento? </Text>
        <Pressable onPress={() => navigation.navigate('Register')}>
          <Text style={styles.link}>Create an account</Text>
        </Pressable>
      </View>
    </AuthShell>
  );
}

const styles = StyleSheet.create({
  forgot: { alignSelf: 'flex-end', marginBottom: spacing.lg },
  forgotText: { color: colors.primary, fontWeight: '600', fontSize: 14 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.lg },
  muted: { color: colors.inkMuted, fontSize: 15 },
  link: { color: colors.primary, fontWeight: '700', fontSize: 15 },
});
