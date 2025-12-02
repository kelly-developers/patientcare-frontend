import { apiClient, API_ENDPOINTS } from '@/config/api';

export interface PharmacyPrescription {
  id: string;
  patientId: string;
  patientName?: string;
  doctorId: string;
  medicationName: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
  status: 'pending' | 'dispensed' | 'collected';
  dispensedAt?: string;
  collectedAt?: string;
  createdAt: string;
}

export const pharmacyService = {
  async getPending(): Promise<PharmacyPrescription[]> {
    try {
      const response = await apiClient.get<PharmacyPrescription[]>(API_ENDPOINTS.PRESCRIPTIONS.PENDING);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching pending prescriptions:', error);
      throw error;
    }
  },

  async getAll(): Promise<PharmacyPrescription[]> {
    try {
      const response = await apiClient.get<PharmacyPrescription[]>(API_ENDPOINTS.PRESCRIPTIONS.BASE);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching all prescriptions:', error);
      throw error;
    }
  },

  async getByPatient(patientId: string): Promise<PharmacyPrescription[]> {
    try {
      const response = await apiClient.get<PharmacyPrescription[]>(API_ENDPOINTS.PRESCRIPTIONS.BY_PATIENT(patientId));
      return response.data || [];
    } catch (error) {
      console.error('Error fetching patient prescriptions:', error);
      throw error;
    }
  },

  async updateStatus(id: string, status: 'pending' | 'dispensed' | 'collected'): Promise<PharmacyPrescription> {
    const response = await apiClient.put<PharmacyPrescription>(
      `${API_ENDPOINTS.PRESCRIPTIONS.UPDATE_STATUS(id)}?status=${status}`
    );
    return response.data;
  },

  async dispense(id: string): Promise<PharmacyPrescription> {
    return this.updateStatus(id, 'dispensed');
  },

  async markCollected(id: string): Promise<PharmacyPrescription> {
    return this.updateStatus(id, 'collected');
  },

  async search(query: string): Promise<PharmacyPrescription[]> {
    try {
      const response = await apiClient.get<PharmacyPrescription[]>(
        API_ENDPOINTS.PRESCRIPTIONS.SEARCH,
        { params: { q: query } }
      );
      return response.data || [];
    } catch (error) {
      console.error('Error searching prescriptions:', error);
      throw error;
    }
  },
};
