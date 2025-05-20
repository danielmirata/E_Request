import NetInfo from '@react-native-community/netinfo';
import { Alert } from 'react-native';

export const NetworkUtils = {
  /**
   * Check if the device is connected to the internet
   */
  isConnected: async (): Promise<boolean> => {
    const state = await NetInfo.fetch();
    return state.isConnected ?? false;
  },

  /**
   * Handle API errors with appropriate messages
   */
  handleApiError: (error: any) => {
    console.error('API Error:', error);

    if (error.message === 'Network request failed') {
      Alert.alert(
        'Connection Error',
        'Please check your internet connection and try again.',
        [{ text: 'OK' }]
      );
      return;
    }

    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      switch (error.response.status) {
        case 401:
          Alert.alert('Authentication Error', 'Please login again.');
          break;
        case 403:
          Alert.alert('Access Denied', 'You do not have permission to perform this action.');
          break;
        case 404:
          Alert.alert('Not Found', 'The requested resource was not found.');
          break;
        case 500:
          Alert.alert('Server Error', 'Something went wrong on our end. Please try again later.');
          break;
        default:
          Alert.alert('Error', error.response.data?.message || 'An unexpected error occurred.');
      }
    } else if (error.request) {
      // The request was made but no response was received
      Alert.alert(
        'Connection Error',
        'Unable to reach the server. Please check your connection and try again.',
        [{ text: 'OK' }]
      );
    } else {
      // Something happened in setting up the request that triggered an Error
      Alert.alert('Error', error.message || 'An unexpected error occurred.');
    }
  },

  /**
   * Check connectivity before making an API call
   */
  checkConnectivity: async (): Promise<boolean> => {
    const isConnected = await NetworkUtils.isConnected();
    if (!isConnected) {
      Alert.alert(
        'No Internet Connection',
        'Please check your internet connection and try again.',
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  }
}; 