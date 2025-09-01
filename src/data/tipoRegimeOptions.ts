import { TipoContratoOption } from '../types';

export const tipoRegimeTrabOptions: TipoContratoOption[] = [
  {
    value: '',
    label: 'Selecione o tipo de regime trabalhista',
    description: 'Escolha uma das opções disponíveis'
  },
  {
    value: '1',
    label: 'CLT – Consolidação das Leis do Trabalho e legislações trabalhistas específicas',
    description: 'Regime celetista'
  },
  {
    value: '2',
    label: 'Estatutário/legislações específicas (servidor temporário, militar, agente político etc.)',
    description: 'Regime estatutário'
  }
];

export const tipoRegimePrevOptions: TipoContratoOption[] = [
  {
    value: '',
    label: 'Selecione o tipo de regime previdenciário',
    description: 'Escolha uma das opções disponíveis'
  },
  {
    value: '1',
    label: 'Regime Geral de Previdência Social – RGPS',
    description: 'RGPS'
  },
  {
    value: '2',
    label: 'Regime Próprio de Previdência Social – RPPS',
    description: 'RPPS'
  },
  {
    value: '3',
    label: 'Regime de Previdência Social no exterior',
    description: 'Regime no exterior'
  }
];

export const tipoContratoParcialOptions: TipoContratoOption[] = [
  {
    value: '',
    label: 'Selecione o tipo de contrato',
    description: 'Escolha uma das opções disponíveis'
  },
  {
    value: '0',
    label: 'Não é contrato em tempo parcial',
    description: 'Contrato em tempo integral'
  },
  {
    value: '1',
    label: 'Limitado a 25 horas semanais',
    description: 'Contrato parcial - 25h'
  },
  {
    value: '2',
    label: 'Limitado a 30 horas semanais',
    description: 'Contrato parcial - 30h'
  },
  {
    value: '3',
    label: 'Limitado a 26 horas semanais',
    description: 'Contrato parcial - 26h'
  }
];