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
import { 
  appointmentsService, 
  Appointment, 
  CreateAppointmentRequest,
  Doctor 
} from "@/services/appointmentsService";
import { usePatients } from "@/hooks/usePatients";

export default function AppointmentBooking() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const { patients, loading: patientsLoading } = usePatients();
  const [loading, setLoading] = useState(false);
  const [doctorsLoading, setDoctorsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<{
    patientId: string;
    doctorId: string;
    date: string;
    time: string;
    type: string;
    priority: string;
    reason: string;
    notes: string;
  }>({
    patientId: "",
    doctorId: "",
    date: "",
    time: "",
    type: "",
    priority: "MEDIUM",
    reason: "",
    notes: ""
  });
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([loadAppointments(), loadDoctors()]);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "Failed to load data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadAppointments = async () => {
    try {
      const data = await appointmentsService.getAll();
      setAppointments(data);
    } catch (error) {
      console.error('Error loading appointments:', error);
      throw error;
    }
  };

  const loadDoctors = async () => {
    try {
      setDoctorsLoading(true);
      const data = await appointmentsService.getDoctors();
      setDoctors(data);
    } catch (error) {
      console.error('Error loading doctors:', error);
      throw error;
    } finally {
      setDoctorsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.patientId) {
      toast({
        title: "Error",
        description: "Please select a patient",
        variant: "destructive",
      });
      return;
    }

    if (!formData.doctorId) {
      toast({
        title: "Error",
        description: "Please select a doctor",
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

    if (!formData.type) {
      toast({
        title: "Error",
        description: "Please select appointment type",
        variant: "destructive",
      });
      return;
    }

    if (!formData.reason.trim()) {
      toast({
        title: "Error",
        description: "Please enter reason for appointment",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    try {
      // Convert string IDs to numbers
      const appointmentData: CreateAppointmentRequest = {
        patientId: parseInt(formData.patientId),
        doctorId: parseInt(formData.doctorId),
        appointmentDate: formData.date,
        appointmentTime: formData.time,
        type: formData.type as 'CONSULTATION' | 'FOLLOW_UP' | 'EMERGENCY' | 'SURGERY',
        reason: formData.reason,
        notes: formData.notes.trim(),
        priority: formData.priority as 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
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
        priority: "MEDIUM",
        reason: "",
        notes: ""
      });

      toast({
        title: "Success",
        description: "Appointment scheduled successfully",
      });
    } catch (error: any) {
      console.error('Error creating appointment:', error);
      const errorMessage = error.response?.data?.message || "Failed to schedule appointment";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const updateAppointmentStatus = async (appointmentId: number, newStatus: string) => {
    try {
      const updated = await appointmentsService.updateStatus(appointmentId, newStatus);
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
      case 'SCHEDULED': return 'bg-blue-500 text-white';
      case 'CONFIRMED': return 'bg-green-500 text-white';
      case 'COMPLETED': return 'bg-gray-500 text-white';
      case 'CANCELLED': return 'bg-red-500 text-white';
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

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes} ${ampm}`;
  };

  const getDoctorName = (doctorId: number) => {
    const doctor = doctors.find(d => d.id === doctorId);
    return doctor ? `${doctor.firstName} ${doctor.lastName}` : 'Unknown Doctor';
  };

  const getAppointmentTypeLabel = (type: string) => {
    switch (type) {
      case 'CONSULTATION': return 'Consultation';
      case 'FOLLOW_UP': return 'Follow-up';
      case 'EMERGENCY': return 'Emergency';
      case 'SURGERY': return 'Surgery';
      default: return type;
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'LOW': return 'Low';
      case 'MEDIUM': return 'Medium';
      case 'HIGH': return 'High';
      case 'URGENT': return 'Urgent';
      default: return priority;
    }
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
                <Label htmlFor="patient">Select Patient *</Label>
                <Select 
                  value={formData.patientId} 
                  onValueChange={(value) => setFormData({...formData, patientId: value})}
                  disabled={patientsLoading}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder={patientsLoading ? "Loading patients..." : "Select patient..."} />
                  </SelectTrigger>
                  <SelectContent>
                    {patients.map((patient) => (
                      <SelectItem key={patient.id} value={patient.id.toString()}>
                        {patient.firstName} {patient.lastName} - {patient.patientId}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="doctor">Select Doctor *</Label>
                <Select 
                  value={formData.doctorId} 
                  onValueChange={(value) => setFormData({...formData, doctorId: value})}
                  disabled={doctorsLoading}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder={doctorsLoading ? "Loading doctors..." : "Select doctor..."} />
                  </SelectTrigger>
                  <SelectContent>
                    {doctors
                      .filter(doctor => doctor.available)
                      .map((doctor) => (
                        <SelectItem key={doctor.id} value={doctor.id.toString()}>
                          Dr. {doctor.firstName} {doctor.lastName} {doctor.specialty ? `- ${doctor.specialty}` : ''}
                        </SelectItem>
                      ))
                    }
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date *</Label>
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
                  <Label htmlFor="time">Time *</Label>
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
                <Label htmlFor="type">Appointment Type *</Label>
                <Select 
                  value={formData.type} 
                  onValueChange={(value) => setFormData({...formData, type: value})}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CONSULTATION">Consultation</SelectItem>
                    <SelectItem value="FOLLOW_UP">Follow-up</SelectItem>
                    <SelectItem value="EMERGENCY">Emergency</SelectItem>
                    <SelectItem value="SURGERY">Surgery</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select 
                  value={formData.priority} 
                  onValueChange={(value) => setFormData({...formData, priority: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW">Low</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="HIGH">High</SelectItem>
                    <SelectItem value="URGENT">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason">Reason for Visit *</Label>
                <Textarea
                  id="reason"
                  placeholder="Brief description of the reason for appointment..."
                  value={formData.reason}
                  onChange={(e) => setFormData({...formData, reason: e.target.value})}
                  required
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Any additional information..."
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  rows={2}
                />
              </div>

              <Button 
                type="submit" 
                className="w-full bg-gradient-medical text-white"
                disabled={submitting || patientsLoading || doctorsLoading}
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
                      <div className="font-medium">
                        {appointment.patient.firstName} {appointment.patient.lastName}
                      </div>
                      <Badge className={getStatusBadgeColor(appointment.status)}>
                        {appointment.status}
                      </Badge>
                    </div>
                    
                    <div className="text-sm text-muted-foreground space-y-1">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3 h-3" />
                        {formatDate(appointment.appointmentDate)} at {formatTime(appointment.appointmentTime)}
                      </div>
                      <div className="flex items-center gap-2">
                        <Stethoscope className="w-3 h-3" />
                        {getAppointmentTypeLabel(appointment.type)}
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="w-3 h-3" />
                        {appointment.doctor ? 
                          `Dr. ${appointment.doctor.firstName} ${appointment.doctor.lastName}` : 
                          'Doctor not assigned'
                        }
                      </div>
                      {appointment.priority && (
                        <div className="flex items-center gap-2">
                          <AlertCircle className="w-3 h-3" />
                          Priority: {getPriorityLabel(appointment.priority)}
                        </div>
                      )}
                      <div className="mt-2 text-xs">
                        <span className="font-medium">Reason:</span> {appointment.reason}
                      </div>
                      {appointment.notes && (
                        <div className="text-xs">
                          <span className="font-medium">Notes:</span> {appointment.notes}
                        </div>
                      )}
                    </div>
                    
                    {appointment.status === 'SCHEDULED' && (
                      <div className="flex gap-2 mt-3">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => updateAppointmentStatus(appointment.id, 'CONFIRMED')}
                        >
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Confirm
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => updateAppointmentStatus(appointment.id, 'CANCELLED')}
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