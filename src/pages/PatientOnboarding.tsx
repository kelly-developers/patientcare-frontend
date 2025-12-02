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
  MoreHorizontal,
  CheckCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { usePatients } from "@/hooks/usePatients";
import PatientForm from "@/components/PatientForm";
import { Patient } from "@/services/patientsService";

// Helper functions moved outside the component
const hasResearchConsent = (patient: Patient) => {
  return patient?.researchConsent === true || 
         patient?.research_consent?.dataUse === true ||
         patient?.research_consent === true;
};

const hasSampleStorage = (patient: Patient) => {
  return patient?.sampleStorageConsent === true || 
         patient?.sample_storage?.storeSamples === true;
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
  return (patient as any)?.status || 'active';
};

// PatientCard component moved outside and uses the helper functions
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

// Enhanced Research Data Consent Component with Download and Physical Signature
const EnhancedResearchConsentSection = ({ 
  consent, 
  onChange, 
  loading, 
  onDownloadConsent,
  consentFile,
  onFileUpload,
  onRemoveFile,
  onConsentAcceptedChange,
  consentAccepted 
}: any) => {
  const [fileUploaded, setFileUploaded] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== "application/pdf") {
        // Handle error - should be done via toast in parent
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        // Handle error - should be done via toast in parent
        return;
      }
      onFileUpload(file);
      setFileUploaded(true);
    }
  };

  const handleRemoveFile = () => {
    onRemoveFile();
    setFileUploaded(false);
  };

  return (
    <div className="space-y-6">
      {/* Research Data Consent Section */}
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

            {/* Consent Form Download Section */}
            {consent.dataUse && (
              <div className="pt-4 border-t">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-semibold">
                      1
                    </div>
                    <h4 className="font-medium text-blue-800">Download Consent Form</h4>
                  </div>
                  <p className="text-sm text-blue-600 mb-4">
                    Download the research data consent form for physical signature.
                  </p>
                  <Button
                    type="button"
                    onClick={onDownloadConsent}
                    className="whitespace-nowrap"
                    disabled={loading}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Consent Form
                  </Button>
                </div>
              </div>
            )}

            {/* Physical Signature Upload Section */}
            {consent.dataUse && (
              <div className="pt-4">
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-green-100 text-green-700 rounded-full flex items-center justify-center font-semibold">
                      2
                    </div>
                    <h4 className="font-medium text-green-800">Upload Signed Consent Form</h4>
                  </div>
                  
                  {consentFile ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                        <FileText className="w-6 h-6 text-green-500" />
                        <div className="flex-1">
                          <p className="font-medium">{consentFile.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {(consentFile.size || 0) / 1024} KB • PDF
                          </p>
                        </div>
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleRemoveFile}
                      >
                        Remove File
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="border-2 border-dashed border-green-300 rounded-lg p-6 text-center">
                        <Upload className="w-8 h-8 text-green-400 mx-auto mb-3" />
                        <p className="text-sm font-medium text-green-700 mb-2">
                          Upload signed consent form
                        </p>
                        <p className="text-xs text-green-600 mb-4">
                          Upload the physically signed consent form (PDF only, max 10MB)
                        </p>
                        <Input
                          id="research_consent_form"
                          type="file"
                          accept=".pdf"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                        <Label
                          htmlFor="research_consent_form"
                          className="cursor-pointer inline-flex items-center justify-center px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Choose File
                        </Label>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Confirmation Checkbox */}
            {consentFile && (
              <div className="flex items-start space-x-3 p-4 bg-purple-50 rounded-lg border border-purple-200">
                <Checkbox
                  id="research_consent_accepted"
                  checked={consentAccepted}
                  onCheckedChange={(checked) => onConsentAcceptedChange(checked === true)}
                  className="mt-1"
                />
                <div className="space-y-1">
                  <Label htmlFor="research_consent_accepted" className="font-medium text-purple-800">
                    I confirm that the patient has physically signed the research consent form
                  </Label>
                  <p className="text-sm text-purple-600">
                    By checking this box, you confirm that the patient has reviewed and physically signed 
                    the research data consent form, and the uploaded document is the authentic signed copy.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default function PatientOnboarding() {
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [activeTab, setActiveTab] = useState("new");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [researchConsent, setResearchConsent] = useState({
    dataUse: false,
    futureContact: false,
    anonymizedData: false,
    consentDate: null as Date | null
  });
  const [researchConsentFile, setResearchConsentFile] = useState<File | null>(null);
  const [researchConsentAccepted, setResearchConsentAccepted] = useState(false);
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

  const handleResearchConsentFileUpload = (file: File) => {
    if (file.type !== "application/pdf") {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF file",
        variant: "destructive",
      });
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Maximum file size is 10MB",
        variant: "destructive",
      });
      return;
    }
    setResearchConsentFile(file);
    toast({
      title: "File uploaded successfully",
      description: `${file.name} has been uploaded`,
    });
  };

  const handleRemoveResearchConsentFile = () => {
    setResearchConsentFile(null);
    setResearchConsentAccepted(false);
  };

  const handleDownloadResearchConsentForm = () => {
    // Generate research consent form content
    const consentContent = `
RESEARCH DATA CONSENT FORM
=============================

CONSENT FOR USE OF HEALTH DATA IN RESEARCH

I hereby give my consent for my health data to be used in medical research studies under the following terms:

1. DATA USAGE: I consent to my anonymized health data being used in medical research studies to advance medical knowledge and improve healthcare outcomes.

2. ANONYMIZATION: I understand that my data will be anonymized and cannot be traced back to me personally. All identifying information will be removed before data is used for research.

3. FUTURE CONTACT: ${researchConsent.futureContact ? 
      "I consent to being contacted about future research studies I may be eligible for." : 
      "I do not consent to being contacted about future research studies."}

4. CONSENT DATE: ${researchConsent.consentDate ? format(researchConsent.consentDate, "MMMM dd, yyyy") : "Date not specified"}

5. WITHDRAWAL RIGHTS: I understand that I may withdraw my consent at any time by notifying the research coordinator in writing.

6. DATA SECURITY: I understand that my data will be stored securely and accessed only by authorized research personnel.

By signing below, I acknowledge that I have read and understood this consent form, and I voluntarily agree to participate.

_________________________
Patient's Signature

Date: ___________________

_________________________
Witness Signature

Date: ___________________

RESEARCHER'S ACKNOWLEDGMENT

I confirm that I have explained the nature and purpose of this research data consent to the patient and answered all questions.

_________________________
Researcher's Signature

Date: ___________________
    `;
    
    const blob = new Blob([consentContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Research-Consent-Form-${Date.now()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Research consent form downloaded",
      description: "Please print, sign, and upload the signed form",
    });
  };

  const handleSubmitWithConsent = async (patientData: any) => {
    try {
      console.log('📝 Submitting patient data:', patientData);
      
      // Enhanced validation with proper field names
      const requiredFields = ['firstName', 'lastName', 'dateOfBirth', 'gender'];
      const missingFields = requiredFields.filter(field => {
        // Map from snake_case to camelCase for checking
        const snakeCaseField = field
          .replace(/([A-Z])/g, '_$1')
          .toLowerCase();
        return !patientData[snakeCaseField] && !patientData[field];
      });
      
      if (missingFields.length > 0) {
        toast({
          title: "Missing required information",
          description: `Please fill in: ${missingFields.join(', ')}`,
          variant: "destructive"
        });
        return;
      }

      // Check for research consent acceptance and file
      if (researchConsent.dataUse && !researchConsentAccepted) {
        toast({
          title: "Research consent confirmation required",
          description: "Please confirm that the patient has signed the research consent form",
          variant: "destructive"
        });
        return;
      }

      if (researchConsent.dataUse && !researchConsentFile) {
        toast({
          title: "Signed research consent form required",
          description: "Please upload the signed research consent form",
          variant: "destructive"
        });
        return;
      }

      // Enhanced date validation
      const dob = patientData.date_of_birth || patientData.dateOfBirth;
      const dobDate = new Date(dob);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (isNaN(dobDate.getTime())) {
        toast({
          title: "Invalid date format",
          description: "Please enter a valid date of birth in YYYY-MM-DD format",
          variant: "destructive"
        });
        return;
      }

      if (dobDate > today) {
        toast({
          title: "Invalid date of birth",
          description: "Date of birth cannot be in the future",
          variant: "destructive"
        });
        return;
      }

      // Validate age
      const ageInMs = today.getTime() - dobDate.getTime();
      const ageInYears = ageInMs / (1000 * 60 * 60 * 24 * 365.25);
      
      if (ageInYears > 120) {
        toast({
          title: "Invalid age",
          description: "Patient age appears to be over 120 years. Please check the date of birth.",
          variant: "destructive"
        });
        return;
      }

      if (ageInYears < 0) {
        toast({
          title: "Invalid date",
          description: "Date of birth cannot be in the future",
          variant: "destructive"
        });
        return;
      }

      // Create FormData to handle file uploads
      const formData = new FormData();
      
      // Add patient data with CORRECT camelCase field names for backend
      // Map from snake_case (from PatientForm) to camelCase (backend expects)
      formData.append('firstName', patientData.first_name || patientData.firstName || '');
      formData.append('lastName', patientData.last_name || patientData.lastName || '');
      formData.append('dateOfBirth', patientData.date_of_birth || patientData.dateOfBirth || '');
      formData.append('gender', patientData.gender || '');
      formData.append('phone', patientData.phone || '');
      formData.append('email', patientData.email || '');
      formData.append('address', patientData.address || '');
      formData.append('emergencyContactName', patientData.emergency_contact_name || patientData.emergencyContactName || '');
      formData.append('emergencyContactPhone', patientData.emergency_contact_phone || patientData.emergencyContactPhone || '');
      formData.append('medicalHistory', patientData.medical_history || patientData.medicalHistory || '');
      formData.append('allergies', patientData.allergies || '');
      formData.append('currentMedications', patientData.current_medications || patientData.currentMedications || '');
      
      // Add patient consent information
      formData.append('consentAccepted', (patientData.consentAccepted || false).toString());
      formData.append('consentFormPath', patientData.consentFile?.name || '');
      
      // Add research consent information
      formData.append('researchConsent', researchConsent.dataUse.toString());
      formData.append('anonymizedDataConsent', researchConsent.anonymizedData.toString());
      formData.append('futureContactConsent', researchConsent.futureContact.toString());
      
      if (researchConsent.consentDate) {
        formData.append('researchConsentDate', researchConsent.consentDate.toISOString());
      }
      
      // Add research consent file if exists
      if (researchConsentFile) {
        formData.append('researchConsentFile', researchConsentFile);
      }

      console.log('🚀 Submitting form data with files');
      console.log('FormData contents:');
      for (let [key, value] of (formData as any).entries()) {
        console.log(`${key}:`, value);
      }
      
      // You'll need to update your addPatient function to handle FormData
      await addPatient(formData);
      
      // Reset forms only on success
      setResearchConsent({
        dataUse: false,
        futureContact: false,
        anonymizedData: false,
        consentDate: null
      });
      setResearchConsentFile(null);
      setResearchConsentAccepted(false);

      toast({
        title: "Patient registered successfully",
        description: "Patient information and signed consent forms have been stored.",
        variant: "default"
      });

      // Switch to recent tab to show the new patient
      setActiveTab("recent");
      
    } catch (error) {
      console.error("❌ Error submitting patient data:", error);
      
      // Enhanced error handling
      if (error instanceof Error) {
        toast({
          title: "Registration failed",
          description: error.message || "An unexpected error occurred. Please try again.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Registration failed",
          description: "Unable to register patient. Please check your connection and try again.",
          variant: "destructive"
        });
      }
    }
  };

  const handlePatientFormSubmit = async (patientData: any) => {
    // The patientData now includes consentAccepted and consentFile
    await handleSubmitWithConsent(patientData);
  };

  const statusOptions = [
    { value: "all", label: "All Patients" },
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
    { value: "pending", label: "Pending Review" }
  ];

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

          {/* Enhanced Research Data Consent Section Only */}
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
              <EnhancedResearchConsentSection
                consent={researchConsent}
                onChange={handleResearchConsentChange}
                loading={loading}
                onDownloadConsent={handleDownloadResearchConsentForm}
                consentFile={researchConsentFile}
                onFileUpload={handleResearchConsentFileUpload}
                onRemoveFile={handleRemoveResearchConsentFile}
                onConsentAcceptedChange={setResearchConsentAccepted}
                consentAccepted={researchConsentAccepted}
              />
            </CardContent>
          </Card>
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