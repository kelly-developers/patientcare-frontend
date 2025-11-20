import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Heart, 
  Droplet, 
  Activity, 
  Brain,
  User, 
  AlertTriangle, 
  CheckCircle,
  Pill,
  Bed,
  Save,
  Monitor,
  Stethoscope,
  ClipboardList,
  Trash2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ICUMonitoring {
  id: string;
  timestamp: string;
  heart_rate: number;
  blood_pressure_systolic: number;
  blood_pressure_diastolic: number;
  mean_arterial_pressure: number;
  central_venous_pressure: number;
  respiratory_rate: number;
  oxygen_saturation: number;
  fio2: number;
  peep: number;
  tidal_volume: number;
  minute_ventilation: number;
  gcs_total: number;
  gcs_eyes: number;
  gcs_verbal: number;
  gcs_motor: number;
  pupil_size_left: string;
  pupil_size_right: string;
  pupil_reaction_left: boolean;
  pupil_reaction_right: boolean;
  temperature: number;
  blood_glucose: number;
  urine_output: number;
  abg_ph?: number;
  abg_pao2?: number;
  abg_paco2?: number;
  abg_hco3?: number;
  ventilation_mode: 'assist-control' | 'simv' | 'pressure-support' | 'cpap' | 'none';
}

interface Vasopressor {
  id: string;
  name: string;
  dose: number;
  unit: string;
  route: string;
  started_at: string;
}

interface ICULabResult {
  id: string;
  test_type: string;
  result: string;
  unit: string;
  reference_range: string;
  critical: boolean;
  timestamp: string;
}

interface ICUMedication {
  id: string;
  name: string;
  dosage: string;
  route: string;
  frequency: string;
  start_date: string;
  status: 'active' | 'completed' | 'discontinued';
}

interface ICUNote {
  id: string;
  timestamp: string;
  note: string;
  type: 'progress' | 'consult' | 'procedure' | 'event';
  author: string;
  author_role: string;
}

interface ICUData {
  patientInfo: {
    name: string;
    age: number;
    gender: string;
    admission_date: string;
    diagnosis: string;
    surgery_type: string;
    surgeon: string;
    bed_number: string;
    status: 'critical' | 'serious' | 'stable' | 'improving';
    code_status: 'full-code' | 'dnr' | 'dnr-dni';
  };
  monitoring: ICUMonitoring[];
  vasopressors: Vasopressor[];
  labResults: ICULabResult[];
  medications: ICUMedication[];
  notes: ICUNote[];
}

export default function ICUPage() {
  const [icuData, setIcuData] = useState<ICUData>({
    patientInfo: {
      name: "John Doe",
      age: 62,
      gender: "Male",
      admission_date: "2024-01-15",
      diagnosis: "Post-CABG Recovery",
      surgery_type: "Coronary Artery Bypass Graft",
      surgeon: "Dr. Sarah Chen",
      bed_number: "ICU-07",
      status: "serious",
      code_status: "full-code"
    },
    monitoring: [],
    vasopressors: [],
    labResults: [],
    medications: [],
    notes: []
  });

  const [currentVitals, setCurrentVitals] = useState({
    heart_rate: 85,
    blood_pressure_systolic: 125,
    blood_pressure_diastolic: 82,
    mean_arterial_pressure: 96,
    central_venous_pressure: 8,
    respiratory_rate: 18,
    oxygen_saturation: 96,
    fio2: 35,
    peep: 6,
    tidal_volume: 480,
    minute_ventilation: 8.6,
    gcs_total: 14,
    gcs_eyes: 4,
    gcs_verbal: 4,
    gcs_motor: 6,
    pupil_size_left: "3",
    pupil_size_right: "3",
    pupil_reaction_left: true,
    pupil_reaction_right: true,
    temperature: 37.8,
    blood_glucose: 145,
    urine_output: 45,
    abg_ph: 7.38,
    abg_pao2: 88,
    abg_paco2: 42,
    abg_hco3: 23,
    ventilation_mode: "pressure-support" as const,
  });

  const [newVasopressor, setNewVasopressor] = useState({
    name: "",
    dose: 0,
    unit: "mcg/kg/min",
    route: "iv"
  });

  const [newLabResult, setNewLabResult] = useState({
    test_type: "",
    result: "",
    unit: "",
    reference_range: "",
    critical: false
  });

  const [newMedication, setNewMedication] = useState({
    name: "",
    dosage: "",
    route: "iv",
    frequency: ""
  });

  const [newNote, setNewNote] = useState({
    note: "",
    type: "progress" as const,
    author: "",
    author_role: ""
  });

  const { toast } = useToast();

  // Load data from localStorage on component mount
  useEffect(() => {
    loadICUData();
  }, []);

  const loadICUData = () => {
    try {
      const storedData = localStorage.getItem('icu_patient_data');
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        setIcuData(parsedData);
        
        // Set current vitals to the latest monitoring record if available
        if (parsedData.monitoring.length > 0) {
          const latestRecord = parsedData.monitoring[parsedData.monitoring.length - 1];
          setCurrentVitals(latestRecord);
        }
      } else {
        // Initialize with some demo data if no data exists
        const initialData: ICUData = {
          patientInfo: {
            name: "Jhn Doe",
            age: 62,
            gender: "Male",
            admission_date: "2024-01-15",
            diagnosis: "Post-CABG Recovery",
            surgery_type: "Coronary Artery Bypass Graft",
            surgeon: "Dr. Sarah Chen",
            bed_number: "ICU-07",
            status: "serious",
            code_status: "full-code"
          },
          monitoring: [
            {
              id: "1",
              timestamp: new Date().toISOString(),
              heart_rate: 85,
              blood_pressure_systolic: 125,
              blood_pressure_diastolic: 82,
              mean_arterial_pressure: 96,
              central_venous_pressure: 8,
              respiratory_rate: 18,
              oxygen_saturation: 96,
              fio2: 35,
              peep: 6,
              tidal_volume: 480,
              minute_ventilation: 8.6,
              gcs_total: 14,
              gcs_eyes: 4,
              gcs_verbal: 4,
              gcs_motor: 6,
              pupil_size_left: "3",
              pupil_size_right: "3",
              pupil_reaction_left: true,
              pupil_reaction_right: true,
              temperature: 37.8,
              blood_glucose: 145,
              urine_output: 45,
              abg_ph: 7.38,
              abg_pao2: 88,
              abg_paco2: 42,
              abg_hco3: 23,
              ventilation_mode: "pressure-support"
            }
          ],
          vasopressors: [
            {
              id: "1",
              name: "Norepinephrine",
              dose: 0.05,
              unit: "mcg/kg/min",
              route: "iv",
              started_at: new Date().toISOString()
            }
          ],
          labResults: [
            {
              id: "1",
              test_type: "CBC - WBC",
              result: "12.5",
              unit: "x10³/μL",
              reference_range: "4.5-11.0",
              critical: true,
              timestamp: new Date().toISOString()
            }
          ],
          medications: [
            {
              id: "1",
              name: "Fentanyl",
              dosage: "25 mcg",
              route: "iv",
              frequency: "q4h PRN",
              start_date: new Date().toISOString(),
              status: "active"
            }
          ],
          notes: [
            {
              id: "1",
              timestamp: new Date().toISOString(),
              note: "Patient showing signs of improvement. Chest tube drainage decreased to 50ml/hr. Maintaining current vent settings.",
              type: "progress",
              author: "Dr. Maria Rodriguez",
              author_role: "ICU Attending"
            }
          ]
        };
        setIcuData(initialData);
        setCurrentVitals(initialData.monitoring[0] as any);
        saveICUData(initialData);
      }
    } catch (error) {
      console.error('Error loading ICU data:', error);
      toast({
        title: "Error",
        description: "Failed to load ICU data",
        variant: "destructive",
      });
    }
  };

  const saveICUData = (data: ICUData) => {
    try {
      localStorage.setItem('icu_patient_data', JSON.stringify(data));
    } catch (error) {
      console.error('Error saving ICU data:', error);
      toast({
        title: "Error",
        description: "Failed to save ICU data",
        variant: "destructive",
      });
    }
  };

  const updateICUData = (updates: Partial<ICUData>) => {
    const newData = { ...icuData, ...updates };
    setIcuData(newData);
    saveICUData(newData);
  };

  const handleRecordVitals = () => {
    const newMonitoring: ICUMonitoring = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      ...currentVitals
    };

    const updatedMonitoring = [...icuData.monitoring, newMonitoring];
    updateICUData({ monitoring: updatedMonitoring });

    toast({
      title: "Vitals Recorded",
      description: "Patient vitals have been updated successfully",
    });
  };

  const handleAddVasopressor = () => {
    if (!newVasopressor.name || newVasopressor.dose <= 0) {
      toast({
        title: "Missing information",
        description: "Please fill all vasopressor fields",
        variant: "destructive",
      });
      return;
    }

    const newVaso: Vasopressor = {
      id: Date.now().toString(),
      name: newVasopressor.name,
      dose: newVasopressor.dose,
      unit: newVasopressor.unit,
      route: newVasopressor.route,
      started_at: new Date().toISOString()
    };

    const updatedVasopressors = [...icuData.vasopressors, newVaso];
    updateICUData({ vasopressors: updatedVasopressors });

    toast({
      title: "Vasopressor Added",
      description: "Vasopressor has been recorded successfully",
    });
    setNewVasopressor({ name: "", dose: 0, unit: "mcg/kg/min", route: "iv" });
  };

  const handleRemoveVasopressor = (id: string) => {
    const updatedVasopressors = icuData.vasopressors.filter(v => v.id !== id);
    updateICUData({ vasopressors: updatedVasopressors });
    
    toast({
      title: "Vasopressor Removed",
      description: "Vasopressor has been discontinued",
    });
  };

  const handleAddLabResult = () => {
    if (!newLabResult.test_type || !newLabResult.result) {
      toast({
        title: "Missing information",
        description: "Please fill all required lab fields",
        variant: "destructive",
      });
      return;
    }

    const newLab: ICULabResult = {
      id: Date.now().toString(),
      test_type: newLabResult.test_type,
      result: newLabResult.result,
      unit: newLabResult.unit,
      reference_range: newLabResult.reference_range,
      critical: newLabResult.critical,
      timestamp: new Date().toISOString()
    };

    const updatedLabs = [...icuData.labResults, newLab];
    updateICUData({ labResults: updatedLabs });

    toast({
      title: "Lab Result Added",
      description: "Laboratory result has been recorded successfully",
    });
    setNewLabResult({ test_type: "", result: "", unit: "", reference_range: "", critical: false });
  };

  const handleRemoveLabResult = (id: string) => {
    const updatedLabs = icuData.labResults.filter(lab => lab.id !== id);
    updateICUData({ labResults: updatedLabs });
    
    toast({
      title: "Lab Result Removed",
      description: "Lab result has been deleted",
    });
  };

  const handleAddMedication = () => {
    if (!newMedication.name || !newMedication.dosage) {
      toast({
        title: "Missing information",
        description: "Please fill all medication fields",
        variant: "destructive",
      });
      return;
    }

    const newMed: ICUMedication = {
      id: Date.now().toString(),
      name: newMedication.name,
      dosage: newMedication.dosage,
      route: newMedication.route,
      frequency: newMedication.frequency,
      start_date: new Date().toISOString(),
      status: 'active'
    };

    const updatedMeds = [...icuData.medications, newMed];
    updateICUData({ medications: updatedMeds });

    toast({
      title: "Medication Added",
      description: "Medication has been prescribed successfully",
    });
    setNewMedication({ name: "", dosage: "", route: "iv", frequency: "" });
  };

  const handleRemoveMedication = (id: string) => {
    const updatedMeds = icuData.medications.filter(med => med.id !== id);
    updateICUData({ medications: updatedMeds });
    
    toast({
      title: "Medication Removed",
      description: "Medication has been discontinued",
    });
  };

  const handleAddNote = () => {
    if (!newNote.note.trim()) {
      toast({
        title: "Missing information",
        description: "Please enter a note",
        variant: "destructive",
      });
      return;
    }

    const newNoteItem: ICUNote = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      note: newNote.note,
      type: newNote.type,
      author: newNote.author,
      author_role: newNote.author_role
    };

    const updatedNotes = [...icuData.notes, newNoteItem];
    updateICUData({ notes: updatedNotes });

    toast({
      title: "Note Added",
      description: "Clinical note has been recorded successfully",
    });
    setNewNote({ note: "", type: "progress", author: "", author_role: "" });
  };

  const handleRemoveNote = (id: string) => {
    const updatedNotes = icuData.notes.filter(note => note.id !== id);
    updateICUData({ notes: updatedNotes });
    
    toast({
      title: "Note Removed",
      description: "Clinical note has been deleted",
    });
  };

  const generateAlerts = () => {
    const alerts: string[] = [];
    const latestVitals = icuData.monitoring[icuData.monitoring.length - 1];

    if (!latestVitals) return alerts;

    if (latestVitals.heart_rate < 50 || latestVitals.heart_rate > 120) alerts.push('Abnormal heart rate');
    if (latestVitals.blood_pressure_systolic < 90 || latestVitals.blood_pressure_systolic > 180) alerts.push('Blood pressure concern');
    if (latestVitals.oxygen_saturation < 92) alerts.push('Low oxygen saturation');
    if (latestVitals.respiratory_rate < 8 || latestVitals.respiratory_rate > 24) alerts.push('Abnormal respiratory rate');
    if (latestVitals.temperature > 38.5) alerts.push('Fever');
    if (latestVitals.temperature < 36) alerts.push('Hypothermia');
    if (latestVitals.gcs_total < 15) alerts.push('Reduced GCS');
    if (latestVitals.blood_glucose < 70 || latestVitals.blood_glucose > 180) alerts.push('Glucose level abnormal');
    if (latestVitals.urine_output < 30) alerts.push('Low urine output');

    // Check for critical lab results
    const criticalLabs = icuData.labResults.filter(lab => lab.critical);
    if (criticalLabs.length > 0) {
      alerts.push(`Critical lab results: ${criticalLabs.map(lab => lab.test_type).join(', ')}`);
    }

    return alerts;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'critical': 'text-red-600 bg-red-100',
      'serious': 'text-orange-600 bg-orange-100',
      'stable': 'text-yellow-600 bg-yellow-100',
      'improving': 'text-green-600 bg-green-100'
    };
    return colors[status as keyof typeof colors] || colors.stable;
  };

  const VitalInput = ({ label, value, onChange, unit, type = "number", step }: {
    label: string;
    value: number;
    onChange: (value: number) => void;
    unit: string;
    type?: string;
    step?: string;
  }) => (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input
        type={type}
        step={step}
        value={value}
        onChange={(e) => onChange(type === "number" ? parseFloat(e.target.value) || 0 : parseInt(e.target.value) || 0)}
      />
      <div className="text-xs text-muted-foreground">{unit}</div>
    </div>
  );

  const alerts = generateAlerts();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
          <Monitor className="w-8 h-8 text-blue-600" />
          Intensive Care Unit Monitoring
        </h1>
        <p className="text-muted-foreground text-lg">
          Comprehensive critical care management with real-time monitoring and advanced life support
        </p>
      </div>

      {/* Patient Overview Card */}
      <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 shadow-lg border-blue-200">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center gap-3 text-2xl">
                <User className="w-6 h-6 text-blue-600" />
                <div className="space-y-1">
                  <div>{icuData.patientInfo.name}</div>
                  <div className="flex items-center gap-4 text-sm font-normal text-muted-foreground">
                    <span>Bed {icuData.patientInfo.bed_number}</span>
                    <span>•</span>
                    <span>{icuData.patientInfo.age}y {icuData.patientInfo.gender}</span>
                    <span>•</span>
                    <span>{icuData.patientInfo.diagnosis}</span>
                  </div>
                </div>
              </CardTitle>
              <CardDescription className="text-base mt-2">
                Admitted on {new Date(icuData.patientInfo.admission_date).toLocaleDateString()} • {icuData.patientInfo.surgery_type}
              </CardDescription>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Badge className={`${getStatusColor(icuData.patientInfo.status)} text-sm px-3 py-1`}>
                {icuData.patientInfo.status.toUpperCase()}
              </Badge>
              <Badge variant="outline" className="text-xs">
                Code: {icuData.patientInfo.code_status}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
            <div className="space-y-1">
              <div className="font-semibold text-muted-foreground">Primary Surgeon</div>
              <div className="text-lg font-medium">{icuData.patientInfo.surgeon}</div>
            </div>
            <div className="space-y-1">
              <div className="font-semibold text-muted-foreground">Admission Date</div>
              <div className="text-lg font-medium">{new Date(icuData.patientInfo.admission_date).toLocaleDateString()}</div>
            </div>
            <div className="space-y-1">
              <div className="font-semibold text-muted-foreground">Current Location</div>
              <div className="text-lg font-medium">Cardiac ICU - {icuData.patientInfo.bed_number}</div>
            </div>
            <div className="space-y-1">
              <div className="font-semibold text-muted-foreground">Last Update</div>
              <div className="text-lg font-medium">
                {icuData.monitoring.length > 0 
                  ? new Date(icuData.monitoring[icuData.monitoring.length - 1].timestamp).toLocaleTimeString()
                  : 'No data'
                }
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dynamic Alerts */}
      {alerts.length > 0 && (
        <Alert variant="destructive" className="border-red-300 bg-red-50">
          <AlertTriangle className="w-5 h-5 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>Critical Alerts:</strong> {alerts.join(', ')}
          </AlertDescription>
        </Alert>
      )}

      {/* Main ICU Dashboard */}
      <Tabs defaultValue="monitoring" className="space-y-6">
        <TabsList className="grid grid-cols-5 w-full bg-muted/50 p-1 rounded-lg">
          <TabsTrigger value="monitoring" className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Vital Signs
          </TabsTrigger>
          <TabsTrigger value="labs" className="flex items-center gap-2">
            <Droplet className="w-4 h-4" />
            Laboratory
          </TabsTrigger>
          <TabsTrigger value="medications" className="flex items-center gap-2">
            <Pill className="w-4 h-4" />
            Medications
          </TabsTrigger>
          <TabsTrigger value="vasopressors" className="flex items-center gap-2">
            <Heart className="w-4 h-4" />
            Vasopressors
          </TabsTrigger>
          <TabsTrigger value="notes" className="flex items-center gap-2">
            <ClipboardList className="w-4 h-4" />
            Clinical Notes
          </TabsTrigger>
        </TabsList>

        {/* Vital Signs Monitoring */}
        <TabsContent value="monitoring" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Current Vitals Input */}
            <Card className="bg-gradient-card shadow-card">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                  <Stethoscope className="w-5 h-5" />
                  Record Vital Signs
                </CardTitle>
                <CardDescription className="text-blue-100">
                  Enter current physiological parameters
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div className="space-y-4">
                  <h4 className="font-semibold flex items-center gap-2 text-blue-700">
                    <Heart className="w-4 h-4" />
                    Hemodynamics
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <VitalInput label="Heart Rate" value={currentVitals.heart_rate} onChange={(v) => setCurrentVitals({...currentVitals, heart_rate: v})} unit="bpm" />
                    <VitalInput label="BP Systolic" value={currentVitals.blood_pressure_systolic} onChange={(v) => setCurrentVitals({...currentVitals, blood_pressure_systolic: v})} unit="mmHg" />
                    <VitalInput label="BP Diastolic" value={currentVitals.blood_pressure_diastolic} onChange={(v) => setCurrentVitals({...currentVitals, blood_pressure_diastolic: v})} unit="mmHg" />
                    <VitalInput label="MAP" value={currentVitals.mean_arterial_pressure} onChange={(v) => setCurrentVitals({...currentVitals, mean_arterial_pressure: v})} unit="mmHg" />
                    <VitalInput label="CVP" value={currentVitals.central_venous_pressure} onChange={(v) => setCurrentVitals({...currentVitals, central_venous_pressure: v})} unit="mmHg" step="0.1" />
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold flex items-center gap-2 text-blue-700">
                    <Activity className="w-4 h-4" />
                    Respiratory
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <VitalInput label="Resp Rate" value={currentVitals.respiratory_rate} onChange={(v) => setCurrentVitals({...currentVitals, respiratory_rate: v})} unit="/min" />
                    <VitalInput label="SpO₂" value={currentVitals.oxygen_saturation} onChange={(v) => setCurrentVitals({...currentVitals, oxygen_saturation: v})} unit="%" />
                    <VitalInput label="FiO₂" value={currentVitals.fio2} onChange={(v) => setCurrentVitals({...currentVitals, fio2: v})} unit="%" />
                    <VitalInput label="PEEP" value={currentVitals.peep} onChange={(v) => setCurrentVitals({...currentVitals, peep: v})} unit="cmH₂O" />
                    <VitalInput label="Tidal Volume" value={currentVitals.tidal_volume} onChange={(v) => setCurrentVitals({...currentVitals, tidal_volume: v})} unit="ml" />
                  </div>
                  <div className="space-y-2">
                    <Label>Ventilation Mode</Label>
                    <Select value={currentVitals.ventilation_mode} onValueChange={(value) => setCurrentVitals({...currentVitals, ventilation_mode: value as any})}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="assist-control">Assist-Control</SelectItem>
                        <SelectItem value="simv">SIMV</SelectItem>
                        <SelectItem value="pressure-support">Pressure Support</SelectItem>
                        <SelectItem value="cpap">CPAP</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button onClick={handleRecordVitals} className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800">
                  <Save className="w-4 h-4 mr-2" />
                  Record Vital Signs
                </Button>
              </CardContent>
            </Card>

            {/* Monitoring History */}
            <Card className="bg-gradient-card shadow-card">
              <CardHeader>
                <CardTitle>Monitoring History</CardTitle>
                <CardDescription>Recent vital sign recordings</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Time</TableHead>
                      <TableHead>HR</TableHead>
                      <TableHead>BP</TableHead>
                      <TableHead>RR</TableHead>
                      <TableHead>SpO₂</TableHead>
                      <TableHead>Temp</TableHead>
                      <TableHead>GCS</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {icuData.monitoring.slice(-10).reverse().map((record) => (
                      <TableRow key={record.id}>
                        <TableCell className="font-medium">{new Date(record.timestamp).toLocaleTimeString()}</TableCell>
                        <TableCell>{record.heart_rate}</TableCell>
                        <TableCell>{record.blood_pressure_systolic}/{record.blood_pressure_diastolic}</TableCell>
                        <TableCell>{record.respiratory_rate}</TableCell>
                        <TableCell>{record.oxygen_saturation}%</TableCell>
                        <TableCell>{record.temperature}°C</TableCell>
                        <TableCell>
                          <Badge variant={record.gcs_total < 14 ? "destructive" : "outline"}>
                            {record.gcs_total}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                    {icuData.monitoring.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                          No monitoring data recorded yet
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Laboratory Results */}
        <TabsContent value="labs" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-gradient-card shadow-card">
              <CardHeader>
                <CardTitle>Add Lab Result</CardTitle>
                <CardDescription>Record new laboratory findings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Test Type</Label>
                    <Input placeholder="e.g., CBC, BMP, ABG" value={newLabResult.test_type} onChange={(e) => setNewLabResult({...newLabResult, test_type: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Result</Label>
                    <Input value={newLabResult.result} onChange={(e) => setNewLabResult({...newLabResult, result: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Unit</Label>
                    <Input value={newLabResult.unit} onChange={(e) => setNewLabResult({...newLabResult, unit: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Reference Range</Label>
                    <Input value={newLabResult.reference_range} onChange={(e) => setNewLabResult({...newLabResult, reference_range: e.target.value})} />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="critical"
                    checked={newLabResult.critical}
                    onCheckedChange={(checked) => setNewLabResult({...newLabResult, critical: checked as boolean})}
                  />
                  <Label htmlFor="critical" className="text-sm">Critical Result</Label>
                </div>
                <Button onClick={handleAddLabResult} className="w-full bg-gradient-medical text-white">
                  Add Lab Result
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-gradient-card shadow-card">
              <CardHeader>
                <CardTitle>Recent Lab Results</CardTitle>
                <CardDescription>Latest laboratory findings</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Test</TableHead>
                      <TableHead>Result</TableHead>
                      <TableHead>Reference</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {icuData.labResults.slice().reverse().map((lab) => (
                      <TableRow key={lab.id}>
                        <TableCell className="font-medium">{lab.test_type}</TableCell>
                        <TableCell>{lab.result} {lab.unit}</TableCell>
                        <TableCell>{lab.reference_range}</TableCell>
                        <TableCell>
                          <Badge variant={lab.critical ? "destructive" : "default"}>
                            {lab.critical ? "Critical" : "Normal"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveLabResult(lab.id)}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {icuData.labResults.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                          No lab results recorded yet
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Medications */}
        <TabsContent value="medications" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-gradient-card shadow-card">
              <CardHeader>
                <CardTitle>Prescribe Medication</CardTitle>
                <CardDescription>Add new medication orders</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Medication Name</Label>
                    <Input placeholder="e.g., Fentanyl, Heparin" value={newMedication.name} onChange={(e) => setNewMedication({...newMedication, name: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Dosage</Label>
                    <Input placeholder="e.g., 25 mcg, 5000 units" value={newMedication.dosage} onChange={(e) => setNewMedication({...newMedication, dosage: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Route</Label>
                    <Select value={newMedication.route} onValueChange={(value) => setNewMedication({...newMedication, route: value})}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="iv">IV</SelectItem>
                        <SelectItem value="po">PO</SelectItem>
                        <SelectItem value="sc">Subcutaneous</SelectItem>
                        <SelectItem value="im">IM</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Frequency</Label>
                    <Input placeholder="e.g., q4h, q8h, daily" value={newMedication.frequency} onChange={(e) => setNewMedication({...newMedication, frequency: e.target.value})} />
                  </div>
                </div>
                <Button onClick={handleAddMedication} className="w-full bg-gradient-medical text-white">
                  Prescribe Medication
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-gradient-card shadow-card">
              <CardHeader>
                <CardTitle>Active Medications</CardTitle>
                <CardDescription>Current medication regimen</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Medication</TableHead>
                      <TableHead>Dosage</TableHead>
                      <TableHead>Route</TableHead>
                      <TableHead>Frequency</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {icuData.medications.map((med) => (
                      <TableRow key={med.id}>
                        <TableCell className="font-medium">{med.name}</TableCell>
                        <TableCell>{med.dosage}</TableCell>
                        <TableCell>{med.route.toUpperCase()}</TableCell>
                        <TableCell>{med.frequency}</TableCell>
                        <TableCell>
                          <Badge variant="default" className="bg-green-100 text-green-800">
                            Active
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveMedication(med.id)}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {icuData.medications.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                          No medications prescribed yet
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Vasopressors */}
        <TabsContent value="vasopressors" className="space-y-6">
          <Card className="bg-gradient-card shadow-card">
            <CardHeader>
              <CardTitle>Vasopressor Management</CardTitle>
              <CardDescription>Manage vasoactive medication infusions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-semibold">Active Vasopressors</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {icuData.vasopressors.map((vaso) => (
                    <Card key={vaso.id} className="bg-red-50 border-red-200">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-semibold text-red-800">{vaso.name}</div>
                            <div className="text-sm text-red-600">{vaso.dose} {vaso.unit}</div>
                            <div className="text-xs text-red-500 mt-1">
                              Started: {new Date(vaso.started_at).toLocaleTimeString()}
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Badge variant="destructive">Active</Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveVasopressor(vaso.id)}
                            >
                              <Trash2 className="w-3 h-3 text-red-500" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {icuData.vasopressors.length === 0 && (
                    <div className="col-span-full text-center text-muted-foreground py-8">
                      No active vasopressors
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold">Add New Vasopressor</h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label>Medication</Label>
                    <Input placeholder="e.g., Norepinephrine" value={newVasopressor.name} onChange={(e) => setNewVasopressor({...newVasopressor, name: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Dose</Label>
                    <Input type="number" step="0.01" value={newVasopressor.dose} onChange={(e) => setNewVasopressor({...newVasopressor, dose: parseFloat(e.target.value) || 0})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Unit</Label>
                    <Select value={newVasopressor.unit} onValueChange={(value) => setNewVasopressor({...newVasopressor, unit: value})}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mcg/kg/min">mcg/kg/min</SelectItem>
                        <SelectItem value="mcg/min">mcg/min</SelectItem>
                        <SelectItem value="units/hr">units/hr</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 flex items-end">
                    <Button onClick={handleAddVasopressor} className="w-full bg-gradient-medical text-white">
                      Add Vasopressor
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Clinical Notes */}
        <TabsContent value="notes" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-gradient-card shadow-card">
              <CardHeader>
                <CardTitle>Add Clinical Note</CardTitle>
                <CardDescription>Document patient progress and events</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Note Type</Label>
                  <Select value={newNote.type} onValueChange={(value) => setNewNote({...newNote, type: value as any})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="progress">Progress Note</SelectItem>
                      <SelectItem value="consult">Consult Note</SelectItem>
                      <SelectItem value="procedure">Procedure Note</SelectItem>
                      <SelectItem value="event">Event Note</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Author</Label>
                    <Input placeholder="Your name" value={newNote.author} onChange={(e) => setNewNote({...newNote, author: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Role</Label>
                    <Input placeholder="e.g., ICU Nurse, Resident" value={newNote.author_role} onChange={(e) => setNewNote({...newNote, author_role: e.target.value})} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Note Content</Label>
                  <Textarea 
                    placeholder="Enter detailed clinical note..." 
                    value={newNote.note} 
                    onChange={(e) => setNewNote({...newNote, note: e.target.value})}
                    rows={6}
                  />
                </div>
                <Button onClick={handleAddNote} className="w-full bg-gradient-medical text-white">
                  Add Clinical Note
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-gradient-card shadow-card">
              <CardHeader>
                <CardTitle>Recent Clinical Notes</CardTitle>
                <CardDescription>Latest documentation</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {icuData.notes.slice().reverse().map((note) => (
                    <div key={note.id} className="border rounded-lg p-4 space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-semibold capitalize">{note.type} Note</div>
                          <div className="text-sm text-muted-foreground">
                            By {note.author} ({note.author_role})
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <div className="text-xs text-muted-foreground">
                            {new Date(note.timestamp).toLocaleString()}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveNote(note.id)}
                          >
                            <Trash2 className="w-3 h-3 text-red-500" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm leading-relaxed">{note.note}</p>
                    </div>
                  ))}
                  {icuData.notes.length === 0 && (
                    <div className="text-center text-muted-foreground py-8">
                      No clinical notes recorded yet
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}