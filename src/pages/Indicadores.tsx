import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { PageLayout } from '../components/layout/PageLayout';
import { PageHeader } from '../components/layout/PageHeader';
import { ActionButtons } from '../components/ui/ActionButtons';
import { MainTabs } from '../components/navigation/MainTabs';
import { ProcessStepper } from '../components/ui/ProcessStepper';
import { formatCPF } from '../utils/cpfUtils';
import { IndicadoresFormData, FormErrors } from '../types';
import { FormDataService } from '../services/formDataService';
import { RadioGroup } from '../components/RadioGroup';

export const Indicadores: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const cpf = searchParams.get('cpf') || '';
  
  const [formData, setFormData] = useState<IndicadoresFormData>({
    indReint: '',
    indCateg: '',
    indNatAtiv: '',
    indMotDeslig: ''
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [shouldShowPage, setShouldShowPage] = useState(false);
  
  // Verificar condições de exibição e carregar dados
  useEffect(() => {
    const checkConditionsAndLoadData = async () => {
      if (cpf) {
        try {
          // Verificar condições de exibição
          const contratoData = await FormDataService.getFormData(cpf);
          const shouldShow = contratoData.tpContr !== '6' && contratoData.indContr === 'S';
          
          setShouldShowPage(shouldShow);
          
          if (shouldShow) {
            // Carregar dados dos indicadores
            const indicadoresData = await FormDataService.getIndicadoresData(cpf);
            setFormData(indicadoresData);
          } else {
            // Se não deve mostrar a página, pular para próxima etapa
            // Por enquanto, mostrar mensagem (futuramente navegar automaticamente)
            console.log('Etapa não aplicável - pular para próxima');
          }
        } catch (error) {
          console.error('Erro ao carregar dados:', error);
        }
      }
    };
    
    checkConditionsAndLoadData();
  }, [cpf]);
  
    const handleFieldChange = (field: keyof IndicadoresFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Limpar erro do campo quando começar a digitar
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
    
    // Salvar automaticamente
    if (cpf && value.trim() !== '') {
      try {
        FormDataService.saveField(cpf, field, value);
      } catch (error) {
        console.error('Erro ao salvar campo:', error);
      }
    }
  };
  
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    // Campos obrigatórios (ocorrência = 1)
    if (!formData.indCateg) {
      newErrors.indCateg = 'Campo obrigatório';
    }
    
    if (!formData.indNatAtiv) {
      newErrors.indNatAtiv = 'Campo obrigatório';
    }
    
    if (!formData.indMotDeslig) {
      newErrors.indMotDeslig = 'Campo obrigatório';
    }
    
    // indReint é opcional (ocorrência 0-1), não precisa validar
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSalvarRascunho = async () => {
    if (!cpf) return;
    
    setIsLoading(true);
    try {
      await FormDataService.saveIndicadoresData(cpf, formData);
      alert('Rascunho salvo com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar rascunho:', error);
      alert('Erro ao salvar rascunho');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleProximo = async () => {
    if (!validateForm()) {
      return;
    }
    
    if (!cpf) return;
    
    setIsLoading(true);
    try {
      await FormDataService.saveIndicadoresData(cpf, formData);
      // Navegar para próxima etapa - Consolidação dos Valores
      navigate(`/consolidacao?cpf=${cpf}`);
    } catch (error) {
      console.error('Erro ao salvar dados:', error);
      alert('Erro ao salvar dados');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCancelar = () => {
    navigate('/');
  };
  
  const handleAnterior = () => {
    navigate(`/registrar?cpf=${cpf}`);
  };
  
  // Breadcrumb items
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
      label: 'Indicadores'
    }
  ];
  
  // Process stepper steps
  const stepperSteps = [
    {
      id: 'contrato',
      label: 'Informações do Contrato',
      status: 'completed' as const
    },
    {
      id: 'indicadores', 
      label: 'Indicadores do Processo',
      status: 'current' as const
    },
    {
      id: 'consolidacao',
      label: 'Consolidação dos Valores do Contrato',
      status: 'pending' as const
    }
  ];
  
  // Se não deve mostrar a página
  if (!shouldShowPage) {
    return (
      <PageLayout breadcrumbItems={breadcrumbItems}>
        <PageHeader title="Indicadores do Processo" />
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Etapa não aplicável
            </h2>
            <p className="text-gray-600 mb-6">
              Esta etapa não se aplica ao tipo de contrato selecionado.
            </p>
            
            <ActionButtons
              onCancel={handleCancelar}
              onPrevious={handleAnterior}
              onNext={() => alert('Próxima etapa será implementada.')}
              showSaveDraft={false}
              nextLabel="PULAR ETAPA"
            />
          </div>
        </div>
      </PageLayout>
    );
  }
  
  return (
    <PageLayout breadcrumbItems={breadcrumbItems}>
      <PageHeader
        title="Indicadores do Processo"
        cpf={cpf}
        formatCPF={formatCPF}
      />
      
      {/* Main Tabs */}
      <MainTabs activeTab="decisao" cpf={cpf} />
      
      {/* Process Stepper */}
      <ProcessStepper steps={stepperSteps} />
      
      {/* Formulário de Indicadores */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-6 pb-3 border-b border-gray-200">
          Indicadores do Processo
        </h2>
        
        <div className="space-y-6">
          {/* Indicativo de reintegração do empregado */}
          <RadioGroup
            value={formData.indReint}
            onChange={(value) => handleFieldChange('indReint', value)}
            options={[
              { value: 'S', label: 'Sim' },
              { value: 'N', label: 'Não' }
            ]}
            name="indReint"
            label="Indicativo de reintegração do empregado"
            error={errors.indReint}
          />
          
          {/* Indicativo se houve reconhecimento de categoria do trabalhador diferente */}
          <RadioGroup
            value={formData.indCateg}
            onChange={(value) => handleFieldChange('indCateg', value)}
            options={[
              { value: 'S', label: 'Sim' },
              { value: 'N', label: 'Não' }
            ]}
            name="indCateg"
            label="Indicativo se houve reconhecimento de categoria do trabalhador diferente da informada (no eSocial ou na GFIP) pelo declarante"
            required
            error={errors.indCateg}
          />
          
          {/* Indicativo se houve reconhecimento da natureza da atividade diferente */}
          <RadioGroup
            value={formData.indNatAtiv}
            onChange={(value) => handleFieldChange('indNatAtiv', value)}
            options={[
              { value: 'S', label: 'Sim' },
              { value: 'N', label: 'Não' }
            ]}
            name="indNatAtiv"
            label="Indicativo se houve reconhecimento da natureza da atividade diferente da cadastrada pelo declarante"
            required
            error={errors.indNatAtiv}
          />
          
          {/* Indicativo se houve reconhecimento de motivo de desligamento diferente */}
          <RadioGroup
            value={formData.indMotDeslig}
            onChange={(value) => handleFieldChange('indMotDeslig', value)}
            options={[
              { value: 'S', label: 'Sim' },
              { value: 'N', label: 'Não' }
            ]}
            name="indMotDeslig"
            label="Indicativo se houve reconhecimento de motivo de desligamento diferente do informado pelo declarante"
            required
            error={errors.indMotDeslig}
          />
        </div>
      </div>
      
      {/* Action Buttons */}
      <ActionButtons
        onCancel={handleCancelar}
        onSaveDraft={handleSalvarRascunho}
        onPrevious={handleAnterior}
        onNext={handleProximo}
        isLoading={isLoading}
      />
    </PageLayout>
  );
};