/**
 * Remove formatação de documentos
 */
export const unmaskDocument = (value: string): string => {
  return value.replace(/\D/g, '');
};

/**
 * Aplica máscara de CPF
 */
export const maskCPF = (value: string): string => {
  const digits = unmaskDocument(value);
  
  if (digits.length <= 11) {
    return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }
  
  return digits;
};

/**
 * Aplica máscara de CNPJ
 */
export const maskCNPJ = (value: string): string => {
  const digits = unmaskDocument(value);
  
  if (digits.length <= 14) {
    return digits.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  }
  
  return digits;
};

/**
 * Aplica máscara de data DD/MM/AAAA
 */
export const maskDate = (value: string): string => {
  const digits = value.replace(/\D/g, '');
  
  if (digits.length <= 8) {
    return digits.replace(/(\d{2})(\d{2})(\d{4})/, '$1/$2/$3');
  }
  
  return digits;
};

/**
 * Valida formato de data DD/MM/AAAA
 */
export const isValidDate = (dateString: string): boolean => {
  const regex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
  const match = dateString.match(regex);
  
  if (!match) return false;
  
  const day = parseInt(match[1], 10);
  const month = parseInt(match[2], 10);
  const year = parseInt(match[3], 10);
  
  const date = new Date(year, month - 1, day);
  
  return date.getFullYear() === year &&
         date.getMonth() === month - 1 &&
         date.getDate() === day;
};

/**
 * Converte data DD/MM/AAAA para formato ISO AAAA-MM-DD
 */
export const formatDateToISO = (dateString: string): string => {
  const regex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
  const match = dateString.match(regex);
  
  if (!match) return '';
  
  const day = match[1];
  const month = match[2];
  const year = match[3];
  
  return `${year}-${month}-${day}`;
};