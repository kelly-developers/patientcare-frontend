import { apiClient, API_ENDPOINTS } from '@/config/api';

export interface Appointment {
  id: number;
  patient: {
    id: number;
    patientId: string;
    firstName: string;
    lastName: string;
  };
  doctor?: {
    id: number;
    username: string;
    firstName: string;
    lastName: string;
    specialty?: string;
  };
  appointmentDate: string;
  appointmentTime: string;
  type: 'CONSULTATION' | 'FOLLOW_UP' | 'EMERGENCY' | 'SURGERY';
  status: 'SCHEDULED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  reason: string;
  notes?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  arrivalStatus: 'PENDING' | 'ARRIVED' | 'NO_SHOW';
  createdAt: string;
}

export interface Doctor {
  id: number;
  firstName: string;
  lastName: string;
  specialty?: string;
  available: boolean;
}

export interface CreateAppointmentRequest {
  patientId: number;
  doctorId: number;
  appointmentDate: string;
  appointmentTime: string;
  type: 'CONSULTATION' | 'FOLLOW_UP' | 'EMERGENCY' | 'SURGERY';
  reason: string;
  notes?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
}

export interface UpdateAppointmentRequest {
  patientId?: number;
  doctorId?: number;
  appointmentDate?: string;
  appointmentTime?: string;
  type?: 'CONSULTATION' | 'FOLLOW_UP' | 'EMERGENCY' | 'SURGERY';
  reason?: string;
  notes?: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
}

export const appointmentsService = {
  async getAll(): Promise<Appointment[]> {
    const response = await apiClient.get<Appointment[]>(API_ENDPOINTS.APPOINTMENTS.BASE);
    return response.data;
  },

  async getById(id: number): Promise<Appointment> {
    const response = await apiClient.get<Appointment>(API_ENDPOINTS.APPOINTMENTS.BY_ID(id.toString()));
    return response.data;
  },

  async getByPatient(patientId: number): Promise<Appointment[]> {
    const response = await apiClient.get<Appointment[]>(
      API_ENDPOINTS.APPOINTMENTS.BY_PATIENT(patientId.toString())
    );
    return response.data;
  },

  async create(data: CreateAppointmentRequest): Promise<Appointment> {
    const response = await apiClient.post<Appointment>(API_ENDPOINTS.APPOINTMENTS.BASE, data);
    return response.data;
  },

  async update(id: number, data: UpdateAppointmentRequest): Promise<Appointment> {
    const response = await apiClient.put<Appointment>(API_ENDPOINTS.APPOINTMENTS.BY_ID(id.toString()), data);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.APPOINTMENTS.BY_ID(id.toString()));
  },

  async updateStatus(id: number, status: string): Promise<Appointment> {
    const response = await apiClient.put<Appointment>(
      `${API_ENDPOINTS.APPOINTMENTS.BASE}/${id}/status`,
      null,
      {
        params: { status }
      }
    );
    return response.data;
  },

  async updateArrivalStatus(id: number, arrivalStatus: string): Promise<Appointment> {
    const response = await apiClient.put<Appointment>(
      `${API_ENDPOINTS.APPOINTMENTS.BASE}/${id}/arrival`,
      null,
      {
        params: { arrivalStatus }
      }
    );
    return response.data;
  },

  async getUpcomingByPatient(patientId: number): Promise<Appointment[]> {
    const response = await apiClient.get<Appointment[]>(
      API_ENDPOINTS.APPOINTMENTS.UPCOMING(patientId.toString())
    );
    return response.data;
  },

  async getByDate(date: string): Promise<Appointment[]> {
    const response = await apiClient.get<Appointment[]>(
      API_ENDPOINTS.APPOINTMENTS.BY_DATE(date)
    );
    return response.data;
  },

  async getByDoctor(doctorId: number): Promise<Appointment[]> {
    const response = await apiClient.get<Appointment[]>(
      API_ENDPOINTS.APPOINTMENTS.BY_DOCTOR(doctorId.toString())
    );
    return response.data;
  },

  async getDoctors(): Promise<Doctor[]> {
    const response = await apiClient.get<Doctor[]>('/api/users/doctors');
    return response.data;
  }
};