import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG } from './config';

interface LoginCredentials {
  email: string;
  password: string;
}

interface SignupData {
  fullname: string;
  username: string;
  email: string;
  password: string;
  account_type: string;
}

interface AuthResponse {
  status: string;
  message?: string;
  data?: {
    user: any;
    token: string;
  };
}

const handleResponse = async (response: Response): Promise<any> => {
  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    throw new Error('Server returned non-JSON response');
  }

  const rawText = await response.text();
  console.log('Raw response:', rawText);

  let data;
  try {
    data = JSON.parse(rawText);
  } catch (e) {
    throw new Error('Server did not return valid JSON. Raw response: ' + rawText);
  }

  if (!response.ok) {
    throw new Error(data.message || 'Server error occurred');
  }
  return data;
};

export const authAPI = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    try {
      console.log('Attempting login to:', `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH}`);
      
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          email: credentials.email.trim(),
          password: credentials.password.trim(),
        })
      });

      const data = await handleResponse(response);

      if (data.status === 'success' && data.data) {
        await AsyncStorage.setItem('userToken', data.data.token);
        await AsyncStorage.setItem('userData', JSON.stringify(data.data.user));
      }

      return data;
    } catch (error) {
      console.error('Login error:', error);
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error('Failed to connect to the server');
    }
  },

  signup: async (userData: SignupData): Promise<AuthResponse> => {
    try {
      console.log('Attempting signup to:', `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.REGISTER}`);
      
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.REGISTER}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          fullname: userData.fullname,
          username: userData.username,
          email: userData.email,
          password: userData.password,
          account_type: userData.account_type,
          password_confirmation: userData.password,
        })
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Signup error:', error);
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error('Failed to connect to the server');
    }
  },

  logout: async (): Promise<void> => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        console.log('Attempting logout to:', `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.LOGOUT}`);
        
        const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.LOGOUT}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          }
        });

        await handleResponse(response);
      }
      
      // Clear local storage regardless of API call success
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userData');
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear local storage even if API call fails
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userData');
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error('Failed to logout');
    }
  },

  isAuthenticated: async (): Promise<boolean> => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) return false;

      console.log('Checking authentication at:', `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.USER}`);
      
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.USER}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        }
      });

      return response.ok;
    } catch (error) {
      console.error('Auth check error:', error);
      return false;
    }
  },

  getToken: async (): Promise<string | null> => {
    try {
      return await AsyncStorage.getItem('userToken');
    } catch (error) {
      console.error('Get token error:', error);
      return null;
    }
  },

  getUserData: async (): Promise<any | null> => {
    try {
      const userData = await AsyncStorage.getItem('userData');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Get user data error:', error);
      return null;
    }
  }
};