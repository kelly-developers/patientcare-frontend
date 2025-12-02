// VitalDataCollection.tsx
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Heart, Activity, Thermometer, Weight, Ruler, Clock, AlertTriangle, CheckCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { usePatients } from "@/hooks/usePatients";

interface Patient {
  id: string;
  patientId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
}

interface VitalData {
  id: string;
  patientId: number;
  systolicBp: number;
  diastolicBp: number;
  heartRate: number;
  temperature: number;
  weight?: number;
  height?: number;
  oxygenSaturation: number;
  bloodGlucose?: number;
  respiratoryRate?: number;
  painLevel?: number;
  notes?: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  recordedAt: string;
  recordedBy: string;
}

export default function VitalDataCollection() {
  const [vitals, setVitals] = useState<VitalData[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    systolicBp: "",
    diastolicBp: "",
    heartRate: "",
    respiratoryRate: "",
    temperature: "",
    weight: "",
    height: "",
    oxygenSaturation: "",
    bloodGlucose: "",
    painLevel: "",
    notes: ""
  });
  
  const { toast } = useToast();
  const navigate = useNavigate();
  const { patients: backendPatients, loading: patientsLoading, recordVitalData, getVitalsRecordedByMe } = usePatients();

  useEffect(() => {
    loadPatients();
    loadVitals();
  }, []);

  useEffect(() => {
    if (backendPatients && backendPatients.length > 0) {
      const processedPatients = backendPatients.map((patient: any) => ({
        id: patient.id?.toString() || '',
        patientId: patient.patientId || patient.patient_id || `HOSP-${new Date().getFullYear()}-${patient.id}`,
        firstName: patient.firstName || patient.first_name || '',
        lastName: patient.lastName || patient.last_name || '',
        dateOfBirth: patient.dateOfBirth || patient.date_of_birth || '',
        gender: patient.gender || ''
      }));
      setPatients(processedPatients);
    }
  }, [backendPatients]);

  const loadPatients = async () => {
    try {
      setLoading(true);
      console.log('🔍 Loading patients...');
    } catch (error: any) {
      console.error('❌ Error loading patients:', error);
      toast({
        title: "Error",
        description: "Failed to load patients",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadVitals = async () => {
    try {
      const vitalsData = await getVitalsRecordedByMe();
      if (vitalsData && Array.isArray(vitalsData)) {
        const vitalsWithRisk = vitalsData.map((vital: any) => ({
          id: vital.id?.toString() || '',
          patientId: vital.patient?.id || vital.patientId || 0,
          systolicBp: vital.systolicBp || vital.systolicBP || 0,
          diastolicBp: vital.diastolicBp || vital.diastolicBP || 0,
          heartRate: vital.heartRate || 0,
          temperature: vital.temperature || 0,
          weight: vital.weight || 0,
          height: vital.height || 0,
          oxygenSaturation: vital.oxygenSaturation || 0,
          bloodGlucose: vital.bloodGlucose || null,
          respiratoryRate: vital.respiratoryRate || null,
          painLevel: vital.painLevel || null,
          notes: vital.notes || '',
          riskLevel: vital.riskLevel || 'LOW',
          recordedAt: vital.createdAt || vital.recordedAt || new Date().toISOString(),
          recordedBy: vital.recordedBy || 'Unknown'
        }));
        setVitals(vitalsWithRisk);
      }
    } catch (error: any) {
      console.error('Error loading vital data:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedPatient) {
      toast({
        title: "Error",
        description: "Please select a patient",
        variant: "destructive",
      });
      return;
    }

    // Validate required fields
    const requiredFields = ['systolicBp', 'diastolicBp', 'heartRate', 'temperature', 'oxygenSaturation'];
    const missingFields = requiredFields.filter(field => !formData[field as keyof typeof formData]);
    
    if (missingFields.length > 0) {
      toast({
        title: "Missing Information",
        description: `Please fill in all required vital signs`,
        variant: "destructive",
      });
      return;
    }

    // Validate numeric values
    const systolic = parseInt(formData.systolicBp);
    const diastolic = parseInt(formData.diastolicBp);
    const heartRate = parseInt(formData.heartRate);
    const temperature = parseFloat(formData.temperature);
    const oxygenSat = parseFloat(formData.oxygenSaturation);

    if (isNaN(systolic) || systolic < 50 || systolic > 250) {
      toast({
        title: "Invalid Value",
        description: "Systolic BP must be between 50 and 250",
        variant: "destructive",
      });
      return;
    }

    if (isNaN(diastolic) || diastolic < 30 || diastolic > 150) {
      toast({
        title: "Invalid Value",
        description: "Diastolic BP must be between 30 and 150",
        variant: "destructive",
      });
      return;
    }

    if (isNaN(heartRate) || heartRate < 30 || heartRate > 250) {
      toast({
        title: "Invalid Value",
        description: "Heart rate must be between 30 and 250",
        variant: "destructive",
      });
      return;
    }

    if (isNaN(temperature) || temperature < 32 || temperature > 43) {
      toast({
        title: "Invalid Value",
        description: "Temperature must be between 32°C and 43°C",
        variant: "destructive",
      });
      return;
    }

    if (isNaN(oxygenSat) || oxygenSat < 70 || oxygenSat > 100) {
      toast({
        title: "Invalid Value",
        description: "Oxygen saturation must be between 70% and 100%",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    try {
      // Prepare the vital data request - CORRECT field names
      const vitalDataRequest = {
        patientId: parseInt(selectedPatient), // Convert to number for backend
        systolicBp: systolic,
        diastolicBp: diastolic,
        heartRate: heartRate,
        respiratoryRate: formData.respiratoryRate ? parseInt(formData.respiratoryRate) : undefined,
        temperature: temperature,
        oxygenSaturation: oxygenSat,
        weight: formData.weight ? parseFloat(formData.weight) : undefined,
        height: formData.height ? parseFloat(formData.height) : undefined,
        bloodGlucose: formData.bloodGlucose ? parseInt(formData.bloodGlucose) : undefined,
        painLevel: formData.painLevel ? parseInt(formData.painLevel) : undefined,
        riskLevel: 'LOW', // Will be calculated in the service
        notes: formData.notes || '',
        recordedBy: 'current-user' // Will be set in the service
      };

      console.log('📝 Submitting vital data:', vitalDataRequest);

      // Record vital data
      await recordVitalData(vitalDataRequest);
      
      // Reset form
      setFormData({
        systolicBp: "",
        diastolicBp: "",
        heartRate: "",
        respiratoryRate: "",
        temperature: "",
        weight: "",
        height: "",
        oxygenSaturation: "",
        bloodGlucose: "",
        painLevel: "",
        notes: ""
      });
      setSelectedPatient("");

      toast({
        title: "Success",
        description: `Vital data recorded successfully for ${getPatientName(selectedPatient)}`,
      });

      // Reload vitals
      loadVitals();
    } catch (error: any) {
      console.error('❌ Error recording vital data:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to record vital data",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getRiskBadgeColor = (risk: string) => {
    switch (risk) {
      case 'CRITICAL': return 'bg-red-500 text-white';
      case 'HIGH': return 'bg-orange-500 text-white';
      case 'MEDIUM': return 'bg-yellow-500 text-black';
      case 'LOW': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getPatientName = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId);
    return patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown Patient';
  };

  const getPatientById = (patientId: number) => {
    const patient = patients.find(p => parseInt(p.id) === patientId);
    return patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown Patient';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-foreground">Vital Data Collection</h1>
        <p className="text-muted-foreground">
          Record and monitor cardiovascular vital signs and symptoms
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vital Data Entry Form */}
        <Card className="bg-gradient-card shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-primary" />
              Record Vital Signs
            </CardTitle>
            <CardDescription>
              Enter patient cardiovascular vital data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="patient">Select Patient *</Label>
                <Select 
                  value={selectedPatient} 
                  onValueChange={setSelectedPatient}
                  disabled={patientsLoading || submitting}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={patientsLoading ? "Loading patients..." : "Choose patient..."} />
                  </SelectTrigger>
                  <SelectContent>
                    {patients.length > 0 ? (
                      patients.map((patient) => (
                        <SelectItem 
                          key={patient.id} 
                          value={patient.id}
                        >
                          {patient.firstName} {patient.lastName} - {patient.patientId}
                        </SelectItem>
                      ))
                    ) : (
                      <div className="px-2 py-1.5 text-sm text-muted-foreground">
                        No patients found
                      </div>
                    )}
                  </SelectContent>
                </Select>
                <div className="flex justify-between items-center">
                  {patientsLoading && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Loading patients...
                    </div>
                  )}
                  {!patientsLoading && patients.length === 0 && (
                    <div className="text-sm text-muted-foreground">
                      No patients found. Please register patients first.
                    </div>
                  )}
                  {!patientsLoading && patients.length > 0 && (
                    <div className="text-sm text-muted-foreground">
                      {patients.length} patient(s) found
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="systolicBp">Blood Pressure (Systolic) *</Label>
                  <Input
                    id="systolicBp"
                    type="number"
                    placeholder="120"
                    value={formData.systolicBp}
                    onChange={(e) => setFormData({...formData, systolicBp: e.target.value})}
                    required
                    min="50"
                    max="250"
                    disabled={submitting}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="diastolicBp">Blood Pressure (Diastolic) *</Label>
                  <Input
                    id="diastolicBp"
                    type="number"
                    placeholder="80"
                    value={formData.diastolicBp}
                    onChange={(e) => setFormData({...formData, diastolicBp: e.target.value})}
                    required
                    min="30"
                    max="150"
                    disabled={submitting}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="heartRate">Heart Rate (BPM) *</Label>
                  <Input
                    id="heartRate"
                    type="number"
                    placeholder="72"
                    value={formData.heartRate}
                    onChange={(e) => setFormData({...formData, heartRate: e.target.value})}
                    required
                    min="30"
                    max="250"
                    disabled={submitting}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="respiratoryRate">Respiratory Rate</Label>
                  <Input
                    id="respiratoryRate"
                    type="number"
                    placeholder="16"
                    value={formData.respiratoryRate}
                    onChange={(e) => setFormData({...formData, respiratoryRate: e.target.value})}
                    min="8"
                    max="60"
                    disabled={submitting}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="temperature">Temperature (°C) *</Label>
                  <Input
                    id="temperature"
                    type="number"
                    step="0.1"
                    placeholder="36.5"
                    value={formData.temperature}
                    onChange={(e) => setFormData({...formData, temperature: e.target.value})}
                    required
                    min="32"
                    max="43"
                    disabled={submitting}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="oxygenSaturation">O2 Saturation (%) *</Label>
                  <Input
                    id="oxygenSaturation"
                    type="number"
                    placeholder="98"
                    value={formData.oxygenSaturation}
                    onChange={(e) => setFormData({...formData, oxygenSaturation: e.target.value})}
                    required
                    min="70"
                    max="100"
                    disabled={submitting}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.1"
                    placeholder="70"
                    value={formData.weight}
                    onChange={(e) => setFormData({...formData, weight: e.target.value})}
                    min="1"
                    max="300"
                    disabled={submitting}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="height">Height (cm)</Label>
                  <Input
                    id="height"
                    type="number"
                    step="0.1"
                    placeholder="170"
                    value={formData.height}
                    onChange={(e) => setFormData({...formData, height: e.target.value})}
                    min="50"
                    max="250"
                    disabled={submitting}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bloodGlucose">Blood Glucose (mg/dL)</Label>
                  <Input
                    id="bloodGlucose"
                    type="number"
                    placeholder="100"
                    value={formData.bloodGlucose}
                    onChange={(e) => setFormData({...formData, bloodGlucose: e.target.value})}
                    min="20"
                    max="500"
                    disabled={submitting}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="painLevel">Pain Level (0-10)</Label>
                  <Input
                    id="painLevel"
                    type="number"
                    placeholder="0"
                    value={formData.painLevel}
                    onChange={(e) => setFormData({...formData, painLevel: e.target.value})}
                    min="0"
                    max="10"
                    disabled={submitting}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Additional observations or comments..."
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  disabled={submitting}
                  rows={3}
                />
              </div>

              <Button 
                type="submit" 
                className="w-full bg-gradient-medical text-white"
                disabled={submitting || !selectedPatient}
              >
                {submitting ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Recording...
                  </div>
                ) : (
                  "Record Vital Data"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Recent Vital Records */}
        <Card className="bg-gradient-card shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Recent Vital Records
            </CardTitle>
            <CardDescription>
              Latest cardiovascular measurements
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {vitals.map((vital) => (
                <div key={vital.id} className="p-4 bg-background rounded-lg border">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium">{getPatientById(vital.patientId)}</div>
                    <Badge className={getRiskBadgeColor(vital.riskLevel)}>
                      {vital.riskLevel}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                    <div>BP: {vital.systolicBp}/{vital.diastolicBp}</div>
                    <div>HR: {vital.heartRate} BPM</div>
                    <div>Temp: {vital.temperature}°C</div>
                    <div>O2: {vital.oxygenSaturation}%</div>
                    {vital.respiratoryRate && <div>RR: {vital.respiratoryRate}</div>}
                    {vital.bloodGlucose && <div>Glucose: {vital.bloodGlucose} mg/dL</div>}
                    {vital.painLevel !== undefined && <div>Pain: {vital.painLevel}/10</div>}
                    {vital.weight && <div>Weight: {vital.weight} kg</div>}
                    {vital.height && <div>Height: {vital.height} cm</div>}
                  </div>
                  {vital.notes && (
                    <div className="mt-2 text-sm text-muted-foreground">
                      <strong>Notes:</strong> {vital.notes}
                    </div>
                  )}
                  <div className="mt-2 text-xs text-muted-foreground">
                    Recorded by: {vital.recordedBy} • {new Date(vital.recordedAt).toLocaleString()}
                  </div>
                </div>
              ))}
              {vitals.length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                  <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No vital data recorded yet</p>
                  <p className="text-sm">Start by recording patient vital signs</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}