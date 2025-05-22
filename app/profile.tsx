import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { profileAPI } from '../api/profile';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
    const { user, signOut } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [profileData, setProfileData] = useState({
        fullname: '',
        username: '',
        email: '',
        current_password: '',
        new_password: '',
        new_password_confirmation: ''
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            setIsLoading(true);
            const response = await profileAPI.getProfile();
            if (response.status === 'success' && response.data?.user) {
                setProfileData({
                    ...profileData,
                    fullname: response.data.user.fullname,
                    username: response.data.user.username,
                    email: response.data.user.email
                });
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
            Alert.alert('Error', 'Failed to fetch profile data');
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateProfile = async () => {
        try {
            setIsLoading(true);
            const response = await profileAPI.updateProfile(profileData);
            if (response.status === 'success') {
                Alert.alert('Success', 'Profile updated successfully');
                setIsEditing(false);
                // Clear password fields
                setProfileData(prev => ({
                    ...prev,
                    current_password: '',
                    new_password: '',
                    new_password_confirmation: ''
                }));
            }
        } catch (error: any) {
            console.error('Error updating profile:', error);
            Alert.alert('Error', error.message || 'Failed to update profile');
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            await signOut();
            // Navigate to index after successful logout
            router.replace('/');
        } catch (error) {
            console.error('Logout error:', error);
            Alert.alert('Error', 'Failed to logout');
        }
    };

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#800000" />
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <View style={styles.profileIcon}>
                    <Ionicons name="person-circle" size={100} color="#800000" />
                </View>
                <Text style={styles.name}>{profileData.fullname || 'User Name'}</Text>
                <Text style={styles.email}>{profileData.email || 'user@email.com'}</Text>
            </View>

            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Personal Information</Text>
                    <TouchableOpacity onPress={() => setIsEditing(!isEditing)}>
                        <Ionicons
                            name={isEditing ? "close-circle-outline" : "create-outline"}
                            size={24}
                            color="#800000"
                        />
                    </TouchableOpacity>
                </View>
                <View style={styles.infoCard}>
                    <View style={styles.infoRow}>
                        <Ionicons name="person-outline" size={24} color="#800000" />
                        {isEditing ? (
                            <TextInput
                                style={styles.input}
                                value={profileData.fullname}
                                onChangeText={(text) => setProfileData(prev => ({ ...prev, fullname: text }))}
                                placeholder="Full Name"
                            />
                        ) : (
                            <Text style={styles.infoText}>{profileData.fullname || 'Full Name not available'}</Text>
                        )}
                    </View>
                    <View style={styles.infoRow}>
                        <Ionicons name="at-outline" size={24} color="#800000" />
                        {isEditing ? (
                            <TextInput
                                style={styles.input}
                                value={profileData.username}
                                onChangeText={(text) => setProfileData(prev => ({ ...prev, username: text }))}
                                placeholder="Username"
                            />
                        ) : (
                            <Text style={styles.infoText}>{profileData.username || 'Username not available'}</Text>
                        )}
                    </View>
                    <View style={styles.infoRow}>
                        <Ionicons name="mail-outline" size={24} color="#800000" />
                        {isEditing ? (
                            <TextInput
                                style={styles.input}
                                value={profileData.email}
                                onChangeText={(text) => setProfileData(prev => ({ ...prev, email: text }))}
                                placeholder="Email"
                                keyboardType="email-address"
                            />
                        ) : (
                            <Text style={styles.infoText}>{profileData.email || 'Email not available'}</Text>
                        )}
                    </View>
                </View>
            </View>

            {isEditing && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Change Password</Text>
                    <View style={styles.infoCard}>
                        <View style={styles.infoRow}>
                            <Ionicons name="lock-closed-outline" size={24} color="#800000" />
                            <TextInput
                                style={styles.input}
                                value={profileData.current_password}
                                onChangeText={(text) => setProfileData(prev => ({ ...prev, current_password: text }))}
                                placeholder="Current Password"
                                secureTextEntry
                            />
                        </View>
                        <View style={styles.infoRow}>
                            <Ionicons name="key-outline" size={24} color="#800000" />
                            <TextInput
                                style={styles.input}
                                value={profileData.new_password}
                                onChangeText={(text) => setProfileData(prev => ({ ...prev, new_password: text }))}
                                placeholder="New Password"
                                secureTextEntry
                            />
                        </View>
                        <View style={styles.infoRow}>
                            <Ionicons name="key-outline" size={24} color="#800000" />
                            <TextInput
                                style={styles.input}
                                value={profileData.new_password_confirmation}
                                onChangeText={(text) => setProfileData(prev => ({ ...prev, new_password_confirmation: text }))}
                                placeholder="Confirm New Password"
                                secureTextEntry
                            />
                        </View>
                    </View>
                </View>
            )}

            {isEditing && (
                <TouchableOpacity
                    style={styles.updateButton}
                    onPress={handleUpdateProfile}
                    disabled={isLoading}
                >
                    <Text style={styles.updateButtonText}>
                        {isLoading ? 'Updating...' : 'Update Profile'}
                    </Text>
                </TouchableOpacity>
            )}

            <TouchableOpacity
                style={styles.logoutButton}
                onPress={handleLogout}
            >
                <Text style={styles.logoutButtonText}>Logout</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    profileIcon: {
        marginBottom: 10,
    },
    name: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    email: {
        fontSize: 16,
        color: '#666',
    },
    section: {
        padding: 20,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    infoCard: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    infoText: {
        marginLeft: 15,
        fontSize: 16,
        color: '#333',
        flex: 1,
    },
    input: {
        marginLeft: 15,
        fontSize: 16,
        color: '#333',
        flex: 1,
        padding: 0,
    },
    updateButton: {
        backgroundColor: '#800000',
        margin: 20,
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
    },
    updateButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    logoutButton: {
        backgroundColor: '#fff',
        margin: 20,
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#800000',
    },
    logoutButtonText: {
        color: '#800000',
        fontSize: 16,
        fontWeight: 'bold',
    },
}); 