import { apiClient, API_ENDPOINTS } from '@/config/api';

export interface Patient {
  id: string;
  patientId?: string;
  patient_id?: string;
  firstName?: string;
  first_name?: string;
  lastName?: string;
  last_name?: string;
  dateOfBirth?: string;
  date_of_birth?: string;
  gender?: string;
  phone?: string;
  email?: string;
  address?: string;
  emergencyContactName?: string;
  emergency_contact_name?: string;
  emergencyContactPhone?: string;
  emergency_contact_phone?: string;
  medicalHistory?: string;
  medical_history?: string;
  allergies?: string;
  currentMedications?: string;
  current_medications?: string;
  researchConsent?: boolean;
  research_consent?: any;
  researchConsentDate?: string;
  research_consent_date?: string;
  futureContactConsent?: boolean;
  anonymizedDataConsent?: boolean;
  sampleStorageConsent?: boolean;
  sample_storage?: any;
  sampleTypes?: string;
  storageDuration?: string;
  futureResearchUseConsent?: boolean;
  destructionConsent?: boolean;
  consentData?: any;
  createdAt?: string;
  created_at?: string;
  updatedAt?: string;
  updated_at?: string;
}

export interface CreatePatientRequest {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  phone?: string;
  email?: string;
  address?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  medicalHistory?: string;
  allergies?: string;
  currentMedications?: string;
  researchConsent?: boolean;
  researchConsentDate?: string | null;
  futureContactConsent?: boolean;
  anonymizedDataConsent?: boolean;
  sampleStorageConsent?: boolean;
  sampleTypes?: string;
  storageDuration?: string;
  futureResearchUseConsent?: boolean;
  destructionConsent?: boolean;
  consentData?: any;
}

export const patientsService = {
  async getAll(): Promise<Patient[]> {
    try {
      const response = await apiClient.get(API_ENDPOINTS.PATIENTS.BASE);
      // Handle both direct array response and ApiResponse wrapper
      if (response.data && Array.isArray(response.data)) {
        return response.data;
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        return response.data.data;
      } else if (response.data && response.data.success) {
        return response.data.data || [];
      }
      return [];
    } catch (error) {
      console.error('Error fetching patients:', error);
      return [];
    }
  },

  async getById(id: string): Promise<Patient | null> {
    try {
      const response = await apiClient.get(API_ENDPOINTS.PATIENTS.BY_ID(id));
      return response.data?.data || response.data;
    } catch (error) {
      console.error('Error fetching patient by id:', error);
      return null;
    }
  },

  async create(data: CreatePatientRequest): Promise<Patient | null> {
    try {
      const response = await apiClient.post(API_ENDPOINTS.PATIENTS.BASE, data);
      return response.data?.data || response.data;
    } catch (error) {
      console.error('Error creating patient:', error);
      throw error;
    }
  },

  async update(id: string, data: Partial<Patient>): Promise<Patient | null> {
    try {
      const response = await apiClient.put(API_ENDPOINTS.PATIENTS.BY_ID(id), data);
      return response.data?.data || response.data;
    } catch (error) {
      console.error('Error updating patient:', error);
      return null;
    }
  },

  async delete(id: string): Promise<boolean> {
    try {
      await apiClient.delete(API_ENDPOINTS.PATIENTS.BY_ID(id));
      return true;
    } catch (error) {
      console.error('Error deleting patient:', error);
      return false;
    }
  },

  async search(query: string): Promise<Patient[]> {
    try {
      const response = await apiClient.get(API_ENDPOINTS.PATIENTS.SEARCH, {
        params: { q: query },
      });
      // Handle both direct array response and ApiResponse wrapper
      if (response.data && Array.isArray(response.data)) {
        return response.data;
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        return response.data.data;
      } else if (response.data && response.data.success) {
        return response.data.data || [];
      }
      return [];
    } catch (error) {
      console.error('Error searching patients:', error);
      return [];
    }
  },

  async updateConsent(id: string, consent: boolean): Promise<Patient | null> {
    try {
      const response = await apiClient.patch(
        API_ENDPOINTS.PATIENTS.CONSENT(id),
        { consent }
      );
      return response.data?.data || response.data;
    } catch (error) {
      console.error('Error updating consent:', error);
      return null;
    }
  },

  async exportToExcel(patientIds?: string[]): Promise<Blob | null> {
    try {
      const response = await apiClient.post(
        API_ENDPOINTS.PATIENTS.EXPORT_EXCEL,
        { patientIds },
        { responseType: 'blob' }
      );
      return response.data;
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      return null;
    }
  },

  async exportToPDF(patientIds?: string[]): Promise<Blob | null> {
    try {
      const response = await apiClient.post(
        API_ENDPOINTS.PATIENTS.EXPORT_PDF,
        { patientIds },
        { responseType: 'blob' }
      );
      return response.data;
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      return null;
    }
  },
};