import { API_CONFIG } from './config';

export const complaintsApi = {
  /**
   * Submit a new complaint with form data
   * @param formData - The complaint form data
   * @returns Promise with the response data
   */
  submitComplaint: async (formData: FormData) => {
    try {
      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.COMPLAINTS}`;
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
      console.error('API error in submitComplaint:', error);
      throw error;
    }
  },

  // Add other complaint-related API functions here
};