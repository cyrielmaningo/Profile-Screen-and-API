import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import AuthShell from '../../components/AuthShell';
import Notice from '../../components/Notice';
import { Button, TextField } from '../../components/ui';
import { colors, spacing } from '../../theme/theme';

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const submit = () => {
    const clean = email.trim();
    if (!/^\S+@\S+\.\S+$/.test(clean)) {
      setError('Enter the email address connected to your Memento account.');
      return;
    }
    setError('');
    setSent(true);
  };

  return (
    <AuthShell
      eyebrow="Account recovery"
      title="Reset password"
      subtitle="Enter your email to begin account recovery."
    >
      {sent ? (
        <View>
          <Notice
            tone="success"
            title="Recovery request received"
            message={`If an account exists for ${email || 'that address'}, follow the recovery instructions sent to it.`}
          />
          <Button label="Back to Log In" onPress={() => navigation.navigate('Login')} />
        </View>
      ) : (
        <View>
          <TextField
            label="Email"
            icon="mail"
            placeholder="you@example.com"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={(text) => { setEmail(text); setError(''); }}
          />
          {error ? <Notice title="Check your email" message={error} tone="error" /> : null}
          <Button label="Send Recovery Request" onPress={submit} />
          <Pressable onPress={() => navigation.navigate('Login')} style={styles.back}>
            <Text style={styles.link}>Cancel</Text>
          </Pressable>
        </View>
      )}
    </AuthShell>
  );
}

const styles = StyleSheet.create({
  back: { alignSelf: 'center', marginTop: spacing.lg },
  link: { color: colors.primary, fontWeight: '700', fontSize: 15 },
});
