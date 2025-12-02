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
  patientId: string;
  patientName: string;
  systolicBP: number;
  diastolicBP: number;
  heartRate: number;
  temperature: number;
  weight: number;
  height: number;
  oxygenSaturation: number;
  bloodGlucose?: number;
  respiratoryRate?: number;
  painLevel?: number;
  notes?: string;
  bmi?: number;
  bloodPressure?: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  recordedAt: string;
  recordedByName: string;
}

// Simple token management
const getToken = (): string | null => {
  try {
    return localStorage.getItem('patientcare_token');
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
};

const isTokenValid = (): boolean => {
  const token = getToken();
  if (!token) return false;
  
  try {
    // Simple check - in a real app you'd decode and check expiration
    return token.length > 10;
  } catch (error) {
    return false;
  }
};

export default function VitalDataCollection() {
  const [vitals, setVitals] = useState<VitalData[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    systolicBP: "",
    diastolicBP: "",
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

  useEffect(() => {
    // Check authentication first
    if (!isTokenValid()) {
      toast({
        title: "Authentication Required",
        description: "Please log in to access this page",
        variant: "destructive",
      });
      navigate('/auth');
      return;
    }
    
    loadPatients();
    loadVitals();
  }, [navigate, toast]);

  const loadPatients = async () => {
    try {
      setLoading(true);
      const token = getToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('https://patientcarebackend.onrender.com/api/patients', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('Patients loaded successfully:', result.data?.length || 0, 'patients');
        if (result.success) {
          const patientsData = result.data.map((patient: any) => ({
            id: patient.id,
            patientId: patient.id,
            firstName: patient.firstName,
            lastName: patient.lastName,
            dateOfBirth: patient.dateOfBirth,
            gender: patient.gender
          }));
          setPatients(patientsData);
        }
      } else if (response.status === 401) {
        toast({
          title: "Session Expired",
          description: "Please log in again",
          variant: "destructive",
        });
        localStorage.removeItem('patientcare_token');
        navigate('/auth');
      } else {
        const errorText = await response.text();
        throw new Error(`Failed to load patients: ${response.status} ${errorText}`);
      }
    } catch (error: any) {
      console.error('Error loading patients:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to load patients",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadVitals = async () => {
    try {
      const token = getToken();
      if (!token) return;

      const response = await fetch('https://patientcarebackend.onrender.com/api/vital-data/recorded-by-me', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          // Add risk level to each vital record
          const vitalsWithRisk = result.data.map((vital: any) => ({
            ...vital,
            riskLevel: calculateRiskLevel(vital)
          }));
          setVitals(vitalsWithRisk);
        }
      } else if (response.status === 401) {
        console.log('Authentication failed for vital data');
      } else {
        console.log('Failed to load vital data:', response.status);
      }
    } catch (error: any) {
      console.error('Error loading vital data:', error);
      // Don't show error toast for vital data loading as it might not be critical
    }
  };

  const calculateRiskLevel = (vitals: any): 'low' | 'medium' | 'high' | 'critical' => {
    const systolic = vitals.systolicBP;
    const diastolic = vitals.diastolicBP;
    const heartRate = vitals.heartRate;
    const oxygenSat = vitals.oxygenSaturation;

    if (!systolic || !diastolic || !heartRate || !oxygenSat) {
      return 'low';
    }

    // Critical conditions
    if (systolic > 180 || diastolic > 120 || heartRate > 120 || heartRate < 50 || oxygenSat < 90) {
      return 'critical';
    }
    // High risk
    if (systolic > 160 || diastolic > 100 || heartRate > 100 || oxygenSat < 95) {
      return 'high';
    }
    // Medium risk
    if (systolic > 140 || diastolic > 90 || heartRate > 80) {
      return 'medium';
    }
    return 'low';
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
    const requiredFields = ['systolicBP', 'diastolicBP', 'heartRate', 'temperature', 'oxygenSaturation', 'weight', 'height'];
    const missingFields = requiredFields.filter(field => !formData[field as keyof typeof formData]);
    
    if (missingFields.length > 0) {
      toast({
        title: "Missing Information",
        description: `Please fill in all required vital signs`,
        variant: "destructive",
      });
      return;
    }

    // Validate numeric ranges
    const systolic = parseInt(formData.systolicBP);
    const diastolic = parseInt(formData.diastolicBP);
    const heartRate = parseInt(formData.heartRate);
    const temperature = parseFloat(formData.temperature);
    const oxygenSat = parseFloat(formData.oxygenSaturation);

    if (systolic < 50 || systolic > 250) {
      toast({
        title: "Invalid Value",
        description: "Systolic BP must be between 50 and 250",
        variant: "destructive",
      });
      return;
    }

    if (diastolic < 30 || diastolic > 150) {
      toast({
        title: "Invalid Value",
        description: "Diastolic BP must be between 30 and 150",
        variant: "destructive",
      });
      return;
    }

    if (heartRate < 30 || heartRate > 250) {
      toast({
        title: "Invalid Value",
        description: "Heart rate must be between 30 and 250",
        variant: "destructive",
      });
      return;
    }

    if (temperature < 32 || temperature > 43) {
      toast({
        title: "Invalid Value",
        description: "Temperature must be between 32°C and 43°C",
        variant: "destructive",
      });
      return;
    }

    if (oxygenSat < 70 || oxygenSat > 100) {
      toast({
        title: "Invalid Value",
        description: "Oxygen saturation must be between 70% and 100%",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    try {
      const token = getToken();
      if (!token) {
        toast({
          title: "Authentication Required",
          description: "Please log in to record vital data",
          variant: "destructive",
        });
        navigate('/auth');
        return;
      }

      // Prepare the request data - ensure all fields are properly formatted
      const vitalDataRequest = {
        patientId: selectedPatient,
        systolicBP: systolic,
        diastolicBP: diastolic,
        heartRate: heartRate,
        respiratoryRate: formData.respiratoryRate ? parseInt(formData.respiratoryRate) : null,
        temperature: temperature,
        oxygenSaturation: oxygenSat,
        height: formData.height ? parseFloat(formData.height) : null,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        bloodGlucose: formData.bloodGlucose ? parseFloat(formData.bloodGlucose) : null,
        painLevel: formData.painLevel ? parseInt(formData.painLevel) : null,
        notes: formData.notes || null
      };

      console.log('Submitting vital data:', vitalDataRequest);

      const response = await fetch('https://patientcarebackend.onrender.com/api/vital-data', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(vitalDataRequest)
      });

      const responseText = await response.text();
      let result;
      
      try {
        result = responseText ? JSON.parse(responseText) : {};
      } catch (parseError) {
        console.error('Failed to parse response:', parseError);
        throw new Error('Invalid response from server');
      }

      if (response.ok) {
        if (result.success) {
          const newVital = result.data;
          const riskLevel = calculateRiskLevel(newVital);
          
          // Add risk level to the vital data for display
          const vitalWithRisk = {
            ...newVital,
            riskLevel
          };

          setVitals(prev => [vitalWithRisk, ...prev]);
          
          // Reset form
          setFormData({
            systolicBP: "",
            diastolicBP: "",
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
            description: `Vital data recorded successfully. Risk level: ${riskLevel.toUpperCase()}`,
          });

          // Reload vitals to ensure we have the latest data
          loadVitals();
        } else {
          throw new Error(result.message || 'Failed to record vital data');
        }
      } else {
        throw new Error(result.message || `Server error: ${response.status}`);
      }
    } catch (error: any) {
      console.error('Error recording vital data:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to record vital data. Please check if the patient exists and all values are valid.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getRiskBadgeColor = (risk: string) => {
    switch (risk) {
      case 'critical': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-black';
      case 'low': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getPatientName = (patientId: string) => {
    const patient = patients.find(p => p.patientId === patientId);
    return patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown Patient';
  };

  if (!isTokenValid()) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">Authentication Required</h2>
              <p className="text-muted-foreground mb-4">Please log in to access vital data collection</p>
              <Button onClick={() => navigate('/auth')}>
                Go to Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

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
                  disabled={loading || submitting}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={loading ? "Loading patients..." : "Choose patient..."} />
                  </SelectTrigger>
                  <SelectContent>
                    {patients.map((patient) => (
                      <SelectItem key={patient.id} value={patient.id}>
                        {patient.firstName} {patient.lastName} - {patient.id}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {loading && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Loading patients...
                  </div>
                )}
                {!loading && patients.length === 0 && (
                  <div className="text-sm text-muted-foreground">
                    No patients found. Please register patients first.
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="systolic">Blood Pressure (Systolic) *</Label>
                  <Input
                    id="systolic"
                    type="number"
                    placeholder="120"
                    value={formData.systolicBP}
                    onChange={(e) => setFormData({...formData, systolicBP: e.target.value})}
                    required
                    min="50"
                    max="250"
                    disabled={submitting}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="diastolic">Blood Pressure (Diastolic) *</Label>
                  <Input
                    id="diastolic"
                    type="number"
                    placeholder="80"
                    value={formData.diastolicBP}
                    onChange={(e) => setFormData({...formData, diastolicBP: e.target.value})}
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
                  <Label htmlFor="oxygenSat">O2 Saturation (%) *</Label>
                  <Input
                    id="oxygenSat"
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
                  <Label htmlFor="weight">Weight (kg) *</Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.1"
                    placeholder="70"
                    value={formData.weight}
                    onChange={(e) => setFormData({...formData, weight: e.target.value})}
                    required
                    min="1"
                    max="300"
                    disabled={submitting}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="height">Height (cm) *</Label>
                  <Input
                    id="height"
                    type="number"
                    placeholder="170"
                    value={formData.height}
                    onChange={(e) => setFormData({...formData, height: e.target.value})}
                    required
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
                    <div className="font-medium">{getPatientName(vital.patientId)}</div>
                    <Badge className={getRiskBadgeColor(vital.riskLevel)}>
                      {vital.riskLevel.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                    <div>BP: {vital.systolicBP}/{vital.diastolicBP}</div>
                    <div>HR: {vital.heartRate} BPM</div>
                    <div>Temp: {vital.temperature}°C</div>
                    <div>O2: {vital.oxygenSaturation}%</div>
                    {vital.respiratoryRate && <div>RR: {vital.respiratoryRate}</div>}
                    {vital.bloodGlucose && <div>Glucose: {vital.bloodGlucose} mg/dL</div>}
                    {vital.painLevel !== undefined && <div>Pain: {vital.painLevel}/10</div>}
                    {vital.bmi && <div>BMI: {vital.bmi.toFixed(1)}</div>}
                  </div>
                  {vital.notes && (
                    <div className="mt-2 text-sm text-muted-foreground">
                      <strong>Notes:</strong> {vital.notes}
                    </div>
                  )}
                  <div className="mt-2 text-xs text-muted-foreground">
                    {new Date(vital.recordedAt).toLocaleString()}
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