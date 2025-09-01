import { TipoContratoOption } from '../types';

export const motivoDesligamentoOptions: TipoContratoOption[] = [
  {
    value: '',
    label: 'Selecione o motivo do desligamento',
    description: 'Escolha uma das opções da Tabela 19'
  },
  {
    value: '01',
    label: 'Demissão sem justa causa',
    description: 'Dispensa sem justa causa'
  },
  {
    value: '02',
    label: 'Demissão por justa causa',
    description: 'Dispensa por justa causa'
  },
  {
    value: '03',
    label: 'Término de contrato',
    description: 'Término de contrato por prazo determinado'
  },
  {
    value: '04',
    label: 'Rescisão antecipada pelo empregado',
    description: 'Rescisão antecipada do contrato por prazo determinado pelo empregado'
  },
  {
    value: '05',
    label: 'Rescisão antecipada pelo empregador',
    description: 'Rescisão antecipada do contrato por prazo determinado pelo empregador'
  },
  {
    value: '06',
    label: 'Pedido de demissão',
    description: 'Pedido de demissão pelo empregado'
  },
  {
    value: '07',
    label: 'Aposentadoria',
    description: 'Aposentadoria'
  },
  {
    value: '08',
    label: 'Falecimento',
    description: 'Falecimento do trabalhador'
  },
  {
    value: '09',
    label: 'Acordo entre as partes',
    description: 'Rescisão por acordo entre empregado e empregador'
  },
  {
    value: '10',
    label: 'Culpa recíproca',
    description: 'Rescisão por culpa recíproca'
  },
  {
    value: '11',
    label: 'Força maior',
    description: 'Rescisão por força maior'
  },
  {
    value: '12',
    label: 'Morte do empregador',
    description: 'Morte do empregador pessoa física'
  },
  {
    value: '13',
    label: 'Rescisão indireta',
    description: 'Rescisão indireta (justa causa do empregador)'
  },
  {
    value: '14',
    label: 'Término de obra',
    description: 'Término de obra (construção civil)'
  },
  {
    value: '15',
    label: 'Término de safra',
    description: 'Término de safra (trabalhador rural)'
  }
];