import { apiClient, API_ENDPOINTS } from '@/config/api';

export interface PreoperativeChecklist {
  id: string;
  patientId: string;
  surgeryId?: string;
  procedureName: string;
  patientIdentityConfirmed: boolean;
  consentSigned: boolean;
  siteMarked: boolean;
  anesthesiaMachineChecked: boolean;
  oxygenAvailable: boolean;
  suction: boolean;
  knownAllergy?: string;
  difficultAirway?: string;
  aspirationRisk?: string;
  bloodLossRisk?: string;
  sterileIndicatorsConfirmed: boolean;
  equipmentIssues?: string;
  implantAvailable?: string;
  antibioticProphylaxis?: string;
  imagingDisplayed?: string;
  criticalSteps?: string;
  anticipatedDuration?: string;
  nurseConfirmed: boolean;
  anesthetistConfirmed: boolean;
  surgeonConfirmed: boolean;
  additionalConcerns?: string;
  researchConsentGiven: boolean;
  dataUsageConsent: boolean;
  sampleStorageConsent: boolean;
  researchConsentDate?: string;
  researchConsentWitness?: string;
  completedBy?: string;
  completedAt?: string;
  status: string;
  createdAt?: string;
}

export interface CreatePreoperativeRequest {
  patientId: string;
  surgeryId?: string;
  procedureName: string;
  patientIdentityConfirmed?: boolean;
  consentSigned?: boolean;
  siteMarked?: boolean;
  anesthesiaMachineChecked?: boolean;
  oxygenAvailable?: boolean;
  suction?: boolean;
  knownAllergy?: string;
  difficultAirway?: string;
  aspirationRisk?: string;
  bloodLossRisk?: string;
  sterileIndicatorsConfirmed?: boolean;
  equipmentIssues?: string;
  implantAvailable?: string;
  antibioticProphylaxis?: string;
  imagingDisplayed?: string;
  criticalSteps?: string;
  anticipatedDuration?: string;
  nurseConfirmed?: boolean;
  anesthetistConfirmed?: boolean;
  surgeonConfirmed?: boolean;
  additionalConcerns?: string;
  researchConsentGiven?: boolean;
  dataUsageConsent?: boolean;
  sampleStorageConsent?: boolean;
  researchConsentDate?: string;
  researchConsentWitness?: string;
}

export const preoperativeService = {
  async getAll(): Promise<PreoperativeChecklist[]> {
    try {
      const response = await apiClient.get<PreoperativeChecklist[]>(API_ENDPOINTS.PREOPERATIVE.BASE);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching preoperative checklists:', error);
      throw error;
    }
  },

  async getById(id: string): Promise<PreoperativeChecklist> {
    const response = await apiClient.get<PreoperativeChecklist>(API_ENDPOINTS.PREOPERATIVE.BY_ID(id));
    return response.data;
  },

  async getByPatient(patientId: string): Promise<PreoperativeChecklist[]> {
    try {
      const response = await apiClient.get<PreoperativeChecklist[]>(API_ENDPOINTS.PREOPERATIVE.BY_PATIENT(patientId));
      return response.data || [];
    } catch (error) {
      console.error('Error fetching patient preoperative checklists:', error);
      throw error;
    }
  },

  async isComplete(patientId: string): Promise<boolean> {
    try {
      const response = await apiClient.get<{ complete: boolean }>(API_ENDPOINTS.PREOPERATIVE.IS_COMPLETE(patientId));
      return response.data?.complete || false;
    } catch (error) {
      console.error('Error checking preoperative completeness:', error);
      return false;
    }
  },

  async create(data: CreatePreoperativeRequest): Promise<PreoperativeChecklist> {
    const response = await apiClient.post<PreoperativeChecklist>(API_ENDPOINTS.PREOPERATIVE.BASE, data);
    return response.data;
  },

  async update(id: string, data: Partial<PreoperativeChecklist>): Promise<PreoperativeChecklist> {
    const response = await apiClient.put<PreoperativeChecklist>(API_ENDPOINTS.PREOPERATIVE.BY_ID(id), data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.PREOPERATIVE.BY_ID(id));
  },
};
