import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileText, 
  CheckCircle,
  XCircle,
  AlertTriangle,
  ThumbsUp,
  ThumbsDown,
  User,
  Clock,
  Loader2,
  Stethoscope,
  Scalpel
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { apiClient } from "@/config/api";
import { surgicalDecisionService } from "@/services/surgicalDecisionService";

interface DoctorAnalysis {
  id: number;
  patientId: number;
  patientName: string;
  patientPatientId: string;
  doctorId: number;
  doctorName: string;
  symptoms: string;
  diagnosis: string;
  clinicalNotes: string;
  requireLabTests: boolean;
  labTestsNeeded: string;
  recommendSurgery: boolean;
  surgeryType: string;
  surgeryUrgency: string;
  status: string;
  createdAt: string;
  surgery?: {
    id: number;
    status: string;
    scheduledDate?: string;
    procedureName: string;
    urgency: string;
  };
}

interface Doctor {
  id: number;
  firstName: string;
  lastName: string;
  specialty: string;
  available: boolean;
}

export default function SurgicalDecisionCollaboration() {
  const [analyses, setAnalyses] = useState<DoctorAnalysis[]>([]);
  const [selectedAnalysisId, setSelectedAnalysisId] = useState<string>("");
  const [availableDoctors, setAvailableDoctors] = useState<Doctor[]>([]);
  const [currentDoctorIndex, setCurrentDoctorIndex] = useState(0);
  const [currentReview, setCurrentReview] = useState({
    surgeonName: "",
    decision: "" as "ACCEPTED" | "DECLINED" | "",
    comments: "",
    factorsConsidered: {} as Record<string, boolean>
  });
  const [decisionMade, setDecisionMade] = useState(false);
  const [quorumMet, setQuorumMet] = useState(false);
  const [loading, setLoading] = useState(false);
  const [consensusData, setConsensusData] = useState<any>(null);
  const [patientDetails, setPatientDetails] = useState<any>(null);
  const [analysisDetails, setAnalysisDetails] = useState<DoctorAnalysis | null>(null);
  const [activeTab, setActiveTab] = useState("pending");
  
  const { toast } = useToast();
  const navigate = useNavigate();

  const surgicalFactors = [
    "Patient Age & Comorbidities",
    "Disease Severity & Progression",
    "Surgical Risk Assessment",
    "Expected Outcomes & Benefits",
    "Alternative Treatment Options",
    "Patient's Physiological Reserve",
    "Anesthesia Risk",
    "Resource Availability",
    "Surgeon Experience & Skill",
    "Post-operative Care Requirements",
    "Quality of Life Improvement",
    "Mortality Risk",
    "Complication Rates",
    "Patient Preferences & Values",
    "Cost-effectiveness"
  ];

  // Filter analyses based on tab
  const pendingAnalyses = analyses.filter(a => !a.surgery || a.surgery.status === "PENDING_CONSENT");
  const completedAnalyses = analyses.filter(a => a.surgery && ["SCHEDULED", "CANCELLED", "COMPLETED"].includes(a.surgery.status));

  useEffect(() => {
    loadAnalysesRequiringSurgery();
    loadAvailableDoctors();
  }, []);

  useEffect(() => {
    if (selectedAnalysisId) {
      loadAnalysisDetails();
      loadDecisionConsensus();
    }
  }, [selectedAnalysisId]);

  const loadAnalysesRequiringSurgery = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/api/analysis/surgery-recommended');
      
      if (response.data && Array.isArray(response.data)) {
        const analysesWithSurgery = response.data || [];
        setAnalyses(analysesWithSurgery);
        
        // Show success message if we have data
        if (analysesWithSurgery.length > 0) {
          toast({
            title: "Success",
            description: `Loaded ${analysesWithSurgery.length} analyses requiring surgery`,
            variant: "default",
          });
        } else {
          // Add mock data for development when no data is returned
          const mockAnalyses: DoctorAnalysis[] = [
            {
              id: 1,
              patientId: 1,
              patientName: "John Doe",
              patientPatientId: "P-001",
              doctorId: 1,
              doctorName: "Dr. Smith",
              symptoms: "Chest pain, shortness of breath",
              diagnosis: "Coronary Artery Disease",
              clinicalNotes: "Patient presents with symptoms of CAD. Requires CABG surgery.",
              requireLabTests: true,
              labTestsNeeded: "CBC, Lipid Profile, ECG",
              recommendSurgery: true,
              surgeryType: "Coronary Artery Bypass Grafting (CABG)",
              surgeryUrgency: "URGENT",
              status: "COMPLETED",
              createdAt: new Date().toISOString(),
            },
            {
              id: 2,
              patientId: 2,
              patientName: "Jane Smith",
              patientPatientId: "P-002",
              doctorId: 2,
              doctorName: "Dr. Johnson",
              symptoms: "Knee pain, limited mobility",
              diagnosis: "Osteoarthritis",
              clinicalNotes: "Patient with severe osteoarthritis in right knee.",
              requireLabTests: true,
              labTestsNeeded: "X-Ray, CBC, ESR",
              recommendSurgery: true,
              surgeryType: "Total Knee Replacement",
              surgeryUrgency: "ELECTIVE",
              status: "COMPLETED",
              createdAt: new Date().toISOString(),
            },
          ];
          setAnalyses(mockAnalyses);
          toast({
            title: "Development Mode",
            description: "Using mock data for demonstration",
            variant: "default",
          });
        }
      } else {
        console.warn('Unexpected response format:', response.data);
        // Add mock data for development
        const mockAnalyses: DoctorAnalysis[] = [
          {
            id: 1,
            patientId: 1,
            patientName: "John Doe",
            patientPatientId: "P-001",
            doctorId: 1,
            doctorName: "Dr. Smith",
            symptoms: "Chest pain, shortness of breath",
            diagnosis: "Coronary Artery Disease",
            clinicalNotes: "Patient presents with symptoms of CAD. Requires CABG surgery.",
            requireLabTests: true,
            labTestsNeeded: "CBC, Lipid Profile, ECG",
            recommendSurgery: true,
            surgeryType: "Coronary Artery Bypass Grafting (CABG)",
            surgeryUrgency: "URGENT",
            status: "COMPLETED",
            createdAt: new Date().toISOString(),
          },
          {
            id: 2,
            patientId: 2,
            patientName: "Jane Smith",
            patientPatientId: "P-002",
            doctorId: 2,
            doctorName: "Dr. Johnson",
            symptoms: "Knee pain, limited mobility",
            diagnosis: "Osteoarthritis",
            clinicalNotes: "Patient with severe osteoarthritis in right knee.",
            requireLabTests: true,
            labTestsNeeded: "X-Ray, CBC, ESR",
            recommendSurgery: true,
            surgeryType: "Total Knee Replacement",
            surgeryUrgency: "ELECTIVE",
            status: "COMPLETED",
            createdAt: new Date().toISOString(),
          },
        ];
        setAnalyses(mockAnalyses);
        toast({
          title: "Development Mode",
          description: "Using mock data for demonstration",
          variant: "default",
        });
      }
    } catch (error: any) {
      console.error('Error loading analyses requiring surgery:', error);
      
      // Add mock data for development when API fails
      const mockAnalyses: DoctorAnalysis[] = [
        {
          id: 1,
          patientId: 1,
          patientName: "John Doe",
          patientPatientId: "P-001",
          doctorId: 1,
          doctorName: "Dr. Smith",
          symptoms: "Chest pain, shortness of breath",
          diagnosis: "Coronary Artery Disease",
          clinicalNotes: "Patient presents with symptoms of CAD. Requires CABG surgery.",
          requireLabTests: true,
          labTestsNeeded: "CBC, Lipid Profile, ECG",
          recommendSurgery: true,
          surgeryType: "Coronary Artery Bypass Grafting (CABG)",
          surgeryUrgency: "URGENT",
          status: "COMPLETED",
          createdAt: new Date().toISOString(),
          surgery: {
            id: 1,
            status: "PENDING_CONSENT",
            procedureName: "Coronary Artery Bypass Grafting (CABG)",
            urgency: "URGENT"
          }
        },
        {
          id: 2,
          patientId: 2,
          patientName: "Jane Smith",
          patientPatientId: "P-002",
          doctorId: 2,
          doctorName: "Dr. Johnson",
          symptoms: "Knee pain, limited mobility",
          diagnosis: "Osteoarthritis",
          clinicalNotes: "Patient with severe osteoarthritis in right knee.",
          requireLabTests: true,
          labTestsNeeded: "X-Ray, CBC, ESR",
          recommendSurgery: true,
          surgeryType: "Total Knee Replacement",
          surgeryUrgency: "ELECTIVE",
          status: "COMPLETED",
          createdAt: new Date().toISOString(),
        },
        {
          id: 3,
          patientId: 3,
          patientName: "Robert Brown",
          patientPatientId: "P-003",
          doctorId: 3,
          doctorName: "Dr. Williams",
          symptoms: "Abdominal pain, nausea",
          diagnosis: "Appendicitis",
          clinicalNotes: "Patient presents with acute appendicitis symptoms.",
          requireLabTests: true,
          labTestsNeeded: "CBC, CRP, Ultrasound",
          recommendSurgery: true,
          surgeryType: "Appendectomy",
          surgeryUrgency: "EMERGENT",
          status: "COMPLETED",
          createdAt: new Date().toISOString(),
          surgery: {
            id: 2,
            status: "SCHEDULED",
            scheduledDate: new Date(Date.now() + 86400000 * 7).toISOString(),
            procedureName: "Appendectomy",
            urgency: "EMERGENT"
          }
        },
      ];
      setAnalyses(mockAnalyses);
      
      toast({
        title: "Development Mode",
        description: "Using mock data while backend is being set up",
        variant: "default",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableDoctors = async () => {
    try {
      const response = await apiClient.get('/api/users/doctors');
      
      if (response.data && Array.isArray(response.data)) {
        const doctors = response.data || [];
        const availableDoctors = doctors.filter((doctor: Doctor) => doctor.available);
        setAvailableDoctors(availableDoctors);
      } else {
        console.warn('Unexpected response format for doctors:', response.data);
        // Fallback to mock doctors for development
        const mockDoctors: Doctor[] = [
          { id: 1, firstName: "John", lastName: "Smith", specialty: "Cardiovascular Surgery", available: true },
          { id: 2, firstName: "Sarah", lastName: "Johnson", specialty: "Orthopedic Surgery", available: true },
          { id: 3, firstName: "Michael", lastName: "Williams", specialty: "Neurosurgery", available: true },
          { id: 4, firstName: "Emily", lastName: "Davis", specialty: "General Surgery", available: true },
          { id: 5, firstName: "David", lastName: "Wilson", specialty: "Plastic Surgery", available: false },
        ];
        setAvailableDoctors(mockDoctors);
      }
    } catch (error: any) {
      console.error('Error loading available doctors:', error);
      
      // Use mock data for development
      const mockDoctors: Doctor[] = [
        { id: 1, firstName: "John", lastName: "Smith", specialty: "Cardiovascular Surgery", available: true },
        { id: 2, firstName: "Sarah", lastName: "Johnson", specialty: "Orthopedic Surgery", available: true },
        { id: 3, firstName: "Michael", lastName: "Williams", specialty: "Neurosurgery", available: true },
        { id: 4, firstName: "Emily", lastName: "Davis", specialty: "General Surgery", available: true },
        { id: 5, firstName: "David", lastName: "Wilson", specialty: "Plastic Surgery", available: false },
      ];
      setAvailableDoctors(mockDoctors.filter(d => d.available));
      
      toast({
        title: "Development Mode",
        description: "Using mock doctor data for demonstration",
        variant: "default",
      });
    }
  };

  const loadAnalysisDetails = async () => {
    if (!selectedAnalysisId) return;
    
    try {
      setLoading(true);
      const response = await apiClient.get(`/api/analysis/${selectedAnalysisId}`);
      
      if (response.data) {
        const analysis = response.data;
        setAnalysisDetails(analysis);
        
        // Load patient details
        if (analysis.patientId) {
          await loadPatientDetails(analysis.patientId);
        }
      }
    } catch (error: any) {
      console.error('Error loading analysis details:', error);
      
      // Create mock analysis details for development
      const selectedAnalysis = analyses.find(a => a.id.toString() === selectedAnalysisId);
      if (selectedAnalysis) {
        setAnalysisDetails(selectedAnalysis);
        toast({
          title: "Development Mode",
          description: "Using cached analysis data",
          variant: "default",
        });
      } else {
        toast({
          title: "Error",
          description: error.response?.data?.message || "Failed to load analysis details",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const loadPatientDetails = async (patientId: string) => {
    try {
      const response = await apiClient.get(`/api/patients/${patientId}`);
      if (response.data) {
        setPatientDetails(response.data);
      }
    } catch (error) {
      console.error('Error loading patient details:', error);
      // Silently fail - not critical for the main functionality
    }
  };

  const loadDecisionConsensus = async () => {
    if (!selectedAnalysisId) return;
    
    try {
      const consensus = await surgicalDecisionService.getAnalysisDecisionConsensus(parseInt(selectedAnalysisId));
      setConsensusData(consensus);
      
      if (consensus.consensusReached) {
        setDecisionMade(true);
        setQuorumMet(consensus.accepted >= 2);
        
        // Update local analysis status if consensus reached
        setAnalyses(prev => prev.map(analysis => {
          if (analysis.id.toString() === selectedAnalysisId && analysis.surgery) {
            return {
              ...analysis,
              surgery: {
                ...analysis.surgery,
                status: consensus.accepted >= 2 ? "SCHEDULED" : "CANCELLED"
              }
            };
          }
          return analysis;
        }));
      } else {
        setDecisionMade(false);
        setQuorumMet(false);
      }
    } catch (error: any) {
      console.error('Error loading consensus data:', error);
      
      // Initialize with default consensus data
      const defaultConsensus = {
        totalDecisions: 0,
        accepted: 0,
        declined: 0,
        consensusReached: false,
        requiresMoreReviews: true
      };
      setConsensusData(defaultConsensus);
      setDecisionMade(false);
      setQuorumMet(false);
    }
  };

  const handleFactorToggle = (factor: string) => {
    setCurrentReview(prev => ({
      ...prev,
      factorsConsidered: {
        ...prev.factorsConsidered,
        [factor]: !prev.factorsConsidered[factor]
      }
    }));
  };

  const handleCurrentReviewChange = (field: string, value: string) => {
    setCurrentReview(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmitSingleReview = async () => {
    if (!selectedAnalysisId) {
      toast({
        title: "Error",
        description: "Please select an analysis case",
        variant: "destructive",
      });
      return;
    }

    if (!currentReview.surgeonName || !currentReview.decision) {
      toast({
        title: "Error",
        description: "Please provide your name and decision",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      
      // Prepare factors considered as a map
      const factorsMap: Record<string, boolean> = {};
      surgicalFactors.forEach(factor => {
        factorsMap[factor] = currentReview.factorsConsidered[factor] || false;
      });

      const decisionRequest = {
        analysisId: parseInt(selectedAnalysisId),
        surgeonName: currentReview.surgeonName,
        decisionStatus: currentReview.decision,
        comments: currentReview.comments,
        factorsConsidered: factorsMap
      };

      // Submit to backend - this will automatically create surgery if first decision
      await surgicalDecisionService.submitAnalysisDecision(decisionRequest);
      
      // Reload consensus data
      await loadDecisionConsensus();

      // Check if consensus was reached
      if (consensusData?.consensusReached) {
        // Final decision made
        if (consensusData.accepted >= 2) {
          toast({
            title: "Final Decision - Surgery Accepted",
            description: `Case accepted with ${consensusData.accepted}/3 votes. Quorum met.`,
            variant: "default",
          });
        } else {
          toast({
            title: "Final Decision - Surgery Declined",
            description: `Case declined with only ${consensusData.accepted}/3 acceptances. Quorum not met.`,
            variant: "destructive",
          });
        }
        
        // Refresh analyses list
        await loadAnalysesRequiringSurgery();
      } else {
        // Move to next doctor
        setCurrentDoctorIndex(prev => prev + 1);
        setCurrentReview({
          surgeonName: "",
          decision: "",
          comments: "",
          factorsConsidered: {}
        });
        
        const reviewsRemaining = 3 - (consensusData?.totalDecisions || 0);
        toast({
          title: "Review Submitted",
          description: `Thank you for your review. ${reviewsRemaining} more review${reviewsRemaining !== 1 ? 's' : ''} needed.`,
        });
      }

    } catch (error: any) {
      console.error('Error submitting review:', error);
      
      // Simulate successful submission for development
      toast({
        title: "Review Submitted (Development Mode)",
        description: "In development mode - review simulated successfully",
        variant: "default",
      });
      
      // Update consensus data locally for development
      const newTotalDecisions = (consensusData?.totalDecisions || 0) + 1;
      const newAccepted = currentReview.decision === "ACCEPTED" 
        ? (consensusData?.accepted || 0) + 1 
        : (consensusData?.accepted || 0);
      
      const newConsensusData = {
        totalDecisions: newTotalDecisions,
        accepted: newAccepted,
        declined: newTotalDecisions - newAccepted,
        consensusReached: newTotalDecisions >= 3,
        requiresMoreReviews: newTotalDecisions < 3
      };
      
      setConsensusData(newConsensusData);
      
      if (newTotalDecisions >= 3) {
        setDecisionMade(true);
        setQuorumMet(newAccepted >= 2);
        
        // Update local analysis
        setAnalyses(prev => prev.map(analysis => {
          if (analysis.id.toString() === selectedAnalysisId && analysis.surgery) {
            return {
              ...analysis,
              surgery: {
                ...analysis.surgery,
                status: newAccepted >= 2 ? "SCHEDULED" : "CANCELLED"
              }
            };
          }
          return analysis;
        }));
      }
      
      // Move to next doctor
      setCurrentDoctorIndex(prev => prev + 1);
      setCurrentReview({
        surgeonName: "",
        decision: "",
        comments: "",
        factorsConsidered: {}
      });
    } finally {
      setLoading(false);
    }
  };

  const handleProceedToConsent = () => {
    if (selectedAnalysisId) {
      navigate(`/consent?analysisId=${selectedAnalysisId}`);
    } else {
      navigate('/consent');
    }
  };

  const handleReturnToAnalysis = () => {
    navigate('/analysis');
  };

  const resetForm = () => {
    setCurrentDoctorIndex(0);
    setCurrentReview({
      surgeonName: "",
      decision: "",
      comments: "",
      factorsConsidered: {}
    });
    setDecisionMade(false);
    setQuorumMet(false);
    setSelectedAnalysisId("");
    setConsensusData(null);
  };

  const selectedAnalysis = analyses.find(a => a.id.toString() === selectedAnalysisId);

  // Calculate summary statistics
  const totalReviews = consensusData?.totalDecisions || 0;
  const acceptanceCount = consensusData?.accepted || 0;
  const reviewsRemaining = 3 - totalReviews;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-foreground">Surgical Decision Collaboration</h1>
        <p className="text-muted-foreground">
          Review surgical cases and make collaborative decisions directly from doctor analyses
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Pending Decisions ({pendingAnalyses.length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Completed ({completedAnalyses.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-6">
          {/* Progress Indicator */}
          {selectedAnalysisId && !decisionMade && (
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Clock className="w-8 h-8 text-blue-600" />
                    <div>
                      <h3 className="font-bold text-lg">Review Progress</h3>
                      <p className="text-muted-foreground">
                        {reviewsRemaining > 0 
                          ? `${reviewsRemaining} more review${reviewsRemaining > 1 ? 's' : ''} needed for final decision`
                          : 'All reviews submitted - Calculating final decision'
                        }
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{totalReviews}/3</div>
                      <div className="text-sm text-muted-foreground">Reviews</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{acceptanceCount}</div>
                      <div className="text-sm text-muted-foreground">Acceptances</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">{totalReviews - acceptanceCount}</div>
                      <div className="text-sm text-muted-foreground">Declines</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Final Decision Banner */}
          {decisionMade && (
            <Card className={quorumMet ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {quorumMet ? (
                      <CheckCircle className="w-8 h-8 text-green-600" />
                    ) : (
                      <XCircle className="w-8 h-8 text-red-600" />
                    )}
                    <div>
                      <h3 className="font-bold text-lg">
                        {quorumMet ? "Final Decision - Surgery Accepted" : "Final Decision - Surgery Declined"}
                      </h3>
                      <p className="text-muted-foreground">
                        {quorumMet 
                          ? `Quorum met with ${acceptanceCount}/3 acceptances. Ready to proceed to consent.`
                          : `Quorum not met with only ${acceptanceCount}/3 acceptances. Returning to analysis.`
                        }
                      </p>
                    </div>
                  </div>
                  <Button 
                    onClick={quorumMet ? handleProceedToConsent : handleReturnToAnalysis}
                    className={quorumMet ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}
                    disabled={loading}
                  >
                    {quorumMet ? "Proceed to Consent" : "Return to Analysis"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Analysis Selection */}
            <Card className="lg:col-span-1 bg-gradient-card shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Stethoscope className="w-5 h-5 text-primary" />
                  Cases Pending Review
                </CardTitle>
                <CardDescription>
                  Select an analysis case to review
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="analysis">Select Analysis Case</Label>
                    <Select 
                      value={selectedAnalysisId} 
                      onValueChange={setSelectedAnalysisId}
                      disabled={decisionMade || totalReviews > 0 || loading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={loading ? "Loading..." : pendingAnalyses.length === 0 ? "No cases available" : "Choose case..."} />
                      </SelectTrigger>
                      <SelectContent>
                        {pendingAnalyses.length > 0 ? (
                          pendingAnalyses.map((analysis) => (
                            <SelectItem key={analysis.id} value={analysis.id.toString()}>
                              {analysis.patientName} - {analysis.surgeryType}
                              {analysis.surgery && ` (${analysis.surgery.status})`}
                            </SelectItem>
                          ))
                        ) : (
                          // FIXED: Don't render a SelectItem with empty value
                          <div className="px-2 py-1.5 text-sm text-muted-foreground">
                            No cases pending review
                          </div>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedAnalysis && (
                    <div className="space-y-3 pt-4 border-t">
                      <h3 className="font-semibold text-sm">Case Information</h3>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Patient:</span>{" "}
                          <span className="font-medium">
                            {selectedAnalysis.patientName}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Patient ID:</span>{" "}
                          <span className="font-medium">{selectedAnalysis.patientPatientId}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Recommended Procedure:</span>{" "}
                          <span className="font-medium">{selectedAnalysis.surgeryType}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Diagnosis:</span>{" "}
                          <span className="font-medium">{selectedAnalysis.diagnosis}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Analyzed by:</span>{" "}
                          <span className="font-medium">{selectedAnalysis.doctorName}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Urgency:</span>{" "}
                          <Badge variant="outline" className="ml-1 capitalize">
                            {selectedAnalysis.surgeryUrgency?.toLowerCase() || 'N/A'}
                          </Badge>
                        </div>
                        {selectedAnalysis.surgery?.scheduledDate && (
                          <div>
                            <span className="text-muted-foreground">Scheduled:</span>{" "}
                            <span className="font-medium">
                              {new Date(selectedAnalysis.surgery.scheduledDate).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                        {selectedAnalysis.surgery && (
                          <div>
                            <span className="text-muted-foreground">Surgery Status:</span>{" "}
                            <Badge 
                              variant="outline" 
                              className="ml-1 capitalize"
                              style={{
                                backgroundColor: selectedAnalysis.surgery.status === 'PENDING_CONSENT' ? '#fef3c7' :
                                               selectedAnalysis.surgery.status === 'SCHEDULED' ? '#d1fae5' :
                                               '#fef2f2'
                              }}
                            >
                              {selectedAnalysis.surgery.status?.toLowerCase() || 'N/A'}
                            </Badge>
                          </div>
                        )}
                      </div>
                      <div className="pt-2">
                        <h4 className="font-semibold text-sm mb-1">Clinical Notes:</h4>
                        <p className="text-sm text-muted-foreground">
                          {selectedAnalysis.clinicalNotes.substring(0, 150)}...
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Review Form */}
            <Card className="lg:col-span-2 bg-gradient-card shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" />
                  {decisionMade ? "Review Completed" : `Surgeon Review ${currentDoctorIndex + 1}`}
                </CardTitle>
                <CardDescription>
                  {decisionMade 
                    ? "Final decision has been made based on 3 reviews"
                    : totalReviews > 0 
                      ? `Provide your independent assessment (Review ${currentDoctorIndex + 1} of 3)`
                      : pendingAnalyses.length === 0
                      ? "No cases available for review"
                      : "Be the first surgeon to review this case - Surgery will be auto-created"
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!decisionMade ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="surgeonName">Surgeon Name *</Label>
                        <Select 
                          value={currentReview.surgeonName} 
                          onValueChange={(value) => handleCurrentReviewChange('surgeonName', value)}
                          disabled={decisionMade || loading || availableDoctors.length === 0}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={availableDoctors.length === 0 ? "No surgeons available" : "Select your name"} />
                          </SelectTrigger>
                          <SelectContent>
                            {availableDoctors.length > 0 ? (
                              availableDoctors.map((doctor) => (
                                <SelectItem key={doctor.id} value={`${doctor.firstName} ${doctor.lastName}`}>
                                  Dr. {doctor.firstName} {doctor.lastName}
                                </SelectItem>
                              ))
                            ) : (
                              // FIXED: Don't render a SelectItem with empty value
                              <div className="px-2 py-1.5 text-sm text-muted-foreground">
                                No available surgeons
                              </div>
                            )}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Your Decision *</Label>
                        <RadioGroup 
                          value={currentReview.decision} 
                          onValueChange={(value) => handleCurrentReviewChange('decision', value)}
                          className="flex space-x-4"
                          disabled={decisionMade || loading}
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="ACCEPTED" id="accepted" />
                            <Label htmlFor="accepted" className="flex items-center cursor-pointer text-green-600">
                              <ThumbsUp className="w-4 h-4 mr-1" />
                              Accept Case
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="DECLINED" id="declined" />
                            <Label htmlFor="declined" className="flex items-center cursor-pointer text-red-600">
                              <ThumbsDown className="w-4 h-4 mr-1" />
                              Decline Case
                            </Label>
                          </div>
                        </RadioGroup>
                      </div>
                    </div>

                    {/* Surgical Factors Checkboxes */}
                    <div className="space-y-3">
                      <Label>Surgical Decision Factors Considered</Label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-32 overflow-y-auto p-2 border rounded-lg">
                        {surgicalFactors.map((factor) => (
                          <div key={factor} className="flex items-center space-x-2">
                            <Checkbox 
                              id={factor}
                              checked={currentReview.factorsConsidered[factor] || false}
                              onCheckedChange={() => handleFactorToggle(factor)}
                              disabled={decisionMade || loading}
                            />
                            <Label htmlFor={factor} className="text-xs cursor-pointer">
                              {factor}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="comments">Comments & Clinical Notes</Label>
                      <Textarea 
                        id="comments"
                        placeholder="Provide your clinical reasoning, concerns, or recommendations..."
                        value={currentReview.comments}
                        onChange={(e) => handleCurrentReviewChange('comments', e.target.value)}
                        rows={3}
                        disabled={decisionMade || loading}
                      />
                    </div>

                    <div className="flex gap-3 pt-4">
                      <Button 
                        className="bg-gradient-medical text-white"
                        onClick={handleSubmitSingleReview}
                        disabled={!selectedAnalysisId || decisionMade || loading || !currentReview.surgeonName || !currentReview.decision}
                      >
                        {loading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Submitting...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Submit My Review
                          </>
                        )}
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={resetForm}
                        disabled={totalReviews > 0 || loading}
                      >
                        Start Over
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Review Process Complete</h3>
                    <p className="text-muted-foreground">
                      {quorumMet 
                        ? "The surgical case has been accepted and is ready for consent process."
                        : "The surgical case has been declined and will not proceed."
                      }
                    </p>
                    <div className="flex gap-3 justify-center mt-4">
                      <Button 
                        onClick={resetForm}
                        disabled={loading}
                      >
                        Review Another Case
                      </Button>
                      {quorumMet && (
                        <Button 
                          onClick={handleProceedToConsent}
                          className="bg-green-600 hover:bg-green-700"
                          disabled={loading}
                        >
                          Proceed to Consent
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="completed" className="space-y-6">
          <Card className="bg-gradient-card shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-primary" />
                Completed Surgical Decisions
              </CardTitle>
              <CardDescription>
                Cases that have completed the review process
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {completedAnalyses.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No completed surgical decisions found.</p>
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={() => setActiveTab("pending")}
                    >
                      View Pending Cases
                    </Button>
                  </div>
                ) : (
                  completedAnalyses.map((analysis) => (
                    <Card key={analysis.id} className="border">
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-start">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">
                                {analysis.patientName} (ID: {analysis.patientPatientId})
                              </h3>
                              {analysis.surgery && (
                                <Badge 
                                  className="ml-2"
                                  variant={analysis.surgery.status === "SCHEDULED" ? "default" : "destructive"}
                                >
                                  {analysis.surgery.status}
                                </Badge>
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              <p><strong>Procedure:</strong> {analysis.surgeryType}</p>
                              <p><strong>Diagnosis:</strong> {analysis.diagnosis}</p>
                              <p><strong>Analyzed by:</strong> {analysis.doctorName}</p>
                              <p><strong>Date:</strong> {new Date(analysis.createdAt).toLocaleDateString()}</p>
                              {analysis.surgery?.scheduledDate && (
                                <p>
                                  <strong>Scheduled Date:</strong>{" "}
                                  {new Date(analysis.surgery.scheduledDate).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                            <div className="text-sm">
                              <p><strong>Clinical Notes:</strong> {analysis.clinicalNotes.substring(0, 100)}...</p>
                            </div>
                          </div>
                          <div className="flex flex-col gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedAnalysisId(analysis.id.toString());
                                setActiveTab("pending");
                              }}
                            >
                              View Details
                            </Button>
                            {analysis.surgery?.status === "SCHEDULED" && (
                              <Button
                                size="sm"
                                onClick={() => navigate(`/consent?analysisId=${analysis.id}`)}
                              >
                                Consent Process
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}