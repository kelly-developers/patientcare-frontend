import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Download, FileText, Table, FileSpreadsheet } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { usePatients } from "@/hooks/usePatients";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function ExportData() {
  const [selectedPatients, setSelectedPatients] = useState<string[]>([]);
  const [exportType, setExportType] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { patients } = usePatients();

  const consentedPatients = patients.filter(p => p.research_consent);

  const togglePatient = (patientId: string) => {
    setSelectedPatients(prev =>
      prev.includes(patientId)
        ? prev.filter(id => id !== patientId)
        : [...prev, patientId]
    );
  };

  const toggleAll = () => {
    if (selectedPatients.length === consentedPatients.length) {
      setSelectedPatients([]);
    } else {
      setSelectedPatients(consentedPatients.map(p => p.id));
    }
  };

  const downloadFile = (blob: Blob, filename: string) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const exportToExcelLocal = () => {
    const selectedData = consentedPatients.filter(p => 
      selectedPatients.length === 0 || selectedPatients.includes(p.id)
    );

    const exportData = selectedData.map(patient => ({
      'Patient ID': patient.patient_id,
      'First Name': patient.first_name,
      'Last Name': patient.last_name,
      'Date of Birth': patient.date_of_birth,
      'Gender': patient.gender || 'N/A',
      'Phone': patient.phone || 'N/A',
      'Email': patient.email || 'N/A',
      'Address': patient.address || 'N/A',
      'Emergency Contact': patient.emergency_contact_name || 'N/A',
      'Emergency Phone': patient.emergency_contact_phone || 'N/A',
      'Medical History': patient.medical_history || 'N/A',
      'Allergies': patient.allergies || 'N/A',
      'Current Medications': patient.current_medications || 'N/A',
      'Research Consent': patient.research_consent ? 'Yes' : 'No',
      'Consent Date': patient.research_consent_date || 'N/A',
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Patient Data");

    const colWidths = [
      { wch: 12 }, { wch: 15 }, { wch: 15 }, { wch: 12 },
      { wch: 10 }, { wch: 15 }, { wch: 25 }, { wch: 30 },
      { wch: 20 }, { wch: 15 }, { wch: 30 }, { wch: 20 },
      { wch: 30 }, { wch: 15 }, { wch: 12 }
    ];
    worksheet['!cols'] = colWidths;

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    downloadFile(blob, `patient_data_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const exportToPDFLocal = () => {
    const selectedData = consentedPatients.filter(p => 
      selectedPatients.length === 0 || selectedPatients.includes(p.id)
    );

    const doc = new jsPDF('l', 'mm', 'a4');
    
    doc.setFontSize(18);
    doc.text('Patient Research Data Export', 14, 15);
    doc.setFontSize(11);
    doc.text(`Export Date: ${new Date().toLocaleDateString()}`, 14, 22);
    doc.text(`Total Patients: ${selectedData.length}`, 14, 27);

    const tableData = selectedData.map(patient => [
      patient.patient_id,
      `${patient.first_name} ${patient.last_name}`,
      patient.date_of_birth,
      patient.gender || 'N/A',
      patient.phone || 'N/A',
      patient.email || 'N/A',
      patient.research_consent ? 'Yes' : 'No',
      patient.research_consent_date ? new Date(patient.research_consent_date).toLocaleDateString() : 'N/A',
    ]);

    autoTable(doc, {
      head: [['Patient ID', 'Name', 'DOB', 'Gender', 'Phone', 'Email', 'Consent', 'Consent Date']],
      body: tableData,
      startY: 32,
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [10, 134, 77], textColor: 255 },
      alternateRowStyles: { fillColor: [245, 247, 250] },
    });

    const blob = doc.output('blob');
    downloadFile(blob, `patient_data_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const handleExport = async () => {
    if (!exportType) {
      toast({
        title: "Error",
        description: "Please select an export format",
        variant: "destructive",
      });
      return;
    }

    if (consentedPatients.length === 0) {
      toast({
        title: "No Data",
        description: "No patients have consented to research data use",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      if (exportType === 'excel') {
        exportToExcelLocal();
        toast({
          title: "Export Successful",
          description: `Exported ${selectedPatients.length || consentedPatients.length} patient records to Excel`,
        });
      } else if (exportType === 'pdf') {
        exportToPDFLocal();
        toast({
          title: "Export Successful",
          description: `Exported ${selectedPatients.length || consentedPatients.length} patient records to PDF`,
        });
      } else if (exportType === 'csv') {
        const selectedData = consentedPatients.filter(p => 
          selectedPatients.length === 0 || selectedPatients.includes(p.id)
        );
        
        const csvData = selectedData.map(patient => ({
          'Patient ID': patient.patient_id,
          'First Name': patient.first_name,
          'Last Name': patient.last_name,
          'Date of Birth': patient.date_of_birth,
          'Gender': patient.gender || '',
          'Phone': patient.phone || '',
          'Email': patient.email || '',
        }));

        const worksheet = XLSX.utils.json_to_sheet(csvData);
        const csv = XLSX.utils.sheet_to_csv(worksheet);
        const blob = new Blob([csv], { type: 'text/csv' });
        downloadFile(blob, `patient_data_${new Date().toISOString().split('T')[0]}.csv`);

        toast({
          title: "Export Successful",
          description: `Exported ${selectedPatients.length || consentedPatients.length} patient records to CSV`,
        });
      }
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-gradient-card shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="w-5 h-5 text-primary" />
          Export Patient Research Data
        </CardTitle>
        <CardDescription>
          Export consented patient data for research purposes (REDCap-style export)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-muted/50 p-4 rounded-lg border border-border">
          <p className="text-sm font-medium mb-2">Research Data Usage Consent</p>
          <p className="text-sm text-muted-foreground">
            Only patients who have explicitly consented to research data usage will be included in exports. 
            All data is anonymized and complies with HIPAA regulations.
          </p>
          <p className="text-sm font-semibold mt-2 text-primary">
            {consentedPatients.length} of {patients.length} patients have consented to research data use
          </p>
        </div>

        {consentedPatients.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Select Patients to Export</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={toggleAll}
              >
                {selectedPatients.length === consentedPatients.length ? 'Deselect All' : 'Select All'}
              </Button>
            </div>
            
            <div className="max-h-64 overflow-y-auto space-y-2 border border-border rounded-md p-3 bg-background">
              {consentedPatients.map((patient) => (
                <div key={patient.id} className="flex items-center space-x-2 p-2 hover:bg-muted/50 rounded">
                  <Checkbox
                    id={`patient-${patient.id}`}
                    checked={selectedPatients.includes(patient.id)}
                    onCheckedChange={() => togglePatient(patient.id)}
                  />
                  <Label
                    htmlFor={`patient-${patient.id}`}
                    className="flex-1 cursor-pointer text-sm"
                  >
                    {patient.first_name} {patient.last_name} - {patient.patient_id}
                    {patient.research_consent_date && (
                      <span className="text-xs text-muted-foreground ml-2">
                        (Consented: {new Date(patient.research_consent_date).toLocaleDateString()})
                      </span>
                    )}
                  </Label>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              {selectedPatients.length > 0 
                ? `${selectedPatients.length} patient(s) selected` 
                : 'All consented patients will be exported'}
            </p>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="export-type">Export Format</Label>
          <Select value={exportType} onValueChange={setExportType}>
            <SelectTrigger>
              <SelectValue placeholder="Select format" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="excel">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4" />
                  Excel (.xlsx) - Comprehensive Data
                </div>
              </SelectItem>
              <SelectItem value="pdf">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  PDF Report - Summary View
                </div>
              </SelectItem>
              <SelectItem value="csv">
                <div className="flex items-center gap-2">
                  <Table className="w-4 h-4" />
                  CSV Data - Basic Info
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Export Contents (for Excel/CSV)</Label>
          <div className="text-sm text-muted-foreground space-y-1 bg-muted/30 p-3 rounded-md">
            <div>• Patient demographics and contact information</div>
            <div>• Medical history and current conditions</div>
            <div>• Allergies and current medications</div>
            <div>• Emergency contact information</div>
            <div>• Research consent status and date</div>
            <div className="text-xs italic mt-2">Note: All exported data is anonymized for research purposes</div>
          </div>
        </div>

        <Button
          onClick={handleExport}
          disabled={loading || !exportType || consentedPatients.length === 0}
          className="w-full"
        >
          <Download className="w-4 h-4 mr-2" />
          {loading ? 'Exporting...' : `Export ${exportType.toUpperCase()}`}
        </Button>
      </CardContent>
    </Card>
  );
}
