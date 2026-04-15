import { Patient } from "../types";

export const exportPatientData = (patient: Patient) => {
  const dataStr = JSON.stringify(patient, null, 2);
  const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
  
  const exportFileDefaultName = `ficha_paciente_${patient.personal.fullName.replace(/\s+/g, '_')}.json`;
  
  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', exportFileDefaultName);
  linkElement.click();
};
