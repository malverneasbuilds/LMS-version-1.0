import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { router, Redirect } from 'expo-router';
import { KeyRound, Mail, User } from 'lucide-react-native';
import { Text } from '@/components/typography/Text';
import { TextField } from '@/components/inputs/TextField';
import { Button } from '@/components/ui/Button';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { Header } from '@/components/layout/Header';
import { useAuth } from '@/contexts/AuthContext';
import Colors from '@/constants/Colors';

export default function SignupScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signUp, user } = useAuth();

  // Redirect if already logged in
  if (user) {
    return <Redirect href="/(tabs)" />;
  }

  const handleSignup = async () => {
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError('');
    
    const { error } = await signUp(email, password, name);
    
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.replace('/(tabs)');
    }
  };

  return (
    <ScreenContainer backgroundColor={Colors.white}>
      <Header title="Create Account" showBackButton onBackPress={() => router.back()} />

      <View style={styles.formContainer}>
        <Text variant="h4" weight="bold" style={styles.title}>
          Join LiveStock
        </Text>
        <Text variant="body" color="neutral.600" style={styles.subtitle}>
          Create your account to start managing your livestock
        </Text>

        <TextField
          label="Full Name"
          placeholder="Enter your full name"
          value={name}
          onChangeText={setName}
          startIcon={<User size={20} color={Colors.neutral[500]} />}
          containerStyle={styles.inputContainer}
          error={error && name === '' ? 'Name is required' : ''}
        />

        <TextField
          label="Email"
          placeholder="Enter your email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          startIcon={<Mail size={20} color={Colors.neutral[500]} />}
          containerStyle={styles.inputContainer}
          error={error && email === '' ? 'Email is required' : ''}
        />

        <TextField
          label="Password"
          placeholder="Create a password"
          value={password}
          onChangeText={setPassword}
          isPassword
          startIcon={<KeyRound size={20} color={Colors.neutral[500]} />}
          containerStyle={styles.inputContainer}
          error={error && password === '' ? 'Password is required' : ''}
        />

        <TextField
          label="Confirm Password"
          placeholder="Confirm your password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          isPassword
          startIcon={<KeyRound size={20} color={Colors.neutral[500]} />}
          containerStyle={styles.inputContainer}
          error={password !== confirmPassword ? 'Passwords do not match' : ''}
        />

        {error && (
          <View style={styles.errorContainer}>
            <Text variant="body2" color="error.500">
              {error}
            </Text>
          </View>
        )}

        <Button
          variant="primary"
          fullWidth
          loading={loading}
          style={styles.signupButton}
          onPress={handleSignup}
        >
          Create Account
        </Button>

        <View style={styles.loginContainer}>
          <Text variant="body2" color="neutral.600">
            Already have an account?{' '}
          </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
            <Text variant="body2" weight="bold" color="primary.600">
              Login
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  formContainer: {
    padding: 24,
  },
  title: {
    marginBottom: 8,
  },
  subtitle: {
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 16,
  },
  signupButton: {
    marginTop: 8,
    marginBottom: 24,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  errorContainer: {
    marginBottom: 16,
  },
});