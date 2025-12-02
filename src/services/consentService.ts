import { apiClient, API_ENDPOINTS } from '@/config/api';

export interface Consent {
  id: string;
  surgeryId: string;
  patientId: string;
  consentType: string;
  decision: string;
  signedAt?: string;
  signedBy?: string;
  witnessName?: string;
  documentPath?: string;
  notes?: string;
  createdAt: string;
}

export interface CreateConsentRequest {
  surgeryId: string;
  patientId: string;
  consentType: string;
  decision: string;
  signedBy?: string;
  witnessName?: string;
  notes?: string;
}

export const consentService = {
  async getAll(): Promise<Consent[]> {
    try {
      const response = await apiClient.get<Consent[]>(API_ENDPOINTS.CONSENT.BASE);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching consents:', error);
      throw error;
    }
  },

  async getBySurgery(surgeryId: string): Promise<Consent[]> {
    try {
      const response = await apiClient.get<Consent[]>(API_ENDPOINTS.CONSENT.BY_SURGERY(surgeryId));
      return response.data || [];
    } catch (error) {
      console.error('Error fetching surgery consent:', error);
      throw error;
    }
  },

  async getStored(): Promise<Consent[]> {
    try {
      const response = await apiClient.get<Consent[]>(API_ENDPOINTS.CONSENT.STORED);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching stored consents:', error);
      throw error;
    }
  },

  async hasValidConsent(surgeryId: string): Promise<boolean> {
    try {
      const response = await apiClient.get<{ valid: boolean }>(API_ENDPOINTS.CONSENT.HAS_VALID(surgeryId));
      return response.data?.valid || false;
    } catch (error) {
      console.error('Error checking consent validity:', error);
      return false;
    }
  },

  async getByDecision(decision: string): Promise<Consent[]> {
    try {
      const response = await apiClient.get<Consent[]>(API_ENDPOINTS.CONSENT.BY_DECISION(decision));
      return response.data || [];
    } catch (error) {
      console.error('Error fetching consents by decision:', error);
      throw error;
    }
  },

  async create(data: CreateConsentRequest): Promise<Consent> {
    const response = await apiClient.post<Consent>(API_ENDPOINTS.CONSENT.BASE, data);
    return response.data;
  },

  async uploadDocument(consentId: string, file: File): Promise<Consent> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await apiClient.post<Consent>(
      API_ENDPOINTS.CONSENT.UPLOAD(consentId),
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`${API_ENDPOINTS.CONSENT.BASE}/${id}`);
  },
};
