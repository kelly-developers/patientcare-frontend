import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { 
  FileText, 
  CheckCircle,
  XCircle,
  AlertTriangle,
  ThumbsUp,
  ThumbsDown,
  User,
  Clock
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { apiClient } from "@/config/api";

export default function SurgicalDecisionCollaboration() {
  const [surgeries, setSurgeries] = useState<any[]>([]);
  const [selectedSurgeryId, setSelectedSurgeryId] = useState<string>("");
  const [surgeonReviews, setSurgeonReviews] = useState<any[]>([]);
  const [currentDoctorIndex, setCurrentDoctorIndex] = useState(0);
  const [currentReview, setCurrentReview] = useState({
    name: "",
    decision: "" as "ACCEPTED" | "DECLINED" | "",
    comments: "",
    factorsConsidered: {} as Record<string, boolean>
  });
  const [decisionMade, setDecisionMade] = useState(false);
  const [quorumMet, setQuorumMet] = useState(false);
  const [loading, setLoading] = useState(false);
  const [consensusData, setConsensusData] = useState<any>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const surgeons = [
    "Dr. Sarah Johnson",
    "Dr. Michael Chen", 
    "Dr. Emily Davis"
  ];

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
    loadSurgeries();
  }, []);

  useEffect(() => {
    if (selectedSurgeryId) {
      loadSurgeonReviews();
      loadConsensusData();
    }
  }, [selectedSurgeryId]);

  const loadSurgeries = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/api/surgeries/pending-consent');
      setSurgeries(response.data || []);
    } catch (error) {
      console.error('Error loading surgeries:', error);
      toast({
        title: "Error",
        description: "Failed to load surgery cases",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadSurgeonReviews = async () => {
    if (!selectedSurgeryId) return;
    
    try {
      setLoading(true);
      const response = await apiClient.get(`/api/surgical-decisions/surgery/${selectedSurgeryId}`);
      setSurgeonReviews(response.data || []);
    } catch (error) {
      console.error('Error loading surgeon reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadConsensusData = async () => {
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

  const getPatientDetails = async (patientId: string) => {
    try {
      const response = await apiClient.get(`/api/patients/${patientId}`);
      return response.data;
    } catch (error) {
      console.error('Error loading patient details:', error);
      return null;
    }
  };

  const getAnalysisDetails = async (patientId: string) => {
    try {
      const response = await apiClient.get(`/api/analysis/patient/${patientId}`);
      const analyses = response.data || [];
      return analyses.sort((a: any, b: any) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )[0];
    } catch (error) {
      console.error('Error loading analysis details:', error);
      return null;
    }
  };

  const getVitalDataByPatient = async (patientId: string) => {
    try {
      const response = await apiClient.get(`/api/vital-data/patient/${patientId}/latest?limit=5`);
      return response.data || [];
    } catch (error) {
      console.error('Error loading vital data:', error);
      return [];
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

    if (!currentReview.name || !currentReview.decision) {
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
        surgeonName: currentReview.name,
        decisionStatus: currentReview.decision,
        comments: currentReview.comments,
        factorsConsidered: factorsMap
      };

      // Submit to backend
      await apiClient.post('/api/surgical-decisions', decisionRequest);
      
      // Reload reviews and consensus data
      await loadSurgeonReviews();
      await loadConsensusData();

      if (consensusData?.consensusReached) {
        // Update surgery status based on consensus
        const newStatus = consensusData.accepted >= 2 ? 'APPROVED' : 'DECLINED';
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
        await loadSurgeries();
      } else {
        // Move to next doctor
        setCurrentDoctorIndex(prev => prev + 1);
        setCurrentReview({
          name: "",
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
      name: "",
      decision: "",
      comments: "",
      factorsConsidered: {}
    });
    setDecisionMade(false);
    setQuorumMet(false);
    setSelectedSurgeryId("");
    setSurgeonReviews([]);
    setConsensusData(null);
  };

  const selectedSurgery = surgeries.find(s => s.id.toString() === selectedSurgeryId);
  const surgeryReviews = surgeonReviews.filter(r => r.surgery?.id?.toString() === selectedSurgeryId);

  // Calculate summary statistics
  const totalReviews = consensusData?.totalDecisions || 0;
  const acceptanceCount = consensusData?.accepted || 0;
  const reviewsRemaining = 3 - totalReviews;
  
  // Calculate most considered factors across all reviews
  const allFactors = surgeryReviews.flatMap((review: any) => 
    Object.entries(review.factorsConsidered || {})
      .filter(([, value]) => value === true)
      .map(([factor]) => factor)
  );
  
  const factorCounts = allFactors.reduce((acc: any, factor: string) => {
    acc[factor] = (acc[factor] || 0) + 1;
    return acc;
  }, {});
  
  const topFactors = Object.entries(factorCounts)
    .sort(([,a]: any, [,b]: any) => b - a)
    .slice(0, 3)
    .map(([factor]) => factor);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-foreground">Surgical Decision Collaboration</h1>
        <p className="text-muted-foreground">
          Individual Surgeon Reviews - 3 reviews required for final decision
        </p>
      </div>

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
        {/* Case Selection with Summary Stats */}
        <Card className="lg:col-span-1 bg-gradient-card shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-primary" />
              Surgical Case
            </CardTitle>
            <CardDescription>
              Case under review
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="surgery">Select Case</Label>
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
                        {surgery.patient?.firstName} {surgery.patient?.lastName} - {surgery.procedureName}
                      </SelectItem>
                    ))}
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
                        {selectedSurgery.patient?.firstName} {selectedSurgery.patient?.lastName}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Patient ID:</span>{" "}
                      <span className="font-medium">{selectedSurgery.patient?.patientId}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Procedure:</span>{" "}
                      <span className="font-medium">{selectedSurgery.procedureName}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Urgency:</span>{" "}
                      <Badge variant="outline" className="ml-1 capitalize">
                        {selectedSurgery.urgency?.toLowerCase() || 'N/A'}
                      </Badge>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Diagnosis:</span>{" "}
                      <span className="font-medium">{selectedSurgery.diagnosis || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Status:</span>{" "}
                      <Badge variant="secondary" className="ml-1 capitalize">
                        {selectedSurgery.status?.toLowerCase().replace('_', ' ') || 'N/A'}
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
                    
                    {/* Summary Statistics */}
                    {totalReviews > 0 && (
                      <div className="pt-2 border-t">
                        <span className="text-muted-foreground">Review Progress:</span>
                        <div className="mt-1 space-y-1">
                          <div className="flex justify-between text-xs">
                            <span>Completed Reviews:</span>
                            <span className="font-medium">{totalReviews}/3</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span>Acceptances:</span>
                            <span className="font-medium text-green-600">
                              {acceptanceCount}
                            </span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span>Declines:</span>
                            <span className="font-medium text-red-600">
                              {totalReviews - acceptanceCount}
                            </span>
                          </div>
                          {topFactors.length > 0 && (
                            <div className="pt-1">
                              <span className="text-xs text-muted-foreground">Top Factors Considered:</span>
                              <div className="mt-1 space-y-0.5">
                                {topFactors.map((factor, index) => (
                                  <div key={factor} className="flex items-center text-xs">
                                    <div className="w-2 h-2 bg-primary rounded-full mr-2"></div>
                                    <span className="truncate">{factor}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Single Doctor Review Form */}
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
                      value={currentReview.name} 
                      onValueChange={(value) => handleCurrentReviewChange('name', value)}
                      disabled={decisionMade || loading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select your name" />
                      </SelectTrigger>
                      <SelectContent>
                        {surgeons.map((surgeon) => (
                          <SelectItem key={surgeon} value={surgeon}>
                            {surgeon}
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

      {/* Recent Individual Reviews */}
      {selectedSurgeryId && totalReviews > 0 && (
        <Card className="bg-gradient-card shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Submitted Reviews for This Case
            </CardTitle>
            <CardDescription>
              Individual surgeon assessments for the selected case
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {surgeryReviews.map((review) => (
                <div key={review.id} className="p-4 bg-background rounded-lg border">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-medium text-foreground">
                        Reviewed by: {review.surgeonName}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {new Date(review.createdAt).toLocaleDateString()} at {new Date(review.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                    <Badge 
                      variant={review.decisionStatus === 'ACCEPTED' ? 'default' : 'destructive'}
                      className="capitalize"
                    >
                      {review.decisionStatus?.toLowerCase()}
                    </Badge>
                  </div>
                  {review.factorsConsidered && Object.keys(review.factorsConsidered).length > 0 && (
                    <div className="mb-2">
                      <span className="font-medium text-sm">Factors Considered:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {Object.entries(review.factorsConsidered)
                          .filter(([, value]) => value === true)
                          .map(([factor]) => (
                            <Badge key={factor} variant="secondary" className="text-xs">
                              {factor}
                            </Badge>
                          ))}
                      </div>
                    </div>
                  )}
                  {review.comments && (
                    <div className="text-sm">
                      <span className="font-medium">Clinical Notes:</span> 
                      <p className="mt-1 text-muted-foreground">{review.comments}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}