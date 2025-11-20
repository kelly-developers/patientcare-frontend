import { apiClient, API_ENDPOINTS } from '@/config/api';

export interface VitalData {
  id: string;
  patient_id: string;
  blood_pressure_systolic: number;
  blood_pressure_diastolic: number;
  heart_rate: number;
  temperature: number;
  respiratory_rate: number;
  oxygen_saturation: number;
  weight: number;
  height: number;
  bmi: number;
  notes?: string;
  recorded_by: string;
  created_at: string;
}

export interface CreateVitalDataRequest {
  patient_id: string;
  blood_pressure_systolic: number;
  blood_pressure_diastolic: number;
  heart_rate: number;
  temperature: number;
  respiratory_rate: number;
  oxygen_saturation: number;
  weight: number;
  height: number;
  bmi: number;
  notes?: string;
  recorded_by: string;
}

export const vitalDataService = {
  async getAll(): Promise<VitalData[]> {
    const response = await apiClient.get<VitalData[]>(API_ENDPOINTS.VITAL_DATA.BASE);
    return response.data;
  },

  async getById(id: string): Promise<VitalData> {
    const response = await apiClient.get<VitalData>(API_ENDPOINTS.VITAL_DATA.BY_ID(id));
    return response.data;
  },

  async getByPatient(patientId: string): Promise<VitalData[]> {
    const response = await apiClient.get<VitalData[]>(
      API_ENDPOINTS.VITAL_DATA.BY_PATIENT(patientId)
    );
    return response.data;
  },

  async create(data: CreateVitalDataRequest): Promise<VitalData> {
    const response = await apiClient.post<VitalData>(API_ENDPOINTS.VITAL_DATA.BASE, data);
    return response.data;
  },

  async update(id: string, data: Partial<VitalData>): Promise<VitalData> {
    const response = await apiClient.put<VitalData>(API_ENDPOINTS.VITAL_DATA.BY_ID(id), data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.VITAL_DATA.BY_ID(id));
  },
};
