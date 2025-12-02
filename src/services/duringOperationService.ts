import { apiClient, API_ENDPOINTS } from '@/config/api';

export interface OperationVitals {
  heartRate: number;
  bloodPressure: string;
  oxygenSaturation: number;
  temperature: number;
  bloodLoss: number;
  urineOutput: number;
}

export interface SurgicalNote {
  id: string;
  timestamp: string;
  note: string;
  type: 'incision' | 'dissection' | 'repair' | 'closure' | 'other';
  surgeon: string;
}

export interface Complication {
  id: string;
  timestamp: string;
  type: string;
  description: string;
  severity: 'mild' | 'moderate' | 'severe';
  resolved: boolean;
}

export interface Medication {
  id: string;
  timestamp: string;
  name: string;
  dosage: string;
  route: string;
  administeredBy: string;
}

export interface Outcome {
  id: string;
  type: string;
  description: string;
  success: boolean;
  notes: string;
}

export interface DuringOperation {
  id: string;
  patientId: string;
  surgeryId: string;
  procedureName: string;
  surgeon: string;
  startTime: string;
  endTime?: string;
  status: 'in-progress' | 'completed' | 'emergency';
  vitals: OperationVitals;
  surgicalNotes: SurgicalNote[];
  complications: Complication[];
  medications: Medication[];
  outcomes: Outcome[];
  createdAt?: string;
}

export interface CreateDuringOperationRequest {
  patientId: string;
  surgeryId: string;
  procedureName: string;
  surgeon: string;
  vitals?: OperationVitals;
}

export const duringOperationService = {
  async getAll(): Promise<DuringOperation[]> {
    try {
      const response = await apiClient.get<DuringOperation[]>(API_ENDPOINTS.DURING_OPERATION.BASE);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching during operations:', error);
      throw error;
    }
  },

  async getById(id: string): Promise<DuringOperation> {
    const response = await apiClient.get<DuringOperation>(API_ENDPOINTS.DURING_OPERATION.BY_ID(id));
    return response.data;
  },

  async getBySurgery(surgeryId: string): Promise<DuringOperation> {
    const response = await apiClient.get<DuringOperation>(API_ENDPOINTS.DURING_OPERATION.BY_SURGERY(surgeryId));
    return response.data;
  },

  async getActive(): Promise<DuringOperation[]> {
    try {
      const response = await apiClient.get<DuringOperation[]>(API_ENDPOINTS.DURING_OPERATION.ACTIVE);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching active operations:', error);
      throw error;
    }
  },

  async getByStatus(status: string): Promise<DuringOperation[]> {
    try {
      const response = await apiClient.get<DuringOperation[]>(API_ENDPOINTS.DURING_OPERATION.BY_STATUS(status));
      return response.data || [];
    } catch (error) {
      console.error('Error fetching operations by status:', error);
      throw error;
    }
  },

  async create(data: CreateDuringOperationRequest): Promise<DuringOperation> {
    const response = await apiClient.post<DuringOperation>(API_ENDPOINTS.DURING_OPERATION.BASE, data);
    return response.data;
  },

  async update(id: string, data: Partial<DuringOperation>): Promise<DuringOperation> {
    const response = await apiClient.put<DuringOperation>(API_ENDPOINTS.DURING_OPERATION.BY_ID(id), data);
    return response.data;
  },

  async complete(id: string): Promise<DuringOperation> {
    const response = await apiClient.put<DuringOperation>(API_ENDPOINTS.DURING_OPERATION.COMPLETE(id));
    return response.data;
  },

  async updateVitals(id: string, vitals: OperationVitals): Promise<DuringOperation> {
    const response = await apiClient.put<DuringOperation>(API_ENDPOINTS.DURING_OPERATION.VITALS(id), vitals);
    return response.data;
  },

  async addNote(id: string, note: Omit<SurgicalNote, 'id' | 'timestamp'>): Promise<DuringOperation> {
    const response = await apiClient.post<DuringOperation>(API_ENDPOINTS.DURING_OPERATION.NOTES(id), note);
    return response.data;
  },

  async addComplication(id: string, complication: Omit<Complication, 'id' | 'timestamp'>): Promise<DuringOperation> {
    const response = await apiClient.post<DuringOperation>(API_ENDPOINTS.DURING_OPERATION.COMPLICATIONS(id), complication);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.DURING_OPERATION.BY_ID(id));
  },
};
