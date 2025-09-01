import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PageLayout } from '../components/layout/PageLayout';
import { PageHeader } from '../components/layout/PageHeader';
import { ActionButtons } from '../components/ui/ActionButtons';
import { formatCPF } from '../utils/cpfUtils';
import { FormDataService } from '../services/formDataService';

interface SucessaoVinculoData {
  // Fields will be added based on your next prompt
}

interface FormErrors {
  // Error fields will be added based on your next prompt
}

const DEFAULT_DATA: SucessaoVinculoData = {
  // Default values will be added based on your next prompt
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
        // Data mapping will be added based on your next prompt
        setFormData(savedData as SucessaoVinculoData);
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
      await FormDataService.saveField(cpf, field, value as string);
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

  // Configuração do breadcrumb
  const breadcrumbItems = [
    { label: 'Início', onClick: () => navigate('/') },
    { label: 'Registro de Processo', onClick: () => navigate('/registrar') },
    { label: 'Informações de Sucessão de Vínculo' },
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

        {/* Form fields will be added here based on your next prompt */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Fields will be added based on your specifications */}
        </div>
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