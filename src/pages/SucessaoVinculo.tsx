import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { PageLayout } from '../components/layout/PageLayout';
import { PageHeader } from '../components/layout/PageHeader';
import { ActionButtons } from '../components/ui/ActionButtons';
import { TextInput } from '../components/TextInput';
import { SelectInput } from '../components/SelectInput';
import { DateInput } from '../components/DateInput';
import { formatCPF } from '../utils/cpfUtils';
import { FormDataService } from '../services/formDataService';

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
  
  // Carregar dados salvos ao montar o componente
  useEffect(() => {
    const loadFormData = async () => {
      if (cpf) {
        try {
          const savedData = await FormDataService.getFormData(cpf);
          
          // Mapear dados salvos para o estado local
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
  
  // Configuração do breadcrumb
  const breadcrumbItems = [
    {
      label: 'Início',
      onClick: () => navigate('/')
    },
    {
      label: 'Registro de Processo'
    },
    {
      label: 'Informações de Sucessão de Vínculo'
    }
  ];
  
  // Opções para tipo de inscrição
  const tipoInscricaoOptions = [
    { value: '', label: 'Selecione o tipo de inscrição', description: 'Selecione uma das opções disponíveis' },
    { value: '1', label: '1 - CNPJ', description: 'Cadastro Nacional da Pessoa Jurídica' },
    { value: '2', label: '2 - CPF', description: 'Cadastro de Pessoas Físicas' },
    { value: '5', label: '5 - CGC', description: 'Cadastro Geral de Contribuintes' },
    { value: '6', label: '6 - CEI', description: 'Cadastro Específico do INSS' }
  ];
  
  // Função para atualizar campos do formulário
  const handleFieldChange = async (field: keyof SucessaoVinculoData, value: string | boolean) => {
    const newFormData = { ...formData, [field]: value };
    
    // Se desmarcou o checkbox, limpar os outros campos
    if (field === 'sucessaoPreencher' && !value) {
      newFormData.sucessaoTpInsc = '';
      newFormData.sucessaoNrInsc = '';
      newFormData.sucessaoMatricAnt = '';
      newFormData.sucessaoDtTransf = '';
      
      // Salvar campos vazios
      if (cpf) {
        try {
          await FormDataService.saveField(cpf, 'sucessaoTpInsc', '');
          await FormDataService.saveField(cpf, 'sucessaoNrInsc', '');
          await FormDataService.saveField(cpf, 'sucessaoMatricAnt', '');
          await FormDataService.saveField(cpf, 'sucessaoDtTransf', '');
        } catch (error) {
          console.error('Erro ao limpar campos:', error);
        }
      }
    }
    
    setFormData(newFormData);
    
    // Limpar erro do campo quando começar a digitar
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
    
    // Autosave
    if (cpf) {
      try {
        const saveValue = typeof value === 'boolean' ? value.toString() : value;
        await FormDataService.saveField(cpf, field, saveValue);
      } catch (error) {
        console.error('Erro ao salvar campo:', error);
      }
    }
  };
  
  // Handlers para os botões de ação
  const handleCancel = () => {
    navigate('/');
  };
  
  const handleSaveDraft = async () => {
    if (!cpf) return;
    
    setIsLoading(true);
    try {
      const dataToSave = {
        sucessaoPreencher: formData.sucessaoPreencher.toString(),
        sucessaoTpInsc: formData.sucessaoTpInsc,
        sucessaoNrInsc: formData.sucessaoNrInsc,
        sucessaoMatricAnt: formData.sucessaoMatricAnt,
        sucessaoDtTransf: formData.sucessaoDtTransf
      };
      
      await FormDataService.saveFormData(cpf, dataToSave);
      alert('Rascunho salvo com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar rascunho:', error);
      alert('Erro ao salvar rascunho');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handlePrevious = () => {
    navigate('/processo/informacoes-do-processo');
  };
  
  const handleNext = async () => {
    if (!cpf) return;
    
    setIsLoading(true);
    try {
      const dataToSave = {
        sucessaoPreencher: formData.sucessaoPreencher.toString(),
        sucessaoTpInsc: formData.sucessaoTpInsc,
        sucessaoNrInsc: formData.sucessaoNrInsc,
        sucessaoMatricAnt: formData.sucessaoMatricAnt,
        sucessaoDtTransf: formData.sucessaoDtTransf
      };
      
      await FormDataService.saveFormData(cpf, dataToSave);
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
      {/* Cabeçalho da Página */}
      <PageHeader
        title="Informações de Sucessão de Vínculo"
        cpf={cpf}
        formatCPF={formatCPF}
      />
      
      {/* Seção do Formulário */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-6 pb-3 border-b border-gray-200">
          Dados da Sucessão de Vínculo
        </h2>
        
        {/* Checkbox para habilitar/desabilitar seção */}
        <div className="mb-6">
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={formData.sucessaoPreencher}
              onChange={(e) => handleFieldChange('sucessaoPreencher', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm font-medium text-gray-700">
              Preencher informações de sucessão de vínculo?
            </span>
          </label>
        </div>
        
        {/* Campos condicionais */}
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