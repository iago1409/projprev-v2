import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSearchParams } from 'react-router-dom';
import { PageLayout } from '../components/layout/PageLayout';
import { PageHeader } from '../components/layout/PageHeader';
import { ActionButtons } from '../components/ui/ActionButtons';
import { SubTabs } from '../components/navigation/SubTabs';
import { SelectInput } from '../components/SelectInput';
import { TextInput } from '../components/TextInput';
import { DateInput } from '../components/DateInput';
import { SelectInput } from '../components/SelectInput';
import { TextInput } from '../components/TextInput';
import { DateInput } from '../components/DateInput';
import { formatCPF } from '../utils/cpfUtils';
import { FormDataService } from '../services/formDataService';

/**
 * SUCESSÃO DE VÍNCULO PAGE - Informações de Sucessão de Vínculo
 * 
 * Esta página permite o preenchimento das informações de sucessão de vínculo.
 */

// Interface para os dados do formulário
interface SucessaoVinculoData {
  sucessaoPreencher: boolean;
  sucessaoTpInsc: string;
  sucessaoNrInsc: string;
  sucessaoMatricAnt: string;
  sucessaoDtTransf: string;
}

// Interface para erros de validação
interface FormErrors {
  sucessaoTpInsc?: string;
  sucessaoNrInsc?: string;
  sucessaoMatricAnt?: string;
  sucessaoDtTransf?: string;
}

export const SucessaoVinculo: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const cpf = searchParams.get('cpf') || '';
  const activeTab = 'sucessao';
  
  // Estado do formulário
  const [formData, setFormData] = useState<SucessaoVinculoData>({
    sucessaoPreencher: false,
    sucessaoTpInsc: '',
    sucessaoNrInsc: '',
    sucessaoMatricAnt: '',
    sucessaoDtTransf: ''
  });
  
  // Estado de erros
  const [errors, setErrors] = useState<FormErrors>({});
  
  // Estado de loading
  const [isLoading, setIsLoading] = useState(false);
  
  // Opções para tipo de inscrição
  const tipoInscricaoOptions = [
    { value: '', label: 'Selecione o tipo de inscrição', description: 'Selecione uma das opções disponíveis' },
    { value: '1', label: '1 - CNPJ', description: 'Cadastro Nacional da Pessoa Jurídica' },
    { value: '2', label: '2 - CPF', description: 'Cadastro de Pessoas Físicas' },
    { value: '5', label: '5 - CGC', description: 'Cadastro Geral de Contribuintes' },
    { value: '6', label: '6 - CEI', description: 'Cadastro Específico do INSS' }
  ];
  
  // Opções para tipo de inscrição
  const tipoInscricaoOptions = [
    { value: '', label: 'Selecione o tipo de inscrição', description: 'Selecione uma das opções disponíveis' },
    { value: '1', label: '1 - CNPJ', description: 'Cadastro Nacional da Pessoa Jurídica' },
    { value: '2', label: '2 - CPF', description: 'Cadastro de Pessoas Físicas' },
    { value: '5', label: '5 - CGC', description: 'Cadastro Geral de Contribuintes' },
    { value: '6', label: '6 - CEI', description: 'Cadastro Específico do INSS' }
  ];
  
  // Configuração do breadcrumb
  const breadcrumbItems = [
    {
      label: 'Início',
      onClick: () => navigate('/')
    },
    {
      label: 'Registro de Processo',
      onClick: () => navigate(`/registrar?cpf=${cpf}`)
    },
    {
      label: 'Sucessão de Vínculo'
    }
  ];
  
  // Carregar dados salvos ao montar o componente
  useEffect(() => {
    const loadFormData = async () => {
      if (cpf) {
        try {
          const savedData = await FormDataService.getFormData(cpf);
          
          // Carregar dados específicos de sucessão de vínculo
          const sucessaoData: SucessaoVinculoData = {
            sucessaoPreencher: savedData.sucessaoPreencher === 'true' || false,
            sucessaoTpInsc: savedData.sucessaoTpInsc || '',
            sucessaoNrInsc: savedData.sucessaoNrInsc || '',
            sucessaoMatricAnt: savedData.sucessaoMatricAnt || '',
            sucessaoDtTransf: savedData.sucessaoDtTransf || ''
          };
          
          setFormData(sucessaoData);
        } catch (error) {
          console.error('Erro ao carregar dados:', error);
        }
      }
    };
    
    loadFormData();
  }, [cpf]);
  
  // Função para atualizar campos do formulário
  const handleFieldChange = async (field: keyof SucessaoVinculoData, value: string | boolean) => {
    const stringValue = typeof value === 'boolean' ? value.toString() : value;
    
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Limpar erro do campo quando começar a digitar
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
    
    // Salvar automaticamente
    if (cpf) {
      try {
        await FormDataService.saveField(cpf, field, stringValue);
      } catch (error) {
        console.error('Erro ao salvar campo:', error);
      }
    }
  };
  
  // Função para lidar com mudança do checkbox
  const handleCheckboxChange = async (checked: boolean) => {
    await handleFieldChange('sucessaoPreencher', checked);
    
    // Se desmarcado, limpar todos os campos e salvar vazio
    if (!checked) {
      const fieldsToClean = ['sucessaoTpInsc', 'sucessaoNrInsc', 'sucessaoMatricAnt', 'sucessaoDtTransf'];
      
      // Atualizar estado local
      setFormData(prev => ({
        ...prev,
        sucessaoTpInsc: '',
        sucessaoNrInsc: '',
        sucessaoMatricAnt: '',
        sucessaoDtTransf: ''
      }));
      
      // Salvar campos vazios
      if (cpf) {
        try {
          for (const field of fieldsToClean) {
            await FormDataService.saveField(cpf, field, '');
          }
        } catch (error) {
          console.error('Erro ao limpar campos:', error);
        }
      }
    }
  };
  
  // Função de validação
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    // Validações básicas podem ser adicionadas aqui se necessário
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handlers para os botões de ação
  const handleCancel = () => {
    navigate('/');
  };
  
  const handleSaveDraft = async () => {
    setIsLoading(true);
    try {
      if (cpf) {
        await FormDataService.saveFormData(cpf, {
          sucessaoPreencher: formData.sucessaoPreencher.toString(),
          sucessaoTpInsc: formData.sucessaoTpInsc,
          sucessaoNrInsc: formData.sucessaoNrInsc,
          sucessaoMatricAnt: formData.sucessaoMatricAnt,
          sucessaoDtTransf: formData.sucessaoDtTransf
        });
        alert('Rascunho salvo com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao salvar rascunho:', error);
      alert('Erro ao salvar rascunho');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handlePrevious = () => {
    navigate(`/registrar?cpf=${cpf}&tab=contrato`);
  };
  
  const handleNext = async () => {
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    try {
      if (cpf) {
        await FormDataService.saveFormData(cpf, {
          sucessaoPreencher: formData.sucessaoPreencher.toString(),
          sucessaoTpInsc: formData.sucessaoTpInsc,
          sucessaoNrInsc: formData.sucessaoNrInsc,
          sucessaoMatricAnt: formData.sucessaoMatricAnt,
          sucessaoDtTransf: formData.sucessaoDtTransf
        });
        navigate(`/registrar?cpf=${cpf}&tab=consolidacao`);
      }
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
        subtitle="Preencha as informações de sucessão de vínculo"
        cpf={cpf}
        formatCPF={formatCPF}
      />
      
      {/* Sub Tabs */}
      <SubTabs activeTab={activeTab} cpf={cpf} />
      
      {/* Seção do Formulário */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-6 pb-3 border-b border-gray-200">
          Dados de Sucessão de Vínculo
        </h2>
        
        {/* Checkbox para habilitar/desabilitar campos */}
        <div className="mb-6">
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={formData.sucessaoPreencher}
              onChange={(e) => handleCheckboxChange(e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
            />
            <span className="ml-2 text-sm font-medium text-gray-700">
              Preencher informações de sucessão de vínculo?
            </span>
          </label>
        </div>
        
        {/* Campos condicionais */}
        {formData.sucessaoPreencher && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Tipo de Inscrição */}
            <SelectInput
              value={formData.sucessaoTpInsc}
              onChange={(value) => handleFieldChange('sucessaoTpInsc', value)}
              options={tipoInscricaoOptions}
              label="Tipo de inscrição do empregador anterior"
              placeholder="Selecione o tipo de inscrição"
              error={errors.sucessaoTpInsc}
            />
            
            {/* Número de Inscrição */}
            <TextInput
              value={formData.sucessaoNrInsc}
              onChange={(value) => handleFieldChange('sucessaoNrInsc', value)}
              label="Número de inscrição do empregador anterior"
              placeholder="Digite o número de inscrição"
              error={errors.sucessaoNrInsc}
            />
            
            {/* Matrícula Anterior */}
            <TextInput
              value={formData.sucessaoMatricAnt}
              onChange={(value) => handleFieldChange('sucessaoMatricAnt', value)}
              label="Matrícula no empregador anterior"
              placeholder="Digite a matrícula anterior"
              error={errors.sucessaoMatricAnt}
            />
            
            {/* Data da Transferência */}
            <DateInput
              value={formData.sucessaoDtTransf}
              onChange={(value) => handleFieldChange('sucessaoDtTransf', value)}
              label="Data da transferência para o empregador atual"
              placeholder="DD/MM/AAAA"
              error={errors.sucessaoDtTransf}
            />
            {/* Tipo de Inscrição */}
            <SelectInput
              value={formData.sucessaoTpInsc}
              onChange={(value) => handleFieldChange('sucessaoTpInsc', value)}
              options={tipoInscricaoOptions}
              label="Tipo de inscrição do empregador anterior"
              placeholder="Selecione o tipo de inscrição"
              error={errors.sucessaoTpInsc}
            />
            
            {/* Número de Inscrição */}
            <TextInput
              value={formData.sucessaoNrInsc}
              onChange={(value) => handleFieldChange('sucessaoNrInsc', value)}
              label="Número de inscrição do empregador anterior"
              placeholder="Digite o número de inscrição"
              error={errors.sucessaoNrInsc}
            />
            
            {/* Matrícula Anterior */}
            <TextInput
              value={formData.sucessaoMatricAnt}
              onChange={(value) => handleFieldChange('sucessaoMatricAnt', value)}
              label="Matrícula no empregador anterior"
              placeholder="Digite a matrícula anterior"
              error={errors.sucessaoMatricAnt}
            />
            
            {/* Data da Transferência */}
            <DateInput
              value={formData.sucessaoDtTransf}
              onChange={(value) => handleFieldChange('sucessaoDtTransf', value)}
              label="Data da transferência para o empregador atual"
              placeholder="DD/MM/AAAA"
              error={errors.sucessaoDtTransf}
            />
          </div>
        )}
        
        {/* Mensagem quando campos estão ocultos */}
        {!formData.sucessaoPreencher && (
          <div className="text-center py-8">
            <p className="text-gray-500">
              Marque a opção acima para preencher as informações de sucessão de vínculo.
            </p>
          </div>
        )}
      </div>
      
      {/* Botões de Ação */}
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