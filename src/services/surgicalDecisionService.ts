import { apiClient } from '@/config/api';
import { API_ENDPOINTS } from '@/config/api';

export interface SurgicalDecision {
  id: number;
  analysis: {
    id: number;
    patient: {
      id: number;
      patientId: string;
      firstName: string;
      lastName: string;
      dateOfBirth: string;
      gender: string;
    };
    doctor: {
      id: number;
      firstName: string;
      lastName: string;
    };
    symptoms: string;
    diagnosis: string;
    surgeryType: string;
    surgeryUrgency: string;
    clinicalNotes: string;
    createdAt: string;
  };
  surgeonName: string;
  decisionStatus: 'ACCEPTED' | 'DECLINED';
  comments: string;
  factorsConsidered: Record<string, any>;
  createdAt: string;
}

export interface SurgicalDecisionRequest {
  analysisId: number;
  surgeonName: string;
  decisionStatus: 'ACCEPTED' | 'DECLINED';
  comments: string;
  factorsConsidered: Record<string, any>;
}

export interface DecisionConsensus {
  totalDecisions: number;
  accepted: number;
  declined: number;
  consensusReached: boolean;
  requiresMoreReviews: boolean;
}

export const surgicalDecisionService = {
  async submitAnalysisDecision(decisionRequest: SurgicalDecisionRequest): Promise<SurgicalDecision> {
    try {
      const response = await apiClient.post<SurgicalDecision>(
        API_ENDPOINTS.SURGICAL_DECISIONS.SUBMIT_ANALYSIS_DECISION,
        decisionRequest
      );
      return response.data;
    } catch (error) {
      console.error('Error submitting surgical decision for analysis:', error);
      throw error;
    }
  },

  async getDecisionsByAnalysis(analysisId: number): Promise<SurgicalDecision[]> {
    try {
      const response = await apiClient.get<SurgicalDecision[]>(
        API_ENDPOINTS.SURGICAL_DECISIONS.BY_ANALYSIS(analysisId)
      );
      return response.data || [];
    } catch (error) {
      console.error('Error fetching decisions by analysis:', error);
      throw error;
    }
  },

  async getAnalysisDecisionConsensus(analysisId: number): Promise<DecisionConsensus> {
    try {
      const response = await apiClient.get<DecisionConsensus>(
        API_ENDPOINTS.SURGICAL_DECISIONS.ANALYSIS_CONSENSUS(analysisId)
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching decision consensus for analysis:', error);
      throw error;
    }
  },

  async hasConsensusForAnalysis(analysisId: number): Promise<boolean> {
    try {
      const response = await apiClient.get<boolean>(
        API_ENDPOINTS.SURGICAL_DECISIONS.HAS_ANALYSIS_CONSENSUS(analysisId)
      );
      return response.data;
    } catch (error) {
      console.error('Error checking analysis consensus:', error);
      return false;
    }
  },

  async getDecisionById(id: number): Promise<SurgicalDecision> {
    try {
      const response = await apiClient.get<SurgicalDecision>(
        API_ENDPOINTS.SURGICAL_DECISIONS.BY_ID(id)
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching decision by ID:', error);
      throw error;
    }
  },
};