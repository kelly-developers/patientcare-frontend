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
  consentAccepted?: boolean;
  consentFormPath?: string;
  researchConsent?: boolean;
  research_consent?: boolean;
  research_consent_date?: string;
  sampleStorageConsent?: boolean;
  sample_storage?: boolean;
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
  consentAccepted: boolean;
  consentFormPath?: string;
  researchConsent?: boolean;
  sampleStorageConsent?: boolean;
}

export const patientsService = {
  async getAll(): Promise<Patient[]> {
    try {
      const response = await apiClient.get(API_ENDPOINTS.PATIENTS.BASE);
      if (response.data && Array.isArray(response.data)) {
        return response.data;
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        return response.data.data;
      }
      return [];
    } catch (error) {
      console.error('Error fetching patients:', error);
      throw error;
    }
  },

  async getById(id: string): Promise<Patient | null> {
    try {
      const response = await apiClient.get(API_ENDPOINTS.PATIENTS.BY_ID(id));
      return response.data?.data || response.data;
    } catch (error) {
      console.error('Error fetching patient by id:', error);
      throw error;
    }
  },

  async create(data: CreatePatientRequest): Promise<Patient | null> {
    try {
      console.log('📝 Creating patient with data:', data);
      
      // Validate required fields
      if (!data.firstName || !data.lastName || !data.dateOfBirth || !data.gender) {
        throw new Error('Missing required fields: firstName, lastName, dateOfBirth, gender');
      }

      if (!data.consentAccepted) {
        throw new Error('Consent must be accepted to register patient');
      }

      const response = await apiClient.post(API_ENDPOINTS.PATIENTS.BASE, data);
      console.log('✅ Patient created successfully:', response.data);
      return response.data?.data || response.data;
    } catch (error) {
      console.error('❌ Error creating patient:', error);
      if (error.response?.data) {
        console.error('Backend error details:', error.response.data);
      }
      throw error;
    }
  },

  async uploadConsentForm(patientId: string, file: File): Promise<Patient | null> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await apiClient.post(
        `/api/consent/upload/${patientId}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      
      return response.data?.data || response.data;
    } catch (error) {
      console.error('Error uploading consent form:', error);
      throw error;
    }
  },

  async search(query: string): Promise<Patient[]> {
    try {
      const response = await apiClient.get(API_ENDPOINTS.PATIENTS.SEARCH, {
        params: { q: query },
      });
      if (response.data && Array.isArray(response.data)) {
        return response.data;
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        return response.data.data;
      }
      return [];
    } catch (error) {
      console.error('Error searching patients:', error);
      throw error;
    }
  },
};