import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import AuthShell from '../../components/AuthShell';
import Notice from '../../components/Notice';
import { Button, TextField } from '../../components/ui';
import { useApp } from '../../store/AppContext';
import { colors, spacing } from '../../theme/theme';

export default function RegisterScreen({ navigation }) {
  const { register, authLoading, authError } = useApp();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [validationError, setValidationError] = useState('');

  const handleSubmit = () => {
    const cleanName = name.trim();
    const cleanEmail = email.trim();
    if (!cleanName || !cleanEmail || !password) {
      setValidationError('Complete your name, email, and password to create an account.');
      return;
    }
    if (!cleanName.includes(' ')) {
      setValidationError('Please enter both your first and last name.');
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(cleanEmail)) {
      setValidationError('Enter a valid email address, such as name@example.com.');
      return;
    }
    if (password.length < 8) {
      setValidationError('Create a password with at least 8 characters.');
      return;
    }
    setValidationError('');
    register(cleanName, cleanEmail, password);
  };

  return (
    <AuthShell
      eyebrow="Get started"
      title="Create your account"
      subtitle="One family account can hold separate memorial profiles for multiple deceased loved ones."
    >
      <TextField
        label="Full name"
        icon="user"
        placeholder="Sarah Bennett"
        value={name}
        onChangeText={(text) => { setName(text); setValidationError(''); }}
      />
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
        placeholder="Create a password"
        secureTextEntry
        hint="At least 8 characters."
        value={password}
        onChangeText={(text) => { setPassword(text); setValidationError(''); }}
      />

      {validationError ? (
        <Notice title="Check your details" message={validationError} tone="error" />
      ) : authError ? (
        <Notice title="Account not created" message={authError} tone="error" />
      ) : null}

      <Button
        label="Create Account"
        onPress={handleSubmit}
        disabled={authLoading}
        loading={authLoading}
      />

      <View style={styles.footer}>
        <Text style={styles.muted}>Already have an account? </Text>
        <Pressable onPress={() => navigation.navigate('Login')}>
          <Text style={styles.link}>Log in</Text>
        </Pressable>
      </View>
    </AuthShell>
  );
}

const styles = StyleSheet.create({
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.lg },
  muted: { color: colors.inkMuted, fontSize: 15 },
  link: { color: colors.primary, fontWeight: '700', fontSize: 15 },
});
