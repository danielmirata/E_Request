import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG } from './config';

interface ProfileData {
    fullname?: string;
    username?: string;
    email?: string;
    current_password?: string;
    new_password?: string;
    new_password_confirmation?: string;
}

interface ProfileResponse {
    status: string;
    message: string;
    data?: {
        user: {
            id: number;
            fullname: string;
            username: string;
            email: string;
            account_type: string;
        }
    };
    errors?: Record<string, string[]>;
}

export const profileAPI = {
    getProfile: async (): Promise<ProfileResponse> => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            if (!token) {
                throw new Error('Not authenticated');
            }

            const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PROFILE}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Get profile error:', error);
            throw error;
        }
    },

    updateProfile: async (profileData: ProfileData): Promise<ProfileResponse> => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            if (!token) {
                throw new Error('Not authenticated');
            }

            const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PROFILE}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(profileData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to update profile');
            }

            return data;
        } catch (error) {
            console.error('Update profile error:', error);
            throw error;
        }
    },
}; 