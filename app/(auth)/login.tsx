import React, { useState } from 'react';
import { StyleSheet, View, Image, TouchableOpacity } from 'react-native';
import { router, Redirect } from 'expo-router';
import { KeyRound, Mail } from 'lucide-react-native';
import { Text } from '@/components/typography/Text';
import { TextField } from '@/components/inputs/TextField';
import { Button } from '@/components/ui/Button';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { useAuth } from '@/contexts/AuthContext';
import Colors from '@/constants/Colors';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signIn, user } = useAuth();

  // Redirect if already logged in
  if (user) {
    return <Redirect href="/(tabs)" />;
  }

  const handleLogin = async () => {
    setLoading(true);
    setError('');
    
    const { error } = await signIn(email, password);
    
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.replace('/(tabs)');
    }
  };

  return (
    <ScreenContainer backgroundColor={Colors.white} style={styles.container}>
      <View style={styles.logoContainer}>
        <Image
          source={{ uri: 'https://images.pexels.com/photos/2182919/pexels-photo-2182919.jpeg' }}
          style={styles.logoBackground}
        />
        <View style={styles.overlay} />
        <Text variant="h1" weight="bold" color="white" style={styles.appName}>
          LiveStock
        </Text>
        <Text variant="body" color="white" style={styles.appTagline}>
          Smart Livestock Management
        </Text>
      </View>

      <View style={styles.formContainer}>
        <Text variant="h4" weight="bold" style={styles.title}>
          Welcome Back
        </Text>
        <Text variant="body" color="neutral.600" style={styles.subtitle}>
          Login to continue managing your livestock
        </Text>

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
          placeholder="Enter your password"
          value={password}
          onChangeText={setPassword}
          isPassword
          startIcon={<KeyRound size={20} color={Colors.neutral[500]} />}
          containerStyle={styles.inputContainer}
          error={error && password === '' ? 'Password is required' : ''}
        />

        {error && (
          <View style={styles.errorContainer}>
            <Text variant="body2" color="error.500">
              {error}
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={styles.forgotPasswordContainer}
          onPress={() => router.push('/(auth)/forgot-password')}
        >
          <Text variant="body2" color="primary.600">
            Forgot Password?
          </Text>
        </TouchableOpacity>

        <Button
          variant="primary"
          fullWidth
          loading={loading}
          style={styles.loginButton}
          onPress={handleLogin}
        >
          Login
        </Button>

        <View style={styles.signupContainer}>
          <Text variant="body2" color="neutral.600">
            Don't have an account?{' '}
          </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/signup')}>
            <Text variant="body2" weight="bold" color="primary.600">
              Sign Up
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  logoContainer: {
    height: 240,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  logoBackground: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  appName: {
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  appTagline: {
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
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
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  loginButton: {
    marginBottom: 24,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  errorContainer: {
    marginBottom: 16,
  },
});