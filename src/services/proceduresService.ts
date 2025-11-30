import { apiClient, API_ENDPOINTS } from '@/config/api';

export interface Surgery {
  id: string;
  patientId: string;
  surgeryType: string;
  scheduledDate: string;
  surgeon: string;
  assistantSurgeon?: string;
  anesthesiologist?: string;
  status: string;
  priority?: string;
  preOpNotes?: string;
  postOpNotes?: string;
  complications?: string;
  duration?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSurgeryRequest {
  patientId: string;
  surgeryType: string;
  scheduledDate: string;
  surgeon: string;
  assistantSurgeon?: string;
  anesthesiologist?: string;
  status?: string;
  priority?: string;
  preOpNotes?: string;
}

export const proceduresService = {
  async getAll(): Promise<Surgery[]> {
    const response = await apiClient.get<Surgery[]>(API_ENDPOINTS.SURGERIES.BASE);
    return response.data;
  },

  async getById(id: string): Promise<Surgery> {
    const response = await apiClient.get<Surgery>(API_ENDPOINTS.SURGERIES.BY_ID(id));
    return response.data;
  },

  async getByPatient(patientId: string): Promise<Surgery[]> {
    const response = await apiClient.get<Surgery[]>(
      API_ENDPOINTS.SURGERIES.BY_PATIENT(patientId)
    );
    return response.data;
  },

  async create(data: CreateSurgeryRequest): Promise<Surgery> {
    const response = await apiClient.post<Surgery>(API_ENDPOINTS.SURGERIES.BASE, data);
    return response.data;
  },

  async update(id: string, data: Partial<Surgery>): Promise<Surgery> {
    const response = await apiClient.put<Surgery>(
      API_ENDPOINTS.SURGERIES.BY_ID(id),
      data
    );
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.SURGERIES.BY_ID(id));
  },

  async updateStatus(id: string, status: string): Promise<Surgery> {
    const response = await apiClient.put<Surgery>(
      `${API_ENDPOINTS.SURGERIES.UPDATE_STATUS(id)}?status=${status}`
    );
    return response.data;
  },

  async getByStatus(status: string): Promise<Surgery[]> {
    const response = await apiClient.get<Surgery[]>(
      API_ENDPOINTS.SURGERIES.BY_STATUS(status)
    );
    return response.data;
  },

  async getPendingConsent(): Promise<Surgery[]> {
    const response = await apiClient.get<Surgery[]>(
      API_ENDPOINTS.SURGERIES.PENDING_CONSENT
    );
    return response.data;
  },
};
