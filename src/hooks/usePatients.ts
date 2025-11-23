import { useState, useEffect } from 'react';
import { apiClient, API_ENDPOINTS, refreshAuthToken } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

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
      const response = await apiClient.get(API_ENDPOINTS.PATIENTS.BASE);
      setPatients(response.data);
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
      
      const response = await apiClient.post(API_ENDPOINTS.PATIENTS.BASE, patientData);
      
      setPatients(prev => [response.data, ...prev]);
      
      toast({
        title: "Patient created successfully",
        description: "Patient has been added to the system",
      });
      
      return response.data;
    } catch (error) {
      console.error('Error creating patient:', error);
      setError(error.message);
      
      // Handle token expiration specifically
      if (error.response?.status === 401) {
        toast({
          title: "Session expired",
          description: "Please log in again to continue",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Failed to create patient",
          description: error.response?.data?.message || "Please try again",
          variant: "destructive"
        });
      }
      
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const searchPatients = async (query) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiClient.get(API_ENDPOINTS.PATIENTS.SEARCH, {
        params: { q: query }
      });
      
      setPatients(response.data);
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
      
      const response = await apiClient.put(API_ENDPOINTS.PATIENTS.BY_ID(id), patientData);
      
      setPatients(prev => prev.map(patient => 
        patient.id === id ? response.data : patient
      ));
      
      toast({
        title: "Patient updated successfully",
        description: "Patient information has been updated",
      });
      
      return response.data;
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
      
      await apiClient.delete(API_ENDPOINTS.PATIENTS.BY_ID(id));
      
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