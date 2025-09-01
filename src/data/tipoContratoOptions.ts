import { TipoContratoOption } from '../types';

export const tipoContratoOptions: TipoContratoOption[] = [
  {
    value: '1',
    label: 'Trabalhador com vínculo formalizado no eSocial',
    description: 'Sem alteração nas datas de admissão e de desligamento'
  },
  {
    value: '2',
    label: 'Trabalhador com vínculo formalizado no eSocial',
    description: 'Com alteração na data de admissão'
  },
  {
    value: '3',
    label: 'Trabalhador com vínculo formalizado no eSocial',
    description: 'Com inclusão ou alteração de data de desligamento'
  },
  {
    value: '4',
    label: 'Trabalhador com vínculo formalizado no eSocial',
    description: 'Com alteração na data de admissão e inclusão/alteração da data de desligamento'
  },
  {
    value: '5',
    label: 'Empregado com reconhecimento de vínculo',
    description: 'Reconhecimento de vínculo empregatício'
  },
  {
    value: '6',
    label: 'Trabalhador sem vínculo (TSVE)',
    description: 'Sem reconhecimento de vínculo empregatício'
  },
  {
    value: '7',
    label: 'Trabalhador com vínculo de emprego formalizado',
    description: 'Em período anterior ao eSocial'
  },
  {
    value: '8',
    label: 'Responsabilidade indireta',
    description: 'Trabalhador sob responsabilidade indireta'
  },
  {
    value: '9',
    label: 'Trabalhador cujos contratos foram unificados',
    description: 'Unicidade contratual'
  }
];