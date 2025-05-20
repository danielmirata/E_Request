import { Link } from "expo-router";
import { 
  Text, 
  View, 
  StyleSheet, 
  ImageBackground, 
  TouchableOpacity,
  StatusBar,
  Image
} from "react-native";

export default function Index() {
  return (
    <ImageBackground 
      source={require('../assets/images/background.jpg')} 
      style={styles.background}
      resizeMode="cover"
    >
      <StatusBar barStyle="light-content" />
      <View style={styles.container}>
        <View style={styles.logoContainer}>
          <Image 
            source={require('../assets/images/logo.png')} 
            style={styles.logo} 
            resizeMode="contain"
          />
          <Text style={styles.title}>Welcome</Text>
          <Text style={styles.subtitle}>Get started with our app</Text>
        </View>
        
        <View style={styles.buttonContainer}>
          <Link href="/login" asChild>
            <TouchableOpacity style={styles.loginButton}>
              <Text style={styles.buttonText1}>Login</Text>
            </TouchableOpacity>
          </Link>
          
          <Link href="/signup" asChild>
          <TouchableOpacity style={styles.signupButton}>
            <Text style={styles.buttonText2}>Sign Up</Text>
          </TouchableOpacity>
          </Link>
        </View>
        
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            By continuing, you agree to our Terms of Service and Privacy Policy
          </Text>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  container: { 
    flex: 1,
    justifyContent: "center",
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
    marginBottom: 60,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#800000',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  buttonContainer: {
    marginBottom: 40,
    gap: 16,
  },
  loginButton: {
    backgroundColor: '#800000',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
  },
  signupButton: {
    backgroundColor: '#ffffff',
    borderColor: '#800000',
    borderWidth: 2,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
  },
  buttonText1: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },

  buttonText2: {
    color: '#800000',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  footerText: {
    color: '#666',
    textAlign: 'center',
    fontSize: 12,
  },
});