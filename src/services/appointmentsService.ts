import { apiClient, API_ENDPOINTS } from '@/config/api';

export interface Appointment {
  id: string;
  patient_id: string;
  doctor_id: string;
  appointment_date: string;
  appointment_time: string;
  type: string;
  status: string;
  notes?: string;
  created_at: string;
}

export interface CreateAppointmentRequest {
  patient_id: string;
  doctor_id: string;
  appointment_date: string;
  appointment_time: string;
  type: string;
  status: string;
  notes?: string;
}

export const appointmentsService = {
  async getAll(): Promise<Appointment[]> {
    const response = await apiClient.get<Appointment[]>(API_ENDPOINTS.APPOINTMENTS.BASE);
    return response.data;
  },

  async getById(id: string): Promise<Appointment> {
    const response = await apiClient.get<Appointment>(API_ENDPOINTS.APPOINTMENTS.BY_ID(id));
    return response.data;
  },

  async getByPatient(patientId: string): Promise<Appointment[]> {
    const response = await apiClient.get<Appointment[]>(
      API_ENDPOINTS.APPOINTMENTS.BY_PATIENT(patientId)
    );
    return response.data;
  },

  async create(data: CreateAppointmentRequest): Promise<Appointment> {
    const response = await apiClient.post<Appointment>(API_ENDPOINTS.APPOINTMENTS.BASE, data);
    return response.data;
  },

  async update(id: string, data: Partial<Appointment>): Promise<Appointment> {
    const response = await apiClient.put<Appointment>(API_ENDPOINTS.APPOINTMENTS.BY_ID(id), data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.APPOINTMENTS.BY_ID(id));
  },
};
