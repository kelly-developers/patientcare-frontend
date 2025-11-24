import { useState, useEffect } from 'react';
import { apiClient, API_ENDPOINTS } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { patientsService } from '@/services/patientsService';

export const usePatients = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { toast } = useToast();

  // Load patients on component mount
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

  const addPatient = async (patientData) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('📝 Creating patient:', patientData);
      
      // Transform data to match backend expectations
      const transformedData = {
        firstName: patientData.firstName || patientData.first_name,
        lastName: patientData.lastName || patientData.last_name,
        dateOfBirth: patientData.dateOfBirth || patientData.date_of_birth,
        gender: patientData.gender,
        phone: patientData.phone || '',
        email: patientData.email || '',
        address: patientData.address || '',
        emergencyContactName: patientData.emergencyContactName || patientData.emergency_contact_name || '',
        emergencyContactPhone: patientData.emergencyContactPhone || patientData.emergency_contact_phone || '',
        medicalHistory: patientData.medicalHistory || patientData.medical_history || '',
        allergies: patientData.allergies || '',
        currentMedications: patientData.currentMedications || patientData.current_medications || '',
        
        // Consent fields with proper defaults
        researchConsent: patientData.researchConsent || false,
        researchConsentDate: patientData.researchConsentDate || null,
        futureContactConsent: patientData.futureContactConsent || false,
        anonymizedDataConsent: patientData.anonymizedDataConsent || false,
        sampleStorageConsent: patientData.sampleStorageConsent || false,
        sampleTypes: patientData.sampleTypes || '',
        storageDuration: patientData.storageDuration || '',
        futureResearchUseConsent: patientData.futureResearchUseConsent || false,
        destructionConsent: patientData.destructionConsent || false,
      };

      const newPatient = await patientsService.create(transformedData);
      
      setPatients(prev => [newPatient, ...prev]);
      
      toast({
        title: "Patient created successfully",
        description: "Patient has been added to the system",
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

  const searchPatients = async (query) => {
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

  const updatePatient = async (id, patientData) => {
    try {
      setLoading(true);
      setError(null);
      
      const updatedPatient = await patientsService.update(id, patientData);
      
      setPatients(prev => prev.map(patient => 
        patient.id === id ? updatedPatient : patient
      ));
      
      toast({
        title: "Patient updated successfully",
        description: "Patient information has been updated",
      });
      
      return updatedPatient;
    } catch (error) {
      console.error('Error updating patient:', error);
      setError(error.message);
      
      if (error.response?.status === 401) {
        toast({
          title: "Session expired",
          description: "Please log in again",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Failed to update patient",
          description: error.response?.data?.message || "Please try again",
          variant: "destructive"
        });
      }
      
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deletePatient = async (id) => {
    try {
      setLoading(true);
      setError(null);
      
      await patientsService.delete(id);
      
      setPatients(prev => prev.filter(patient => patient.id !== id));
      
      toast({
        title: "Patient deleted successfully",
        description: "Patient has been removed from the system",
      });
    } catch (error) {
      console.error('Error deleting patient:', error);
      setError(error.message);
      
      if (error.response?.status === 401) {
        toast({
          title: "Session expired",
          description: "Please log in again",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Failed to delete patient",
          description: error.response?.data?.message || "Please try again",
          variant: "destructive"
        });
      }
      
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    patients,
    loading,
    error,
    addPatient,
    searchPatients,
    updatePatient,
    deletePatient,
    refreshPatients: loadPatients
  };
};