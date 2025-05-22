import { Ionicons } from '@expo/vector-icons';
import { Link } from "expo-router";
import React, { useState } from 'react';
import {
  Animated,
  Image,
  ImageBackground,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

const HomePage = () => {
  // Using a hardcoded default value and useState instead of getting data from a backend
  const [userName] = useState("DANIEL");
  const [showHeader, setShowHeader] = useState(false);
  const [headerHeight] = useState(new Animated.Value(0));

  const toggleHeader = () => {
    setShowHeader(!showHeader);
    Animated.timing(headerHeight, {
      toValue: showHeader ? 0 : 1,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  return (
    <ImageBackground
      source={require('../assets/images/background.jpg')}
      style={styles.background}
      resizeMode="cover"
    >
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <Animated.View style={[
          styles.header,
          {
            height: headerHeight.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 60]
            }),
            opacity: headerHeight
          }
        ]}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Cantil E-System</Text>
            <TouchableOpacity onPress={toggleHeader} style={styles.headerCloseButton}>
              <Ionicons name="close" size={24} color="#800000" />
            </TouchableOpacity>
          </View>
        </Animated.View>

        <View style={styles.container}>
          {/* Logo Section */}
          <View style={styles.logoContainer}>
            <TouchableOpacity onPress={toggleHeader} style={styles.menuButton}>
              <Ionicons name="menu" size={32} color="#800000" />
            </TouchableOpacity>
            <Image
              source={require('../assets/images/logo.png')}
              style={styles.mainLogo}
              resizeMode="contain"
            />
            <Text style={styles.welcomeText}>WELCOME, {userName}</Text>
            <Text style={styles.subText}>What would you like to do?</Text>
          </View>

          {/* Menu Cards */}
          <View style={styles.cardContainer}>
            {/* Services */}
            <Link href="/service" asChild>
              <TouchableOpacity style={styles.card}>
                <View style={styles.cardIconContainer}>
                  <Ionicons name="construct-outline" size={32} color="#800000" />
                </View>
                <Text style={styles.cardText}>SERVICES</Text>
              </TouchableOpacity>
            </Link>

            {/* Documents */}
            <Link href="/document" asChild>
              <TouchableOpacity style={styles.card}>
                <View style={styles.cardIconContainer}>
                  <Ionicons name="document-text-outline" size={32} color="#800000" />
                </View>
                <Text style={styles.cardText}>DOCUMENTS</Text>
              </TouchableOpacity>
            </Link>

            {/* Profile */}
            <Link href="/profile" asChild>
              <TouchableOpacity style={styles.card}>
                <View style={styles.cardIconContainer}>
                  <Ionicons name="person-circle-outline" size={32} color="#800000" />
                </View>
                <Text style={styles.cardText}>PROFILE</Text>
              </TouchableOpacity>
            </Link>

            {/* About Us */}
            <Link href="/service" asChild>
              <TouchableOpacity style={styles.card}>
                <View style={styles.cardIconContainer}>
                  <Ionicons name="information-circle-outline" size={32} color="#800000" />
                </View>
                <Text style={styles.cardText}>ABOUT US</Text>
              </TouchableOpacity>
            </Link>
          </View>


        </View>
      </SafeAreaView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  safeArea: {
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
    marginBottom: 40,
  },
  mainLogo: {
    width: 120,
    height: 120,
    marginBottom: 16,
    borderRadius: 60,
  },
  welcomeText: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#800000',
  },
  subText: {
    fontSize: 16,
    color: '#666',
  },
  cardContainer: {
    flexDirection: 'column',
    width: '100%',
    marginBottom: 40,
    gap: 16,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardIconContainer: {
    backgroundColor: 'rgba(128, 0, 0, 0.1)',
    borderRadius: 50,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  cardText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#800000',
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
  header: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    overflow: 'hidden',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 60,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#800000',
  },
  headerCloseButton: {
    padding: 8,
  },
  menuButton: {
    position: 'absolute',
    left: 0,
    top: 0,
    padding: 8,
    zIndex: 1,
  },
});

export default HomePage;