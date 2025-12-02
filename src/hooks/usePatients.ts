// hooks/usePatients.ts
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { patientsService, Patient, CreatePatientRequest } from '@/services/patientsService';

export type { Patient };

export const usePatients = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await patientsService.getAll();
      setPatients(response);
    } catch (error: any) {
      console.error('Error loading patients:', error);
      setError(error.message);
      
      if (error.response?.status === 401) {
        toast({
          title: "Session expired",
          description: "Please log in again",
          variant: "destructive"
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Updated to handle both FormData and regular object
  const addPatient = async (patientData: CreatePatientRequest | FormData) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('📝 Creating patient:', patientData);
      
      // Handle FormData - extract to object
      let processedData: CreatePatientRequest;
      
      if (patientData instanceof FormData) {
        // Extract data from FormData
        processedData = {
          firstName: patientData.get('firstName') as string || '',
          lastName: patientData.get('lastName') as string || '',
          dateOfBirth: patientData.get('dateOfBirth') as string,
          gender: patientData.get('gender') as string,
          phone: patientData.get('phone') as string || '',
          email: patientData.get('email') as string || '',
          address: patientData.get('address') as string || '',
          emergencyContactName: patientData.get('emergencyContactName') as string || '',
          emergencyContactPhone: patientData.get('emergencyContactPhone') as string || '',
          medicalHistory: patientData.get('medicalHistory') as string || '',
          allergies: patientData.get('allergies') as string || '',
          currentMedications: patientData.get('currentMedications') as string || '',
          consentAccepted: patientData.get('consentAccepted') === 'true',
          consentFormPath: patientData.get('consentFormPath') as string || '',
          researchConsent: patientData.get('researchConsent') === 'true',
          sampleStorageConsent: false, // Default value
        };
        
        console.log('📝 Extracted data from FormData:', processedData);
      } else {
        processedData = patientData;
      }
      
      // Enhanced validation
      if (!processedData.firstName || !processedData.lastName || !processedData.dateOfBirth || !processedData.gender) {
        throw new Error('Missing required fields: firstName, lastName, dateOfBirth, gender');
      }

      if (!processedData.consentAccepted) {
        throw new Error('Consent must be accepted to register patient');
      }

      // Validate date
      const dob = new Date(processedData.dateOfBirth);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (dob > today) {
        throw new Error('Date of birth cannot be in the future');
      }

      const newPatient = await patientsService.create(processedData);
      
      setPatients(prev => [newPatient, ...prev]);
      
      toast({
        title: "Patient registered successfully",
        description: `Patient ID: ${newPatient.patientId} has been created`,
      });
      
      return newPatient;
    } catch (error: any) {
      console.error('❌ Error creating patient:', error);
      setError(error.message);
      
      let errorMessage = "Failed to create patient";
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Failed to create patient",
        description: errorMessage,
        variant: "destructive"
      });
      
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const uploadConsentForm = async (patientId: string, file: File) => {
    try {
      setLoading(true);
      setError(null);
      
      const updatedPatient = await patientsService.uploadConsentForm(patientId, file);
      
      // Update patient in local state
      setPatients(prev => prev.map(patient => 
        patient.id === patientId ? updatedPatient : patient
      ));
      
      toast({
        title: "Consent form uploaded",
        description: "Consent form has been successfully uploaded",
      });
      
      return updatedPatient;
    } catch (error: any) {
      console.error('Error uploading consent form:', error);
      setError(error.message);
      
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload consent form",
        variant: "destructive"
      });
      
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const searchPatients = async (query: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const results = await patientsService.search(query);
      setPatients(results);
    } catch (error: any) {
      console.error('Error searching patients:', error);
      setError(error.message);
      
      if (error.response?.status === 401) {
        toast({
          title: "Session expired",
          description: "Please log in again",
          variant: "destructive"
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    patients,
    loading,
    error,
    addPatient,
    uploadConsentForm,
    searchPatients,
    refreshPatients: loadPatients
  };
};