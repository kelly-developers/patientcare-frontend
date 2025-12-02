import { apiClient, API_ENDPOINTS } from '@/config/api';

export interface DoctorAnalysis {
  id: number;
  patient: {
    id: number;
    patientId: string;
    firstName: string;
    lastName: string;
  };
  doctor: {
    id: number;
    firstName: string;
    lastName: string;
    specialty?: string;
  };
  symptoms: string;
  diagnosis: string;
  clinicalNotes?: string;
  recommendSurgery: boolean;
  surgeryType?: string;
  surgeryUrgency?: 'EMERGENCY' | 'URGENT' | 'ROUTINE' | 'ELECTIVE';
  requireLabTests: boolean;
  labTestsNeeded?: string;
  status: 'PENDING' | 'COMPLETED';
  createdAt: string;
}

export interface CreateAnalysisRequest {
  patientId: number;
  doctorId: number;
  symptoms: string;
  diagnosis: string;
  clinicalNotes?: string;
  recommendSurgery?: boolean;
  surgeryType?: string;
  surgeryUrgency?: 'EMERGENCY' | 'URGENT' | 'ROUTINE' | 'ELECTIVE';
  requireLabTests?: boolean;
  labTestsNeeded?: string;
  status: 'PENDING' | 'COMPLETED';
}

export interface UpdateAnalysisRequest {
  patientId?: number;
  doctorId?: number;
  symptoms?: string;
  diagnosis?: string;
  clinicalNotes?: string;
  recommendSurgery?: boolean;
  surgeryType?: string;
  surgeryUrgency?: 'EMERGENCY' | 'URGENT' | 'ROUTINE' | 'ELECTIVE';
  requireLabTests?: boolean;
  labTestsNeeded?: string;
  status?: 'PENDING' | 'COMPLETED';
}

export const analysisService = {
  async getAll(): Promise<DoctorAnalysis[]> {
    const response = await apiClient.get<DoctorAnalysis[]>(API_ENDPOINTS.ANALYSIS.BASE);
    return response.data;
  },

  async getById(id: number): Promise<DoctorAnalysis> {
    const response = await apiClient.get<DoctorAnalysis>(API_ENDPOINTS.ANALYSIS.BY_ID(id.toString()));
    return response.data;
  },

  async getByPatient(patientId: number): Promise<DoctorAnalysis[]> {
    const response = await apiClient.get<DoctorAnalysis[]>(
      API_ENDPOINTS.ANALYSIS.BY_PATIENT(patientId.toString())
    );
    return response.data;
  },

  async getByDoctor(doctorId: number): Promise<DoctorAnalysis[]> {
    const response = await apiClient.get<DoctorAnalysis[]>(
      API_ENDPOINTS.ANALYSIS.BY_DOCTOR(doctorId.toString())
    );
    return response.data;
  },

  async getSurgeryRecommended(): Promise<DoctorAnalysis[]> {
    const response = await apiClient.get<DoctorAnalysis[]>(
      API_ENDPOINTS.ANALYSIS.SURGERY_RECOMMENDED
    );
    return response.data;
  },

  async create(data: CreateAnalysisRequest): Promise<DoctorAnalysis> {
    const response = await apiClient.post<DoctorAnalysis>(API_ENDPOINTS.ANALYSIS.BASE, data);
    return response.data;
  },

  async update(id: number, data: UpdateAnalysisRequest): Promise<DoctorAnalysis> {
    const response = await apiClient.put<DoctorAnalysis>(API_ENDPOINTS.ANALYSIS.BY_ID(id.toString()), data);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.ANALYSIS.BY_ID(id.toString()));
  }
};