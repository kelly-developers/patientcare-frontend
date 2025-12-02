import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Download, Upload, FileText, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PatientFormData {
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: string;
  phone: string;
  email: string;
  address: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  medical_history: string;
  allergies: string;
  current_medications: string;
}

interface PatientFormProps {
  onSubmit: (data: any) => void;
  isLoading?: boolean;
}

export default function PatientForm({ onSubmit, isLoading = false }: PatientFormProps) {
  const [formData, setFormData] = useState<PatientFormData>({
    first_name: "",
    last_name: "",
    date_of_birth: "",
    gender: "",
    phone: "",
    email: "",
    address: "",
    emergency_contact_name: "",
    emergency_contact_phone: "",
    medical_history: "",
    allergies: "",
    current_medications: "",
  });

  const [date, setDate] = useState<Date>();
  const [consentAccepted, setConsentAccepted] = useState(false);
  const [consentFile, setConsentFile] = useState<File | null>(null);
  const [fileUploaded, setFileUploaded] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (field: keyof PatientFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      setDate(selectedDate);
      const formattedDate = format(selectedDate, "yyyy-MM-dd");
      handleInputChange("date_of_birth", formattedDate);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== "application/pdf") {
        toast({
          title: "Invalid file type",
          description: "Please upload a PDF file",
          variant: "destructive",
        });
        return;
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast({
          title: "File too large",
          description: "Maximum file size is 10MB",
          variant: "destructive",
        });
        return;
      }
      setConsentFile(file);
      setFileUploaded(true);
      toast({
        title: "File uploaded successfully",
        description: `${file.name} has been uploaded`,
      });
    }
  };

  const downloadConsentForm = () => {
    // Generate a pre-filled consent form with patient information
    const consentData = {
      patientName: `${formData.first_name} ${formData.last_name}`,
      dateOfBirth: formData.date_of_birth,
      gender: formData.gender,
      phone: formData.phone,
      email: formData.email,
      address: formData.address,
      date: new Date().toISOString().split('T')[0]
    };
    
    // Create a downloadable PDF (this is a simplified version - you would use a PDF library in production)
    const consentFormContent = `
CONSENT FORM
=======================

Patient Information:
Name: ${consentData.patientName}
Date of Birth: ${consentData.dateOfBirth}
Gender: ${consentData.gender}
Phone: ${consentData.phone}
Email: ${consentData.email}
Address: ${consentData.address}

Date: ${consentData.date}

CONSENT FOR TREATMENT AND DATA USE

I, ${consentData.patientName}, hereby consent to:

1. MEDICAL TREATMENT: I consent to receive medical treatment, procedures, and interventions as deemed necessary by my healthcare provider.

2. DATA USAGE: I consent to the collection and use of my health information for treatment purposes, with the understanding that my information will be stored securely and only authorized personnel will have access.

3. RESEARCH PARTICIPATION: I agree that my anonymized health data may be used for medical research to improve treatment outcomes and advance medical knowledge.

4. SAMPLE STORAGE: I consent to the storage of my biological samples for future testing and research purposes.

5. COMMUNICATION: I agree to receive communications regarding my treatment, appointments, and follow-up care.

I have read and understood this consent form. All my questions have been answered to my satisfaction.

_________________________
Patient's Signature

Date: ___________________

_________________________
Witness Signature

Date: ___________________

NOTES:
- You may withdraw your consent at any time by notifying your healthcare provider in writing.
- Withdrawal of consent will not affect the quality of care you receive.
    `;
    
    const blob = new Blob([consentFormContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Consent-Form-${formData.first_name}-${formData.last_name}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Consent form downloaded",
      description: "Please print, sign, and upload the signed form",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!consentAccepted) {
      toast({
        title: "Consent required",
        description: "Please accept the consent terms to proceed",
        variant: "destructive",
      });
      return;
    }

    if (!consentFile) {
      toast({
        title: "Signed consent form required",
        description: "Please download, sign, and upload the consent form",
        variant: "destructive",
      });
      return;
    }

    const requiredFields = ['first_name', 'last_name', 'date_of_birth', 'gender'];
    const missingFields = requiredFields.filter(field => !formData[field as keyof PatientFormData]);
    
    if (missingFields.length > 0) {
      toast({
        title: "Missing required information",
        description: `Please fill in: ${missingFields.join(', ').replace(/_/g, ' ')}`,
        variant: "destructive",
      });
      return;
    }

    // Convert snake_case to camelCase for backend
    const processedData = {
      firstName: formData.first_name,
      lastName: formData.last_name,
      dateOfBirth: formData.date_of_birth,
      gender: formData.gender,
      phone: formData.phone,
      email: formData.email,
      address: formData.address,
      emergencyContactName: formData.emergency_contact_name,
      emergencyContactPhone: formData.emergency_contact_phone,
      medicalHistory: formData.medical_history,
      allergies: formData.allergies,
      currentMedications: formData.current_medications,
      consentAccepted,
      consentFile
    };

    onSubmit(processedData);
  };

  const removeFile = () => {
    setConsentFile(null);
    setFileUploaded(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Basic Information</CardTitle>
          <CardDescription>Enter patient's basic details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name">First Name *</Label>
              <Input
                id="first_name"
                value={formData.first_name}
                onChange={(e) => handleInputChange("first_name", e.target.value)}
                placeholder="John"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name">Last Name *</Label>
              <Input
                id="last_name"
                value={formData.last_name}
                onChange={(e) => handleInputChange("last_name", e.target.value)}
                placeholder="Doe"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date_of_birth">Date of Birth *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                    type="button"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Select date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={handleDateSelect}
                    disabled={(date) => date > new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <Input
                id="date_of_birth"
                type="hidden"
                value={formData.date_of_birth}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gender">Gender *</Label>
              <Select
                value={formData.gender}
                onValueChange={(value) => handleInputChange("gender", value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MALE">Male</SelectItem>
                  <SelectItem value="FEMALE">Female</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Contact Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                placeholder="+254700000000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="john@example.com"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => handleInputChange("address", e.target.value)}
              placeholder="Full address"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Emergency Contact */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Emergency Contact</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="emergency_contact_name">Emergency Contact Name</Label>
              <Input
                id="emergency_contact_name"
                value={formData.emergency_contact_name}
                onChange={(e) => handleInputChange("emergency_contact_name", e.target.value)}
                placeholder="Contact person name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emergency_contact_phone">Emergency Contact Phone</Label>
              <Input
                id="emergency_contact_phone"
                type="tel"
                value={formData.emergency_contact_phone}
                onChange={(e) => handleInputChange("emergency_contact_phone", e.target.value)}
                placeholder="+254700000000"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Medical Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Medical Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="medical_history">Medical History</Label>
            <Textarea
              id="medical_history"
              value={formData.medical_history}
              onChange={(e) => handleInputChange("medical_history", e.target.value)}
              placeholder="Previous medical conditions, surgeries, etc."
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="allergies">Allergies</Label>
            <Textarea
              id="allergies"
              value={formData.allergies}
              onChange={(e) => handleInputChange("allergies", e.target.value)}
              placeholder="Known allergies"
              rows={2}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="current_medications">Current Medications</Label>
            <Textarea
              id="current_medications"
              value={formData.current_medications}
              onChange={(e) => handleInputChange("current_medications", e.target.value)}
              placeholder="Current medications and dosages"
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {/* Consent Section - Physical Signature Process */}
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-500" />
            Consent Form Process
          </CardTitle>
          <CardDescription>
            Three-step process for physical consent form
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Step 1: Download Form */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-semibold">
                1
              </div>
              <h4 className="font-medium text-blue-800">Download Consent Form</h4>
            </div>
            <p className="text-sm text-blue-600 mb-4">
              Download the pre-filled consent form. It will include all the patient information you entered above.
            </p>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="text-sm">
                <p className="font-medium">Form includes:</p>
                <ul className="list-disc ml-5 mt-1 space-y-1">
                  <li>Patient information</li>
                  <li>Consent terms and conditions</li>
                  <li>Signature lines</li>
                  <li>Date fields</li>
                </ul>
              </div>
              <Button
                type="button"
                onClick={downloadConsentForm}
                className="whitespace-nowrap"
                disabled={!formData.first_name || !formData.last_name}
              >
                <Download className="w-4 h-4 mr-2" />
                Download Form
              </Button>
            </div>
          </div>

          {/* Step 2: Print & Sign */}
          <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center font-semibold">
                2
              </div>
              <h4 className="font-medium text-amber-800">Print & Sign Physically</h4>
            </div>
            <div className="space-y-2 text-sm text-amber-600">
              <p><strong>Instructions:</strong></p>
              <ol className="list-decimal ml-5 space-y-1">
                <li>Print the downloaded consent form</li>
                <li>Have the patient read and sign the form</li>
                <li>Get witness signature if required</li>
                <li>Scan or take a clear photo of the signed form</li>
              </ol>
            </div>
          </div>

          {/* Step 3: Upload Signed Form */}
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-green-100 text-green-700 rounded-full flex items-center justify-center font-semibold">
                3
              </div>
              <h4 className="font-medium text-green-800">Upload Signed Form</h4>
            </div>
            
            {fileUploaded ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                  <FileText className="w-6 h-6 text-green-500" />
                  <div className="flex-1">
                    <p className="font-medium">{consentFile?.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(consentFile?.size || 0) / 1024} KB • PDF
                    </p>
                  </div>
                  <CheckCircle className="w-5 h-5 text-green-500" />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={removeFile}
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
                    Upload the scanned/photographed signed consent form (PDF only, max 10MB)
                  </p>
                  <Input
                    id="consent_form"
                    type="file"
                    accept=".pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Label
                    htmlFor="consent_form"
                    className="cursor-pointer inline-flex items-center justify-center px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Choose File
                  </Label>
                </div>
              </div>
            )}
          </div>

          {/* Simple Consent Checkbox */}
          <div className="flex items-start space-x-3 p-4 bg-purple-50 rounded-lg border border-purple-200">
            <Checkbox
              id="consent_accepted"
              checked={consentAccepted}
              onCheckedChange={(checked) => setConsentAccepted(checked === true)}
              className="mt-1"
            />
            <div className="space-y-1">
              <Label htmlFor="consent_accepted" className="font-medium text-purple-800">
                I confirm that the patient has physically signed the consent form
              </Label>
              <p className="text-sm text-purple-600">
                By checking this box, you confirm that the patient has reviewed and physically signed 
                the consent form, and the uploaded document is the authentic signed copy.
              </p>
            </div>
          </div>

          <Separator />

          {/* Submit Button */}
          <div className="flex justify-end pt-4">
            <Button
              type="submit"
              size="lg"
              disabled={isLoading || !consentAccepted || !consentFile}
              className="min-w-[200px]"
            >
              {isLoading ? "Registering Patient..." : "Complete Registration"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}