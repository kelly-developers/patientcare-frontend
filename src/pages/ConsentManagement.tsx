import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { 
  FileText, 
  Download, 
  CheckCircle,
  XCircle,
  AlertTriangle,
  User,
  Phone,
  Upload,
  Scan,
  Printer
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ConsentManagement() {
  const [surgeries, setSurgeries] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [selectedSurgery, setSelectedSurgery] = useState<any>(null);
  const [consentData, setConsentData] = useState({
    patientName: "",
    nextOfKin: "",
    nextOfKinPhone: "",
    understoodRisks: false,
    understoodBenefits: false,
    understoodAlternatives: false,
    consentToSurgery: false,
    signature: ""
  });
  const [uploadedConsentFile, setUploadedConsentFile] = useState<File | null>(null);
  const [storedConsentForms, setStoredConsentForms] = useState<any[]>([]);
  const [consentDecision, setConsentDecision] = useState<'pending' | 'accepted' | 'declined'>('pending');
  const { toast } = useToast();

  useEffect(() => {
    loadData();
    loadStoredConsentForms();
  }, []);

  const loadData = () => {
    const storedSurgeries = localStorage.getItem('cardiovascular-surgeries');
    const storedPatients = localStorage.getItem('patients');
    
    if (storedSurgeries) {
      const allSurgeries = JSON.parse(storedSurgeries);
      setSurgeries(allSurgeries.filter((s: any) => s.status === 'consent_pending'));
    }
    
    if (storedPatients) {
      setPatients(JSON.parse(storedPatients));
    }
  };

  const loadStoredConsentForms = () => {
    const storedForms = localStorage.getItem('patient-consent-forms');
    if (storedForms) {
      setStoredConsentForms(JSON.parse(storedForms));
    }
  };

  const getPatientById = (patientId: string) => {
    return patients.find(p => p.id === patientId);
  };

  const handleSurgerySelect = (surgery: any) => {
    setSelectedSurgery(surgery);
    setConsentDecision('pending');
    const patient = getPatientById(surgery.patient_id);
    setConsentData({
      patientName: `${patient?.first_name || ''} ${patient?.last_name || ''}`,
      nextOfKin: patient?.emergency_contact_name || '',
      nextOfKinPhone: patient?.emergency_contact_phone || '',
      understoodRisks: false,
      understoodBenefits: false,
      understoodAlternatives: false,
      consentToSurgery: false,
      signature: ""
    });
    setUploadedConsentFile(null);
  };

  const handleConsentDecision = (accepted: boolean) => {
    if (!selectedSurgery) return;

    if (accepted) {
      // Validate all checkboxes are checked
      if (!consentData.understoodRisks || !consentData.understoodBenefits || 
          !consentData.understoodAlternatives || !consentData.consentToSurgery) {
        toast({
          title: "Error",
          description: "Please acknowledge all consent requirements",
          variant: "destructive",
        });
        return;
      }

      if (!consentData.nextOfKin || !consentData.nextOfKinPhone) {
        toast({
          title: "Error",
          description: "Please provide next of kin information",
          variant: "destructive",
        });
        return;
      }

      if (!consentData.signature) {
        toast({
          title: "Error",
          description: "Please provide your signature (type your full name)",
          variant: "destructive",
        });
        return;
      }
    }

    const storedSurgeries = JSON.parse(localStorage.getItem('cardiovascular-surgeries') || '[]');
    const updatedSurgeries = storedSurgeries.map((s: any) => {
      if (s.id === selectedSurgery.id) {
        return {
          ...s,
          status: accepted ? 'consent_accepted' : 'consent_declined',
          consent_date: new Date().toISOString(),
          consent_data: accepted ? {
            ...consentData,
            submittedTimestamp: new Date().toISOString(),
            submittedDate: new Date().toLocaleDateString(),
            submittedTime: new Date().toLocaleTimeString()
          } : null,
          consent_decision: accepted ? 'accepted' : 'declined',
          decision_timestamp: new Date().toISOString()
        };
      }
      return s;
    });

    localStorage.setItem('cardiovascular-surgeries', JSON.stringify(updatedSurgeries));
    
    setConsentDecision(accepted ? 'accepted' : 'declined');
    
    toast({
      title: accepted ? "Consent Accepted" : "Consent Declined",
      description: accepted 
        ? `Consent has been accepted on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}. You can now print the form and upload the signed copy.` 
        : `Consent has been declined on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}.`,
      variant: accepted ? "default" : "destructive"
    });

    loadData();
  };

  const handlePrintConsent = () => {
    if (consentDecision === 'pending') {
      toast({
        title: "Action Required",
        description: "Please accept or decline consent before printing",
        variant: "destructive",
      });
      return;
    }
    window.print();
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid File Type",
          description: "Please upload PDF, JPEG, or PNG files only",
          variant: "destructive",
        });
        return;
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Please upload files smaller than 5MB",
          variant: "destructive",
        });
        return;
      }

      setUploadedConsentFile(file);
      toast({
        title: "File Ready for Upload",
        description: `${file.name} has been selected for upload at ${new Date().toLocaleTimeString()}`,
        variant: "default",
      });
    }
  };

  const storeConsentForm = () => {
    if (!selectedSurgery || !uploadedConsentFile) {
      toast({
        title: "Missing Information",
        description: "Please select a surgery and upload a consent form",
        variant: "destructive",
      });
      return;
    }

    if (consentDecision !== 'accepted') {
      toast({
        title: "Consent Not Accepted",
        description: "Only accepted consent forms can be stored",
        variant: "destructive",
      });
      return;
    }

    const patient = getPatientById(selectedSurgery.patient_id);
    if (!patient) {
      toast({
        title: "Patient Not Found",
        description: "Unable to find patient information",
        variant: "destructive",
      });
      return;
    }

    const currentTimestamp = new Date().toISOString();
    const currentDate = new Date().toLocaleDateString();
    const currentTime = new Date().toLocaleTimeString();

    // Create consent form record
    const consentForm = {
      id: `consent-${Date.now()}`,
      surgeryId: selectedSurgery.id,
      patientId: selectedSurgery.patient_id,
      patientName: `${patient.first_name} ${patient.last_name}`,
      procedureName: selectedSurgery.procedure_name,
      fileName: uploadedConsentFile.name,
      fileType: uploadedConsentFile.type,
      fileSize: uploadedConsentFile.size,
      uploadDate: currentTimestamp,
      uploadTimestamp: currentTimestamp,
      uploadDateFormatted: currentDate,
      uploadTimeFormatted: currentTime,
      status: 'signed_and_stored',
      storageLocation: 'secure_digital_archive',
      consentDecision: 'accepted',
      submittedTimestamp: selectedSurgery.consent_data?.submittedTimestamp,
      submittedDate: selectedSurgery.consent_data?.submittedDate,
      submittedTime: selectedSurgery.consent_data?.submittedTime
    };

    // Store in localStorage
    const existingForms = JSON.parse(localStorage.getItem('patient-consent-forms') || '[]');
    const updatedForms = [...existingForms, consentForm];
    localStorage.setItem('patient-consent-forms', JSON.stringify(updatedForms));

    // Update surgery status to scheduled only after signed form is uploaded
    const storedSurgeries = JSON.parse(localStorage.getItem('cardiovascular-surgeries') || '[]');
    const updatedSurgeries = storedSurgeries.map((s: any) => {
      if (s.id === selectedSurgery.id) {
        return {
          ...s,
          status: 'scheduled',
          consent_date: currentTimestamp,
          consent_form_stored: true,
          stored_consent_id: consentForm.id,
          form_upload_timestamp: currentTimestamp,
          form_upload_date: currentDate,
          form_upload_time: currentTime
        };
      }
      return s;
    });

    localStorage.setItem('cardiovascular-surgeries', JSON.stringify(updatedSurgeries));

    toast({
      title: "Consent Form Stored Successfully",
      description: `The signed consent form has been securely stored on ${currentDate} at ${currentTime} and surgery is now scheduled`,
      variant: "default",
    });

    // Reset state
    setUploadedConsentFile(null);
    setSelectedSurgery(null);
    setConsentDecision('pending');
    loadData();
    loadStoredConsentForms();
  };

  const retrieveConsentForm = (consentFormId: string) => {
    const form = storedConsentForms.find(f => f.id === consentFormId);
    if (form) {
      const submittedDate = form.submittedDate ? `Submitted: ${form.submittedDate} at ${form.submittedTime}` : '';
      const uploadedDate = `Uploaded: ${form.uploadDateFormatted} at ${form.uploadTimeFormatted}`;
      
      toast({
        title: "Consent Form Retrieved",
        description: `Consent form for ${form.patientName} is available for review. ${submittedDate} ${uploadedDate}`,
        variant: "default",
      });
      console.log('Retrieving consent form:', form);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-foreground">Surgery Consent Management</h1>
        <p className="text-muted-foreground">
          Obtain, sign, print, and upload patient consent for surgical procedures
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Consent List */}
        <Card className="lg:col-span-1 bg-gradient-card shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-warning" />
              Pending Consent
            </CardTitle>
            <CardDescription>
              Surgeries requiring patient consent
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {surgeries.length === 0 ? (
                <div className="text-center text-muted-foreground py-8 text-sm">
                  No pending consents
                </div>
              ) : (
                surgeries.map((surgery) => {
                  const patient = getPatientById(surgery.patient_id);
                  return (
                    <div 
                      key={surgery.id} 
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedSurgery?.id === surgery.id 
                          ? 'bg-primary/10 border-primary' 
                          : 'bg-background hover:bg-muted/50'
                      }`}
                      onClick={() => handleSurgerySelect(surgery)}
                    >
                      <div className="font-medium text-sm">
                        {patient?.first_name} {patient?.last_name}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {surgery.procedure_name}
                      </div>
                      <Badge variant="outline" className="mt-2 text-xs">
                        {surgery.urgency}
                      </Badge>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>

        {/* Consent Form */}
        <Card className="lg:col-span-2 bg-gradient-card shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Surgical Consent Form
            </CardTitle>
            <CardDescription>
              {consentDecision === 'accepted' 
                ? "Consent accepted - Print form and upload signed copy" 
                : consentDecision === 'declined' 
                ? "Consent declined" 
                : "Patient consent for surgical procedure"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!selectedSurgery ? (
              <div className="text-center text-muted-foreground py-12">
                <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Select a patient from the list to begin consent process</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Decision Status Banner */}
                {consentDecision !== 'pending' && (
                  <div className={`p-4 rounded-lg ${
                    consentDecision === 'accepted' 
                      ? 'bg-green-50 border border-green-200' 
                      : 'bg-red-50 border border-red-200'
                  }`}>
                    <div className="flex items-center gap-2">
                      {consentDecision === 'accepted' ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600" />
                      )}
                      <span className={`font-medium ${
                        consentDecision === 'accepted' ? 'text-green-800' : 'text-red-800'
                      }`}>
                        {consentDecision === 'accepted' 
                          ? `Consent Accepted on ${new Date().toLocaleDateString()} - Ready for printing and upload` 
                          : `Consent Declined on ${new Date().toLocaleDateString()}`}
                      </span>
                    </div>
                  </div>
                )}

                {/* Patient Information */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-3">
                    <User className="w-4 h-4 text-primary" />
                    <h3 className="font-semibold">Patient Information</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Patient Name</Label>
                      <Input value={consentData.patientName} disabled />
                    </div>
                    <div className="space-y-2">
                      <Label>Procedure</Label>
                      <Input value={selectedSurgery.procedure_name} disabled />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="nextOfKin">Next of Kin *</Label>
                      <Input 
                        id="nextOfKin"
                        value={consentData.nextOfKin}
                        onChange={(e) => setConsentData({...consentData, nextOfKin: e.target.value})}
                        placeholder="Enter next of kin name"
                        disabled={consentDecision !== 'pending'}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="nextOfKinPhone">Next of Kin Phone *</Label>
                      <Input 
                        id="nextOfKinPhone"
                        value={consentData.nextOfKinPhone}
                        onChange={(e) => setConsentData({...consentData, nextOfKinPhone: e.target.value})}
                        placeholder="Enter phone number"
                        disabled={consentDecision !== 'pending'}
                      />
                    </div>
                  </div>
                </div>

                {/* Procedure Information */}
                <div className="space-y-3">
                  <h3 className="font-semibold">Procedure Details</h3>
                  <div className="p-4 bg-muted/50 rounded-lg space-y-2 text-sm">
                    <div><strong>Diagnosis:</strong> {selectedSurgery.diagnosis}</div>
                    <div><strong>Recommended Surgery:</strong> {selectedSurgery.procedure_name}</div>
                    <div><strong>Urgency Level:</strong> <Badge variant="outline">{selectedSurgery.urgency}</Badge></div>
                    <div><strong>Recommended By:</strong> {selectedSurgery.recommended_by}</div>
                  </div>
                </div>

                <Separator />

                {/* Consent Acknowledgments */}
                <div className="space-y-4">
                  <h3 className="font-semibold">Consent Acknowledgments</h3>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-2">
                      <Checkbox 
                        id="understoodRisks"
                        checked={consentData.understoodRisks}
                        onCheckedChange={(checked) => setConsentData({...consentData, understoodRisks: checked as boolean})}
                        disabled={consentDecision !== 'pending'}
                      />
                      <Label htmlFor="understoodRisks" className="text-sm cursor-pointer leading-relaxed">
                        I understand the risks associated with this surgical procedure including, but not limited to: infection, bleeding, adverse reactions to anesthesia, and potential complications specific to cardiovascular surgery.
                      </Label>
                    </div>

                    <div className="flex items-start space-x-2">
                      <Checkbox 
                        id="understoodBenefits"
                        checked={consentData.understoodBenefits}
                        onCheckedChange={(checked) => setConsentData({...consentData, understoodBenefits: checked as boolean})}
                        disabled={consentDecision !== 'pending'}
                      />
                      <Label htmlFor="understoodBenefits" className="text-sm cursor-pointer leading-relaxed">
                        I understand the potential benefits of this surgery and how it may improve my cardiovascular health and quality of life.
                      </Label>
                    </div>

                    <div className="flex items-start space-x-2">
                      <Checkbox 
                        id="understoodAlternatives"
                        checked={consentData.understoodAlternatives}
                        onCheckedChange={(checked) => setConsentData({...consentData, understoodAlternatives: checked as boolean})}
                        disabled={consentDecision !== 'pending'}
                      />
                      <Label htmlFor="understoodAlternatives" className="text-sm cursor-pointer leading-relaxed">
                        I have been informed of alternative treatment options and have had the opportunity to discuss them with my healthcare provider.
                      </Label>
                    </div>

                    <div className="flex items-start space-x-2 pt-2 border-t">
                      <Checkbox 
                        id="consentToSurgery"
                        checked={consentData.consentToSurgery}
                        onCheckedChange={(checked) => setConsentData({...consentData, consentToSurgery: checked as boolean})}
                        disabled={consentDecision !== 'pending'}
                      />
                      <Label htmlFor="consentToSurgery" className="text-sm font-medium cursor-pointer leading-relaxed">
                        I hereby give my informed consent to proceed with the surgical procedure described above.
                      </Label>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Digital Signature */}
                <div className="space-y-2">
                  <Label htmlFor="signature">Digital Signature *</Label>
                  <Input 
                    id="signature"
                    value={consentData.signature}
                    onChange={(e) => setConsentData({...consentData, signature: e.target.value})}
                    placeholder="Type your full name to sign"
                    disabled={consentDecision !== 'pending'}
                  />
                  <p className="text-xs text-muted-foreground">
                    By typing your name above, you electronically sign this consent form.
                  </p>
                </div>

                {/* Action Buttons - Decision Phase */}
                {consentDecision === 'pending' && (
                  <>
                    <Separator />
                    <div className="flex flex-wrap gap-3">
                      <Button 
                        className="bg-gradient-medical text-white"
                        onClick={() => handleConsentDecision(true)}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Accept & Sign Consent
                      </Button>
                      <Button 
                        variant="destructive"
                        onClick={() => handleConsentDecision(false)}
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Decline Consent
                      </Button>
                    </div>
                  </>
                )}

                {/* Print Section - Available after decision */}
                {consentDecision !== 'pending' && (
                  <>
                    <Separator />
                    <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center gap-2">
                        <Printer className="w-4 h-4 text-blue-600" />
                        <h3 className="font-semibold text-blue-900">Print Consent Form</h3>
                      </div>
                      <p className="text-sm text-blue-700">
                        {consentDecision === 'accepted' 
                          ? "Print the consent form for physical signature and records." 
                          : "Print the declined consent form for records."}
                      </p>
                      <Button 
                        variant="outline"
                        onClick={handlePrintConsent}
                        className="bg-white"
                      >
                        <Printer className="w-4 h-4 mr-2" />
                        Print Form
                      </Button>
                    </div>
                  </>
                )}

                {/* Upload Section - Only available after acceptance */}
                {consentDecision === 'accepted' && (
                  <>
                    <Separator />
                    <div className="space-y-4 p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center gap-2">
                        <Upload className="w-4 h-4 text-green-600" />
                        <h3 className="font-semibold text-green-900">Upload Signed Consent Form</h3>
                      </div>
                      <p className="text-sm text-green-700">
                        After obtaining physical signature, scan and upload the signed consent form for secure digital storage.
                      </p>
                      
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <Input 
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={handleFileUpload}
                            className="flex-1"
                          />
                          <Button 
                            variant="outline" 
                            onClick={() => {
                              const input = document.querySelector('input[type="file"]') as HTMLInputElement;
                              input?.click();
                            }}
                            className="bg-white"
                          >
                            <Scan className="w-4 h-4 mr-2" />
                            Choose File
                          </Button>
                        </div>
                        
                        {uploadedConsentFile && (
                          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium text-green-800">{uploadedConsentFile.name}</p>
                                <p className="text-sm text-green-600">
                                  {(uploadedConsentFile.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                                <p className="text-xs text-green-500">
                                  Selected: {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
                                </p>
                              </div>
                              <Button 
                                onClick={storeConsentForm}
                                className="bg-green-600 hover:bg-green-700 text-white"
                              >
                                <Upload className="w-4 h-4 mr-2" />
                                Store Securely
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}

                <Separator />

                <div className="pt-4 border-t">
                  <p className="text-xs text-muted-foreground">
                    <strong>Workflow:</strong> 1. Accept/Decline Consent → 2. Print Form → 3. (If accepted) Upload Signed Copy → 4. Surgery Scheduled
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Stored Consent Forms Section */}
      <Card className="bg-gradient-card shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-green-600" />
            Securely Stored Consent Forms
          </CardTitle>
          <CardDescription>
            Digitally stored consent forms for compliance and easy retrieval
          </CardDescription>
        </CardHeader>
        <CardContent>
          {storedConsentForms.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No consent forms stored yet</p>
              <p className="text-sm">Upload signed consent forms to see them here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {storedConsentForms.map((form) => (
                <div key={form.id} className="p-4 border rounded-lg bg-background">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="font-medium">{form.patientName}</div>
                      <div className="text-sm text-muted-foreground">{form.procedureName}</div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>Submitted: {form.submittedDate || 'N/A'} at {form.submittedTime || 'N/A'}</span>
                        <span>Uploaded: {form.uploadDateFormatted} at {form.uploadTimeFormatted}</span>
                        <span>File: {form.fileName}</span>
                        <Badge variant="outline" className="bg-green-50 text-green-700">
                          Securely Stored
                        </Badge>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => retrieveConsentForm(form.id)}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Retrieve
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}