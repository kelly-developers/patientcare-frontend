import { apiClient, API_ENDPOINTS } from '@/config/api';

export interface LabTest {
  id: string;
  patientId: string;
  testType: string;
  testName: string;
  orderedBy: string;
  orderedDate: string;
  status: 'ordered' | 'in-progress' | 'completed' | 'cancelled';
  priority: 'routine' | 'urgent' | 'stat';
  results?: string;
  notes?: string;
  clinicalNotes?: string;
  reportDate?: string;
  completedDate?: string;
  createdAt?: string;
}

export interface CreateLabTestRequest {
  patientId: string;
  testType: string;
  testName: string;
  orderedBy?: string;
  priority?: string;
  notes?: string;
  clinicalNotes?: string;
}

export const labTestsService = {
  async getAll(): Promise<LabTest[]> {
    try {
      const response = await apiClient.get<LabTest[]>(API_ENDPOINTS.LAB_TESTS.BASE);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching lab tests:', error);
      throw error;
    }
  },

  async getById(id: string): Promise<LabTest> {
    const response = await apiClient.get<LabTest>(API_ENDPOINTS.LAB_TESTS.BY_ID(id));
    return response.data;
  },

  async getByPatient(patientId: string): Promise<LabTest[]> {
    try {
      const response = await apiClient.get<LabTest[]>(API_ENDPOINTS.LAB_TESTS.BY_PATIENT(patientId));
      return response.data || [];
    } catch (error) {
      console.error('Error fetching patient lab tests:', error);
      throw error;
    }
  },

  async getByStatus(status: string): Promise<LabTest[]> {
    try {
      const response = await apiClient.get<LabTest[]>(API_ENDPOINTS.LAB_TESTS.BY_STATUS(status));
      return response.data || [];
    } catch (error) {
      console.error('Error fetching lab tests by status:', error);
      throw error;
    }
  },

  async getUrgent(): Promise<LabTest[]> {
    try {
      const response = await apiClient.get<LabTest[]>(API_ENDPOINTS.LAB_TESTS.URGENT);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching urgent lab tests:', error);
      throw error;
    }
  },

  async create(data: CreateLabTestRequest): Promise<LabTest> {
    const response = await apiClient.post<LabTest>(API_ENDPOINTS.LAB_TESTS.BASE, data);
    return response.data;
  },

  async update(id: string, data: Partial<LabTest>): Promise<LabTest> {
    const response = await apiClient.put<LabTest>(API_ENDPOINTS.LAB_TESTS.BY_ID(id), data);
    return response.data;
  },

  async updateStatus(id: string, status: string, results?: string): Promise<LabTest> {
    const response = await apiClient.put<LabTest>(
      `${API_ENDPOINTS.LAB_TESTS.UPDATE_STATUS(id)}?status=${status}`,
      results ? { results } : undefined
    );
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.LAB_TESTS.BY_ID(id));
  },
};
