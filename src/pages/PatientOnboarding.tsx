import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";
import { 
  CalendarIcon, 
  User, 
  FileText, 
  Heart, 
  AlertTriangle, 
  Plus, 
  Search, 
  Shield, 
  Database, 
  TestTube,
  Download,
  Upload,
  Filter,
  MoreHorizontal
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { usePatients } from "@/hooks/usePatients";
import PatientForm from "@/components/PatientForm";
import { Patient } from "@/services/patientsService";

export default function PatientOnboarding() {
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [activeTab, setActiveTab] = useState("new");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [researchConsent, setResearchConsent] = useState({
    dataUse: false,
    futureContact: false,
    anonymizedData: false,
    specificStudies: [] as string[],
    consentDate: null as Date | null
  });
  const [sampleStorage, setSampleStorage] = useState({
    storeSamples: false,
    sampleTypes: [] as string[],
    storageDuration: "5years",
    futureResearchUse: false,
    destructionConsent: false
  });
  const { toast } = useToast();
  const { patients, addPatient, searchPatients, loading, error } = usePatients();

  // Enhanced search with debouncing
  useEffect(() => {
    if (searchQuery.trim()) {
      const timer = setTimeout(() => {
        handleSearch();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [searchQuery]);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      searchPatients(searchQuery);
    }
  };

  const handleResearchConsentChange = (field: string, value: any) => {
    setResearchConsent(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSampleStorageChange = (field: string, value: any) => {
    setSampleStorage(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSampleTypeToggle = (sampleType: string) => {
    setSampleStorage(prev => ({
      ...prev,
      sampleTypes: prev.sampleTypes.includes(sampleType)
        ? prev.sampleTypes.filter(type => type !== sampleType)
        : [...prev.sampleTypes, sampleType]
    }));
  };

  // Enhanced patient submission with better validation
  const handleSubmitWithConsent = async (patientData: any) => {
    try {
      console.log('📝 Submitting patient data:', patientData);
      
      // Enhanced validation
      const requiredFields = ['first_name', 'last_name', 'date_of_birth', 'gender'];
      const missingFields = requiredFields.filter(field => !patientData[field]);
      
      if (missingFields.length > 0) {
        toast({
          title: "Missing required information",
          description: `Please fill in: ${missingFields.join(', ').replace(/_/g, ' ')}`,
          variant: "destructive"
        });
        return;
      }

      // Validate date format
      if (patientData.date_of_birth && new Date(patientData.date_of_birth) > new Date()) {
        toast({
          title: "Invalid date of birth",
          description: "Date of birth cannot be in the future",
          variant: "destructive"
        });
        return;
      }

      // Transform data to match backend structure
      const completePatientData = {
        firstName: patientData.first_name,
        lastName: patientData.last_name,
        dateOfBirth: patientData.date_of_birth,
        gender: patientData.gender,
        phone: patientData.phone || '',
        email: patientData.email || '',
        address: patientData.address || '',
        emergencyContactName: patientData.emergency_contact_name || '',
        emergencyContactPhone: patientData.emergency_contact_phone || '',
        medicalHistory: patientData.medical_history || '',
        allergies: patientData.allergies || '',
        currentMedications: patientData.current_medications || '',
        
        // Enhanced consent data
        researchConsent: researchConsent.dataUse,
        researchConsentDate: researchConsent.dataUse ? (researchConsent.consentDate || new Date()).toISOString() : null,
        futureContactConsent: researchConsent.futureContact,
        anonymizedDataConsent: researchConsent.anonymizedData,
        sampleStorageConsent: sampleStorage.storeSamples,
        sampleTypes: sampleStorage.sampleTypes.join(','),
        storageDuration: sampleStorage.storageDuration,
        futureResearchUseConsent: sampleStorage.futureResearchUse,
        destructionConsent: sampleStorage.destructionConsent,
        
        // Additional metadata
        registrationDate: new Date().toISOString(),
        status: 'active'
      };
      
      console.log('🚀 Final patient data being sent:', completePatientData);
      
      await addPatient(completePatientData);
      
      // Reset forms only on success
      setResearchConsent({
        dataUse: false,
        futureContact: false,
        anonymizedData: false,
        specificStudies: [],
        consentDate: null
      });
      setSampleStorage({
        storeSamples: false,
        sampleTypes: [],
        storageDuration: "5years",
        futureResearchUse: false,
        destructionConsent: false
      });

      toast({
        title: "Patient registered successfully",
        description: "Patient information and consent forms have been stored.",
      });

      // Switch to recent tab to show the new patient
      setActiveTab("recent");
      
    } catch (error) {
      console.error("❌ Error submitting patient data:", error);
      // Error is already handled in the addPatient function
    }
  };

  const handlePatientFormSubmit = async (patientData: any) => {
    await handleSubmitWithConsent(patientData);
  };

  // Enhanced sample type options
  const sampleTypeOptions = [
    { value: "Blood", description: "Whole blood, plasma, serum" },
    { value: "Tissue", description: "Biopsy samples, surgical specimens" },
    { value: "DNA/RNA", description: "Genetic material for sequencing" },
    { value: "Urine", description: "Urine samples for analysis" },
    { value: "Saliva", description: "Saliva and oral samples" },
    { value: "Other Biofluids", description: "CSF, synovial fluid, etc." }
  ];

  const storageDurationOptions = [
    { value: "5years", label: "5 Years" },
    { value: "10years", label: "10 Years" },
    { value: "indefinite", label: "Indefinite" },
    { value: "studyend", label: "Until Study Completion" }
  ];

  const statusOptions = [
    { value: "all", label: "All Patients" },
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
    { value: "pending", label: "Pending Review" }
  ];

  // Enhanced helper functions
  const hasResearchConsent = (patient: Patient) => {
    return patient?.researchConsent === true || 
           patient?.research_consent?.dataUse === true ||
           patient?.research_consent === true;
  };

  const hasSampleStorage = (patient: Patient) => {
    return patient?.sampleStorageConsent === true || 
           patient?.sample_storage?.storeSamples === true ||
           patient?.sample_storage_consent === true;
  };

  const formatPatientDate = (dateString: any) => {
    try {
      if (!dateString) return 'N/A';
      return new Date(dateString).toLocaleDateString();
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const getPatientId = (patient: Patient) => {
    return patient?.patientId || patient?.patient_id || patient?.id || 'N/A';
  };

  const getPatientName = (patient: Patient) => {
    const firstName = patient?.firstName || patient?.first_name || '';
    const lastName = patient?.lastName || patient?.last_name || '';
    return `${firstName} ${lastName}`.trim() || 'Unknown Patient';
  };

  const getCreatedAt = (patient: Patient) => {
    return patient?.createdAt || patient?.created_at || new Date().toISOString();
  };

  const getPatientStatus = (patient: Patient) => {
    return patient?.status || 'active';
  };

  // Filter patients based on status
  const filteredPatients = patients.filter(patient => {
    if (filterStatus === "all") return true;
    return getPatientStatus(patient) === filterStatus;
  });

  // Export functionality
  const handleExportPatients = () => {
    toast({
      title: "Export initiated",
      description: "Patient data export has been started.",
    });
    // Implement export logic here
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Patient Onboarding</h1>
            <p className="text-muted-foreground">
              Register new patients and manage existing patient information
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExportPatients}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button>
              <Upload className="w-4 h-4 mr-2" />
              Import
            </Button>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="new">New Patient</TabsTrigger>
          <TabsTrigger value="search">Search Patients</TabsTrigger>
          <TabsTrigger value="recent">Recent Registrations</TabsTrigger>
        </TabsList>

        <TabsContent value="new" className="space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Patients</p>
                    <p className="text-2xl font-bold">{patients.length}</p>
                  </div>
                  <User className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">With Research Consent</p>
                    <p className="text-2xl font-bold">
                      {patients.filter(p => hasResearchConsent(p)).length}
                    </p>
                  </div>
                  <Shield className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Sample Storage</p>
                    <p className="text-2xl font-bold">
                      {patients.filter(p => hasSampleStorage(p)).length}
                    </p>
                  </div>
                  <TestTube className="w-8 h-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Today</p>
                    <p className="text-2xl font-bold">
                      {patients.filter(p => 
                        new Date(getCreatedAt(p)).toDateString() === new Date().toDateString()
                      ).length}
                    </p>
                  </div>
                  <FileText className="w-8 h-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-gradient-card shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                Patient Registration Form
              </CardTitle>
              <CardDescription>
                Complete patient information for surgical assessment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PatientForm 
                onSubmit={handlePatientFormSubmit}
                isLoading={loading}
              />
            </CardContent>
          </Card>

          {/* Enhanced Consent Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-gradient-card shadow-card border-l-4 border-l-blue-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-blue-500" />
                  Research Data Consent
                </CardTitle>
                <CardDescription>
                  Patient consent for using health data in research studies
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <EnhancedConsentSection
                  consent={researchConsent}
                  onChange={handleResearchConsentChange}
                  loading={loading}
                />
              </CardContent>
            </Card>

            <Card className="bg-gradient-card shadow-card border-l-4 border-l-green-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TestTube className="w-5 h-5 text-green-500" />
                  Biological Sample Storage
                </CardTitle>
                <CardDescription>
                  Consent for storing and using biological samples in research
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <EnhancedSampleStorageSection
                  storage={sampleStorage}
                  onChange={handleSampleStorageChange}
                  onSampleTypeToggle={handleSampleTypeToggle}
                  loading={loading}
                  sampleTypeOptions={sampleTypeOptions}
                  storageDurationOptions={storageDurationOptions}
                />
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Consent Summary */}
          {(researchConsent.dataUse || sampleStorage.storeSamples) && (
            <Card className="bg-gradient-card shadow-card border-l-4 border-l-purple-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5 text-purple-500" />
                  Consent Summary
                </CardTitle>
                <CardDescription>
                  Overview of patient consent preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <EnhancedConsentSummary
                  researchConsent={researchConsent}
                  sampleStorage={sampleStorage}
                />
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="search" className="space-y-6">
          <Card className="bg-gradient-card shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="w-5 h-5 text-primary" />
                Search Patients
              </CardTitle>
              <CardDescription>
                Find existing patients in the system with advanced filtering
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <Input 
                    placeholder="Search by name, ID, email, or phone..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-[180px]">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={handleSearch} disabled={loading}>
                  <Search className="w-4 h-4 mr-2" />
                  Search
                </Button>
              </div>
              
              {error && (
                <div className="p-4 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200">
                  <div className="flex items-center gap-2 text-red-700 dark:text-red-300">
                    <AlertTriangle className="w-4 h-4" />
                    <span>{error}</span>
                  </div>
                </div>
              )}
              
              {searchQuery && filteredPatients.length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                  <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No patients found matching "{searchQuery}"</p>
                  <p className="text-sm">Try adjusting your search terms or filters</p>
                </div>
              )}
              
              {searchQuery && filteredPatients.length > 0 && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-muted-foreground">
                      Found {filteredPatients.length} patients
                    </p>
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Export Results
                    </Button>
                  </div>
                  {filteredPatients.map((patient, index) => (
                    <PatientCard
                      key={getPatientId(patient) || `patient-${index}`}
                      patient={patient}
                      onViewDetails={() => window.location.href = `/records/${getPatientId(patient)}`}
                    />
                  ))}
                </div>
              )}
              
              {!searchQuery && (
                <div className="text-center text-muted-foreground py-8">
                  <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Enter search criteria to find patients</p>
                  <p className="text-sm">You can search by name, patient ID, email, or phone number</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recent" className="space-y-6">
          <Card className="bg-gradient-card shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Recent Registrations
              </CardTitle>
              <CardDescription>
                Recently registered patients awaiting assessment
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {patients.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No patients registered yet</p>
                  <p className="text-sm">Start by registering a new patient</p>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-muted-foreground">
                      Showing {Math.min(patients.length, 10)} of {patients.length} patients
                    </p>
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger className="w-[180px]">
                        <Filter className="w-4 h-4 mr-2" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {patients.slice(0, 10).map((patient, index) => (
                    <PatientCard
                      key={getPatientId(patient) || `recent-patient-${index}`}
                      patient={patient}
                      onViewDetails={() => window.location.href = `/records/${getPatientId(patient)}`}
                    />
                  ))}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Enhanced Components
const EnhancedConsentSection = ({ consent, onChange, loading }: any) => (
  <div className="space-y-4">
    <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border">
      <div className="space-y-1">
        <Label htmlFor="dataUse" className="text-base font-medium">
          Use my health data for research purposes
        </Label>
        <p className="text-sm text-muted-foreground">
          I consent to my anonymized health data being used in medical research studies
        </p>
      </div>
      <Switch
        id="dataUse"
        checked={consent.dataUse}
        onCheckedChange={(checked) => onChange("dataUse", checked)}
        disabled={loading}
      />
    </div>

    {consent.dataUse && (
      <div className="space-y-4 pl-6 border-l-2 border-blue-200">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="anonymizedData"
            checked={consent.anonymizedData}
            onCheckedChange={(checked) => onChange("anonymizedData", checked)}
            disabled={loading}
          />
          <Label htmlFor="anonymizedData" className="text-sm">
            I understand my data will be anonymized and cannot be traced back to me
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="futureContact"
            checked={consent.futureContact}
            onCheckedChange={(checked) => onChange("futureContact", checked)}
            disabled={loading}
          />
          <Label htmlFor="futureContact" className="text-sm">
            I consent to being contacted about future research studies I may be eligible for
          </Label>
        </div>

        <div className="space-y-3">
          <Label className="text-sm font-medium">Consent Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
                disabled={loading}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {consent.consentDate ? (
                  format(consent.consentDate, "PPP")
                ) : (
                  <span>Select consent date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={consent.consentDate || undefined}
                onSelect={(date) => onChange("consentDate", date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
    )}
  </div>
);

const EnhancedSampleStorageSection = ({ 
  storage, 
  onChange, 
  onSampleTypeToggle, 
  loading, 
  sampleTypeOptions, 
  storageDurationOptions 
}: any) => (
  <div className="space-y-4">
    <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border">
      <div className="space-y-1">
        <Label htmlFor="storeSamples" className="text-base font-medium">
          Store my biological samples for research
        </Label>
        <p className="text-sm text-muted-foreground">
          I consent to storing my biological samples for use in future research studies
        </p>
      </div>
      <Switch
        id="storeSamples"
        checked={storage.storeSamples}
        onCheckedChange={(checked) => onChange("storeSamples", checked)}
        disabled={loading}
      />
    </div>

    {storage.storeSamples && (
      <div className="space-y-4 pl-6 border-l-2 border-green-200">
        <div className="space-y-3">
          <Label className="text-sm font-medium">Sample Types to Store</Label>
          <div className="grid grid-cols-1 gap-2">
            {sampleTypeOptions.map((option: any) => (
              <div key={option.value} className="flex items-start space-x-2 p-2 rounded-lg border">
                <Checkbox
                  id={option.value}
                  checked={storage.sampleTypes.includes(option.value)}
                  onCheckedChange={() => onSampleTypeToggle(option.value)}
                  disabled={loading}
                />
                <div className="flex-1">
                  <Label htmlFor={option.value} className="text-sm font-medium">
                    {option.value}
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    {option.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <Label className="text-sm font-medium">Storage Duration</Label>
          <Select
            value={storage.storageDuration}
            onValueChange={(value) => onChange("storageDuration", value)}
            disabled={loading}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {storageDurationOptions.map((option: any) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="futureResearchUse"
              checked={storage.futureResearchUse}
              onCheckedChange={(checked) => onChange("futureResearchUse", checked)}
              disabled={loading}
            />
            <Label htmlFor="futureResearchUse" className="text-sm">
              I consent to my samples being used in future research studies beyond the current one
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="destructionConsent"
              checked={storage.destructionConsent}
              onCheckedChange={(checked) => onChange("destructionConsent", checked)}
              disabled={loading}
            />
            <Label htmlFor="destructionConsent" className="text-sm">
              I consent to the destruction of my samples at the end of the storage period
            </Label>
          </div>
        </div>

        <div className="p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                Important Information
              </p>
              <p className="text-xs text-amber-700 dark:text-amber-300">
                Your samples will be stored securely and used only for approved research purposes. 
                You may withdraw your consent at any time by contacting our research coordinator.
              </p>
            </div>
          </div>
        </div>
      </div>
    )}
  </div>
);

const EnhancedConsentSummary = ({ researchConsent, sampleStorage }: any) => (
  <div className="space-y-3">
    {researchConsent.dataUse && (
      <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
        <div>
          <span className="text-sm font-medium">Research Data Consent</span>
          <div className="text-xs text-muted-foreground mt-1">
            {researchConsent.anonymizedData && "• Data will be anonymized\n"}
            {researchConsent.futureContact && "• Future contact consented\n"}
            {researchConsent.consentDate && `• Consent date: ${format(researchConsent.consentDate, "MMM dd, yyyy")}`}
          </div>
        </div>
        <Badge variant="default" className="bg-green-500">
          Granted
        </Badge>
      </div>
    )}
    {sampleStorage.storeSamples && (
      <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
        <div>
          <span className="text-sm font-medium">Sample Storage Consent</span>
          <div className="text-xs text-muted-foreground mt-1">
            {sampleStorage.sampleTypes.length > 0 && `• Samples: ${sampleStorage.sampleTypes.join(', ')}\n`}
            {sampleStorage.storageDuration && `• Duration: ${sampleStorage.storageDuration}\n`}
            {sampleStorage.futureResearchUse && "• Future research use consented"}
          </div>
        </div>
        <Badge variant="default" className="bg-green-500">
          Granted
        </Badge>
      </div>
    )}
  </div>
);

const PatientCard = ({ patient, onViewDetails }: any) => {
  const hasResearch = hasResearchConsent(patient);
  const hasSamples = hasSampleStorage(patient);
  
  return (
    <div className="flex items-center justify-between p-4 bg-background rounded-lg border hover:shadow-md transition-shadow">
      <div className="space-y-1 flex-1">
        <div className="font-medium text-foreground">
          {getPatientName(patient)}
        </div>
        <div className="text-sm text-muted-foreground">
          ID: {getPatientId(patient)} • DOB: {formatPatientDate(patient.dateOfBirth || patient.date_of_birth)}
        </div>
        {patient.email && (
          <div className="text-xs text-muted-foreground">
            Email: {patient.email} • Phone: {patient.phone || 'N/A'}
          </div>
        )}
        <div className="flex gap-2 mt-1">
          {hasResearch && (
            <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
              Research Data
            </Badge>
          )}
          {hasSamples && (
            <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
              Sample Storage
            </Badge>
          )}
          <Badge variant="outline" className="text-xs">
            {getPatientStatus(patient)}
          </Badge>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Button size="sm" variant="outline" onClick={onViewDetails}>
          View Details
        </Button>
        <Button size="sm" variant="ghost">
          <MoreHorizontal className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};