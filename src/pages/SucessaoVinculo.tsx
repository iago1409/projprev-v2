import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PageLayout } from '../components/layout/PageLayout';
import { PageHeader } from '../components/layout/PageHeader';
import { ActionButtons } from '../components/ui/ActionButtons';
import { formatCPF } from '../utils/cpfUtils';
import { FormDataService } from '../services/formDataService';

/**
 * INFORMAÇÕES DE SUCESSÃO DE VÍNCULO
 * 
 * Esta página gerencia as informações de sucessão de vínculo trabalhista.
 * Baseada no TemplatePage.tsx e integrada ao sistema de navegação por abas.
 */

// Interface para os dados do formulário (AGUARDANDO ESPECIFICAÇÃO DOS CAMPOS)
interface SucessaoVinculoData {
  // Campos serão adicionados conforme especificação
}

// Interface para erros de validação (AGUARDANDO ESPECIFICAÇÃO DOS CAMPOS)
interface FormErrors {
  // Campos de erro serão adicionados conforme especificação
}

// Dados padrão (AGUARDANDO ESPECIFICAÇÃO DOS CAMPOS)
const DEFAULT_DATA: SucessaoVinculoData = {
  // Valores padrão serão adicionados conforme especificação
};

export const SucessaoVinculo: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const cpf = searchParams.get('cpf') || '';
  
  // Estado do formulário
  const [formData, setFormData] = useState<SucessaoVinculoData>(DEFAULT_DATA);
  
  // Estado de erros
  const [errors, setErrors] = useState<FormErrors>({});
  
  // Estado de loading
  const [isLoading, setIsLoading] = useState(false);
  
  // Carregar dados existentes
  useEffect(() => {
    const loadFormData = async () => {
      if (!cpf) return;
      try {
        const savedData = await FormDataService.getFormData(cpf);
        // Mapeamento de dados será implementado quando os campos forem definidos
        setFormData(savedData as SucessaoVinculoData);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      }
    };
    loadFormData();
  }, [cpf]);
  
  // Salvar campo individual
  const saveField = async (field: keyof SucessaoVinculoData, value: string) => {
    if (!cpf) return;
    try {
      await FormDataService.saveField(cpf, field, value);
    } catch (error) {
      console.error('Erro ao salvar campo:', field, error);
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
  
  // Função de validação (SERÁ IMPLEMENTADA QUANDO OS CAMPOS FOREM DEFINIDOS)
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    // Validações serão implementadas conforme os campos
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
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
      label: 'Informações de Sucessão de Vínculo'
    }
  ];
  
  // Handlers dos botões de ação
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
      {/* Cabeçalho da Página */}
      <PageHeader
        title="Informações de Sucessão de Vínculo"
        subtitle="Configure as informações de sucessão de vínculo trabalhista"
        cpf={cpf}
        formatCPF={formatCPF}
      />
      
      {/* Seção do Formulário */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-6 pb-3 border-b border-gray-200">
          Dados da Sucessão de Vínculo
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Campos serão adicionados aqui conforme especificação */}
          <div className="md:col-span-2">
            <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Campos em Desenvolvimento
              </h3>
              <p className="text-gray-600">
                Os campos desta seção serão implementados conforme especificação.
              </p>
              {cpf && (
                <p className="text-sm text-gray-500 mt-2">
                  CPF: {formatCPF(cpf)}
                </p>
              )}
            </div>
          </div>
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