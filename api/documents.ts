import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG } from './config';

interface DocumentRequest {
  document_type: string;
  purpose: string;
  id_photo?: Blob;
  declaration_checked: boolean;
}

interface DocumentResponse {
  status: string;
  message: string;
  data: Array<{
    id: number;
    request_id: string;
    user_id: number;
    document_type: string;
    first_name: string;
    last_name: string;
    contact_number: string;
    email: string;
    address: string;
    date_needed: string;
    purpose: string;
    notes: string;
    id_type: string;
    id_photo: string;
    declaration: number;
    status: string;
    remarks: string | null;
    created_at: string;
    updated_at: string;
  }>;
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

      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.MY_REQUESTS}`;
      console.log('Fetching documents from:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);

        if (response.status === 401) {
          throw new Error('Not authenticated');
        }
        throw new Error(`Failed to fetch document requests: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('API Response:', data);
      return data;
    } catch (error: any) {
      console.error('API error in getMyRequests:', error);
      throw error;
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
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        throw new Error('Not authenticated');
      }

      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.DOCUMENTS}`;
      console.log('Sending request to:', url);

      const response = await fetch(url, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
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