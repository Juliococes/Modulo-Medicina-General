import React, { useState, useEffect } from 'react';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Patient } from '../types';
import { User, Save } from 'lucide-react';

interface PatientDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (patient: Patient) => void;
  editingPatient?: Patient | null;
}

export function PatientDialog({ isOpen, onOpenChange, onSave, editingPatient }: PatientDialogProps) {
  const [form, setForm] = useState<Partial<Patient>>({
    personal: { fullName: '', idNumber: '', age: 0, phone: '', email: '' },
    responsible: { name: '', relationship: '', phone: '' },
    health: { insurance: '', allergies: '', chronicConditions: '', notes: '' }
  });

  useEffect(() => {
    if (editingPatient) {
      setForm(editingPatient);
    } else {
      setForm({
        personal: { fullName: '', idNumber: '', age: 0, phone: '', email: '' },
        responsible: { name: '', relationship: '', phone: '' },
        health: { insurance: '', allergies: '', chronicConditions: '', notes: '' }
      });
    }
  }, [editingPatient, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const patientData: Patient = {
      id: editingPatient?.id || `P-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
      personal: form.personal as any,
      responsible: form.responsible as any,
      health: form.health as any,
      files: editingPatient?.files || [],
      history: editingPatient?.history || []
    };
    onSave(patientData);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl border-[#e2e8f0] shadow-2xl rounded-[12px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-[#2563eb] flex items-center justify-center text-white">
              <User className="h-6 w-6" />
            </div>
            <div>
              <DialogTitle className="text-[18px] font-bold tracking-tight">
                {editingPatient ? 'Editar Paciente' : 'Nuevo Paciente'}
              </DialogTitle>
              <DialogDescription className="text-[13px] text-[#64748b]">
                Complete la información personal y de salud del paciente.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[12px] font-bold uppercase text-[#64748b]">Nombre Completo</Label>
              <Input 
                required 
                value={form.personal?.fullName} 
                onChange={e => setForm({...form, personal: {...form.personal!, fullName: e.target.value}})}
                className="h-10 rounded-lg border-[#e2e8f0]"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[12px] font-bold uppercase text-[#64748b]">RUT / ID</Label>
              <Input 
                required 
                value={form.personal?.idNumber} 
                onChange={e => setForm({...form, personal: {...form.personal!, idNumber: e.target.value}})}
                className="h-10 rounded-lg border-[#e2e8f0]"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[12px] font-bold uppercase text-[#64748b]">Edad</Label>
              <Input 
                type="number" 
                required 
                value={form.personal?.age} 
                onChange={e => setForm({...form, personal: {...form.personal!, age: parseInt(e.target.value)}})}
                className="h-10 rounded-lg border-[#e2e8f0]"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[12px] font-bold uppercase text-[#64748b]">Teléfono</Label>
              <Input 
                required 
                value={form.personal?.phone} 
                onChange={e => setForm({...form, personal: {...form.personal!, phone: e.target.value}})}
                className="h-10 rounded-lg border-[#e2e8f0]"
              />
            </div>
          </div>

          <Separator className="bg-[#e2e8f0]" />
          
          <div className="space-y-4">
            <h3 className="text-[12px] font-bold uppercase text-[#64748b]">Información de Salud</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[12px] font-bold uppercase text-[#64748b]">Previsión / Seguro</Label>
                <Input 
                  value={form.health?.insurance} 
                  onChange={e => setForm({...form, health: {...form.health!, insurance: e.target.value}})}
                  className="h-10 rounded-lg border-[#e2e8f0]"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[12px] font-bold uppercase text-[#64748b]">Alergias</Label>
                <Input 
                  value={form.health?.allergies} 
                  onChange={e => setForm({...form, health: {...form.health!, allergies: e.target.value}})}
                  className="h-10 rounded-lg border-[#e2e8f0]"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="h-10 rounded-lg border-[#e2e8f0]">
              Cancelar
            </Button>
            <Button type="submit" className="h-10 bg-[#2563eb] hover:bg-blue-700 text-white rounded-lg px-6">
              <Save className="mr-2 h-4 w-4" />
              Guardar Paciente
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
