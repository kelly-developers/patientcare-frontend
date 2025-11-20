import { apiClient, API_ENDPOINTS } from '@/config/api';

export interface Patient {
  id: string;
  patient_id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender?: string;
  phone?: string;
  email?: string;
  address?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  medical_history?: string;
  allergies?: string;
  current_medications?: string;
  research_consent?: boolean;
  research_consent_date?: string;
  created_at: string;
  updated_at: string;
}

export interface CreatePatientRequest {
  patient_id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender?: string;
  phone?: string;
  email?: string;
  address?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  medical_history?: string;
  allergies?: string;
  current_medications?: string;
  research_consent?: boolean;
  research_consent_date?: string;
}

export const patientsService = {
  async getAll(): Promise<Patient[]> {
    const response = await apiClient.get<Patient[]>(API_ENDPOINTS.PATIENTS.BASE);
    return response.data;
  },

  async getById(id: string): Promise<Patient> {
    const response = await apiClient.get<Patient>(API_ENDPOINTS.PATIENTS.BY_ID(id));
    return response.data;
  },

  async create(data: CreatePatientRequest): Promise<Patient> {
    const response = await apiClient.post<Patient>(API_ENDPOINTS.PATIENTS.BASE, data);
    return response.data;
  },

  async update(id: string, data: Partial<Patient>): Promise<Patient> {
    const response = await apiClient.put<Patient>(API_ENDPOINTS.PATIENTS.BY_ID(id), data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.PATIENTS.BY_ID(id));
  },

  async search(query: string): Promise<Patient[]> {
    const response = await apiClient.get<Patient[]>(API_ENDPOINTS.PATIENTS.SEARCH, {
      params: { q: query },
    });
    return response.data;
  },

  async updateConsent(id: string, consent: boolean): Promise<Patient> {
    const response = await apiClient.patch<Patient>(
      API_ENDPOINTS.PATIENTS.CONSENT(id),
      { research_consent: consent, research_consent_date: new Date().toISOString() }
    );
    return response.data;
  },

  async exportToExcel(patientIds?: string[]): Promise<Blob> {
    const response = await apiClient.post(
      API_ENDPOINTS.PATIENTS.EXPORT_EXCEL,
      { patientIds },
      { responseType: 'blob' }
    );
    return response.data;
  },

  async exportToPDF(patientIds?: string[]): Promise<Blob> {
    const response = await apiClient.post(
      API_ENDPOINTS.PATIENTS.EXPORT_PDF,
      { patientIds },
      { responseType: 'blob' }
    );
    return response.data;
  },
};
