import { apiClient, API_ENDPOINTS } from '@/config/api';

export interface PostoperativeFollowup {
  id: string;
  patientId: string;
  surgeryId: string;
  procedureName: string;
  surgeryDate: string;
  followupDate: string;
  followupType: string;
  status: string;
  painLevel?: number;
  mobilityStatus?: string;
  complications?: string;
  medications?: string[];
  vitalSigns?: {
    temperature: string;
    bloodPressure: string;
    heartRate: string;
  };
  incisionStatus?: string;
  notes?: string;
  nextAppointment?: string;
  adherenceStatus?: string;
  createdAt?: string;
}

export interface CreatePostoperativeRequest {
  patientId: string;
  surgeryId: string;
  procedureName: string;
  surgeryDate: string;
  followupDate: string;
  followupType: string;
  status?: string;
  notes?: string;
}

export const postoperativeService = {
  async getAll(): Promise<PostoperativeFollowup[]> {
    try {
      const response = await apiClient.get<PostoperativeFollowup[]>(API_ENDPOINTS.POSTOPERATIVE.BASE);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching postoperative followups:', error);
      throw error;
    }
  },

  async getById(id: string): Promise<PostoperativeFollowup> {
    const response = await apiClient.get<PostoperativeFollowup>(API_ENDPOINTS.POSTOPERATIVE.BY_ID(id));
    return response.data;
  },

  async getByPatient(patientId: string): Promise<PostoperativeFollowup[]> {
    try {
      const response = await apiClient.get<PostoperativeFollowup[]>(API_ENDPOINTS.POSTOPERATIVE.BY_PATIENT(patientId));
      return response.data || [];
    } catch (error) {
      console.error('Error fetching patient postoperative followups:', error);
      throw error;
    }
  },

  async getBySurgery(surgeryId: string): Promise<PostoperativeFollowup[]> {
    try {
      const response = await apiClient.get<PostoperativeFollowup[]>(API_ENDPOINTS.POSTOPERATIVE.BY_SURGERY(surgeryId));
      return response.data || [];
    } catch (error) {
      console.error('Error fetching surgery postoperative followups:', error);
      throw error;
    }
  },

  async getByType(followupType: string): Promise<PostoperativeFollowup[]> {
    try {
      const response = await apiClient.get<PostoperativeFollowup[]>(API_ENDPOINTS.POSTOPERATIVE.BY_TYPE(followupType));
      return response.data || [];
    } catch (error) {
      console.error('Error fetching postoperative by type:', error);
      throw error;
    }
  },

  async getNonAdherent(): Promise<PostoperativeFollowup[]> {
    try {
      const response = await apiClient.get<PostoperativeFollowup[]>(API_ENDPOINTS.POSTOPERATIVE.NON_ADHERENT);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching non-adherent patients:', error);
      throw error;
    }
  },

  async getOverdue(): Promise<PostoperativeFollowup[]> {
    try {
      const response = await apiClient.get<PostoperativeFollowup[]>(API_ENDPOINTS.POSTOPERATIVE.OVERDUE);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching overdue followups:', error);
      throw error;
    }
  },

  async create(data: CreatePostoperativeRequest): Promise<PostoperativeFollowup> {
    const response = await apiClient.post<PostoperativeFollowup>(API_ENDPOINTS.POSTOPERATIVE.BASE, data);
    return response.data;
  },

  async update(id: string, data: Partial<PostoperativeFollowup>): Promise<PostoperativeFollowup> {
    const response = await apiClient.put<PostoperativeFollowup>(API_ENDPOINTS.POSTOPERATIVE.BY_ID(id), data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.POSTOPERATIVE.BY_ID(id));
  },
};
