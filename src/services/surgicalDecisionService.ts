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
      // Using the BASE endpoint since your API config doesn't have SUBMIT_ANALYSIS_DECISION
      const response = await apiClient.post<SurgicalDecision>(
        API_ENDPOINTS.SURGICAL_DECISIONS.BASE,
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
      // Use analysis-specific endpoint or filter by analysis
      const response = await apiClient.get<SurgicalDecision[]>(
        `${API_ENDPOINTS.SURGICAL_DECISIONS.BASE}/analysis/${analysisId}`
      );
      return response.data || [];
    } catch (error) {
      console.error('Error fetching decisions by analysis:', error);
      // Fallback: get all decisions and filter by analysisId
      const allDecisions = await apiClient.get<SurgicalDecision[]>(
        API_ENDPOINTS.SURGICAL_DECISIONS.BASE
      );
      return (allDecisions.data || []).filter(decision => decision.analysis?.id === analysisId);
    }
  },

  async getAnalysisDecisionConsensus(analysisId: number): Promise<DecisionConsensus> {
    try {
      // Try the correct consensus endpoint
      const response = await apiClient.get<DecisionConsensus>(
        `${API_ENDPOINTS.SURGICAL_DECISIONS.BASE}/analysis/${analysisId}/consensus`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching decision consensus for analysis:', error);
      
      // Calculate consensus manually if endpoint doesn't exist
      const decisions = await this.getDecisionsByAnalysis(analysisId);
      const totalDecisions = decisions.length;
      const accepted = decisions.filter(d => d.decisionStatus === 'ACCEPTED').length;
      const declined = totalDecisions - accepted;
      const consensusReached = totalDecisions >= 3;
      const requiresMoreReviews = totalDecisions < 3;
      
      return {
        totalDecisions,
        accepted,
        declined,
        consensusReached,
        requiresMoreReviews
      };
    }
  },

  async hasConsensusForAnalysis(analysisId: number): Promise<boolean> {
    try {
      const consensus = await this.getAnalysisDecisionConsensus(analysisId);
      return consensus.consensusReached && consensus.accepted >= 2;
    } catch (error) {
      console.error('Error checking analysis consensus:', error);
      return false;
    }
  },

  async getDecisionById(id: number): Promise<SurgicalDecision> {
    try {
      const response = await apiClient.get<SurgicalDecision>(
        `${API_ENDPOINTS.SURGICAL_DECISIONS.BASE}/${id}`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching decision by ID:', error);
      throw error;
    }
  },
};