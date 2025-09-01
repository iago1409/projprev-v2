import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PageLayout } from '../components/layout/PageLayout';
import { PageHeader } from '../components/layout/PageHeader';
import { ActionButtons } from '../components/ui/ActionButtons';
import { TextInput } from '../components/TextInput';
import { SelectInput } from '../components/SelectInput';
import { DateInput } from '../components/DateInput';
import { formatCPF } from '../utils/cpfUtils';
import { FormDataService } from '../services/formDataService';

interface SucessaoVinculoData {
  sucessaoPreencher: boolean;
  sucessaoTpInsc: string;
  sucessaoNrInsc: string;
  sucessaoMatricAnt: string;
  sucessaoDtTransf: string;
}

interface FormErrors {
  sucessaoTpInsc?: string;
  sucessaoNrInsc?: string;
  sucessaoMatricAnt?: string;
  sucessaoDtTransf?: string;
}

const DEFAULT_DATA: SucessaoVinculoData = {
  sucessaoPreencher: false,
  sucessaoTpInsc: '',
  sucessaoNrInsc: '',
  sucessaoMatricAnt: '',
  sucessaoDtTransf: '',
};

export const SucessaoVinculo: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const cpf = searchParams.get('cpf') || '';

  const [formData, setFormData] = useState<SucessaoVinculoData>(DEFAULT_DATA);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  // Carregar dados existentes
  useEffect(() => {
    const loadFormData = async () => {
      if (!cpf) return;
      try {
        const savedData = await FormDataService.getFormData(cpf);
        const parsed: SucessaoVinculoData = {
          sucessaoPreencher: 
            savedData?.sucessaoPreencher === true ||
            savedData?.sucessaoPreencher === 'S' ||
            savedData?.sucessaoPreencher === 'true',
          sucessaoTpInsc: savedData?.sucessaoTpInsc || '',
          sucessaoNrInsc: savedData?.sucessaoNrInsc || '',
          sucessaoMatricAnt: savedData?.sucessaoMatricAnt || '',
          sucessaoDtTransf: savedData?.sucessaoDtTransf || '',
        };
        setFormData(parsed);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      }
    };
    loadFormData();
  }, [cpf]);

  // Salvar campo individual
  const saveField = async (field: keyof SucessaoVinculoData, value: string | boolean) => {
    if (!cpf) return;
    try {
      const toSave =
        field === 'sucessaoPreencher'
          ? (value ? 'S' : 'N')
          : (value as string);
      await FormDataService.saveField(cpf, field, toSave);
    } catch (error) {
      console.error('Erro ao salvar campo:', field, error);
    }
  };

  // Manipular mudança do checkbox
  const handleToggle = async (checked: boolean) => {
    const newFormData: SucessaoVinculoData = {
      ...formData,
      sucessaoPreencher: checked,
      // Se desmarcado, limpar os outros campos
      ...(!checked && {
        sucessaoTpInsc: '',
        sucessaoNrInsc: '',
        sucessaoMatricAnt: '',
        sucessaoDtTransf: '',
      }),
    };
    
    setFormData(newFormData);

    // Salvar o checkbox
    await saveField('sucessaoPreencher', checked);
    
    // Se desmarcado, limpar os outros campos no storage
    if (!checked) {
      await Promise.all([
        saveField('sucessaoTpInsc', ''),
        saveField('sucessaoNrInsc', ''),
        saveField('sucessaoMatricAnt', ''),
        saveField('sucessaoDtTransf', ''),
      ]);
      
      // Limpar erros
      setErrors({});
    }
  };

  // Manipular mudança de campos
  const handleFieldChange = async (field: keyof SucessaoVinculoData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Limpar erro do campo
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
    
    // Auto-save
    await saveField(field, value);
  };

  // Configuração do breadcrumb
  const breadcrumbItems = [
    { label: 'Início', onClick: () => navigate('/') },
    { label: 'Registro de Processo', onClick: () => navigate('/registrar') },
    { label: 'Informações de Sucessão de Vínculo' },
  ];

  // Opções para o select de tipo de inscrição
  const tipoInscricaoOptions = [
    { value: '', label: 'Selecione o tipo de inscrição', description: 'Selecione uma das opções disponíveis' },
    { value: '1', label: '1 - CNPJ', description: 'Cadastro Nacional da Pessoa Jurídica' },
    { value: '2', label: '2 - CPF', description: 'Cadastro de Pessoas Físicas' },
    { value: '5', label: '5 - CGC', description: 'Cadastro Geral de Contribuintes' },
    { value: '6', label: '6 - CEI', description: 'Cadastro Específico do INSS' },
  ];

  // Handlers dos botões de ação
  const handleCancel = () => navigate('/');
  
  const handlePrevious = () => {
    navigate('/processo/informacoes-do-processo');
  };
  
  const handleSaveDraft = async () => {
    if (!cpf) return;
    setIsLoading(true);
    try {
      await FormDataService.saveFormData(cpf, formData);
      alert('Rascunho salvo com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar rascunho:', error);
      alert('Erro ao salvar rascunho');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleNext = async () => {
    if (!cpf) return;
    setIsLoading(true);
    try {
      await FormDataService.saveFormData(cpf, formData);
      navigate('/processo/vinculo');
    } catch (error) {
      console.error('Erro ao salvar dados:', error);
      alert('Erro ao salvar dados');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageLayout breadcrumbItems={breadcrumbItems}>
      <PageHeader
        title="Informações de Sucessão de Vínculo"
        cpf={cpf}
        formatCPF={formatCPF}
      />

      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-6 pb-3 border-b border-gray-200">
          Dados da Sucessão de Vínculo
        </h2>

        {/* Checkbox para habilitar/desabilitar campos */}
        <label className="flex items-center gap-3 mb-6">
          <input
            type="checkbox"
            className="h-4 w-4"
            checked={formData.sucessaoPreencher}
            onChange={(e) => handleToggle(e.target.checked)}
          />
          <span className="text-sm text-gray-900">
            Preencher informações de sucessão de vínculo?
          </span>
        </label>

        {/* Campos condicionais - só aparecem quando checkbox marcado */}
        {formData.sucessaoPreencher && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Tipo de inscrição do empregador anterior */}
            <SelectInput
              value={formData.sucessaoTpInsc}
              onChange={(value) => handleFieldChange('sucessaoTpInsc', value)}
              options={tipoInscricaoOptions}
              label="Tipo de inscrição do empregador anterior"
              placeholder="Selecione o tipo de inscrição"
              error={errors.sucessaoTpInsc}
            />

            {/* Número de inscrição do empregador anterior */}
            <TextInput
              value={formData.sucessaoNrInsc}
              onChange={(value) => handleFieldChange('sucessaoNrInsc', value)}
              label="Número de inscrição do empregador anterior"
              placeholder="Digite o número de inscrição"
              error={errors.sucessaoNrInsc}
            />

            {/* Matrícula no empregador anterior */}
            <TextInput
              value={formData.sucessaoMatricAnt}
              onChange={(value) => handleFieldChange('sucessaoMatricAnt', value)}
              label="Matrícula no empregador anterior"
              placeholder="Digite a matrícula anterior"
              error={errors.sucessaoMatricAnt}
            />

            {/* Data da transferência para o empregador atual */}
            <DateInput
              value={formData.sucessaoDtTransf}
              onChange={(value) => handleFieldChange('sucessaoDtTransf', value)}
              label="Data da transferência para o empregador atual"
              placeholder="DD/MM/AAAA"
              error={errors.sucessaoDtTransf}
            />
          </div>
        )}
      </div>

      {/* Botões de ação */}
      <ActionButtons
        onCancel={handleCancel}
        onSaveDraft={handleSaveDraft}
        onPrevious={handlePrevious}
        onNext={handleNext}
        isLoading={isLoading}
      />
    </PageLayout>
  );
};