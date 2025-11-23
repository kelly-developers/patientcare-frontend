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
import { CalendarIcon, User, FileText, Heart, AlertTriangle, Plus, Search, Shield, Database, TestTube } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { usePatients } from "@/hooks/usePatients";
import PatientForm from "@/components/PatientForm";

export default function PatientOnboarding() {
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [activeTab, setActiveTab] = useState("new");
  const [searchQuery, setSearchQuery] = useState("");
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
  const { patients, addPatient, searchPatients } = usePatients();

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

  // Fixed onSubmit handler - properly handles form submission
  const handleSubmitWithConsent = async (patientData: any) => {
    try {
      // Validate required patient data
      if (!patientData.first_name || !patientData.last_name || !patientData.date_of_birth) {
        toast({
          title: "Missing required information",
          description: "Please fill in all required patient fields.",
          variant: "destructive"
        });
        return;
      }

      // Transform data to match backend structure
      const completePatientData = {
        // Map to backend field names
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
        
        // Consent data mapped to backend structure
        researchConsent: researchConsent.dataUse,
        researchConsentDate: researchConsent.dataUse ? (researchConsent.consentDate || new Date()) : null,
        futureContactConsent: researchConsent.futureContact,
        anonymizedDataConsent: researchConsent.anonymizedData,
        sampleStorageConsent: sampleStorage.storeSamples,
        sampleTypes: sampleStorage.sampleTypes.join(','),
        storageDuration: sampleStorage.storageDuration,
        futureResearchUseConsent: sampleStorage.futureResearchUse,
        destructionConsent: sampleStorage.destructionConsent,
        
        // Store additional consent data as JSON
        consentData: {
          specificStudies: researchConsent.specificStudies,
          consentTimestamp: new Date().toISOString()
        }
      };
      
      await addPatient(completePatientData);
      
      // Reset consent forms
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
      console.error("Error submitting patient data:", error);
      toast({
        title: "Registration failed",
        description: "There was an error registering the patient. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Handle form submission from PatientForm component
  const handlePatientFormSubmit = async (patientData: any) => {
    await handleSubmitWithConsent(patientData);
  };

  const sampleTypeOptions = [
    "Blood",
    "Tissue",
    "DNA/RNA",
    "Urine",
    "Saliva",
    "Other Biofluids"
  ];

  const storageDurationOptions = [
    { value: "5years", label: "5 Years" },
    { value: "10years", label: "10 Years" },
    { value: "indefinite", label: "Indefinite" },
    { value: "studyend", label: "Until Study Completion" }
  ];

  // Safe helper functions to access patient data
  const hasResearchConsent = (patient: any) => {
    // Check both new and old field structures
    return patient?.researchConsent === true || 
           patient?.research_consent?.dataUse === true ||
           patient?.research_consent === true;
  };

  const hasSampleStorage = (patient: any) => {
    // Check both new and old field structures
    return patient?.sampleStorageConsent === true || 
           patient?.sample_storage?.storeSamples === true ||
           patient?.sample_storage_consent === true;
  };

  // Safe date formatting
  const formatPatientDate = (dateString: any) => {
    try {
      if (!dateString) return 'N/A';
      return new Date(dateString).toLocaleDateString();
    } catch (error) {
      return 'Invalid Date';
    }
  };

  // Safe access to patient ID
  const getPatientId = (patient: any) => {
    return patient?.patientId || patient?.patient_id || 'N/A';
  };

  // Safe access to patient name
  const getPatientName = (patient: any) => {
    const firstName = patient?.firstName || patient?.first_name || '';
    const lastName = patient?.lastName || patient?.last_name || '';
    return `${firstName} ${lastName}`.trim() || 'Unknown Patient';
  };

  // Safe access to creation date
  const getCreatedAt = (patient: any) => {
    return patient?.createdAt || patient?.created_at || new Date().toISOString();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-foreground">Patient Onboarding</h1>
        <p className="text-muted-foreground">
          Register new patients and manage existing patient information
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="new">New Patient</TabsTrigger>
          <TabsTrigger value="search">Search Patients</TabsTrigger>
          <TabsTrigger value="recent">Recent Registrations</TabsTrigger>
        </TabsList>

        <TabsContent value="new" className="space-y-6">
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
              <PatientForm onSubmit={handlePatientFormSubmit} />
            </CardContent>
          </Card>

          {/* Research Data Consent Section */}
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
                    checked={researchConsent.dataUse}
                    onCheckedChange={(checked) => handleResearchConsentChange("dataUse", checked)}
                  />
                </div>

                {researchConsent.dataUse && (
                  <div className="space-y-4 pl-6 border-l-2 border-blue-200">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="anonymizedData"
                        checked={researchConsent.anonymizedData}
                        onCheckedChange={(checked) => handleResearchConsentChange("anonymizedData", checked)}
                      />
                      <Label htmlFor="anonymizedData" className="text-sm">
                        I understand my data will be anonymized and cannot be traced back to me
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="futureContact"
                        checked={researchConsent.futureContact}
                        onCheckedChange={(checked) => handleResearchConsentChange("futureContact", checked)}
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
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {researchConsent.consentDate ? (
                              format(researchConsent.consentDate, "PPP")
                            ) : (
                              <span>Select consent date</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={researchConsent.consentDate || undefined}
                            onSelect={(date) => handleResearchConsentChange("consentDate", date)}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Biological Sample Storage Section */}
          <Card className="bg-gradient-card shadow-card border-l-4 border-l-green-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TestTube className="w-5 h-5 text-green-500" />
                Biological Sample Storage Consent
              </CardTitle>
              <CardDescription>
                Consent for storing and using biological samples in research
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
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
                    checked={sampleStorage.storeSamples}
                    onCheckedChange={(checked) => handleSampleStorageChange("storeSamples", checked)}
                  />
                </div>

                {sampleStorage.storeSamples && (
                  <div className="space-y-4 pl-6 border-l-2 border-green-200">
                    <div className="space-y-3">
                      <Label className="text-sm font-medium">Sample Types to Store</Label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {sampleTypeOptions.map((sampleType) => (
                          <div key={sampleType} className="flex items-center space-x-2">
                            <Checkbox
                              id={sampleType}
                              checked={sampleStorage.sampleTypes.includes(sampleType)}
                              onCheckedChange={() => handleSampleTypeToggle(sampleType)}
                            />
                            <Label htmlFor={sampleType} className="text-sm">
                              {sampleType}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label className="text-sm font-medium">Storage Duration</Label>
                      <Select
                        value={sampleStorage.storageDuration}
                        onValueChange={(value) => handleSampleStorageChange("storageDuration", value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {storageDurationOptions.map((option) => (
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
                          checked={sampleStorage.futureResearchUse}
                          onCheckedChange={(checked) => handleSampleStorageChange("futureResearchUse", checked)}
                        />
                        <Label htmlFor="futureResearchUse" className="text-sm">
                          I consent to my samples being used in future research studies beyond the current one
                        </Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="destructionConsent"
                          checked={sampleStorage.destructionConsent}
                          onCheckedChange={(checked) => handleSampleStorageChange("destructionConsent", checked)}
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
            </CardContent>
          </Card>

          {/* Consent Summary */}
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
                <div className="space-y-3">
                  {researchConsent.dataUse && (
                    <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                      <span className="text-sm font-medium">Research Data Consent</span>
                      <Badge variant="default" className="bg-green-500">
                        Granted
                      </Badge>
                    </div>
                  )}
                  {sampleStorage.storeSamples && (
                    <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                      <span className="text-sm font-medium">Sample Storage Consent</span>
                      <Badge variant="default" className="bg-green-500">
                        Granted
                      </Badge>
                    </div>
                  )}
                  {researchConsent.consentDate && (
                    <div className="text-xs text-muted-foreground text-center">
                      Consent recorded on {format(researchConsent.consentDate, "PPP 'at' p")}
                    </div>
                  )}
                </div>
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
                Find existing patients in the system
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <Input 
                    placeholder="Search by name, ID, or email..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>
                <Button onClick={handleSearch}>
                  <Search className="w-4 h-4 mr-2" />
                  Search
                </Button>
              </div>
              
              {searchQuery && patients.length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                  No patients found matching "{searchQuery}"
                </div>
              )}
              
              {searchQuery && patients.length > 0 && (
                <div className="space-y-4">
                  {patients.map((patient, index) => (
                    <div key={patient.id || `patient-${index}`} className="flex items-center justify-between p-4 bg-background rounded-lg border">
                      <div className="space-y-1">
                        <div className="font-medium text-foreground">
                          {getPatientName(patient)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          ID: {getPatientId(patient)} • DOB: {formatPatientDate(patient.dateOfBirth || patient.date_of_birth)}
                        </div>
                        {patient.email && (
                          <div className="text-xs text-muted-foreground">
                            Email: {patient.email}
                          </div>
                        )}
                        <div className="flex gap-2 mt-1">
                          {hasResearchConsent(patient) && (
                            <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                              Research Data
                            </Badge>
                          )}
                          {hasSampleStorage(patient) && (
                            <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
                              Sample Storage
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">Active</Badge>
                        <Button size="sm" variant="outline" onClick={() => window.location.href = '/records'}>
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {!searchQuery && (
                <div className="text-center text-muted-foreground py-8">
                  Enter search criteria to find patients
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
                  No patients registered yet
                </div>
              ) : (
                patients.slice(0, 5).map((patient, index) => (
                  <div key={patient.id || `recent-patient-${index}`} className="flex items-center justify-between p-4 bg-background rounded-lg border">
                    <div className="space-y-1">
                      <div className="font-medium text-foreground">
                        {getPatientName(patient)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        ID: {getPatientId(patient)} • DOB: {formatPatientDate(patient.dateOfBirth || patient.date_of_birth)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Registered: {formatPatientDate(getCreatedAt(patient))}
                      </div>
                      <div className="flex gap-2 mt-1">
                        {hasResearchConsent(patient) && (
                          <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                            Research Data
                          </Badge>
                        )}
                        {hasSampleStorage(patient) && (
                          <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
                            Sample Storage
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">
                        Registered
                      </Badge>
                      <Button size="sm" variant="outline" onClick={() => window.location.href = '/records'}>
                        View Details
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}