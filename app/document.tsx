import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Image, 
  ImageBackground,
  StatusBar 
} from 'react-native';
import { Link } from "expo-router";

const App = () => {
  return (
    <ImageBackground 
      source={require('../assets/images/background.jpg')} 
      style={styles.background}
      resizeMode="cover"
    >
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
          <View style={styles.logoContainer}>
            <Image 
              source={require('../assets/images/logo.png')} 
              style={styles.logo}
              resizeMode="contain" 
            />
            <Text style={styles.title}>Documents</Text>
            <Text style={styles.subtitle}>View and Track Request Documents</Text>
          </View>
          
          <View style={styles.buttonContainer}>
            <Link href="/trackdocs" asChild>
              <TouchableOpacity style={styles.primaryButton}>
                <Text style={styles.primaryButtonText}>View Request Docs</Text>
              </TouchableOpacity>
            </Link>
            
            <Link href="/trackcomp" asChild>
              <TouchableOpacity style={styles.secondaryButton}>
                <Text style={styles.secondaryButtonText}>View Complain</Text>
              </TouchableOpacity>
            </Link>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Contact Information</Text>
            <Text style={styles.infoText}>Need assistance? Contact your barangay office.</Text>
            <Text style={styles.infoText}>Operating Hours: 8:00 AM - 5:00 PM</Text>
            <Text style={styles.infoText}>Monday-Saturday</Text>
            <Text style={styles.infoText}>Contact: 09876543211</Text>
          </View>
          
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              By continuing, you agree to our Terms of Service and Privacy Policy
            </Text>
          </View>
        </View>
      </ScrollView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 16,
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
    marginBottom: 40,
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
    marginBottom: 30,
    gap: 16,
  },
  primaryButton: {
    backgroundColor: '#800000',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
  },
  secondaryButton: {
    backgroundColor: '#ffffff',
    borderColor: '#800000',
    borderWidth: 2,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: '#800000',
    fontSize: 16,
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 10,
    padding: 20,
    marginBottom: 30,
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#800000',
    marginBottom: 10,
    textAlign: 'center',
  },
  infoText: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
    textAlign: 'center',
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

export default App;