// Utilitários para manipulação de CPF
export const formatCPF = (value: string): string => {
  // Remove tudo que não é dígito
  const digits = value.replace(/\D/g, '');
  
  // Aplica a máscara
  return digits
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})/, '$1-$2')
    .replace(/(-\d{2})\d+?$/, '$1');
};

export const removeCPFMask = (cpf: string): string => {
  return cpf.replace(/\D/g, '');
};

export const isValidCPF = (cpf: string): boolean => {
  const digits = removeCPFMask(cpf);
  
  if (digits.length !== 11) return false;
  
  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{10}$/.test(digits)) return false;
  
  // Calcula primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(digits.charAt(i)) * (10 - i);
  }
  let remainder = sum % 11;
  const firstDigit = remainder < 2 ? 0 : 11 - remainder;
  
  if (parseInt(digits.charAt(9)) !== firstDigit) return false;
  
  // Calcula segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(digits.charAt(i)) * (11 - i);
  }
  remainder = sum % 11;
  const secondDigit = remainder < 2 ? 0 : 11 - remainder;
  
  return parseInt(digits.charAt(10)) === secondDigit;
};

export const maskCPFForDisplay = (cpf: string): string => {
  const digits = removeCPFMask(cpf);
  if (digits.length !== 11) return cpf;
  
  return `${digits.substring(0, 3)}.***.***-${digits.substring(9, 11)}`;
};