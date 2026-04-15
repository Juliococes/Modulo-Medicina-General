export interface VitalSigns {
  bp: string;
  temp: string;
  weight: string;
  hr: string;
}

export interface ClinicalEpisode {
  reason: string;
  anamnesis: string;
  diagnosis: string;
  treatment: string;
  instructions: string;
}

export interface FollowUp {
  control: boolean;
  nextDate?: string;
}

export interface Consultation {
  id: string;
  date: string;
  practitioner: string;
  vitals: VitalSigns;
  episode: ClinicalEpisode;
  followUp: FollowUp;
  notes: string;
  files: string[];
}

export interface Patient {
  id: string;
  personal: {
    fullName: string;
    idNumber: string;
    age: number;
    phone: string;
    email: string;
  };
  responsible: {
    name: string;
    relationship: string;
    phone: string;
  };
  health: {
    insurance: string;
    allergies: string;
    chronicConditions: string;
    notes: string;
  };
  files: { name: string; date: string }[];
  history: Consultation[];
}
