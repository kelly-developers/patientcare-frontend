import { apiClient, API_ENDPOINTS } from '@/config/api';

export interface Prescription {
  id: string;
  patient_id: string;
  doctor_id: string;
  medication_name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
  created_at: string;
}

export interface CreatePrescriptionRequest {
  patient_id: string;
  doctor_id: string;
  medication_name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
}

export const prescriptionsService = {
  async getAll(): Promise<Prescription[]> {
    const response = await apiClient.get<Prescription[]>(API_ENDPOINTS.PRESCRIPTIONS.BASE);
    return response.data;
  },

  async getById(id: string): Promise<Prescription> {
    const response = await apiClient.get<Prescription>(API_ENDPOINTS.PRESCRIPTIONS.BY_ID(id));
    return response.data;
  },

  async getByPatient(patientId: string): Promise<Prescription[]> {
    const response = await apiClient.get<Prescription[]>(
      API_ENDPOINTS.PRESCRIPTIONS.BY_PATIENT(patientId)
    );
    return response.data;
  },

  async create(data: CreatePrescriptionRequest): Promise<Prescription> {
    const response = await apiClient.post<Prescription>(API_ENDPOINTS.PRESCRIPTIONS.BASE, data);
    return response.data;
  },

  async update(id: string, data: Partial<Prescription>): Promise<Prescription> {
    const response = await apiClient.put<Prescription>(
      API_ENDPOINTS.PRESCRIPTIONS.BY_ID(id),
      data
    );
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.PRESCRIPTIONS.BY_ID(id));
  },
};
