import { useState, useEffect } from 'react';
import { apiClient, API_ENDPOINTS } from '@/config/api';
import { useToast } from '@/hooks/use-toast';
import { patientsService, Patient, CreatePatientRequest } from '@/services/patientsService';

export type { Patient };

export const usePatients = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
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
    } catch (error) {
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

  const addPatient = async (patientData: CreatePatientRequest) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('📝 Creating patient:', patientData);
      
      // Enhanced validation
      if (!patientData.firstName || !patientData.lastName || !patientData.dateOfBirth || !patientData.gender) {
        throw new Error('Missing required fields: firstName, lastName, dateOfBirth, gender');
      }

      if (!patientData.consentAccepted) {
        throw new Error('Consent must be accepted to register patient');
      }

      // Validate date
      const dob = new Date(patientData.dateOfBirth);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (dob > today) {
        throw new Error('Date of birth cannot be in the future');
      }

      const newPatient = await patientsService.create(patientData);
      
      setPatients(prev => [newPatient, ...prev]);
      
      toast({
        title: "Patient registered successfully",
        description: `Patient ID: ${newPatient.patientId} has been created`,
      });
      
      return newPatient;
    } catch (error) {
      console.error('Error creating patient:', error);
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
    } catch (error) {
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
    } catch (error) {
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