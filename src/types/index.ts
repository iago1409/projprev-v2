// Worker related types
export interface Worker {
  cpf: string;
  name: string;
  count: number;
}

export interface WorkerSearchResult {
  cpf: string;
  name: string;
  cpfWithoutMask: string;
  cpfMasked: string;
  displayText: string;
}

// Form data types
export interface ContratoFormData {
  tpContr: string;
  matricula: string;
  dtInicio: string;
  dtAdmOrig: string;
  indReintegr: string;
  indContr: string;
  codCBO?: string;
  natAtividadeCompl?: string;
  tpRegTrab?: string;
  tpRegPrev?: string;
  dtAdm?: string;
  tpRegTrabParc?: string;
  // Indicadores
  indReint?: string;
  indCateg?: string;
  indNatAtiv?: string;
  indMotDeslig?: string;
  // Informações do Desligamento
  dtDeslig?: string;
  mtvDeslig?: string;
  dtProjFimAPI?: string;
  // Mudança de categoria
  codCateg?: string;
  natAtividade?: string;
  dtMudCategAtiv?: string;
}

export interface IndicadoresFormData {
  indReint: string;
  indCateg: string;
  indNatAtiv: string;
  indMotDeslig: string;
}

export interface TipoContratoOption {
  value: string;
  label: string;
  description: string;
}

// Error types
export interface FormErrors {
  [key: string]: string | undefined;
}