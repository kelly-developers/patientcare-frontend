import { apiClient, API_ENDPOINTS } from '@/config/api';

export interface SurgicalProcedure {
  id: string;
  patient_id: string;
  procedure_name: string;
  procedure_type?: string;
  scheduled_date?: string;
  actual_date?: string;
  duration_minutes?: number;
  surgeon_name?: string;
  assistant_surgeon?: string;
  anesthesia_type?: string;
  pre_operative_notes?: string;
  operative_notes?: string;
  post_operative_notes?: string;
  complications?: string;
  status: string;
  created_at: string;
  updated_at: string;
  patient?: {
    first_name: string;
    last_name: string;
    patient_id: string;
  };
}

export interface CreateProcedureRequest {
  patient_id: string;
  procedure_name: string;
  procedure_type?: string;
  scheduled_date?: string;
  actual_date?: string;
  duration_minutes?: number;
  surgeon_name?: string;
  assistant_surgeon?: string;
  anesthesia_type?: string;
  pre_operative_notes?: string;
  operative_notes?: string;
  post_operative_notes?: string;
  complications?: string;
  status: string;
}

export const proceduresService = {
  async getAll(): Promise<SurgicalProcedure[]> {
    const response = await apiClient.get<SurgicalProcedure[]>(API_ENDPOINTS.PROCEDURES.BASE);
    return response.data;
  },

  async getById(id: string): Promise<SurgicalProcedure> {
    const response = await apiClient.get<SurgicalProcedure>(API_ENDPOINTS.PROCEDURES.BY_ID(id));
    return response.data;
  },

  async getByPatient(patientId: string): Promise<SurgicalProcedure[]> {
    const response = await apiClient.get<SurgicalProcedure[]>(
      API_ENDPOINTS.PROCEDURES.BY_PATIENT(patientId)
    );
    return response.data;
  },

  async create(data: CreateProcedureRequest): Promise<SurgicalProcedure> {
    const response = await apiClient.post<SurgicalProcedure>(API_ENDPOINTS.PROCEDURES.BASE, data);
    return response.data;
  },

  async update(id: string, data: Partial<SurgicalProcedure>): Promise<SurgicalProcedure> {
    const response = await apiClient.put<SurgicalProcedure>(
      API_ENDPOINTS.PROCEDURES.BY_ID(id),
      data
    );
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.PROCEDURES.BY_ID(id));
  },
};
