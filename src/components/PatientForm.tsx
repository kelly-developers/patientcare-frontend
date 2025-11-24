import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PatientFormProps {
  onSubmit: (data: any) => void;
  isLoading?: boolean;
}

export default function PatientForm({ onSubmit, isLoading = false }: PatientFormProps) {
  const [formData, setFormData] = useState({
    patient_id: "",
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

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedDate, setSelectedDate] = useState<Date>();
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ""
      }));
    }
  };

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    
    if (date) {
      const formattedDate = format(date, "yyyy-MM-dd");
      setFormData(prev => ({
        ...prev,
        date_of_birth: formattedDate
      }));

      // Validate date is not in future
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (date > today) {
        setErrors(prev => ({
          ...prev,
          date_of_birth: "Date of birth cannot be in the future"
        }));
      } else {
        setErrors(prev => ({
          ...prev,
          date_of_birth: ""
        }));
      }
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Required field validation
    if (!formData.first_name.trim()) {
      newErrors.first_name = "First name is required";
    }
    if (!formData.last_name.trim()) {
      newErrors.last_name = "Last name is required";
    }
    if (!formData.date_of_birth) {
      newErrors.date_of_birth = "Date of birth is required";
    } else {
      // Validate date is not in future
      const dob = new Date(formData.date_of_birth);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (dob > today) {
        newErrors.date_of_birth = "Date of birth cannot be in the future";
      }

      // Validate age is reasonable (1-120 years)
      const ageInMs = today.getTime() - dob.getTime();
      const ageInYears = ageInMs / (1000 * 60 * 60 * 24 * 365.25);
      
      if (ageInYears > 120) {
        newErrors.date_of_birth = "Patient age appears to be over 120 years";
      }
      if (ageInYears < 0) {
        newErrors.date_of_birth = "Date of birth cannot be in the future";
      }
    }
    if (!formData.gender) {
      newErrors.gender = "Gender is required";
    }

    // Email validation
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Phone validation (basic)
    if (formData.phone && !/^[\+]?[1-9][\d]{0,15}$/.test(formData.phone.replace(/[\s\-\(\)]/g, ''))) {
      newErrors.phone = "Please enter a valid phone number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form before submitting",
        variant: "destructive",
      });
      return;
    }

    // Ensure date is properly formatted
    const submitData = {
      ...formData,
      date_of_birth: formData.date_of_birth // Already in YYYY-MM-DD format from date picker
    };

    console.log('📝 Form submission data:', submitData);
    onSubmit(submitData);
  };

  const today = new Date();
  const maxDate = new Date();
  maxDate.setFullYear(today.getFullYear() - 1); // Minimum 1 year old
  const minDate = new Date();
  minDate.setFullYear(today.getFullYear() - 120); // Maximum 120 years old

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Patient ID */}
        <div className="space-y-2">
          <Label htmlFor="patient_id">Patient ID *</Label>
          <Input
            id="patient_id"
            placeholder="P-2024-001"
            value={formData.patient_id}
            onChange={(e) => handleInputChange("patient_id", e.target.value)}
            disabled={isLoading}
          />
          <p className="text-sm text-muted-foreground">
            Auto-generated if left empty
          </p>
        </div>

        {/* First Name */}
        <div className="space-y-2">
          <Label htmlFor="first_name">First Name *</Label>
          <Input
            id="first_name"
            placeholder="John"
            value={formData.first_name}
            onChange={(e) => handleInputChange("first_name", e.target.value)}
            disabled={isLoading}
            className={errors.first_name ? "border-red-500" : ""}
          />
          {errors.first_name && (
            <p className="text-sm text-red-500 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errors.first_name}
            </p>
          )}
        </div>

        {/* Last Name */}
        <div className="space-y-2">
          <Label htmlFor="last_name">Last Name *</Label>
          <Input
            id="last_name"
            placeholder="Doe"
            value={formData.last_name}
            onChange={(e) => handleInputChange("last_name", e.target.value)}
            disabled={isLoading}
            className={errors.last_name ? "border-red-500" : ""}
          />
          {errors.last_name && (
            <p className="text-sm text-red-500 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errors.last_name}
            </p>
          )}
        </div>

        {/* Date of Birth */}
        <div className="space-y-2">
          <Label htmlFor="date_of_birth">Date of Birth *</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={`w-full justify-start text-left font-normal ${
                  errors.date_of_birth ? "border-red-500" : ""
                }`}
                disabled={isLoading}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? (
                  format(selectedDate, "PPP")
                ) : (
                  <span>Select date of birth</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                disabled={(date) => date > today || date < minDate}
                initialFocus
                captionLayout="dropdown-buttons"
                fromYear={1900}
                toYear={today.getFullYear()}
              />
            </PopoverContent>
          </Popover>
          {errors.date_of_birth && (
            <p className="text-sm text-red-500 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errors.date_of_birth}
            </p>
          )}
          <p className="text-sm text-muted-foreground">
            Patient must be at least 1 year old
          </p>
        </div>

        {/* Gender */}
        <div className="space-y-2">
          <Label htmlFor="gender">Gender *</Label>
          <Select
            value={formData.gender}
            onValueChange={(value) => handleInputChange("gender", value)}
            disabled={isLoading}
          >
            <SelectTrigger className={errors.gender ? "border-red-500" : ""}>
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="MALE">Male</SelectItem>
              <SelectItem value="FEMALE">Female</SelectItem>
              <SelectItem value="OTHER">Other</SelectItem>
            </SelectContent>
          </Select>
          {errors.gender && (
            <p className="text-sm text-red-500 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errors.gender}
            </p>
          )}
        </div>

        {/* Phone */}
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            placeholder="+1 (555) 123-4567"
            value={formData.phone}
            onChange={(e) => handleInputChange("phone", e.target.value)}
            disabled={isLoading}
            className={errors.phone ? "border-red-500" : ""}
          />
          {errors.phone && (
            <p className="text-sm text-red-500 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errors.phone}
            </p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="patient@example.com"
            value={formData.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
            disabled={isLoading}
            className={errors.email ? "border-red-500" : ""}
          />
          {errors.email && (
            <p className="text-sm text-red-500 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errors.email}
            </p>
          )}
        </div>
      </div>

      {/* Address */}
      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <Input
          id="address"
          placeholder="Full address..."
          value={formData.address}
          onChange={(e) => handleInputChange("address", e.target.value)}
          disabled={isLoading}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Emergency Contact Name */}
        <div className="space-y-2">
          <Label htmlFor="emergency_contact_name">Emergency Contact Name</Label>
          <Input
            id="emergency_contact_name"
            placeholder="Emergency contact full name"
            value={formData.emergency_contact_name}
            onChange={(e) => handleInputChange("emergency_contact_name", e.target.value)}
            disabled={isLoading}
          />
        </div>

        {/* Emergency Contact Phone */}
        <div className="space-y-2">
          <Label htmlFor="emergency_contact_phone">Emergency Contact Phone</Label>
          <Input
            id="emergency_contact_phone"
            placeholder="+1 (555) 123-4567"
            value={formData.emergency_contact_phone}
            onChange={(e) => handleInputChange("emergency_contact_phone", e.target.value)}
            disabled={isLoading}
          />
        </div>
      </div>

      {/* Medical History */}
      <div className="space-y-2">
        <Label htmlFor="medical_history">Medical History</Label>
        <Textarea
          id="medical_history"
          placeholder="Previous surgeries, conditions, family history, etc..."
          value={formData.medical_history}
          onChange={(e) => handleInputChange("medical_history", e.target.value)}
          disabled={isLoading}
          rows={3}
        />
      </div>

      {/* Allergies */}
      <div className="space-y-2">
        <Label htmlFor="allergies">Allergies</Label>
        <Textarea
          id="allergies"
          placeholder="Drug allergies, food allergies, environmental allergies, etc..."
          value={formData.allergies}
          onChange={(e) => handleInputChange("allergies", e.target.value)}
          disabled={isLoading}
          rows={2}
        />
      </div>

      {/* Current Medications */}
      <div className="space-y-2">
        <Label htmlFor="current_medications">Current Medications</Label>
        <Textarea
          id="current_medications"
          placeholder="Current medications, dosages, frequency..."
          value={formData.current_medications}
          onChange={(e) => handleInputChange("current_medications", e.target.value)}
          disabled={isLoading}
          rows={2}
        />
      </div>

      {/* Submit Button */}
      <div className="flex justify-end pt-4">
        <Button 
          type="submit" 
          disabled={isLoading}
          className="min-w-32"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin mr-2" />
              Registering...
            </>
          ) : (
            'Register Patient'
          )}
        </Button>
      </div>
    </form>
  );
}