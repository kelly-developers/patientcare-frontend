import { useState, useEffect } from "react";
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
import { CalendarIcon, Download, Upload, FileText } from "lucide-react";
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
  onSubmit: (data: PatientFormData & { consentAccepted: boolean }) => void;
  isLoading: boolean;
}

export default function PatientForm({ onSubmit, isLoading }: PatientFormProps) {
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
      toast({
        title: "File selected",
        description: `${file.name} is ready for upload`,
      });
    }
  };

  const downloadConsentForm = () => {
    const consentFormUrl = "/consent-form-template.pdf";
    const link = document.createElement("a");
    link.href = consentFormUrl;
    link.download = "Consent-Form-Template.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

    onSubmit({ ...formData, consentAccepted });
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

      {/* Consent Section - Simplified */}
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-500" />
            Consent Form
          </CardTitle>
          <CardDescription>
            Please download, sign, and upload the consent form
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Download Template Button */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h4 className="font-medium text-blue-800">Consent Form Template</h4>
                <p className="text-sm text-blue-600">
                  Download the consent form template for signing
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={downloadConsentForm}
                className="whitespace-nowrap"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Template
              </Button>
            </div>
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <Label htmlFor="consent_form">Upload Signed Consent Form (PDF)</Label>
            <div className="flex items-center gap-4">
              <Input
                id="consent_form"
                type="file"
                accept=".pdf"
                onChange={handleFileUpload}
                className="flex-1"
              />
              {consentFile && (
                <div className="text-sm text-green-600 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  {consentFile.name}
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Maximum file size: 10MB. PDF format only.
            </p>
          </div>

          {/* Simple Consent Checkbox */}
          <div className="flex items-start space-x-3 p-4 bg-green-50 rounded-lg border border-green-200">
            <Checkbox
              id="consent_accepted"
              checked={consentAccepted}
              onCheckedChange={(checked) => setConsentAccepted(checked === true)}
              className="mt-1"
            />
            <div className="space-y-1">
              <Label htmlFor="consent_accepted" className="font-medium text-green-800">
                I confirm that the patient has signed and submitted the consent form
              </Label>
              <p className="text-sm text-green-600">
                By checking this box, you acknowledge that the signed consent form has been
                properly completed and uploaded to the system.
              </p>
            </div>
          </div>

          <Separator />

          {/* Submit Button */}
          <div className="flex justify-end pt-4">
            <Button
              type="submit"
              size="lg"
              disabled={isLoading || !consentAccepted}
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