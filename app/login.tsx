import { Ionicons } from '@expo/vector-icons';
import { router } from "expo-router";
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { authAPI } from '../api/auth';

// Remove BASE_URL from here, since authAPI uses config

export default function LoginScreen() {
  const [email, setEmail] = useState(''); // Changed from username to email
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const validateInputs = () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email');
      return false;
    }
    if (!password.trim()) {
      Alert.alert('Error', 'Please enter your password');
      return false;
    }
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return false;
    }
    return true;
  };

  const handleLogin = async () => {
    if (!validateInputs()) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await authAPI.login({
        email: email.trim(), // Changed from username to email
        password: password.trim()
      });

      if (response.status === 'success') { // Changed from response.success
        Alert.alert('Success', 'Login successful!');
        router.push('/homepage');
      } else {
        Alert.alert('Error', response.message || 'Invalid email or password');
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Error', 'Failed to connect to the server. Please check your internet connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  return (
    <ImageBackground
      source={Platform.select({
        web: { uri: '/assets/images/background.jpg' },
        default: require('@/assets/images/background.jpg')
      })}
      style={styles.background}
      resizeMode="cover"
    >
      <StatusBar barStyle="light-content" />
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: 'padding', android: 'height', default: undefined })}
        style={styles.keyboardAvoid}
      >
        <View style={styles.container}>
          <View style={styles.logoContainer}>
            <Image
              source={Platform.select({
                web: { uri: '/assets/images/logo.png' },
                default: require('@/assets/images/logo.png')
              })}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to continue</Text>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                placeholderTextColor="#888"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                editable={!isLoading}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Enter your password"
                  placeholderTextColor="#888"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!isPasswordVisible}
                  autoCapitalize="none"
                  editable={!isLoading}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={togglePasswordVisibility}
                  disabled={isLoading}
                >
                  <Ionicons
                    name={isPasswordVisible ? "eye-off" : "eye"}
                    size={24}
                    color="#666"
                  />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity style={styles.forgotPassword}>
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.loginButton,
                (!email || !password) && styles.loginButtonDisabled
              ]}
              onPress={handleLogin}
              disabled={!email || !password || isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.loginButtonText}>Sign In</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Don't have an account?
              <Text style={styles.signupText} onPress={() => router.push('/signup')}> Sign Up</Text>
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: "black",
  },
  keyboardAvoid: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: 'rgba(250, 241, 241, 0.9)',
    margin: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    color: "#800000",
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  formContainer: {
    marginBottom: 30,
    width: '100%',
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#444',
  },
  input: {
    height: 52,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
  },
  passwordInput: {
    flex: 1,
    height: 52,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  eyeIcon: {
    padding: 12,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: '#3498db',
    fontSize: 14,
  },
  loginButton: {
    backgroundColor: '#800000',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    width: '100%',
  },
  loginButtonDisabled: {
    backgroundColor: '#a0cdf3',
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    color: '#666',
  },
  signupText: {
    color: '#3498db',
    fontWeight: '600',
  },
  text: {
    color: "white"
  }
});