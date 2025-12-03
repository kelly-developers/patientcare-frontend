import { apiClient } from '@/config/api';
import { API_ENDPOINTS } from '@/config/api';

export interface SurgicalDecision {
  id: number;
  surgery: {
    id: number;
    patient: {
      id: number;
      patientId: string;
      firstName: string;
      lastName: string;
      dateOfBirth: string;
      gender: string;
    };
    procedureName: string;
    urgency: string;
    diagnosis: string;
    status: string;
  };
  surgeonName: string;
  decisionStatus: 'ACCEPTED' | 'DECLINED';
  comments: string;
  factorsConsidered: Record<string, any>;
  createdAt: string;
}

export interface SurgicalDecisionRequest {
  surgeryId: number;
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
  async submitDecision(decisionRequest: SurgicalDecisionRequest): Promise<SurgicalDecision> {
    try {
      const response = await apiClient.post<SurgicalDecision>(
        API_ENDPOINTS.SURGICAL_DECISIONS.BASE,
        decisionRequest
      );
      return response.data;
    } catch (error) {
      console.error('Error submitting surgical decision:', error);
      throw error;
    }
  },

  async getDecisionsBySurgery(surgeryId: number): Promise<SurgicalDecision[]> {
    try {
      const response = await apiClient.get<SurgicalDecision[]>(
        API_ENDPOINTS.SURGICAL_DECISIONS.BY_SURGERY(surgeryId)
      );
      return response.data || [];
    } catch (error) {
      console.error('Error fetching decisions by surgery:', error);
      throw error;
    }
  },

  async getDecisionConsensus(surgeryId: number): Promise<DecisionConsensus> {
    try {
      const response = await apiClient.get<DecisionConsensus>(
        API_ENDPOINTS.SURGICAL_DECISIONS.CONSENSUS(surgeryId)
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching decision consensus:', error);
      throw error;
    }
  },

  async hasConsensusForSurgery(surgeryId: number): Promise<boolean> {
    try {
      const response = await apiClient.get<boolean>(
        API_ENDPOINTS.SURGICAL_DECISIONS.HAS_CONSENSUS(surgeryId)
      );
      return response.data;
    } catch (error) {
      console.error('Error checking consensus:', error);
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