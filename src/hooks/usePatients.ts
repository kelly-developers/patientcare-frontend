import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { patientsService, Patient, CreatePatientRequest } from '@/services/patientsService';

export type { Patient };

export function usePatients() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const data = await patientsService.getAll();
      setPatients(data);
    } catch (error) {
      console.error('Error fetching patients:', error);
      toast({
        title: "Error",
        description: "Failed to fetch patients",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addPatient = async (patientData: CreatePatientRequest) => {
    try {
      const newPatient = await patientsService.create(patientData);
      setPatients(prev => [newPatient, ...prev]);
      
      toast({
        title: "Success",
        description: "Patient added successfully",
      });
      return newPatient;
    } catch (error) {
      console.error('Error adding patient:', error);
      toast({
        title: "Error",
        description: "Failed to add patient",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updatePatient = async (id: string, patientData: Partial<Patient>) => {
    try {
      const updatedPatient = await patientsService.update(id, patientData);
      setPatients(prev => prev.map(p => p.id === id ? updatedPatient : p));
      
      toast({
        title: "Success",
        description: "Patient updated successfully",
      });
      return updatedPatient;
    } catch (error) {
      console.error('Error updating patient:', error);
      toast({
        title: "Error",
        description: "Failed to update patient",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deletePatient = async (id: string) => {
    try {
      await patientsService.delete(id);
      setPatients(prev => prev.filter(p => p.id !== id));
      
      toast({
        title: "Success",
        description: "Patient deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting patient:', error);
      toast({
        title: "Error",
        description: "Failed to delete patient",
        variant: "destructive",
      });
      throw error;
    }
  };

  const searchPatients = async (query: string) => {
    try {
      setLoading(true);
      const data = await patientsService.search(query);
      setPatients(data);
    } catch (error) {
      console.error('Error searching patients:', error);
      toast({
        title: "Error",
        description: "Failed to search patients",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  return {
    patients,
    loading,
    addPatient,
    updatePatient,
    deletePatient,
    searchPatients,
    refreshPatients: fetchPatients,
  };
}