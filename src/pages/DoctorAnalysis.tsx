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
  Scalpel,
  TestTube
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
      setAnalyses(data);
    } catch (error: any) {
      console.error('Error loading analyses:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to load analyses",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadPatientVitals = async (patientId: string) => {
    try {
      const vitals = await vitalDataService.getByPatient(parseInt(patientId));
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
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
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

    setSubmitting(true);

    try {
      // Get current doctor ID from localStorage or auth context
      // For now, using a default doctor ID - replace with actual auth context
      const doctorId = 1; // TODO: Get from auth context

      const requestData: CreateAnalysisRequest = {
        patientId: parseInt(selectedPatientId),
        doctorId: doctorId,
        symptoms: analysisData.symptoms,
        diagnosis: analysisData.diagnosis,
        clinicalNotes: analysisData.clinicalNotes.trim() || undefined,
        recommendSurgery: analysisData.recommendSurgery,
        surgeryType: analysisData.surgeryType || undefined,
        surgeryUrgency: analysisData.surgeryUrgency as any,
        requireLabTests: analysisData.requireLabTests,
        labTestsNeeded: analysisData.labTestsNeeded.trim() || undefined,
        status: 'COMPLETED'
      };

      const newAnalysis = await analysisService.create(requestData);
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
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to save analysis",
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSurgeryUrgencyLabel = (urgency: string) => {
    switch (urgency) {
      case 'EMERGENCY': return 'Emergency';
      case 'URGENT': return 'Urgent';
      case 'ROUTINE': return 'Routine';
      case 'ELECTIVE': return 'Elective';
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
                    <div>
                      <span className="text-muted-foreground">Age:</span>{" "}
                      <span className="font-medium">{getPatientAge(selectedPatient.dateOfBirth)} years</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Gender:</span>{" "}
                      <span className="font-medium capitalize">{selectedPatient.gender || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Medical History:</span>{" "}
                      <p className="text-foreground mt-1 text-xs">{selectedPatient.medicalHistory || 'None recorded'}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Allergies:</span>{" "}
                      <p className="text-foreground mt-1 text-xs">{selectedPatient.allergies || 'None recorded'}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Current Medications:</span>{" "}
                      <p className="text-foreground mt-1 text-xs">{selectedPatient.currentMedications || 'None recorded'}</p>
                    </div>
                    {latestVitals && (
                      <div className="pt-2 border-t">
                        <span className="text-muted-foreground">Latest Vitals:</span>
                        <div className="mt-1 grid grid-cols-2 gap-1 text-xs">
                          <div>BP: {latestVitals.systolicBp}/{latestVitals.diastolicBp} mmHg</div>
                          <div>HR: {latestVitals.heartRate} BPM</div>
                          <div>Temp: {latestVitals.temperature}°C</div>
                          <div>O2: {latestVitals.oxygenSaturation}%</div>
                          <div>RR: {latestVitals.respiratoryRate} bpm</div>
                          <div>Glucose: {latestVitals.bloodGlucose || 'N/A'} mg/dL</div>
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
                <Label htmlFor="requireLabTests" className="cursor-pointer">
                  <TestTube className="w-4 h-4 inline mr-2" />
                  Require Laboratory Tests
                </Label>
              </div>

              {analysisData.requireLabTests && (
                <div className="space-y-2">
                  <Label htmlFor="labTestsNeeded">Lab Tests Needed</Label>
                  <Textarea 
                    id="labTestsNeeded"
                    placeholder="Specify required lab tests: CBC, ECG, Echocardiogram, Cardiac enzymes..."
                    value={analysisData.labTestsNeeded}
                    onChange={(e) => setAnalysisData(prev => ({ ...prev, labTestsNeeded: e.target.value }))}
                    rows={2}
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
                <Label htmlFor="recommendSurgery" className="cursor-pointer">
                  <Scalpel className="w-4 h-4 inline mr-2" />
                  Recommend Surgery
                </Label>
              </div>

              {analysisData.recommendSurgery && (
                <div className="space-y-4 pl-6 border-l-2 border-primary/20">
                  <div className="space-y-2">
                    <Label htmlFor="surgeryType">Surgery Type</Label>
                    <Select 
                      value={analysisData.surgeryType} 
                      onValueChange={(value) => setAnalysisData(prev => ({ ...prev, surgeryType: value }))}
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
                    <Label htmlFor="surgeryUrgency">Surgery Urgency</Label>
                    <Select 
                      value={analysisData.surgeryUrgency} 
                      onValueChange={(value) => setAnalysisData(prev => ({ ...prev, surgeryUrgency: value }))}
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
                      <div className="font-medium">{getPatientName(analysis.patient.id)}</div>
                      <div className="text-sm text-muted-foreground flex items-center gap-2">
                        <span>Dr. {analysis.doctor.firstName} {analysis.doctor.lastName}</span>
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
                      <span className="text-foreground">{analysis.diagnosis}</span>
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
                          <Scalpel className="w-4 h-4" />
                          Surgery Recommended
                        </div>
                        <div className="text-sm text-red-700 mt-1">
                          <div>Type: {analysis.surgeryType}</div>
                          {analysis.surgeryUrgency && (
                            <div>Urgency: {getSurgeryUrgencyLabel(analysis.surgeryUrgency)}</div>
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