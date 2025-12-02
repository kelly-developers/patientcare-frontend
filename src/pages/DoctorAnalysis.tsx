import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { 
  Stethoscope, 
  User, 
  CheckCircle,
  Loader2,
  Scissors,
  TestTube,
  AlertCircle,
  Calendar,
  Heart,
  Thermometer,
  Activity
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { 
  analysisService, 
  type DoctorAnalysis as DoctorAnalysisType, 
  CreateAnalysisRequest 
} from "@/services/analysisService";
import { usePatients } from "@/hooks/usePatients";
import { vitalDataService } from "@/services/vitalDataService";

export default function DoctorAnalysis() {
  const { patients, loading: patientsLoading } = usePatients();
  const [analyses, setAnalyses] = useState<DoctorAnalysisType[]>([]);
  const [latestVitals, setLatestVitals] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [analysisData, setAnalysisData] = useState({
    symptoms: "",
    diagnosis: "",
    clinicalNotes: "",
    recommendSurgery: false,
    surgeryType: "",
    surgeryUrgency: "",
    requireLabTests: false,
    labTestsNeeded: ""
  });
  const { toast } = useToast();

  // Get current doctor ID from localStorage or context
  const getCurrentDoctorId = (): number => {
    try {
      const user = JSON.parse(localStorage.getItem('patientcare_user') || '{}');
      return user?.id || 1; // Default to doctor ID 1 if not found
    } catch (error) {
      console.error('Error getting current doctor ID:', error);
      return 1; // Default fallback
    }
  };

  useEffect(() => {
    loadAnalyses();
  }, []);

  useEffect(() => {
    if (selectedPatientId) {
      loadPatientVitals(selectedPatientId);
    }
  }, [selectedPatientId]);

  const loadAnalyses = async () => {
    try {
      setLoading(true);
      const data = await analysisService.getAll();
      console.log('Loaded analyses:', data);
      setAnalyses(data);
    } catch (error: any) {
      console.error('Error loading analyses:', error);
      const errorMessage = error.response?.data?.message || error.message || "Failed to load analyses";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      // Set empty array on error
      setAnalyses([]);
    } finally {
      setLoading(false);
    }
  };

  const loadPatientVitals = async (patientId: string) => {
    try {
      const vitals = await vitalDataService.getByPatient(parseInt(patientId));
      console.log('Loaded patient vitals:', vitals);
      if (vitals && vitals.length > 0) {
        setLatestVitals(vitals[vitals.length - 1]);
      } else {
        setLatestVitals(null);
      }
    } catch (error) {
      console.error('Error loading patient vitals:', error);
      setLatestVitals(null);
    }
  };

  const getPatientAge = (dateOfBirth: string) => {
    try {
      const today = new Date();
      const birthDate = new Date(dateOfBirth);
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age;
    } catch (error) {
      return 0;
    }
  };

  const handleAnalysisSubmit = async () => {
    if (!selectedPatientId) {
      toast({
        title: "Error",
        description: "Please select a patient",
        variant: "destructive",
      });
      return;
    }

    if (!analysisData.symptoms.trim()) {
      toast({
        title: "Error",
        description: "Please describe symptoms",
        variant: "destructive",
      });
      return;
    }

    if (!analysisData.diagnosis.trim()) {
      toast({
        title: "Error",
        description: "Please enter a diagnosis",
        variant: "destructive",
      });
      return;
    }

    if (analysisData.recommendSurgery && (!analysisData.surgeryType || !analysisData.surgeryUrgency)) {
      toast({
        title: "Error",
        description: "Please select surgery type and urgency if recommending surgery",
        variant: "destructive",
      });
      return;
    }

    if (analysisData.requireLabTests && !analysisData.labTestsNeeded.trim()) {
      toast({
        title: "Error",
        description: "Please specify required lab tests",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    try {
      const doctorId = getCurrentDoctorId();
      
      const requestData: CreateAnalysisRequest = {
        patientId: parseInt(selectedPatientId),
        doctorId: doctorId,
        symptoms: analysisData.symptoms,
        diagnosis: analysisData.diagnosis,
        clinicalNotes: analysisData.clinicalNotes.trim() || undefined,
        recommendSurgery: analysisData.recommendSurgery,
        surgeryType: analysisData.surgeryType.trim() || undefined,
        surgeryUrgency: analysisData.surgeryUrgency as any,
        requireLabTests: analysisData.requireLabTests,
        labTestsNeeded: analysisData.labTestsNeeded.trim() || undefined,
        status: 'COMPLETED'
      };

      console.log('Sending analysis data:', requestData);
      
      const newAnalysis = await analysisService.create(requestData);
      console.log('Created analysis:', newAnalysis);
      
      setAnalyses(prev => [newAnalysis, ...prev]);

      toast({
        title: "Analysis Completed",
        description: "Medical assessment saved successfully",
      });

      // Reset form
      setAnalysisData({
        symptoms: "",
        diagnosis: "",
        clinicalNotes: "",
        recommendSurgery: false,
        surgeryType: "",
        surgeryUrgency: "",
        requireLabTests: false,
        labTestsNeeded: ""
      });
      setSelectedPatientId("");
      setLatestVitals(null);
    } catch (error: any) {
      console.error('Error saving analysis:', error);
      let errorMessage = "Failed to save analysis";
      
      if (error.response?.data) {
        if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.data.error) {
          errorMessage = error.response.data.error;
        } else if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const selectedPatient = patients.find(p => p.id === parseInt(selectedPatientId));

  const getPatientName = (patientId: number) => {
    const patient = patients.find(p => p.id === patientId);
    return patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown Patient';
  };

  const getDoctorName = (doctor: any) => {
    if (!doctor) return 'Unknown Doctor';
    return `Dr. ${doctor.firstName} ${doctor.lastName}`;
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return dateString;
    }
  };

  const getSurgeryUrgencyLabel = (urgency: string) => {
    switch (urgency) {
      case 'EMERGENCY': return 'Emergency (0-6 hours)';
      case 'URGENT': return 'Urgent (24-48 hours)';
      case 'ROUTINE': return 'Routine (1-2 weeks)';
      case 'ELECTIVE': return 'Elective (1+ months)';
      default: return urgency;
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-500 text-white';
      case 'PENDING': return 'bg-yellow-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const truncateText = (text: string, maxLength: number = 100) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-foreground">Doctor Analysis</h1>
        <p className="text-muted-foreground">
          Medical assessment, diagnosis, and treatment planning
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Patient Selection */}
        <Card className="lg:col-span-1 bg-gradient-card shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              Select Patient
            </CardTitle>
            <CardDescription>
              Choose patient for analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="patient">Patient *</Label>
                <Select 
                  value={selectedPatientId} 
                  onValueChange={setSelectedPatientId}
                  disabled={patientsLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={patientsLoading ? "Loading..." : "Choose patient..."} />
                  </SelectTrigger>
                  <SelectContent>
                    {patients.map((patient) => (
                      <SelectItem key={patient.id} value={patient.id.toString()}>
                        {patient.firstName} {patient.lastName} - {patient.patientId}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedPatient && (
                <div className="space-y-3 pt-4 border-t">
                  <h3 className="font-semibold text-sm">Patient Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Name:</span>{" "}
                      <span className="font-medium">{selectedPatient.firstName} {selectedPatient.lastName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Age:</span>{" "}
                      <span className="font-medium">{getPatientAge(selectedPatient.dateOfBirth)} years</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Gender:</span>{" "}
                      <span className="font-medium capitalize">{selectedPatient.gender || 'N/A'}</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Heart className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Medical History:</span>
                      </div>
                      <p className="text-foreground mt-1 text-xs bg-muted/50 p-2 rounded">
                        {truncateText(selectedPatient.medicalHistory || 'None recorded', 150)}
                      </p>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <AlertCircle className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Allergies:</span>
                      </div>
                      <p className="text-foreground mt-1 text-xs bg-muted/50 p-2 rounded">
                        {truncateText(selectedPatient.allergies || 'None recorded', 100)}
                      </p>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <TestTube className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Current Medications:</span>
                      </div>
                      <p className="text-foreground mt-1 text-xs bg-muted/50 p-2 rounded">
                        {truncateText(selectedPatient.currentMedications || 'None recorded', 100)}
                      </p>
                    </div>
                    {latestVitals && (
                      <div className="pt-2 border-t">
                        <div className="flex items-center gap-2 mb-2">
                          <Activity className="w-4 h-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Latest Vitals:</span>
                        </div>
                        <div className="mt-1 grid grid-cols-2 gap-2 text-xs">
                          <div className="flex items-center gap-1 bg-blue-50 p-2 rounded">
                            <Heart className="w-3 h-3 text-blue-600" />
                            <span className="font-medium">BP:</span> 
                            <span>{latestVitals.systolicBp || '--'}/{latestVitals.diastolicBp || '--'} mmHg</span>
                          </div>
                          <div className="flex items-center gap-1 bg-green-50 p-2 rounded">
                            <Activity className="w-3 h-3 text-green-600" />
                            <span className="font-medium">HR:</span> 
                            <span>{latestVitals.heartRate || '--'} BPM</span>
                          </div>
                          <div className="flex items-center gap-1 bg-orange-50 p-2 rounded">
                            <Thermometer className="w-3 h-3 text-orange-600" />
                            <span className="font-medium">Temp:</span> 
                            <span>{latestVitals.temperature || '--'}°C</span>
                          </div>
                          <div className="flex items-center gap-1 bg-purple-50 p-2 rounded">
                            <Activity className="w-3 h-3 text-purple-600" />
                            <span className="font-medium">O2:</span> 
                            <span>{latestVitals.oxygenSaturation || '--'}%</span>
                          </div>
                          <div className="flex items-center gap-1 bg-cyan-50 p-2 rounded">
                            <Activity className="w-3 h-3 text-cyan-600" />
                            <span className="font-medium">RR:</span> 
                            <span>{latestVitals.respiratoryRate || '--'} bpm</span>
                          </div>
                          <div className="flex items-center gap-1 bg-pink-50 p-2 rounded">
                            <TestTube className="w-3 h-3 text-pink-600" />
                            <span className="font-medium">Glucose:</span> 
                            <span>{latestVitals.bloodGlucose || '--'} mg/dL</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Analysis Form */}
        <Card className="lg:col-span-2 bg-gradient-card shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-primary" />
              Medical Analysis
            </CardTitle>
            <CardDescription>
              Record diagnosis and treatment plan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="symptoms">Symptoms *</Label>
                <Textarea 
                  id="symptoms"
                  placeholder="Describe patient symptoms, onset, duration, severity..."
                  value={analysisData.symptoms}
                  onChange={(e) => setAnalysisData(prev => ({ ...prev, symptoms: e.target.value }))}
                  rows={3}
                  required
                  className="resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="diagnosis">Diagnosis *</Label>
                <Textarea 
                  id="diagnosis"
                  placeholder="Enter primary diagnosis and any secondary diagnoses..."
                  value={analysisData.diagnosis}
                  onChange={(e) => setAnalysisData(prev => ({ ...prev, diagnosis: e.target.value }))}
                  rows={2}
                  required
                  className="resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="clinicalNotes">Clinical Notes</Label>
                <Textarea 
                  id="clinicalNotes"
                  placeholder="Additional observations, physical exam findings, assessment..."
                  value={analysisData.clinicalNotes}
                  onChange={(e) => setAnalysisData(prev => ({ ...prev, clinicalNotes: e.target.value }))}
                  rows={4}
                  className="resize-none"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="requireLabTests"
                  checked={analysisData.requireLabTests}
                  onCheckedChange={(checked) => 
                    setAnalysisData(prev => ({ ...prev, requireLabTests: checked as boolean }))
                  }
                />
                <Label htmlFor="requireLabTests" className="cursor-pointer flex items-center gap-2">
                  <TestTube className="w-4 h-4" />
                  Require Laboratory Tests
                </Label>
              </div>

              {analysisData.requireLabTests && (
                <div className="space-y-2 pl-6">
                  <Label htmlFor="labTestsNeeded">Lab Tests Needed *</Label>
                  <Textarea 
                    id="labTestsNeeded"
                    placeholder="Specify required lab tests: CBC, ECG, Echocardiogram, Cardiac enzymes..."
                    value={analysisData.labTestsNeeded}
                    onChange={(e) => setAnalysisData(prev => ({ ...prev, labTestsNeeded: e.target.value }))}
                    rows={2}
                    className="resize-none"
                    required={analysisData.requireLabTests}
                  />
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="recommendSurgery"
                  checked={analysisData.recommendSurgery}
                  onCheckedChange={(checked) => 
                    setAnalysisData(prev => ({ 
                      ...prev, 
                      recommendSurgery: checked as boolean,
                      surgeryType: checked ? prev.surgeryType : "",
                      surgeryUrgency: checked ? prev.surgeryUrgency : ""
                    }))
                  }
                />
                <Label htmlFor="recommendSurgery" className="cursor-pointer flex items-center gap-2">
                  <Scissors className="w-4 h-4" />
                  Recommend Surgery
                </Label>
              </div>

              {analysisData.recommendSurgery && (
                <div className="space-y-4 pl-6 border-l-2 border-red-200">
                  <div className="space-y-2">
                    <Label htmlFor="surgeryType">Surgery Type *</Label>
                    <Select 
                      value={analysisData.surgeryType} 
                      onValueChange={(value) => setAnalysisData(prev => ({ ...prev, surgeryType: value }))}
                      required={analysisData.recommendSurgery}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select surgery type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Coronary Artery Bypass Grafting (CABG)">Coronary Artery Bypass Grafting (CABG)</SelectItem>
                        <SelectItem value="Heart Valve Replacement/Repair">Heart Valve Replacement/Repair</SelectItem>
                        <SelectItem value="Angioplasty & Stent Placement">Angioplasty & Stent Placement</SelectItem>
                        <SelectItem value="Pacemaker/ICD Implantation">Pacemaker/ICD Implantation</SelectItem>
                        <SelectItem value="Cardiac Ablation">Cardiac Ablation</SelectItem>
                        <SelectItem value="Cardiac Transplant">Cardiac Transplant</SelectItem>
                        <SelectItem value="Aortic Aneurysm Repair">Aortic Aneurysm Repair</SelectItem>
                        <SelectItem value="Other">Other (specify in notes)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="surgeryUrgency">Surgery Urgency *</Label>
                    <Select 
                      value={analysisData.surgeryUrgency} 
                      onValueChange={(value) => setAnalysisData(prev => ({ ...prev, surgeryUrgency: value }))}
                      required={analysisData.recommendSurgery}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select urgency level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="EMERGENCY">Emergency (0-6 hours)</SelectItem>
                        <SelectItem value="URGENT">Urgent (24-48 hours)</SelectItem>
                        <SelectItem value="ROUTINE">Routine (1-2 weeks)</SelectItem>
                        <SelectItem value="ELECTIVE">Elective (1+ months)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button 
                  className="bg-gradient-medical text-white"
                  onClick={handleAnalysisSubmit}
                  disabled={!selectedPatientId || !analysisData.symptoms.trim() || !analysisData.diagnosis.trim() || submitting}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Complete Analysis
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Previous Analyses */}
      <Card className="bg-gradient-card shadow-card">
        <CardHeader>
          <CardTitle>Recent Analyses</CardTitle>
          <CardDescription>Previously completed medical assessments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : analyses.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <Stethoscope className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No analyses completed yet</p>
              </div>
            ) : (
              analyses.map((analysis) => (
                <div key={analysis.id} className="p-4 border rounded-lg bg-background">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="font-medium">
                        {analysis.patient ? `${analysis.patient.firstName} ${analysis.patient.lastName}` : 'Unknown Patient'}
                      </div>
                      <div className="text-sm text-muted-foreground flex items-center gap-2">
                        <span>{getDoctorName(analysis.doctor)}</span>
                        <span>•</span>
                        <span>{formatDate(analysis.createdAt)}</span>
                      </div>
                    </div>
                    <Badge className={getStatusBadgeColor(analysis.status)}>
                      {analysis.status}
                    </Badge>
                  </div>
                  
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="font-medium">Symptoms:</span>{" "}
                      <span className="text-muted-foreground">{analysis.symptoms}</span>
                    </div>
                    
                    <div>
                      <span className="font-medium">Diagnosis:</span>{" "}
                      <span className="text-foreground font-semibold">{analysis.diagnosis}</span>
                    </div>
                    
                    {analysis.clinicalNotes && (
                      <div>
                        <span className="font-medium">Clinical Notes:</span>{" "}
                        <span className="text-muted-foreground">{analysis.clinicalNotes}</span>
                      </div>
                    )}
                    
                    {analysis.recommendSurgery && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                        <div className="font-medium text-red-800 flex items-center gap-2">
                          <Scissors className="w-4 h-4" />
                          Surgery Recommended
                        </div>
                        <div className="text-sm text-red-700 mt-1 space-y-1">
                          {analysis.surgeryType && <div>Type: <span className="font-semibold">{analysis.surgeryType}</span></div>}
                          {analysis.surgeryUrgency && (
                            <div>Urgency: <span className="font-semibold">{getSurgeryUrgencyLabel(analysis.surgeryUrgency)}</span></div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {analysis.requireLabTests && analysis.labTestsNeeded && (
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                        <div className="font-medium text-blue-800 flex items-center gap-2">
                          <TestTube className="w-4 h-4" />
                          Lab Tests Required
                        </div>
                        <div className="text-sm text-blue-700 mt-1">{analysis.labTestsNeeded}</div>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}