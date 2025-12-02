import { apiClient, API_ENDPOINTS } from '@/config/api';

export interface ICURecord {
  id: string;
  patientId: string;
  admissionDate: string;
  dischargeDate?: string;
  status: string;
  bedNumber?: string;
  ventilatorStatus?: string;
  consciousness?: string;
  vitals?: {
    heartRate: number;
    bloodPressure: string;
    oxygenSaturation: number;
    temperature: number;
    respiratoryRate: number;
  };
  medications?: string[];
  notes?: string;
  attendingDoctor?: string;
  createdAt: string;
}

export interface CreateICURecordRequest {
  patientId: string;
  bedNumber?: string;
  status?: string;
  ventilatorStatus?: string;
  consciousness?: string;
  vitals?: {
    heartRate: number;
    bloodPressure: string;
    oxygenSaturation: number;
    temperature: number;
    respiratoryRate: number;
  };
  notes?: string;
  attendingDoctor?: string;
}

export const icuService = {
  async getAll(): Promise<ICURecord[]> {
    try {
      const response = await apiClient.get<ICURecord[]>(API_ENDPOINTS.ICU.BASE);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching ICU records:', error);
      throw error;
    }
  },

  async getById(id: string): Promise<ICURecord> {
    const response = await apiClient.get<ICURecord>(API_ENDPOINTS.ICU.BY_ID(id));
    return response.data;
  },

  async getByPatient(patientId: string): Promise<ICURecord[]> {
    try {
      const response = await apiClient.get<ICURecord[]>(API_ENDPOINTS.ICU.BY_PATIENT(patientId));
      return response.data || [];
    } catch (error) {
      console.error('Error fetching patient ICU records:', error);
      throw error;
    }
  },

  async getLatest(patientId: string): Promise<ICURecord | null> {
    try {
      const response = await apiClient.get<ICURecord>(API_ENDPOINTS.ICU.LATEST(patientId));
      return response.data || null;
    } catch (error) {
      console.error('Error fetching latest ICU record:', error);
      return null;
    }
  },

  async getCritical(): Promise<ICURecord[]> {
    try {
      const response = await apiClient.get<ICURecord[]>(API_ENDPOINTS.ICU.CRITICAL);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching critical ICU patients:', error);
      throw error;
    }
  },

  async getStats(patientId: string): Promise<any> {
    try {
      const response = await apiClient.get(API_ENDPOINTS.ICU.STATS(patientId));
      return response.data;
    } catch (error) {
      console.error('Error fetching ICU stats:', error);
      throw error;
    }
  },

  async create(data: CreateICURecordRequest): Promise<ICURecord> {
    const response = await apiClient.post<ICURecord>(API_ENDPOINTS.ICU.BASE, data);
    return response.data;
  },

  async update(id: string, data: Partial<ICURecord>): Promise<ICURecord> {
    const response = await apiClient.put<ICURecord>(API_ENDPOINTS.ICU.BY_ID(id), data);
    return response.data;
  },

  async updateVitals(id: string, vitals: ICURecord['vitals']): Promise<ICURecord> {
    const response = await apiClient.put<ICURecord>(API_ENDPOINTS.ICU.VITALS(id), vitals);
    return response.data;
  },

  async updateMedications(id: string, medications: string[]): Promise<ICURecord> {
    const response = await apiClient.put<ICURecord>(API_ENDPOINTS.ICU.MEDICATIONS(id), { medications });
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.ICU.BY_ID(id));
  },
};
