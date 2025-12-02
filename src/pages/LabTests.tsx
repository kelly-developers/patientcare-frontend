import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Activity, Plus, FileText, Clock, CheckCircle, Download, Eye, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { usePatients } from "@/hooks/usePatients";
import { apiClient, API_ENDPOINTS } from "@/config/api";

interface LabTest {
  id: string;
  patient_id: string;
  test_type: string;
  test_name: string;
  ordered_by: string;
  ordered_date: string;
  status: 'ordered' | 'in-progress' | 'completed' | 'cancelled';
  priority: 'routine' | 'urgent' | 'stat';
  results?: string;
  notes?: string;
  clinical_notes?: string;
  report_date?: string;
  completed_date?: string;
  created_at: string;
}

export default function LabTests() {
  const [labTests, setLabTests] = useState<LabTest[]>([]);
  const { patients, loading: patientsLoading } = usePatients();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState("");
  const [testType, setTestType] = useState("");
  const [testName, setTestName] = useState("");
  const [priority, setPriority] = useState("routine");
  const [notes, setNotes] = useState("");
  const [clinicalNotes, setClinicalNotes] = useState("");
  const [selectedTest, setSelectedTest] = useState<LabTest | null>(null);
  const [testResults, setTestResults] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    loadLabTests();
  }, []);

  const loadLabTests = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(API_ENDPOINTS.LAB_TESTS.BASE);
      setLabTests(response.data || []);
    } catch (error) {
      console.error('Error loading lab tests:', error);
      toast({
        title: "Error",
        description: "Failed to load lab tests",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOrderTest = async () => {
    if (!selectedPatient || !testType || !testName) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    try {
      const testData = {
        patient_id: selectedPatient,
        test_type: testType,
        test_name: testName,
        priority: priority as 'routine' | 'urgent' | 'stat',
        notes: notes,
        clinical_notes: clinicalNotes
      };

      const response = await apiClient.post(API_ENDPOINTS.LAB_TESTS.BASE, testData);
      const newTest = response.data;

      setLabTests(prev => [newTest, ...prev]);

      toast({
        title: "Test Ordered",
        description: "Lab test has been ordered successfully",
      });

      // Reset form
      setSelectedPatient("");
      setTestType("");
      setTestName("");
      setPriority("routine");
      setNotes("");
      setClinicalNotes("");
    } catch (error) {
      console.error('Error ordering test:', error);
      toast({
        title: "Error",
        description: "Failed to order lab test",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const updateTestStatus = async (id: string, status: LabTest['status'], results?: string) => {
    try {
      const updateData: any = { status };
      if (status === 'completed' && results) {
        updateData.results = results;
        updateData.completed_date = new Date().toISOString();
        updateData.report_date = new Date().toISOString();
      }

      const response = await apiClient.put(API_ENDPOINTS.LAB_TESTS.BY_ID(id), updateData);
      const updatedTest = response.data;

      setLabTests(prev => prev.map(test => test.id === id ? updatedTest : test));
      
      toast({
        title: "Status Updated",
        description: `Test status updated to ${status}`,
      });

      if (status === 'completed') {
        setSelectedTest(null);
        setTestResults("");
      }
    } catch (error) {
      console.error('Error updating test status:', error);
      toast({
        title: "Error",
        description: "Failed to update test status",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'in-progress': return 'bg-blue-500';
      case 'ordered': return 'bg-yellow-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getPatientName = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId);
    return patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown Patient';
  };

  const getTestTypeDisplay = (type: string) => {
    const typeMap: { [key: string]: string } = {
      'blood': 'Blood Test',
      'ct-scan': 'CT Scan',
      'mri': 'MRI',
      'xray': 'X-Ray',
      'ecg': 'ECG/EKG',
      'echo': 'Echocardiogram',
      'stress-test': 'Stress Test',
      'other': 'Other'
    };
    return typeMap[type] || type;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-foreground">Laboratory Tests</h1>
        <p className="text-muted-foreground">
          Order and manage lab tests, CT scans, and diagnostic procedures
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order New Test */}
        <Card className="bg-gradient-card shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-primary" />
              Order New Test
            </CardTitle>
            <CardDescription>Request laboratory tests and diagnostic procedures</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="patient">Patient *</Label>
              <Select value={selectedPatient} onValueChange={setSelectedPatient} disabled={patientsLoading}>
                <SelectTrigger>
                  <SelectValue placeholder={patientsLoading ? "Loading..." : "Select patient"} />
                </SelectTrigger>
                <SelectContent>
                  {patients.map((patient) => (
                    <SelectItem key={patient.id} value={patient.id}>
                      {patient.firstName} {patient.lastName} - {patient.patientId}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="test-type">Test Type *</Label>
              <Select value={testType} onValueChange={setTestType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select test type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="blood">Blood Test</SelectItem>
                  <SelectItem value="ct-scan">CT Scan</SelectItem>
                  <SelectItem value="mri">MRI</SelectItem>
                  <SelectItem value="xray">X-Ray</SelectItem>
                  <SelectItem value="ecg">ECG/EKG</SelectItem>
                  <SelectItem value="echo">Echocardiogram</SelectItem>
                  <SelectItem value="stress-test">Stress Test</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="test-name">Specific Test *</Label>
              <Input
                id="test-name"
                value={testName}
                onChange={(e) => setTestName(e.target.value)}
                placeholder="e.g., Complete Blood Count, Cardiac MRI"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="routine">Routine</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="stat">STAT (Immediate)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="clinical-notes">Clinical Notes</Label>
              <Textarea
                id="clinical-notes"
                value={clinicalNotes}
                onChange={(e) => setClinicalNotes(e.target.value)}
                placeholder="Doctor's notes, suspected conditions..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Special instructions..."
                rows={2}
              />
            </div>

            <Button onClick={handleOrderTest} className="w-full" disabled={submitting || patientsLoading}>
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Ordering...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Order Test
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Test Orders and Results */}
        <Card className="lg:col-span-2 bg-gradient-card shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Test Orders & Results
            </CardTitle>
            <CardDescription>All laboratory test orders and results</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : labTests.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No lab tests ordered yet</p>
                </div>
              ) : (
                labTests.map((test) => (
                  <div key={test.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-foreground">{test.test_name}</h3>
                          <Badge variant="outline">{getTestTypeDisplay(test.test_type)}</Badge>
                          {test.priority === 'stat' && (
                            <Badge variant="destructive" className="text-xs">STAT</Badge>
                          )}
                          {test.priority === 'urgent' && (
                            <Badge variant="secondary" className="text-xs">Urgent</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Patient: {getPatientName(test.patient_id)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Ordered on {new Date(test.ordered_date).toLocaleDateString()}
                        </p>
                        
                        {test.clinical_notes && (
                          <div className="mt-2 p-2 bg-blue-50 rounded border">
                            <p className="text-xs font-medium text-blue-800">Clinical Notes:</p>
                            <p className="text-xs text-blue-700 mt-1">{test.clinical_notes}</p>
                          </div>
                        )}

                        {test.results && (
                          <div className="mt-2 p-2 bg-green-50 rounded border">
                            <p className="text-xs font-medium text-green-800">Results:</p>
                            <p className="text-xs text-green-700 mt-1 whitespace-pre-wrap">{test.results}</p>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${getStatusColor(test.status)}`} />
                        <Badge>{test.status}</Badge>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 flex-wrap">
                      {test.status === 'ordered' && (
                        <Button size="sm" variant="outline" onClick={() => updateTestStatus(test.id, 'in-progress')}>
                          <Clock className="w-3 h-3 mr-1" />
                          Start Test
                        </Button>
                      )}
                      {test.status === 'in-progress' && (
                        <Button size="sm" variant="outline" onClick={() => setSelectedTest(test)}>
                          <FileText className="w-3 h-3 mr-1" />
                          Enter Results
                        </Button>
                      )}
                      {test.status !== 'cancelled' && test.status !== 'completed' && (
                        <Button size="sm" variant="destructive" onClick={() => updateTestStatus(test.id, 'cancelled')}>
                          Cancel
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Results Modal */}
      {selectedTest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl bg-gradient-card shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Enter Test Results
              </CardTitle>
              <CardDescription>
                {selectedTest.test_name} for {getPatientName(selectedTest.patient_id)}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="results">Test Results</Label>
                <Textarea
                  id="results"
                  value={testResults}
                  onChange={(e) => setTestResults(e.target.value)}
                  placeholder="Enter detailed test results..."
                  rows={8}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => updateTestStatus(selectedTest.id, 'completed', testResults)}
                  disabled={!testResults.trim()}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Complete Test
                </Button>
                <Button variant="outline" onClick={() => setSelectedTest(null)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
