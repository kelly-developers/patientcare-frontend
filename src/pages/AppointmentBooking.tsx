import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User, Stethoscope, AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { appointmentsService, Appointment, CreateAppointmentRequest } from "@/services/appointmentsService";
import { usePatients } from "@/hooks/usePatients";

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  available: boolean;
}

const doctors: Doctor[] = [
  { id: "1", name: "Dr. Sarah Johnson", specialty: "Cardiologist", available: true },
  { id: "2", name: "Dr. Michael Chen", specialty: "Cardiac Surgeon", available: true },
  { id: "3", name: "Dr. Emily Davis", specialty: "Interventional Cardiologist", available: true },
  { id: "4", name: "Dr. James Wilson", specialty: "Cardiothoracic Surgeon", available: false },
];

export default function AppointmentBooking() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const { patients, loading: patientsLoading } = usePatients();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    patientId: "",
    doctorId: "",
    date: "",
    time: "",
    type: "",
    priority: "medium",
    reason: "",
    notes: ""
  });
  const { toast } = useToast();

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const data = await appointmentsService.getAll();
      setAppointments(data);
    } catch (error) {
      console.error('Error loading appointments:', error);
      toast({
        title: "Error",
        description: "Failed to load appointments",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const selectedPatient = patients.find(p => p.id === formData.patientId);
    const selectedDoctor = formData.doctorId ? doctors.find(d => d.id === formData.doctorId) : null;
    
    if (!selectedPatient) {
      toast({
        title: "Error",
        description: "Please select a patient",
        variant: "destructive",
      });
      return;
    }

    if (!formData.date || !formData.time) {
      toast({
        title: "Error",
        description: "Please select date and time",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    try {
      const appointmentData: CreateAppointmentRequest = {
        patient_id: formData.patientId,
        doctor_id: formData.doctorId || 'unassigned',
        appointment_date: formData.date,
        appointment_time: formData.time,
        type: formData.type,
        status: 'scheduled',
        notes: `${formData.reason}\n\n${formData.notes}`.trim()
      };

      const newAppointment = await appointmentsService.create(appointmentData);
      setAppointments(prev => [newAppointment, ...prev]);

      // Reset form
      setFormData({
        patientId: "",
        doctorId: "",
        date: "",
        time: "",
        type: "",
        priority: "medium",
        reason: "",
        notes: ""
      });

      toast({
        title: "Success",
        description: "Appointment scheduled successfully",
      });
    } catch (error) {
      console.error('Error creating appointment:', error);
      toast({
        title: "Error",
        description: "Failed to schedule appointment",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const updateAppointmentStatus = async (appointmentId: string, newStatus: string) => {
    try {
      const updated = await appointmentsService.update(appointmentId, { status: newStatus });
      setAppointments(prev => prev.map(app => app.id === appointmentId ? updated : app));

      toast({
        title: "Status Updated",
        description: `Appointment status changed to ${newStatus}`,
      });
    } catch (error) {
      console.error('Error updating appointment status:', error);
      toast({
        title: "Error",
        description: "Failed to update appointment status",
        variant: "destructive",
      });
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-500 text-white';
      case 'confirmed': return 'bg-green-500 text-white';
      case 'completed': return 'bg-gray-500 text-white';
      case 'cancelled': return 'bg-red-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getPatientName = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId);
    return patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown Patient';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-foreground">Appointment Booking</h1>
        <p className="text-muted-foreground">
          Schedule cardiac consultations and medical appointments
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Appointment Booking Form */}
        <Card className="bg-gradient-card shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Book New Appointment
            </CardTitle>
            <CardDescription>
              Schedule patient consultation with cardiologist
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="patient">Select Patient</Label>
                <Select 
                  value={formData.patientId} 
                  onValueChange={(value) => setFormData({...formData, patientId: value})}
                  disabled={patientsLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={patientsLoading ? "Loading patients..." : "Choose patient..."} />
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
                <Label htmlFor="doctor">Select Doctor (Optional)</Label>
                <Select 
                  value={formData.doctorId} 
                  onValueChange={(value) => setFormData({...formData, doctorId: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose doctor (optional)..." />
                  </SelectTrigger>
                  <SelectContent>
                    {doctors.filter(d => d.available).map((doctor) => (
                      <SelectItem key={doctor.id} value={doctor.id}>
                        {doctor.name} - {doctor.specialty}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    required
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time">Time</Label>
                  <Input
                    id="time"
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({...formData, time: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Appointment Type</Label>
                <Select 
                  value={formData.type} 
                  onValueChange={(value) => setFormData({...formData, type: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="consultation">Consultation</SelectItem>
                    <SelectItem value="follow-up">Follow-up</SelectItem>
                    <SelectItem value="emergency">Emergency</SelectItem>
                    <SelectItem value="surgery">Surgery</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason">Reason for Visit</Label>
                <Textarea
                  id="reason"
                  placeholder="Brief description of the reason for appointment..."
                  value={formData.reason}
                  onChange={(e) => setFormData({...formData, reason: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Any additional information..."
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                />
              </div>

              <Button 
                type="submit" 
                className="w-full bg-gradient-medical text-white"
                disabled={submitting || patientsLoading}
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Scheduling...
                  </>
                ) : (
                  'Schedule Appointment'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Appointment List */}
        <Card className="bg-gradient-card shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Scheduled Appointments
            </CardTitle>
            <CardDescription>
              Manage and track patient appointments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {loading ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : appointments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No appointments scheduled</p>
                </div>
              ) : (
                appointments.map((appointment) => (
                  <div key={appointment.id} className="p-4 bg-background rounded-lg border">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium">{getPatientName(appointment.patient_id)}</div>
                      <Badge className={getStatusBadgeColor(appointment.status)}>
                        {appointment.status}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3 h-3" />
                        {formatDate(appointment.appointment_date)} at {appointment.appointment_time}
                      </div>
                      <div className="flex items-center gap-2">
                        <Stethoscope className="w-3 h-3" />
                        {appointment.type}
                      </div>
                      {appointment.notes && (
                        <div className="mt-2 text-xs">
                          <span className="font-medium">Notes:</span> {appointment.notes}
                        </div>
                      )}
                    </div>
                    {appointment.status === 'scheduled' && (
                      <div className="flex gap-2 mt-3">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => updateAppointmentStatus(appointment.id, 'confirmed')}
                        >
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Confirm
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => updateAppointmentStatus(appointment.id, 'cancelled')}
                        >
                          Cancel
                        </Button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
