// services/patientsService.ts
import { apiClient, API_ENDPOINTS } from '@/config/api';

export interface Patient {
  id: string;
  patientId?: string;
  patient_id?: string;
  firstName?: string;
  first_name?: string;
  lastName?: string;
  last_name?: string;
  dateOfBirth?: string;
  date_of_birth?: string;
  gender?: string;
  phone?: string;
  email?: string;
  address?: string;
  emergencyContactName?: string;
  emergency_contact_name?: string;
  emergencyContactPhone?: string;
  emergency_contact_phone?: string;
  medicalHistory?: string;
  medical_history?: string;
  allergies?: string;
  currentMedications?: string;
  current_medications?: string;
  consentAccepted?: boolean;
  consentFormPath?: string;
  researchConsent?: boolean;
  research_consent?: boolean;
  research_consent_date?: string;
  sampleStorageConsent?: boolean;
  sample_storage?: boolean;
  createdAt?: string;
  created_at?: string;
  updatedAt?: string;
  updated_at?: string;
}

export interface CreatePatientRequest {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  phone?: string;
  email?: string;
  address?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  medicalHistory?: string;
  allergies?: string;
  currentMedications?: string;
  consentAccepted: boolean;
  consentFormPath?: string;
  researchConsent?: boolean;
  sampleStorageConsent?: boolean;
}

export interface VitalDataRequest {
  patientId: number; // Must be number (Long) for backend
  systolicBp: number; // Note: lowercase 'p' - matches backend
  diastolicBp: number; // Note: lowercase 'p' - matches backend
  heartRate: number;
  respiratoryRate?: number;
  temperature: number | string; // Will be converted to string for BigDecimal
  oxygenSaturation: number;
  height?: number | string; // Will be converted to string for BigDecimal
  weight?: number | string; // Will be converted to string for BigDecimal
  bloodGlucose?: number;
  painLevel?: number;
  riskLevel: string; // REQUIRED: 'LOW', 'MEDIUM', 'HIGH', or 'CRITICAL'
  notes?: string;
  recordedBy: string; // REQUIRED: username of current user
}

export const patientsService = {
  async getAll(): Promise<Patient[]> {
    try {
      const response = await apiClient.get(API_ENDPOINTS.PATIENTS.BASE);
      console.log('📊 Raw patients response:', response.data);
      
      if (Array.isArray(response.data)) {
        return response.data.map((patient: any) => ({
          id: patient.id?.toString() || '',
          patientId: patient.patientId || patient.patient_id || '',
          firstName: patient.firstName || patient.first_name || '',
          lastName: patient.lastName || patient.last_name || '',
          dateOfBirth: patient.dateOfBirth || patient.date_of_birth || '',
          gender: patient.gender || '',
          phone: patient.phone || '',
          email: patient.email || '',
          address: patient.address || '',
          emergencyContactName: patient.emergencyContactName || patient.emergency_contact_name || '',
          emergencyContactPhone: patient.emergencyContactPhone || patient.emergency_contact_phone || '',
          medicalHistory: patient.medicalHistory || patient.medical_history || '',
          allergies: patient.allergies || '',
          currentMedications: patient.currentMedications || patient.current_medications || '',
          consentAccepted: patient.consentAccepted || false,
          consentFormPath: patient.consentFormPath || '',
          researchConsent: patient.researchConsent || patient.research_consent || false,
          sampleStorageConsent: patient.sampleStorageConsent || patient.sample_storage || false,
          createdAt: patient.createdAt || patient.created_at || '',
          updatedAt: patient.updatedAt || patient.updated_at || ''
        }));
      }
      return [];
    } catch (error) {
      console.error('Error fetching patients:', error);
      throw error;
    }
  },

  async getById(id: string): Promise<Patient | null> {
    try {
      const response = await apiClient.get(API_ENDPOINTS.PATIENTS.BY_ID(id));
      const patient = response.data;
      return {
        id: patient.id?.toString() || '',
        patientId: patient.patientId || patient.patient_id || '',
        firstName: patient.firstName || patient.first_name || '',
        lastName: patient.lastName || patient.last_name || '',
        dateOfBirth: patient.dateOfBirth || patient.date_of_birth || '',
        gender: patient.gender || '',
        phone: patient.phone || '',
        email: patient.email || '',
        address: patient.address || '',
        emergencyContactName: patient.emergencyContactName || patient.emergency_contact_name || '',
        emergencyContactPhone: patient.emergencyContactPhone || patient.emergency_contact_phone || '',
        medicalHistory: patient.medicalHistory || patient.medical_history || '',
        allergies: patient.allergies || '',
        currentMedications: patient.currentMedications || patient.current_medications || '',
        consentAccepted: patient.consentAccepted || false,
        consentFormPath: patient.consentFormPath || '',
        researchConsent: patient.researchConsent || patient.research_consent || false,
        sampleStorageConsent: patient.sampleStorageConsent || patient.sample_storage || false,
        createdAt: patient.createdAt || patient.created_at || '',
        updatedAt: patient.updatedAt || patient.updated_at || ''
      };
    } catch (error) {
      console.error('Error fetching patient by id:', error);
      throw error;
    }
  },

  async create(data: CreatePatientRequest): Promise<Patient> {
    try {
      console.log('📝 Creating patient with data:', data);
      
      // Validate required fields
      if (!data.firstName || !data.lastName || !data.dateOfBirth || !data.gender) {
        throw new Error('Missing required fields: firstName, lastName, dateOfBirth, gender');
      }

      if (!data.consentAccepted) {
        throw new Error('Consent must be accepted to register patient');
      }

      const response = await apiClient.post(API_ENDPOINTS.PATIENTS.BASE, data);
      console.log('✅ Patient created successfully:', response.data);
      
      const patient = response.data;
      return {
        id: patient.id?.toString() || '',
        patientId: patient.patientId || patient.patient_id || '',
        firstName: patient.firstName || patient.first_name || '',
        lastName: patient.lastName || patient.last_name || '',
        dateOfBirth: patient.dateOfBirth || patient.date_of_birth || '',
        gender: patient.gender || '',
        phone: patient.phone || '',
        email: patient.email || '',
        address: patient.address || '',
        emergencyContactName: patient.emergencyContactName || patient.emergency_contact_name || '',
        emergencyContactPhone: patient.emergencyContactPhone || patient.emergency_contact_phone || '',
        medicalHistory: patient.medicalHistory || patient.medical_history || '',
        allergies: patient.allergies || '',
        currentMedications: patient.currentMedications || patient.current_medications || '',
        consentAccepted: patient.consentAccepted || false,
        consentFormPath: patient.consentFormPath || '',
        researchConsent: patient.researchConsent || patient.research_consent || false,
        sampleStorageConsent: patient.sampleStorageConsent || patient.sample_storage || false,
        createdAt: patient.createdAt || patient.created_at || '',
        updatedAt: patient.updatedAt || patient.updated_at || ''
      };
    } catch (error: any) {
      console.error('❌ Error creating patient:', error);
      if (error.response?.data) {
        console.error('Backend error details:', error.response.data);
        throw new Error(error.response.data.message || error.response.data.error || 'Failed to create patient');
      }
      throw error;
    }
  },

  async uploadConsentForm(patientId: string, file: File): Promise<Patient> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await apiClient.post(
        `/api/consent/upload/${patientId}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      
      const patient = response.data;
      return {
        id: patient.id?.toString() || '',
        patientId: patient.patientId || patient.patient_id || '',
        firstName: patient.firstName || patient.first_name || '',
        lastName: patient.lastName || patient.last_name || '',
        dateOfBirth: patient.dateOfBirth || patient.date_of_birth || '',
        gender: patient.gender || '',
        phone: patient.phone || '',
        email: patient.email || '',
        address: patient.address || '',
        emergencyContactName: patient.emergencyContactName || patient.emergency_contact_name || '',
        emergencyContactPhone: patient.emergencyContactPhone || patient.emergency_contact_phone || '',
        medicalHistory: patient.medicalHistory || patient.medical_history || '',
        allergies: patient.allergies || '',
        currentMedications: patient.currentMedications || patient.current_medications || '',
        consentAccepted: patient.consentAccepted || false,
        consentFormPath: patient.consentFormPath || '',
        researchConsent: patient.researchConsent || patient.research_consent || false,
        sampleStorageConsent: patient.sampleStorageConsent || patient.sample_storage || false,
        createdAt: patient.createdAt || patient.created_at || '',
        updatedAt: patient.updatedAt || patient.updated_at || ''
      };
    } catch (error) {
      console.error('Error uploading consent form:', error);
      throw error;
    }
  },

  async search(query: string): Promise<Patient[]> {
    try {
      const response = await apiClient.get(API_ENDPOINTS.PATIENTS.SEARCH, {
        params: { query: query },
      });
      
      console.log('🔍 Search response:', response.data);
      
      if (Array.isArray(response.data)) {
        return response.data.map((patient: any) => ({
          id: patient.id?.toString() || '',
          patientId: patient.patientId || patient.patient_id || '',
          firstName: patient.firstName || patient.first_name || '',
          lastName: patient.lastName || patient.last_name || '',
          dateOfBirth: patient.dateOfBirth || patient.date_of_birth || '',
          gender: patient.gender || '',
          phone: patient.phone || '',
          email: patient.email || '',
          address: patient.address || '',
          emergencyContactName: patient.emergencyContactName || patient.emergency_contact_name || '',
          emergencyContactPhone: patient.emergencyContactPhone || patient.emergency_contact_phone || '',
          medicalHistory: patient.medicalHistory || patient.medical_history || '',
          allergies: patient.allergies || '',
          currentMedications: patient.currentMedications || patient.current_medications || '',
          consentAccepted: patient.consentAccepted || false,
          consentFormPath: patient.consentFormPath || '',
          researchConsent: patient.researchConsent || patient.research_consent || false,
          sampleStorageConsent: patient.sampleStorageConsent || patient.sample_storage || false,
          createdAt: patient.createdAt || patient.created_at || '',
          updatedAt: patient.updatedAt || patient.updated_at || ''
        }));
      }
      return [];
    } catch (error) {
      console.error('Error searching patients:', error);
      throw error;
    }
  },

  async recordVitalData(data: VitalDataRequest): Promise<any> {
    try {
      console.log('📝 Recording vital data:', data);
      
      // Get current user for recordedBy
      const user = localStorage.getItem('patientcare_user');
      let recordedBy = 'Unknown';
      
      if (user) {
        try {
          const userData = JSON.parse(user);
          recordedBy = userData.username || userData.name || 'Unknown';
        } catch (e) {
          console.error('Error parsing user data:', e);
        }
      }
      
      // Calculate risk level based on vital signs
      const calculateRiskLevel = (): string => {
        const { systolicBp, diastolicBp, heartRate, oxygenSaturation } = data;
        
        // Critical conditions
        if (systolicBp > 180 || diastolicBp > 120 || heartRate > 120 || heartRate < 50 || oxygenSaturation < 90) {
          return 'CRITICAL';
        }
        // High risk
        if (systolicBp > 160 || diastolicBp > 100 || heartRate > 100 || oxygenSaturation < 95) {
          return 'HIGH';
        }
        // Medium risk
        if (systolicBp > 140 || diastolicBp > 90 || heartRate > 80) {
          return 'MEDIUM';
        }
        return 'LOW';
      };

      // Prepare data for backend - convert numbers to strings for BigDecimal
      const backendData = {
        patientId: data.patientId,
        systolicBp: data.systolicBp,
        diastolicBp: data.diastolicBp,
        heartRate: data.heartRate,
        respiratoryRate: data.respiratoryRate || null,
        temperature: data.temperature?.toString() || '0',
        oxygenSaturation: data.oxygenSaturation,
        height: data.height ? data.height.toString() : null,
        weight: data.weight ? data.weight.toString() : null,
        bloodGlucose: data.bloodGlucose || null,
        painLevel: data.painLevel || null,
        riskLevel: calculateRiskLevel(), // Calculate based on vital signs
        notes: data.notes || '',
        recordedBy: recordedBy // Use current user's username
      };

      console.log('📤 Sending to backend:', backendData);

      const response = await apiClient.post(API_ENDPOINTS.VITAL_DATA.BASE, backendData);
      console.log('✅ Vital data recorded successfully:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error recording vital data:', error);
      if (error.response?.data) {
        console.error('Backend error details:', error.response.data);
        throw new Error(error.response.data.message || error.response.data.error || 'Failed to record vital data');
      }
      throw error;
    }
  },

  async getVitalsRecordedByMe(): Promise<any[]> {
    try {
      const response = await apiClient.get(API_ENDPOINTS.VITAL_DATA.RECORDED_BY_ME);
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error('Error fetching vital data:', error);
      return [];
    }
  },

  async getPatientVitals(patientId: number): Promise<any[]> {
    try {
      const response = await apiClient.get(`${API_ENDPOINTS.VITAL_DATA.BASE}/patient/${patientId}`);
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error('Error fetching patient vitals:', error);
      return [];
    }
  }
};