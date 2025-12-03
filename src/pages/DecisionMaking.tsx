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
}

interface Surgery {
  id: number;
  patientId: number;
  patientName: string;
  patientPatientId: string;
  procedureName: string;
  diagnosis: string;
  urgency: string;
  status: string;
  scheduledDate: string;
  recommendedBy: string;
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
  const [surgeries, setSurgeries] = useState<Surgery[]>([]);
  const [selectedAnalysisId, setSelectedAnalysisId] = useState<string>("");
  const [selectedSurgeryId, setSelectedSurgeryId] = useState<string>("");
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
  const [activeTab, setActiveTab] = useState("surgeries");
  
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

  useEffect(() => {
    loadAnalysesRequiringSurgery();
    loadSurgeriesPendingConsent();
    loadAvailableDoctors();
  }, []);

  useEffect(() => {
    if (selectedAnalysisId) {
      loadAnalysisDetails();
    }
  }, [selectedAnalysisId]);

  useEffect(() => {
    if (selectedSurgeryId) {
      loadSurgeryDetails();
      loadDecisionConsensus();
    }
  }, [selectedSurgeryId]);

  const loadAnalysesRequiringSurgery = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/api/analysis/surgery-recommended');
      setAnalyses(response.data || []);
    } catch (error) {
      console.error('Error loading analyses requiring surgery:', error);
      toast({
        title: "Error",
        description: "Failed to load analyses requiring surgery",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadSurgeriesPendingConsent = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/api/surgeries/pending-consent');
      setSurgeries(response.data || []);
    } catch (error) {
      console.error('Error loading surgeries pending consent:', error);
      toast({
        title: "Error",
        description: "Failed to load surgeries pending consent",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableDoctors = async () => {
    try {
      const response = await apiClient.get('/api/users/doctors');
      const doctors = response.data || [];
      const availableDoctors = doctors.filter((doctor: Doctor) => doctor.available);
      setAvailableDoctors(availableDoctors);
    } catch (error) {
      console.error('Error loading available doctors:', error);
    }
  };

  const loadAnalysisDetails = async () => {
    if (!selectedAnalysisId) return;
    
    try {
      setLoading(true);
      const response = await apiClient.get(`/api/analysis/${selectedAnalysisId}`);
      const analysis = response.data;
      setAnalysisDetails(analysis);
      
      // Load patient details
      if (analysis.patientId) {
        await loadPatientDetails(analysis.patientId);
      }
    } catch (error) {
      console.error('Error loading analysis details:', error);
      toast({
        title: "Error",
        description: "Failed to load analysis details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadSurgeryDetails = async () => {
    if (!selectedSurgeryId) return;
    
    try {
      const response = await apiClient.get(`/api/surgeries/${selectedSurgeryId}`);
      const surgery = response.data;
      
      // Load patient details for surgery
      if (surgery.patientId) {
        await loadPatientDetails(surgery.patientId);
      }
    } catch (error) {
      console.error('Error loading surgery details:', error);
    }
  };

  const loadPatientDetails = async (patientId: string) => {
    try {
      const response = await apiClient.get(`/api/patients/${patientId}`);
      setPatientDetails(response.data);
    } catch (error) {
      console.error('Error loading patient details:', error);
    }
  };

  const loadDecisionConsensus = async () => {
    if (!selectedSurgeryId) return;
    
    try {
      const response = await apiClient.get(`/api/surgical-decisions/consensus/${selectedSurgeryId}`);
      setConsensusData(response.data);
      
      if (response.data.consensusReached) {
        setDecisionMade(true);
        setQuorumMet(response.data.accepted >= 2);
      } else {
        setDecisionMade(false);
        setQuorumMet(false);
      }
    } catch (error) {
      console.error('Error loading consensus data:', error);
    }
  };

  const createSurgeryFromAnalysis = async (analysisId: string) => {
    try {
      setLoading(true);
      
      // Get analysis details
      const response = await apiClient.get(`/api/analysis/${analysisId}`);
      const analysis = response.data;
      
      // Create surgery from analysis
      const surgeryRequest = {
        patientId: analysis.patient.id,
        procedureName: analysis.surgeryType,
        urgency: mapAnalysisUrgencyToSurgeryUrgency(analysis.surgeryUrgency),
        recommendedBy: analysis.doctor.firstName + " " + analysis.doctor.lastName,
        diagnosis: analysis.diagnosis,
        status: "PENDING_CONSENT"
      };
      
      await apiClient.post('/api/surgeries', surgeryRequest);
      
      toast({
        title: "Success",
        description: "Surgery case created from analysis",
      });
      
      // Reload surgeries
      await loadSurgeriesPendingConsent();
      setActiveTab("surgeries");
      
    } catch (error) {
      console.error('Error creating surgery from analysis:', error);
      toast({
        title: "Error",
        description: "Failed to create surgery from analysis",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const mapAnalysisUrgencyToSurgeryUrgency = (urgency: string): string => {
    switch (urgency?.toUpperCase()) {
      case "EMERGENT": return "EMERGENCY";
      case "URGENT": return "URGENT";
      case "SCHEDULED": return "SCHEDULED";
      case "ELECTIVE": return "ELECTIVE";
      default: return "ELECTIVE";
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
    if (!selectedSurgeryId) {
      toast({
        title: "Error",
        description: "Please select a surgery case",
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
        surgeryId: parseInt(selectedSurgeryId),
        surgeonName: currentReview.surgeonName,
        decisionStatus: currentReview.decision,
        comments: currentReview.comments,
        factorsConsidered: factorsMap
      };

      // Submit to backend
      await surgicalDecisionService.submitDecision(decisionRequest);
      
      // Reload consensus data
      await loadDecisionConsensus();

      if (consensusData?.consensusReached) {
        // Update surgery status based on consensus
        const newStatus = consensusData.accepted >= 2 ? 'SCHEDULED' : 'CANCELLED';
        await apiClient.put(`/api/surgeries/${selectedSurgeryId}/status`, null, {
          params: { status: newStatus }
        });

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
        
        // Refresh surgeries list
        await loadSurgeriesPendingConsent();
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
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to submit review",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleProceedToConsent = () => {
    if (selectedSurgeryId) {
      navigate(`/consent?surgeryId=${selectedSurgeryId}`);
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
    setSelectedSurgeryId("");
    setConsensusData(null);
  };

  const selectedSurgery = surgeries.find(s => s.id.toString() === selectedSurgeryId);
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
          Review surgical cases and make collaborative decisions
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="surgeries" className="flex items-center gap-2">
            <Scalpel className="w-4 h-4" />
            Pending Surgeries ({surgeries.length})
          </TabsTrigger>
          <TabsTrigger value="analyses" className="flex items-center gap-2">
            <Stethoscope className="w-4 h-4" />
            Analyses Requiring Surgery ({analyses.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="surgeries" className="space-y-6">
          {/* Progress Indicator */}
          {selectedSurgeryId && !decisionMade && (
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
            {/* Surgery Selection */}
            <Card className="lg:col-span-1 bg-gradient-card shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-primary" />
                  Surgical Cases Pending Review
                </CardTitle>
                <CardDescription>
                  Select a surgery case to review
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="surgery">Select Surgery Case</Label>
                    <Select 
                      value={selectedSurgeryId} 
                      onValueChange={setSelectedSurgeryId}
                      disabled={decisionMade || totalReviews > 0 || loading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={loading ? "Loading..." : "Choose case..."} />
                      </SelectTrigger>
                      <SelectContent>
                        {surgeries.map((surgery) => (
                          <SelectItem key={surgery.id} value={surgery.id.toString()}>
                            {surgery.patientName} - {surgery.procedureName}
                          </SelectItem>
                        ))}
                        {surgeries.length === 0 && (
                          <SelectItem value="" disabled>No surgeries pending consent</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedSurgery && (
                    <div className="space-y-3 pt-4 border-t">
                      <h3 className="font-semibold text-sm">Case Information</h3>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Patient:</span>{" "}
                          <span className="font-medium">
                            {selectedSurgery.patientName}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Patient ID:</span>{" "}
                          <span className="font-medium">{selectedSurgery.patientPatientId}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Procedure:</span>{" "}
                          <span className="font-medium">{selectedSurgery.procedureName}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Diagnosis:</span>{" "}
                          <span className="font-medium">{selectedSurgery.diagnosis}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Recommended by:</span>{" "}
                          <span className="font-medium">{selectedSurgery.recommendedBy}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Urgency:</span>{" "}
                          <Badge variant="outline" className="ml-1 capitalize">
                            {selectedSurgery.urgency?.toLowerCase() || 'N/A'}
                          </Badge>
                        </div>
                        {selectedSurgery.scheduledDate && (
                          <div>
                            <span className="text-muted-foreground">Scheduled:</span>{" "}
                            <span className="font-medium">
                              {new Date(selectedSurgery.scheduledDate).toLocaleDateString()}
                            </span>
                          </div>
                        )}
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
                      : "Be the first surgeon to review this case"
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
                          disabled={decisionMade || loading}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select your name" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableDoctors.map((doctor) => (
                              <SelectItem key={doctor.id} value={`${doctor.firstName} ${doctor.lastName}`}>
                                Dr. {doctor.firstName} {doctor.lastName}
                              </SelectItem>
                            ))}
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
                        disabled={!selectedSurgeryId || decisionMade || loading}
                      >
                        {loading ? (
                          <>
                            <span className="animate-spin mr-2">⟳</span>
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
                      The surgical case has received 3 reviews and a final decision has been made.
                    </p>
                    <Button 
                      onClick={resetForm}
                      className="mt-4"
                      disabled={loading}
                    >
                      Review Another Case
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analyses" className="space-y-6">
          <Card className="bg-gradient-card shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-primary" />
                Analyses Requiring Surgery
              </CardTitle>
              <CardDescription>
                Doctor analyses that recommend surgery - Create surgical cases from these
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyses.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No analyses requiring surgery found.</p>
                  </div>
                ) : (
                  analyses.map((analysis) => (
                    <Card key={analysis.id} className="border">
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-start">
                          <div className="space-y-2">
                            <h3 className="font-semibold">
                              {analysis.patientName} (ID: {analysis.patientPatientId})
                            </h3>
                            <div className="text-sm text-muted-foreground">
                              <p><strong>Diagnosis:</strong> {analysis.diagnosis}</p>
                              <p><strong>Recommended Surgery:</strong> {analysis.surgeryType}</p>
                              <p><strong>Urgency:</strong> {analysis.surgeryUrgency}</p>
                              <p><strong>Analyzed by:</strong> {analysis.doctorName}</p>
                              <p><strong>Date:</strong> {new Date(analysis.createdAt).toLocaleDateString()}</p>
                            </div>
                            <div className="text-sm">
                              <p><strong>Symptoms:</strong> {analysis.symptoms.substring(0, 100)}...</p>
                            </div>
                          </div>
                          <div className="flex flex-col gap-2">
                            <Button
                              size="sm"
                              onClick={() => createSurgeryFromAnalysis(analysis.id.toString())}
                              disabled={loading}
                            >
                              {loading ? (
                                <>
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                  Creating...
                                </>
                              ) : (
                                <>
                                  <Scalpel className="w-4 h-4 mr-2" />
                                  Create Surgery Case
                                </>
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedAnalysisId(analysis.id.toString());
                                setActiveTab("surgeries");
                              }}
                            >
                              View Details
                            </Button>
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