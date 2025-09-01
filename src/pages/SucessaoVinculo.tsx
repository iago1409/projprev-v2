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
import { formatCPF } from '../utils/cpfUtils';
import { FormDataService } from '../services/formDataService';

/**
 * SUCESSÃO DE VÍNCULO PAGE - Informações de Sucessão de Vínculo
 * 
 * Esta página permite o preenchimento das informações de sucessão de vínculo.
 * 
 * COMPONENTES UTILIZADOS:
 * 
 * 1. PageLayout: Layout padrão com breadcrumb integrado
 *    - Wrap principal da página
 *    - Breadcrumb automático baseado nos items fornecidos
 *    - Container responsivo centralizado
 * 
 * 2. PageHeader: Cabeçalho padronizado
 *    - Título principal da página
 *    - Subtítulo opcional
 *    - Exibição de CPF formatado (quando aplicável)
 * 
 * 3. ActionButtons: Botões de ação padronizados
 *    - Cancelar, Salvar Rascunho, Anterior, Próximo
 *    - Estados de loading
 *    - Configuração flexível de quais botões mostrar
 * 
 * 4. Form Components: Componentes de formulário reutilizáveis
 *    - TextInput: Campo de texto simples
 *    - SelectInput: Campo de seleção
 *    - RadioGroup: Grupo de radio buttons
 *    - DateInput: Campo de data com máscara
 */

// Interface para os dados do formulário
interface SucessaoVinculoData {
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
  
  // Carregar dados salvos ao montar o componente
  useEffect(() => {
    const loadFormData = async () => {
      if (cpf) {
        try {
          const savedData = await FormDataService.getFormData(cpf);
          setFormData({
            sucessaoTpInsc: savedData.sucessaoTpInsc || '',
            sucessaoNrInsc: savedData.sucessaoNrInsc || '',
            sucessaoMatricAnt: savedData.sucessaoMatricAnt || '',
            sucessaoDtTransf: savedData.sucessaoDtTransf || ''
          });
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
      label: 'Registro de Processo',
      onClick: () => navigate(`/registrar?cpf=${cpf}`)
    },
    {
      label: 'Sucessão de Vínculo'
    }
  ];
  
  // Função para atualizar campos do formulário
  const handleFieldChange = async (field: keyof SucessaoVinculoData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Limpar erro do campo quando começar a digitar
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
    
    // Salvar automaticamente
    if (cpf && value.trim() !== '') {
      try {
        await FormDataService.saveField(cpf, field, value);
      } catch (error) {
        console.error('Erro ao salvar campo:', error);
      }
    }
  };
  
  // Função de validação
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    // Por enquanto, sem validações específicas
    // Validações podem ser adicionadas conforme necessário
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handlers para os botões de ação
  const handleCancel = () => {
    navigate('/');
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
  
  const handlePrevious = () => {
    navigate(`/registrar?cpf=${cpf}&tab=contrato`);
  };
  
  const handleNext = async () => {
    if (!validateForm()) {
      return;
    }
    
    if (!cpf) return;
    
    setIsLoading(true);
    try {
      await FormDataService.saveFormData(cpf, formData);
      navigate(`/registrar?cpf=${cpf}&tab=consolidacao`);
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
