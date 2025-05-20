import { Document, TrackingResult } from '../types/document';

const API_BASE_URL = 'http://localhost/api';

export const DocumentService = {
  async trackDocument(trackingNumber: string): Promise<TrackingResult> {
    try {
      const response = await fetch(`${API_BASE_URL}/documents/track/${trackingNumber}`);
      if (!response.ok) throw new Error('Failed to fetch tracking information');
      return await response.json();
    } catch (error) {
      throw new Error('Failed to track document');
    }
  },

  async getDocuments(): Promise<Document[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/documents`);
      if (!response.ok) throw new Error('Failed to fetch documents');
      return await response.json();
    } catch (error) {
      throw new Error('Failed to get documents');
    }
  },

  async getDocumentById(id: string): Promise<Document> {
    try {
      const response = await fetch(`${API_BASE_URL}/documents/${id}`);
      if (!response.ok) throw new Error('Document not found');
      return await response.json();
    } catch (error) {
      throw new Error('Failed to get document details');
    }
  }
};