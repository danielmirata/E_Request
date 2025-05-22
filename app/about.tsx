import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

export default function About() {
    return (
        <ScrollView style={styles.container}>
            {/* Header Section */}
            <View style={styles.header}>
                <Ionicons name="information-circle" size={80} color="#800000" />
                <Text style={styles.title}>About Cantil E-System</Text>
                <Text style={styles.subtitle}>Digital Solutions for Better Service</Text>
            </View>

            {/* Mission Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Our Mission</Text>
                <Text style={styles.text}>
                    To provide efficient, accessible, and transparent digital services to the residents of Cantil,
                    making government services more convenient and responsive to the community's needs.
                </Text>
            </View>

            {/* Features Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Our Services</Text>
                <View style={styles.featureCard}>
                    <Ionicons name="document-text-outline" size={24} color="#800000" />
                    <View style={styles.featureText}>
                        <Text style={styles.featureTitle}>Document Requests</Text>
                        <Text style={styles.text}>
                            Request and track official documents like Barangay Clearance, Certificate of Residency,
                            and Certificate of Indigency online.
                        </Text>
                    </View>
                </View>

                <View style={styles.featureCard}>
                    <Ionicons name="alert-circle-outline" size={24} color="#800000" />
                    <View style={styles.featureText}>
                        <Text style={styles.featureTitle}>Complaint Management</Text>
                        <Text style={styles.text}>
                            Submit and track complaints or concerns with real-time updates on their status.
                        </Text>
                    </View>
                </View>

                <View style={styles.featureCard}>
                    <Ionicons name="time-outline" size={24} color="#800000" />
                    <View style={styles.featureText}>
                        <Text style={styles.featureTitle}>24/7 Accessibility</Text>
                        <Text style={styles.text}>
                            Access our services anytime, anywhere through your mobile device.
                        </Text>
                    </View>
                </View>
            </View>

            {/* Contact Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Contact Information</Text>
                <View style={styles.contactCard}>
                    <View style={styles.contactItem}>
                        <Ionicons name="location-outline" size={24} color="#800000" />
                        <Text style={styles.text}>Cantil E, Dumaguete City, Negros Oriental Philippines</Text>
                    </View>
                    <View style={styles.contactItem}>
                        <Ionicons name="call-outline" size={24} color="#800000" />
                        <Text style={styles.text}>(+63) XXX-XXX-XXXX</Text>
                    </View>
                    <View style={styles.contactItem}>
                        <Ionicons name="mail-outline" size={24} color="#800000" />
                        <Text style={styles.text}>cantil.office@email.com</Text>
                    </View>
                </View>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
                <Text style={styles.footerText}>© 2025 Cantil E-System</Text>
                <Text style={styles.footerText}>All rights reserved</Text>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        alignItems: 'center',
        padding: 30,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#800000',
        marginTop: 15,
        marginBottom: 5,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
    },
    section: {
        padding: 20,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
    },
    text: {
        fontSize: 16,
        color: '#444',
        lineHeight: 24,
    },
    featureCard: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 10,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    featureText: {
        flex: 1,
        marginLeft: 15,
    },
    featureTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    contactCard: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    contactItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    footer: {
        padding: 20,
        alignItems: 'center',
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    footerText: {
        color: '#666',
        fontSize: 14,
        marginBottom: 5,
    },
}); 