/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  User, Phone, Mail, Shield, AlertCircle, FileText, 
  PlusCircle, Calendar as CalendarIcon, Activity, Heart, Thermometer, 
  Weight, ClipboardList, Save, ChevronRight, 
  Upload, Clock, UserCheck, Search, Filter, MoreVertical,
  ArrowLeft, CheckCircle2, XCircle, Download, Trash2, Edit, Plus
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { motion, AnimatePresence } from 'motion/react';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

import { Patient, Consultation, VitalSigns, ClinicalEpisode, FollowUp } from './types';
import { PatientDialog } from './components/PatientDialog';
import { exportPatientData } from './lib/exportUtils';

// --- MOCK INITIAL DATA ---
const INITIAL_PATIENTS: Patient[] = [
  {
    id: "P-10023",
    personal: {
      fullName: "Elena Rodriguez",
      idNumber: "12.345.678-K",
      age: 34,
      phone: "+56 9 1234 5678",
      email: "elena.rod@email.com"
    },
    responsible: {
      name: "Carlos Rodriguez",
      relationship: "Cónyuge",
      phone: "+56 9 8765 4321"
    },
    health: {
      insurance: "Fonasa B",
      allergies: "Penicilina, Polen",
      chronicConditions: "Asma Leve",
      notes: "Prefiere citas por la mañana."
    },
    files: [
      { name: "examen_sangre_ene.pdf", date: "2024-01-15" },
      { name: "radiografia_torax_dic.jpg", date: "2023-12-20" }
    ],
    history: [
      {
        id: "C-001",
        date: "2024-03-10",
        practitioner: "Dr. Aris Mendoza",
        vitals: { bp: "120/80", temp: "36.5", weight: "65", hr: "72" },
        episode: {
          reason: "Chequeo Anual",
          anamnesis: "Paciente se siente bien, sin dolores agudos.",
          diagnosis: "Sano / Hallazgos normales",
          treatment: "Continuar con vitaminas",
          instructions: "Mantener ejercicio regular."
        },
        followUp: { control: true, nextDate: "2025-03-10" },
        notes: "Paciente cumple rigurosamente con su medicación.",
        files: []
      }
    ]
  }
];

export default function App() {
  const [patients, setPatients] = useState<Patient[]>(INITIAL_PATIENTS);
  const [activePatientId, setActivePatientId] = useState<string>(INITIAL_PATIENTS[0].id);
  const [isConsultationModalOpen, setIsConsultationModalOpen] = useState(false);
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const patient = useMemo(() => 
    patients.find(p => p.id === activePatientId) || patients[0], 
  [patients, activePatientId]);

  const filteredHistory = useMemo(() => {
    return patient.history.filter(item => 
      item.episode.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.episode.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.practitioner.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [patient.history, searchTerm]);

  const handleSaveConsultation = (consultation: Consultation) => {
    setPatients(prev => prev.map(p => 
      p.id === activePatientId 
        ? { ...p, history: [consultation, ...p.history] }
        : p
    ));
    setIsConsultationModalOpen(false);
  };

  const handleSavePatient = (patientData: Patient) => {
    if (editingPatient) {
      setPatients(prev => prev.map(p => p.id === patientData.id ? patientData : p));
    } else {
      setPatients(prev => [...prev, patientData]);
      setActivePatientId(patientData.id);
    }
    setEditingPatient(null);
  };

  const handleDeletePatient = (id: string) => {
    if (patients.length <= 1) return alert("Debe haber al menos un paciente en el sistema.");
    if (confirm("¿Está seguro de que desea eliminar este paciente? Esta acción no se puede deshacer.")) {
      const newPatients = patients.filter(p => p.id !== id);
      setPatients(newPatients);
      setActivePatientId(newPatients[0].id);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const newFile = {
        name: file.name,
        date: format(new Date(), 'yyyy-MM-dd')
      };
      setPatients(prev => prev.map(p => 
        p.id === activePatientId 
          ? { ...p, files: [newFile, ...p.files] }
          : p
      ));
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#1e293b] font-sans selection:bg-blue-100 selection:text-blue-900 flex flex-col">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 w-full h-[60px] border-b border-[#e2e8f0] bg-white flex items-center shrink-0">
        <div className="container mx-auto flex items-center justify-between px-6">
          <div className="flex items-center gap-2 font-bold text-lg tracking-tight text-[#2563eb]">
            <Shield className="h-5 w-5 stroke-[2.5]" />
            <span>MedFlow</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative hidden md:flex items-center">
              <Search className="absolute left-2.5 h-4 w-4 text-[#64748b]" />
              <select 
                className="pl-9 pr-4 w-[300px] bg-[#f8fafc] border-[#e2e8f0] h-9 text-sm rounded-lg focus:outline-none focus:ring-1 focus:ring-[#2563eb] appearance-none"
                value={activePatientId}
                onChange={(e) => setActivePatientId(e.target.value)}
              >
                {patients.map(p => (
                  <option key={p.id} value={p.id}>{p.personal.fullName}</option>
                ))}
              </select>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full hover:bg-slate-100"
              onClick={() => {
                setEditingPatient(null);
                setIsPatientModalOpen(true);
              }}
            >
              <Plus className="h-5 w-5 text-[#64748b]" />
            </Button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Main Layout with Sidebar and Content */}
        <div className="flex flex-col md:flex-row w-full overflow-hidden">
          
          {/* Sidebar: Patient Profile Details */}
          <aside className="w-full md:w-[320px] bg-white border-r border-[#e2e8f0] flex flex-col shrink-0 overflow-y-auto">
            <div className="p-5 space-y-6">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <h1 className="text-[20px] font-bold text-[#1e293b]">{patient.personal.fullName}</h1>
                  <p className="text-[13px] text-[#64748b] font-mono">ID: {patient.personal.idNumber}</p>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-[#64748b]" onClick={() => {
                    setEditingPatient(patient);
                    setIsPatientModalOpen(true);
                  }}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-[#dc2626]" onClick={() => handleDeletePatient(patient.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <Separator className="bg-[#e2e8f0]" />

              <div className="space-y-6">
                <section>
                  <h3 className="text-[12px] font-bold uppercase tracking-wider text-[#64748b] mb-3 flex items-center gap-2">
                    <User className="h-3.5 w-3.5" /> Datos Personales
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <InfoItem label="Edad" value={`${patient.personal.age} Años`} />
                    <InfoItem label="Género" value="Femenino" />
                    <InfoItem label="Teléfono" value={patient.personal.phone} />
                    <InfoItem label="Previsión" value={patient.health.insurance} />
                  </div>
                </section>

                <section>
                  <h3 className="text-[12px] font-bold uppercase tracking-wider text-[#64748b] mb-3 flex items-center gap-2">
                    <UserCheck className="h-3.5 w-3.5" /> Contacto de Emergencia
                  </h3>
                  <div className="space-y-3">
                    <InfoItem label="Responsable" value={`${patient.responsible.name} (${patient.responsible.relationship})`} />
                    <InfoItem label="Teléfono" value={patient.responsible.phone} />
                  </div>
                </section>

                <section>
                  <h3 className="text-[12px] font-bold uppercase tracking-wider text-[#dc2626] mb-3 flex items-center gap-2">
                    <AlertCircle className="h-3.5 w-3.5" /> Alertas Clínicas
                  </h3>
                  <div className="bg-[#fef2f2] border border-[#fee2e2] rounded-lg p-3 text-[#dc2626] text-[13px] space-y-1">
                    <p><strong>Alergias:</strong> {patient.health.allergies}</p>
                    <p><strong>Crónico:</strong> {patient.health.chronicConditions}</p>
                  </div>
                </section>

                <section>
                  <h3 className="text-[12px] font-bold uppercase tracking-wider text-[#64748b] mb-3 flex items-center gap-2">
                    <FileText className="h-3.5 w-3.5" /> Archivos y Registros
                  </h3>
                  <div className="space-y-2">
                    {patient.files.map((file, i) => (
                      <div key={i} className="flex items-center gap-2 text-[12px] text-[#2563eb] cursor-pointer hover:underline">
                        <FileText className="h-3.5 w-3.5 shrink-0" />
                        <span>{file.name}</span>
                      </div>
                    ))}
                    <div className="relative">
                      <input 
                        type="file" 
                        id="file-upload" 
                        className="hidden" 
                        onChange={handleFileUpload}
                      />
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full mt-2 border-[#e2e8f0] text-[#1e293b] text-[12px] h-8 rounded-lg hover:bg-slate-50"
                        onClick={() => document.getElementById('file-upload')?.click()}
                      >
                        <Upload className="mr-2 h-3 w-3" /> Agregar Archivo
                      </Button>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full mt-1 border-[#e2e8f0] text-[#1e293b] text-[12px] h-8 rounded-lg hover:bg-slate-50"
                      onClick={() => exportPatientData(patient)}
                    >
                      <Download className="mr-2 h-3 w-3" /> Exportar Ficha
                    </Button>
                  </div>
                </section>
              </div>
            </div>
          </aside>

          {/* Content Pane: Clinical History & New Consultation */}
          <main className="flex-1 p-6 overflow-y-auto bg-[#f8fafc]">
            <div className="max-w-4xl mx-auto space-y-8">
              
              {/* Current Consultation Card */}
              <Card className="rounded-[12px] border-[#e2e8f0] shadow-none overflow-hidden border-l-4 border-l-[#2563eb]">
                <CardHeader className="flex flex-row items-center justify-between pb-4">
                  <div>
                    <CardTitle className="text-[18px] font-bold">Consulta Actual</CardTitle>
                  </div>
                  <div className="text-right">
                    <p className="text-[12px] text-[#64748b] font-bold uppercase tracking-wider">Fecha: {format(new Date(), 'yyyy-MM-dd')}</p>
                    <p className="text-[12px] font-bold uppercase tracking-wider">Dr/Dra: Mario Cepeda</p>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <VitalInput label="PA (mmHg)" value="118/76" />
                    <VitalInput label="Temp (°C)" value="36.7" />
                    <VitalInput label="Peso (kg)" value="68.5" />
                    <VitalInput label="FC (bpm)" value="72" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-[12px] font-bold">Motivo de Consulta</Label>
                      <Input placeholder="Breve descripción de los síntomas" className="bg-[#fcfcfd] border-[#e2e8f0] rounded-lg h-10 text-[13px]" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[12px] font-bold">Anamnesis</Label>
                      <Textarea placeholder="Reporte histórico del paciente" className="bg-[#fcfcfd] border-[#e2e8f0] rounded-lg text-[13px] min-h-[40px] resize-none" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[12px] font-bold">Diagnóstico (CIE-10)</Label>
                      <Input defaultValue="J06.9 Infección aguda de las vías respiratorias superiores" className="bg-[#fcfcfd] border-[#e2e8f0] rounded-lg h-10 text-[13px]" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[12px] font-bold">Plan de Tratamiento</Label>
                      <Input placeholder="Medicamento, dosis, duración" className="bg-[#fcfcfd] border-[#e2e8f0] rounded-lg h-10 text-[13px]" />
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-6 bg-[#f8fafc] p-3 rounded-lg border border-[#e2e8f0]">
                    <div className="flex items-center gap-2">
                      <Checkbox id="follow-up-req" />
                      <Label htmlFor="follow-up-req" className="text-[13px] font-bold cursor-pointer">Requiere Control</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[12px] text-[#64748b] font-medium">Próxima Visita:</span>
                      <Input type="date" className="border-none bg-transparent h-auto p-0 text-[13px] font-bold w-auto focus-visible:ring-0" />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-3 border-t border-[#e2e8f0] bg-slate-50/50 py-4">
                  <Button variant="outline" className="border-[#e2e8f0] text-[#1e293b] font-bold text-[14px] rounded-lg h-10 px-6">Descartar</Button>
                  <ConsultationDialog onSave={handleSaveConsultation} isOpen={isConsultationModalOpen} onOpenChange={setIsConsultationModalOpen} />
                </CardFooter>
              </Card>

              {/* Episode History */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <h3 className="text-[12px] font-bold uppercase tracking-wider text-[#64748b] flex items-center gap-2">
                    <ClipboardList className="h-4 w-4" /> Historial de Episodios
                  </h3>
                  <div className="relative flex items-center">
                    <Search className="absolute left-2.5 h-4 w-4 text-[#64748b]" />
                    <Input 
                      placeholder="Filtrar por diagnóstico..." 
                      className="pl-9 h-9 w-full sm:w-[250px] bg-white border-[#e2e8f0] text-sm rounded-lg"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <AnimatePresence mode="popLayout">
                    {filteredHistory.map((episode, index) => (
                      <HistoryCard key={episode.id} episode={episode} index={index} />
                    ))}
                  </AnimatePresence>
                  {filteredHistory.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 text-center space-y-3 bg-muted/20 rounded-2xl border-2 border-dashed">
                      <ClipboardList className="h-12 w-12 text-muted-foreground/50" />
                      <div className="space-y-1">
                        <p className="font-medium text-muted-foreground">No se encontraron registros</p>
                        <p className="text-sm text-muted-foreground/70">Intente ajustar su búsqueda o inicie una nueva consulta.</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Patient Dialog */}
      <PatientDialog 
        isOpen={isPatientModalOpen} 
        onOpenChange={setIsPatientModalOpen} 
        onSave={handleSavePatient}
        editingPatient={editingPatient}
      />
    </div>
  );
}

// --- SUB-COMPONENTS ---

function ProfileSection({ title, icon, children }: { title: string, icon: React.ReactNode, children: React.ReactNode }) {
  return (
    <Card className="border-none shadow-sm bg-white dark:bg-slate-900 overflow-hidden">
      <CardHeader className="py-3 px-4 bg-slate-50/50 dark:bg-slate-800/50 border-b">
        <div className="flex items-center gap-2">
          {icon}
          <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        {children}
      </CardContent>
    </Card>
  );
}

function InfoItem({ label, value }: { label: string, value: string | number }) {
  return (
    <div className="space-y-0.5">
      <Label className="text-[11px] font-bold uppercase text-[#64748b] tracking-wider">{label}</Label>
      <p className="text-[13px] font-medium text-[#1e293b]">{value || "—"}</p>
    </div>
  );
}

function VitalInput({ label, value }: { label: string, value: string }) {
  return (
    <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-lg p-2 text-center space-y-1">
      <Label className="block text-[10px] font-bold uppercase text-[#64748b] tracking-wider">{label}</Label>
      <span className="text-[16px] font-bold text-[#1e293b]">{value}</span>
    </div>
  );
}

function HistoryCard({ episode, index }: { episode: Consultation, index: number, key?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      layout
    >
      <Card className="group hover:shadow-md transition-all duration-300 border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="bg-slate-50/80 dark:bg-slate-900/80 p-4 border-b flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-white dark:bg-slate-800 border shadow-sm flex items-center justify-center text-blue-600">
              <CalendarIcon className="h-5 w-5" />
            </div>
            <div>
              <p className="font-bold text-slate-900 dark:text-slate-100">{format(new Date(episode.date), 'MMMM dd, yyyy', { locale: es })}</p>
              <p className="text-xs text-muted-foreground font-medium">Profesional: {episode.practitioner}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {episode.followUp.control && (
              <Badge variant="secondary" className="bg-amber-100 text-amber-700 hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800">
                <Clock className="h-3 w-3 mr-1" /> Requiere Control
              </Badge>
            )}
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="p-5 grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Vitals Column */}
          <div className="md:col-span-4 space-y-4">
            <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
              <Activity className="h-3 w-3" /> Signos Vitales
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <VitalItem icon={<Activity className="h-3 w-3" />} label="PA" value={episode.vitals.bp} unit="mmHg" />
              <VitalItem icon={<Thermometer className="h-3 w-3" />} label="Temp" value={episode.vitals.temp} unit="°C" />
              <VitalItem icon={<Weight className="h-3 w-3" />} label="Peso" value={episode.vitals.weight} unit="kg" />
              <VitalItem icon={<Heart className="h-3 w-3" />} label="FC" value={episode.vitals.hr} unit="bpm" />
            </div>
          </div>

          {/* Clinical Episode Column */}
          <div className="md:col-span-8 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Diagnóstico</h3>
                <p className="text-sm font-bold text-blue-700 dark:text-blue-400 leading-tight">{episode.episode.diagnosis}</p>
              </div>
              <div className="space-y-1.5">
                <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Motivo de Consulta</h3>
                <p className="text-sm text-slate-700 dark:text-slate-300 italic leading-tight">"{episode.episode.reason}"</p>
              </div>
            </div>
            
            <Separator className="opacity-50" />
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Tratamiento</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{episode.episode.treatment}</p>
              </div>
              <div className="space-y-1.5">
                <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Instrucciones</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{episode.episode.instructions}</p>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

function VitalItem({ icon, label, value, unit }: { icon: React.ReactNode, label: string, value: string, unit: string }) {
  return (
    <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 p-2.5 rounded-xl flex items-center gap-3">
      <div className="h-7 w-7 rounded-lg bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center text-blue-500">
        {icon}
      </div>
      <div>
        <p className="text-[9px] font-bold text-muted-foreground uppercase leading-none mb-1">{label}</p>
        <p className="text-xs font-bold text-slate-900 dark:text-slate-100">{value}<span className="text-[10px] font-normal text-muted-foreground ml-0.5">{unit}</span></p>
      </div>
    </div>
  );
}

// --- CONSULTATION DIALOG COMPONENT ---

function ConsultationDialog({ onSave, isOpen, onOpenChange }: { onSave: (c: Consultation) => void, isOpen: boolean, onOpenChange: (open: boolean) => void }) {
  const [date, setDate] = useState<Date>(new Date());
  const [form, setForm] = useState({
    practitioner: "",
    vitals: { bp: "", temp: "", weight: "", hr: "" },
    episode: { reason: "", anamnesis: "", diagnosis: "", treatment: "", instructions: "" },
    followUp: { control: false, nextDate: "" },
    notes: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newConsultation: Consultation = {
      id: `C-${Math.random().toString(36).substr(2, 9)}`,
      date: date.toISOString(),
      practitioner: form.practitioner,
      vitals: form.vitals,
      episode: form.episode,
      followUp: form.followUp,
      notes: form.notes,
      files: []
    };
    onSave(newConsultation);
    // Reset form
    setForm({
      practitioner: "",
      vitals: { bp: "", temp: "", weight: "", hr: "" },
      episode: { reason: "", anamnesis: "", diagnosis: "", treatment: "", instructions: "" },
      followUp: { control: false, nextDate: "" },
      notes: ""
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="bg-[#2563eb] hover:bg-blue-700 text-white font-bold text-[14px] rounded-lg h-10 px-6 shadow-none">
          <PlusCircle className="mr-2 h-4 w-4" />
          Nueva Consulta
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0 gap-0 border-[#e2e8f0] shadow-2xl rounded-[12px]">
        <DialogHeader className="p-6 bg-white border-b border-[#e2e8f0]">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-[#2563eb] flex items-center justify-center text-white">
              <ClipboardList className="h-6 w-6" />
            </div>
            <div>
              <DialogTitle className="text-[18px] font-bold tracking-tight">Nuevo Episodio Clínico</DialogTitle>
              <DialogDescription className="text-[13px] text-[#64748b]">Registre una nueva consulta para el paciente.</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 p-6 bg-[#f8fafc]">
          <form id="consultation-form" onSubmit={handleSubmit} className="space-y-6 pb-4">
            {/* Header Data */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-[12px] font-bold uppercase tracking-wider text-[#64748b]">Fecha de Consulta</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal h-10 rounded-lg border-[#e2e8f0] bg-white",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP", { locale: es }) : <span>Seleccione una fecha</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={(d) => d && setDate(d)}
                      initialFocus
                      locale={es}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label className="text-[12px] font-bold uppercase tracking-wider text-[#64748b]">Nombre del Profesional</Label>
                <Input 
                  required
                  placeholder="ej. Dr. Mendoza"
                  className="h-10 rounded-lg border-[#e2e8f0] bg-white text-[13px]"
                  value={form.practitioner}
                  onChange={(e) => setForm({...form, practitioner: e.target.value})}
                />
              </div>
            </div>

            {/* Section: Vitals */}
            <div className="space-y-4">
              <h3 className="text-[12px] font-bold uppercase tracking-widest text-[#64748b]">Signos Vitales</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase text-[#64748b]">Presión Arterial</Label>
                  <Input placeholder="120/80" className="h-10 rounded-lg border-[#e2e8f0] bg-white text-[13px]" value={form.vitals.bp} onChange={(e) => setForm({...form, vitals: {...form.vitals, bp: e.target.value}})} />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase text-[#64748b]">Temperatura (°C)</Label>
                  <Input placeholder="36.5" className="h-10 rounded-lg border-[#e2e8f0] bg-white text-[13px]" value={form.vitals.temp} onChange={(e) => setForm({...form, vitals: {...form.vitals, temp: e.target.value}})} />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase text-[#64748b]">Peso (kg)</Label>
                  <Input placeholder="70" className="h-10 rounded-lg border-[#e2e8f0] bg-white text-[13px]" value={form.vitals.weight} onChange={(e) => setForm({...form, vitals: {...form.vitals, weight: e.target.value}})} />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase text-[#64748b]">Frecuencia Cardíaca (bpm)</Label>
                  <Input placeholder="72" className="h-10 rounded-lg border-[#e2e8f0] bg-white text-[13px]" value={form.vitals.hr} onChange={(e) => setForm({...form, vitals: {...form.vitals, hr: e.target.value}})} />
                </div>
              </div>
            </div>

            {/* Section: Clinical Episode */}
            <div className="space-y-6">
              <h3 className="text-[12px] font-bold uppercase tracking-widest text-[#64748b]">Episodio Clínico</h3>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-[12px] font-bold uppercase tracking-wider text-[#64748b]">Motivo de Consulta</Label>
                  <Input 
                    required
                    placeholder="Describa brevemente el motivo..." 
                    className="h-10 rounded-lg border-[#e2e8f0] bg-white text-[13px]"
                    value={form.episode.reason}
                    onChange={(e) => setForm({...form, episode: {...form.episode, reason: e.target.value}})}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[12px] font-bold uppercase tracking-wider text-[#64748b]">Anamnesis (Reporte del Paciente)</Label>
                  <Textarea 
                    placeholder="Historia detallada de los síntomas..." 
                    className="min-h-[100px] rounded-lg border-[#e2e8f0] bg-white text-[13px] resize-none"
                    value={form.episode.anamnesis}
                    onChange={(e) => setForm({...form, episode: {...form.episode, anamnesis: e.target.value}})}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-[12px] font-bold uppercase tracking-wider text-[#64748b]">Diagnóstico</Label>
                    <Input 
                      required
                      placeholder="Diagnóstico clínico..." 
                      className="h-10 rounded-lg border-[#e2e8f0] bg-white text-[13px] font-bold text-[#2563eb]"
                      value={form.episode.diagnosis}
                      onChange={(e) => setForm({...form, episode: {...form.episode, diagnosis: e.target.value}})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[12px] font-bold uppercase tracking-wider text-[#64748b]">Plan de Tratamiento</Label>
                    <Input 
                      placeholder="Tratamiento prescrito..." 
                      className="h-10 rounded-lg border-[#e2e8f0] bg-white text-[13px]"
                      value={form.episode.treatment}
                      onChange={(e) => setForm({...form, episode: {...form.episode, treatment: e.target.value}})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-[12px] font-bold uppercase tracking-wider text-[#64748b]">Instrucciones Médicas</Label>
                  <Textarea 
                    placeholder="Instrucciones para el paciente..." 
                    className="min-h-[80px] rounded-lg border-[#e2e8f0] bg-white text-[13px] resize-none"
                    value={form.episode.instructions}
                    onChange={(e) => setForm({...form, episode: {...form.episode, instructions: e.target.value}})}
                  />
                </div>
              </div>
            </div>

            {/* Section: Follow-up & Notes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="text-[12px] font-bold uppercase tracking-widest text-[#64748b]">Seguimiento</h3>
                <div className="p-4 rounded-lg bg-white border border-[#e2e8f0] space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="control-modal" 
                      checked={form.followUp.control}
                      onCheckedChange={(checked) => setForm({...form, followUp: {...form.followUp, control: checked as boolean}})}
                    />
                    <label htmlFor="control-modal" className="text-[13px] font-bold leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Requiere Control
                    </label>
                  </div>
                  {form.followUp.control && (
                    <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
                      <Label className="text-[10px] font-bold uppercase text-[#64748b]">Fecha del Próximo Control</Label>
                      <Input 
                        type="date" 
                        className="h-10 rounded-lg border-[#e2e8f0] bg-white text-[13px]"
                        value={form.followUp.nextDate}
                        onChange={(e) => setForm({...form, followUp: {...form.followUp, nextDate: e.target.value}})}
                      />
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="text-[12px] font-bold uppercase tracking-widest text-[#64748b]">Notas de la Sesión</h3>
                <Textarea 
                  placeholder="Observaciones adicionales..." 
                  className="min-h-[120px] rounded-lg border-[#e2e8f0] bg-white text-[13px] resize-none"
                  value={form.notes}
                  onChange={(e) => setForm({...form, notes: e.target.value})}
                />
              </div>
            </div>
          </form>
        </ScrollArea>

        <DialogFooter className="p-6 bg-white border-t border-[#e2e8f0] flex flex-row gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1 h-10 rounded-lg border-[#e2e8f0] text-[#1e293b] font-bold text-[14px]">
            Cancelar
          </Button>
          <Button type="submit" form="consultation-form" className="flex-[2] h-10 bg-[#2563eb] hover:bg-blue-700 text-white rounded-lg font-bold text-[14px] shadow-none">
            <Save className="mr-2 h-4 w-4" /> Guardar Ficha Clínica
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
