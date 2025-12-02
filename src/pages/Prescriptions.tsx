import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { FileText, Pill, Calendar, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { prescriptionsService, Prescription, CreatePrescriptionRequest } from "@/services/prescriptionsService";
import { usePatients } from "@/hooks/usePatients";

const commonMedications = [
  "Atorvastatin (Lipitor)",
  "Metoprolol (Lopressor)",
  "Lisinopril (Prinivil)",
  "Amlodipine (Norvasc)",
  "Warfarin (Coumadin)",
  "Clopidogrel (Plavix)",
  "Aspirin",
  "Furosemide (Lasix)",
  "Digoxin (Lanoxin)",
  "Carvedilol (Coreg)"
];

export default function Prescriptions() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const { patients, loading: patientsLoading } = usePatients();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    patientId: "",
    medicationName: "",
    dosage: "",
    frequency: "",
    duration: "",
    instructions: ""
  });
  const { toast } = useToast();

  useEffect(() => {
    loadPrescriptions();
  }, []);

  const loadPrescriptions = async () => {
    try {
      setLoading(true);
      const data = await prescriptionsService.getAll();
      setPrescriptions(data);
    } catch (error) {
      console.error('Error loading prescriptions:', error);
      toast({
        title: "Error",
        description: "Failed to load prescriptions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const selectedPatient = patients.find(p => p.id === formData.patientId);
    
    if (!selectedPatient) {
      toast({
        title: "Error",
        description: "Please select a patient",
        variant: "destructive",
      });
      return;
    }

    if (!formData.medicationName || !formData.dosage) {
      toast({
        title: "Error",
        description: "Please enter medication name and dosage",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    try {
      const prescriptionData: CreatePrescriptionRequest = {
        patient_id: formData.patientId,
        doctor_id: "current-doctor", // Replace with actual doctor ID from auth
        medication_name: formData.medicationName,
        dosage: formData.dosage,
        frequency: formData.frequency,
        duration: formData.duration,
        instructions: formData.instructions
      };

      const newPrescription = await prescriptionsService.create(prescriptionData);
      setPrescriptions(prev => [newPrescription, ...prev]);

      // Reset form
      setFormData({
        patientId: "",
        medicationName: "",
        dosage: "",
        frequency: "",
        duration: "",
        instructions: ""
      });

      toast({
        title: "Success",
        description: "Prescription created successfully",
      });
    } catch (error) {
      console.error('Error creating prescription:', error);
      toast({
        title: "Error",
        description: "Failed to create prescription",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getPatientName = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId);
    return patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown Patient';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-foreground">Prescriptions</h1>
        <p className="text-muted-foreground">
          Manage patient medications and treatment plans
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Prescription Form */}
        <Card className="bg-gradient-card shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Create Prescription
            </CardTitle>
            <CardDescription>
              Prescribe medications for cardiac patients
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="patient">Select Patient</Label>
                <Select 
                  value={formData.patientId} 
                  onValueChange={(value) => setFormData({...formData, patientId: value})}
                  disabled={patientsLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={patientsLoading ? "Loading patients..." : "Choose patient..."} />
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

              <div className="space-y-2">
                <Label htmlFor="medication">Medication</Label>
                <Select 
                  value={formData.medicationName} 
                  onValueChange={(value) => setFormData({...formData, medicationName: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select medication..." />
                  </SelectTrigger>
                  <SelectContent>
                    {commonMedications.map((med) => (
                      <SelectItem key={med} value={med}>{med}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dosage">Dosage</Label>
                  <Input
                    id="dosage"
                    placeholder="e.g., 10mg"
                    value={formData.dosage}
                    onChange={(e) => setFormData({...formData, dosage: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="frequency">Frequency</Label>
                  <Input
                    id="frequency"
                    placeholder="e.g., Once daily"
                    value={formData.frequency}
                    onChange={(e) => setFormData({...formData, frequency: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">Duration</Label>
                <Input
                  id="duration"
                  placeholder="e.g., 30 days"
                  value={formData.duration}
                  onChange={(e) => setFormData({...formData, duration: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="instructions">Instructions</Label>
                <Textarea
                  id="instructions"
                  placeholder="Take with food, avoid alcohol, etc."
                  value={formData.instructions}
                  onChange={(e) => setFormData({...formData, instructions: e.target.value})}
                  rows={3}
                />
              </div>

              <Button 
                type="submit" 
                className="w-full"
                disabled={submitting || patientsLoading}
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Prescription'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Prescription List */}
        <Card className="bg-gradient-card shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Pill className="w-5 h-5 text-primary" />
              Recent Prescriptions
            </CardTitle>
            <CardDescription>
              Active and recent medication prescriptions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {loading ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : prescriptions.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <Pill className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No prescriptions created yet</p>
                </div>
              ) : (
                prescriptions.map((prescription) => (
                  <div key={prescription.id} className="p-4 bg-background rounded-lg border">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium">{getPatientName(prescription.patient_id)}</div>
                      <Badge variant="default">Active</Badge>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium">{prescription.medication_name}</span>
                      </div>
                      <div className="text-muted-foreground">
                        <div>Dosage: {prescription.dosage}</div>
                        <div>Frequency: {prescription.frequency}</div>
                        <div>Duration: {prescription.duration}</div>
                      </div>
                      {prescription.instructions && (
                        <div className="text-xs text-muted-foreground mt-2">
                          <span className="font-medium">Instructions:</span> {prescription.instructions}
                        </div>
                      )}
                      <div className="text-xs text-muted-foreground pt-2 border-t">
                        Prescribed: {formatDate(prescription.created_at)}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
