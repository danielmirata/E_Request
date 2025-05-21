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
  },

  /**
   * Submit a new document request with form data
   * @param formData - The document request form data
   * @returns Promise with the response data
   */
  submitDocumentRequest: async (formData: FormData) => {
    try {
      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.DOCUMENTS}`;
      console.log('Sending request to:', url);

      const response = await fetch(url, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
          // Note: Don't set Content-Type when sending FormData
          // It will be set automatically with the correct boundary
        },
      });

      // Get raw text response for debugging
      const rawText = await response.text();
      console.log('Raw server response:', rawText);

      // Try to parse the response as JSON
      try {
        return JSON.parse(rawText);
      } catch (e) {
        console.error('Failed to parse JSON:', e);
        throw new Error('Server returned invalid JSON. Please check the server logs.');
      }
    } catch (error: any) {
      console.error('API error in submitDocumentRequest:', error);
      throw error;
    }
  },
}; 