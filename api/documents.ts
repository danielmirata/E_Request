import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG } from './config';

interface DocumentRequest {
  document_type: string;
  purpose: string;
  id_photo?: Blob;
  declaration_checked: boolean;
}

interface DocumentResponse {
  success: boolean;
  message?: string;
  data?: any;
}

export const documentsAPI = {
  /**
   * Submit a new document request
   */
  submitRequest: async (requestData: DocumentRequest): Promise<DocumentResponse> => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        throw new Error('Not authenticated');
      }

      const formData = new FormData();
      formData.append('document_type', requestData.document_type);
      formData.append('purpose', requestData.purpose);
      formData.append('declaration_checked', requestData.declaration_checked.toString());
      
      if (requestData.id_photo) {
        formData.append('id_photo', requestData.id_photo);
      }

      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.DOCUMENTS}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      return await response.json();
    } catch (error) {
      console.error('Document request error:', error);
      throw new Error('Failed to submit document request');
    }
  },

  /**
   * Get all document requests for the current user
   */
  getMyRequests: async (): Promise<DocumentResponse> => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.DOCUMENTS}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      return await response.json();
    } catch (error) {
      console.error('Get requests error:', error);
      throw new Error('Failed to fetch document requests');
    }
  },

  /**
   * Track a document request
   */
  trackRequest: async (trackingNumber: string): Promise<DocumentResponse> => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.TRACKING}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ tracking_number: trackingNumber })
      });

      return await response.json();
    } catch (error) {
      console.error('Track request error:', error);
      throw new Error('Failed to track document request');
    }
  }
}; 