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
  Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { analysisService, type DoctorAnalysis as DoctorAnalysisType, CreateAnalysisRequest } from "@/services/analysisService";
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
    diagnosis: "",
    recommendedSurgery: "",
    surgeryUrgency: "",
    clinicalNotes: ""
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
    } catch (error) {
      console.error('Error loading analyses:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPatientVitals = async (patientId: string) => {
    try {
      const vitals = await vitalDataService.getByPatient(patientId);
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

    if (!analysisData.diagnosis) {
      toast({
        title: "Error",
        description: "Please enter a diagnosis",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    try {
      const requestData: CreateAnalysisRequest = {
        patient_id: selectedPatientId,
        doctor_id: "current-doctor", // Replace with actual doctor ID from auth
        diagnosis: analysisData.diagnosis,
        recommended_surgery: analysisData.recommendedSurgery || undefined,
        surgery_urgency: analysisData.surgeryUrgency || undefined,
        clinical_notes: analysisData.clinicalNotes || undefined,
        status: 'completed'
      };

      const newAnalysis = await analysisService.create(requestData);
      setAnalyses(prev => [newAnalysis, ...prev]);

      toast({
        title: "Analysis Completed",
        description: "Medical assessment saved successfully",
      });

      // Reset form
      setAnalysisData({
        diagnosis: "",
        recommendedSurgery: "",
        surgeryUrgency: "",
        clinicalNotes: ""
      });
      setSelectedPatientId("");
      setLatestVitals(null);
    } catch (error) {
      console.error('Error saving analysis:', error);
      toast({
        title: "Error",
        description: "Failed to save analysis",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const selectedPatient = patients.find(p => p.id === selectedPatientId);

  const getPatientName = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId);
    return patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown Patient';
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
                <Label htmlFor="patient">Patient</Label>
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
                      <SelectItem key={patient.id} value={patient.id}>
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
                      <p className="text-foreground mt-1">{selectedPatient.medicalHistory || 'None recorded'}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Allergies:</span>{" "}
                      <p className="text-foreground mt-1">{selectedPatient.allergies || 'None recorded'}</p>
                    </div>
                    {latestVitals && (
                      <div className="pt-2 border-t">
                        <span className="text-muted-foreground">Latest Vitals:</span>
                        <div className="mt-1 grid grid-cols-2 gap-1 text-xs">
                          <div>BP: {latestVitals.blood_pressure_systolic}/{latestVitals.blood_pressure_diastolic}</div>
                          <div>HR: {latestVitals.heart_rate} BPM</div>
                          <div>Temp: {latestVitals.temperature}°C</div>
                          <div>O2: {latestVitals.oxygen_saturation}%</div>
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
                <Label htmlFor="diagnosis">Diagnosis *</Label>
                <Input 
                  id="diagnosis"
                  placeholder="Enter primary diagnosis"
                  value={analysisData.diagnosis}
                  onChange={(e) => setAnalysisData(prev => ({ ...prev, diagnosis: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="clinicalNotes">Clinical Notes</Label>
                <Textarea 
                  id="clinicalNotes"
                  placeholder="Additional observations, test results, recommendations..."
                  value={analysisData.clinicalNotes}
                  onChange={(e) => setAnalysisData(prev => ({ ...prev, clinicalNotes: e.target.value }))}
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="recommendedSurgery">Recommended Surgery (Optional)</Label>
                <Select 
                  value={analysisData.recommendedSurgery} 
                  onValueChange={(value) => setAnalysisData(prev => ({ ...prev, recommendedSurgery: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select surgery type (if applicable)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Surgery Needed</SelectItem>
                    <SelectItem value="Coronary Artery Bypass Grafting (CABG)">CABG</SelectItem>
                    <SelectItem value="Heart Valve Replacement">Heart Valve Replacement</SelectItem>
                    <SelectItem value="Angioplasty & Stent Placement">Angioplasty & Stent</SelectItem>
                    <SelectItem value="Pacemaker Installation">Pacemaker Installation</SelectItem>
                    <SelectItem value="Cardiac Ablation">Cardiac Ablation</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {analysisData.recommendedSurgery && analysisData.recommendedSurgery !== "none" && (
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
                      <SelectItem value="emergency">Emergency (0-6 hours)</SelectItem>
                      <SelectItem value="urgent">Urgent (24-48 hours)</SelectItem>
                      <SelectItem value="routine">Routine (1-2 weeks)</SelectItem>
                      <SelectItem value="elective">Elective (1+ months)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button 
                  className="bg-gradient-medical text-white"
                  onClick={handleAnalysisSubmit}
                  disabled={!selectedPatientId || submitting}
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
                <div key={analysis.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="font-medium">{getPatientName(analysis.patient_id)}</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(analysis.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <Badge>{analysis.status}</Badge>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div>
                      <span className="font-medium">Diagnosis:</span> {analysis.diagnosis}
                    </div>
                    {analysis.recommended_surgery && (
                      <div>
                        <span className="font-medium">Surgery:</span> {analysis.recommended_surgery}
                        {analysis.surgery_urgency && ` (${analysis.surgery_urgency})`}
                      </div>
                    )}
                    {analysis.clinical_notes && (
                      <div className="text-muted-foreground text-xs mt-2">
                        {analysis.clinical_notes}
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
