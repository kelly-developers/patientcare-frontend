// hooks/usePatients.ts
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { patientsService, Patient, CreatePatientRequest, VitalDataRequest } from '@/services/patientsService';
import { apiClient, API_ENDPOINTS } from '@/config/api';

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

  const addPatient = async (patientData: CreatePatientRequest) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('📝 Creating patient:', patientData);
      
      // Validate required fields
      const requiredFields = ['firstName', 'lastName', 'dateOfBirth', 'gender'];
      const missingFields = requiredFields.filter(field => !patientData[field as keyof CreatePatientRequest]);
      
      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }

      if (!patientData.consentAccepted) {
        throw new Error('Consent must be accepted to register patient');
      }

      const newPatient = await patientsService.create(patientData);
      
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

  const recordVitalData = async (vitalData: VitalDataRequest) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('📝 Recording vital data:', vitalData);
      
      // Validate required fields - FIXED: use lowercase 'p' not uppercase 'P'
      const requiredFields = ['patientId', 'systolicBp', 'diastolicBp', 'heartRate', 'temperature', 'oxygenSaturation'];
      const missingFields = requiredFields.filter(field => {
        const value = vitalData[field as keyof VitalDataRequest];
        return value === undefined || value === null || value === '';
      });
      
      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }

      const response = await patientsService.recordVitalData(vitalData);
      
      toast({
        title: "Vital data recorded successfully",
        description: `Vital data has been recorded for patient ID: ${vitalData.patientId}`,
      });
      
      return response;
    } catch (error: any) {
      console.error('❌ Error recording vital data:', error);
      setError(error.message);
      
      let errorMessage = "Failed to record vital data";
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Failed to record vital data",
        description: errorMessage,
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

  const updatePatient = async (id: string, patientData: Partial<Patient>) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiClient.put(`${API_ENDPOINTS.PATIENTS.BASE}/${id}`, patientData);
      const updatedPatient = response.data;
      
      setPatients(prev => prev.map(patient => 
        patient.id === id ? {
          ...patient,
          ...updatedPatient
        } : patient
      ));
      
      toast({
        title: "Patient updated",
        description: "Patient information has been updated successfully",
      });
      
      return updatedPatient;
    } catch (error: any) {
      console.error('Error updating patient:', error);
      setError(error.message);
      
      toast({
        title: "Update failed",
        description: error.message || "Failed to update patient",
        variant: "destructive"
      });
      
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deletePatient = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      
      await apiClient.delete(`${API_ENDPOINTS.PATIENTS.BASE}/${id}`);
      
      setPatients(prev => prev.filter(patient => patient.id !== id));
      
      toast({
        title: "Patient deleted",
        description: "Patient has been removed from the system",
      });
    } catch (error: any) {
      console.error('Error deleting patient:', error);
      setError(error.message);
      
      toast({
        title: "Delete failed",
        description: error.message || "Failed to delete patient",
        variant: "destructive"
      });
      
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getPatientVitals = async (patientId: number) => {
    try {
      setLoading(true);
      setError(null);
      
      const vitals = await patientsService.getPatientVitals(patientId);
      return vitals;
    } catch (error: any) {
      console.error('Error fetching patient vitals:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getVitalsRecordedByMe = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const vitals = await patientsService.getVitalsRecordedByMe();
      return vitals;
    } catch (error: any) {
      console.error('Error fetching vital data:', error);
      setError(error.message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  return {
    patients,
    loading,
    error,
    addPatient,
    updatePatient,
    deletePatient,
    recordVitalData,
    getPatientVitals,
    getVitalsRecordedByMe,
    searchPatients,
    refreshPatients: loadPatients
  };
};