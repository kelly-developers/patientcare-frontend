import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { proceduresService, Surgery, CreateSurgeryRequest } from '@/services/proceduresService';

export type { Surgery as SurgicalProcedure };

export function useProcedures() {
  const [procedures, setProcedures] = useState<Surgery[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchProcedures = async () => {
    try {
      setLoading(true);
      const data = await proceduresService.getAll();
      setProcedures(data);
    } catch (error) {
      console.error('Error fetching procedures:', error);
      toast({
        title: "Error",
        description: "Failed to fetch procedures",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addProcedure = async (procedureData: CreateSurgeryRequest) => {
    try {
      const newProcedure = await proceduresService.create(procedureData);
      setProcedures(prev => [newProcedure, ...prev]);
      
      toast({
        title: "Success",
        description: "Procedure added successfully",
      });
      return newProcedure;
    } catch (error) {
      console.error('Error adding procedure:', error);
      toast({
        title: "Error",
        description: "Failed to add procedure",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateProcedure = async (id: string, procedureData: Partial<Surgery>) => {
    try {
      const updatedProcedure = await proceduresService.update(id, procedureData);
      setProcedures(prev => prev.map(p => p.id === id ? updatedProcedure : p));
      
      toast({
        title: "Success",
        description: "Procedure updated successfully",
      });
      return updatedProcedure;
    } catch (error) {
      console.error('Error updating procedure:', error);
      toast({
        title: "Error",
        description: "Failed to update procedure",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteProcedure = async (id: string) => {
    try {
      await proceduresService.delete(id);
      setProcedures(prev => prev.filter(p => p.id !== id));
      
      toast({
        title: "Success",
        description: "Procedure deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting procedure:', error);
      toast({
        title: "Error",
        description: "Failed to delete procedure",
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchProcedures();
  }, []);

  return {
    procedures,
    loading,
    addProcedure,
    updateProcedure,
    deleteProcedure,
    refreshProcedures: fetchProcedures,
  };
}
