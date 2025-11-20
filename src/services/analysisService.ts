import { apiClient, API_ENDPOINTS } from '@/config/api';

export interface DoctorAnalysis {
  id: string;
  patient_id: string;
  doctor_id: string;
  diagnosis: string;
  recommended_surgery?: string;
  surgery_urgency?: string;
  clinical_notes?: string;
  status: string;
  created_at: string;
}

export interface CreateAnalysisRequest {
  patient_id: string;
  doctor_id: string;
  diagnosis: string;
  recommended_surgery?: string;
  surgery_urgency?: string;
  clinical_notes?: string;
  status: string;
}

export const analysisService = {
  async getAll(): Promise<DoctorAnalysis[]> {
    const response = await apiClient.get<DoctorAnalysis[]>(API_ENDPOINTS.ANALYSIS.BASE);
    return response.data;
  },

  async getById(id: string): Promise<DoctorAnalysis> {
    const response = await apiClient.get<DoctorAnalysis>(API_ENDPOINTS.ANALYSIS.BY_ID(id));
    return response.data;
  },

  async getByPatient(patientId: string): Promise<DoctorAnalysis[]> {
    const response = await apiClient.get<DoctorAnalysis[]>(
      API_ENDPOINTS.ANALYSIS.BY_PATIENT(patientId)
    );
    return response.data;
  },

  async create(data: CreateAnalysisRequest): Promise<DoctorAnalysis> {
    const response = await apiClient.post<DoctorAnalysis>(API_ENDPOINTS.ANALYSIS.BASE, data);
    return response.data;
  },

  async update(id: string, data: Partial<DoctorAnalysis>): Promise<DoctorAnalysis> {
    const response = await apiClient.put<DoctorAnalysis>(API_ENDPOINTS.ANALYSIS.BY_ID(id), data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.ANALYSIS.BY_ID(id));
  },
};
