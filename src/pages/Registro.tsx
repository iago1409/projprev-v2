import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { PageLayout } from '../components/layout/PageLayout';
import { PageHeader } from '../components/layout/PageHeader';
import { ActionButtons } from '../components/ui/ActionButtons';
import { MainTabs } from '../components/navigation/MainTabs';
import { SubTabs } from '../components/navigation/SubTabs';
import { ProcessStepper } from '../components/ui/ProcessStepper';
import { formatCPF } from '../utils/cpfUtils';
import { ContratoFormData, FormErrors } from '../types';
import { FormDataService } from '../services/formDataService';
import { SelectInput } from '../components/SelectInput';
import { TextInput } from '../components/TextInput';
import { DateInput } from '../components/DateInput';
import { RadioGroup } from '../components/RadioGroup';
import { ConsolidacaoTab } from '../components/ConsolidacaoTab';
import { tipoContratoOptions } from '../data/tipoContratoOptions';

export const Registro: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const cpf = searchParams.get('cpf') || '';
  const activeTab = searchParams.get('tab') || 'contrato';
  
  const [formData, setFormData] = useState<ContratoFormData>({
    tpContr: '',
    matricula: '',
    dtInicio: '',
    dtAdmOrig: '',
    indReintegr: '',
    indContr: 'S' // Default para S
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  
  const handleTabChange = (tab: string) => {
    navigate(`/registrar?cpf=${cpf}&tab=${tab}`);
  };
  
  // Carregar dados salvos ao montar o componente
  useEffect(() => {
    const loadFormData = async () => {
      if (cpf) {
        try {
          const savedData = await FormDataService.getFormData(cpf);
          setFormData(savedData);
        } catch (error) {
          console.error('Erro ao carregar dados:', error);
        }
      }
    };
    
    loadFormData();
  }, [cpf]);
  
  // Verificar se dtInicio deve ser exibido
  const shouldShowDtInicio = formData.indContr === 'N' && formData.tpContr === '6';
  
  // Verificar se dtAdmOrig é obrigatório
  const isDtAdmOrigRequired = ['2', '4'].includes(formData.tpContr);
  
  const handleFieldChange = async (field: keyof ContratoFormData, value: string) => {
    const newFormData = { ...formData, [field]: value };
    
    // Limpar dtInicio se não deve mais ser exibido
    if (field === 'tpContr' || field === 'indContr') {
      const newShouldShow = newFormData.indContr === 'N' && newFormData.tpContr === '6';
      if (!newShouldShow) {
        newFormData.dtInicio = '';
      }
    }
    
    setFormData(newFormData);
    
    // Limpar erro do campo
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
  
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    // tpContr é obrigatório
    if (!formData.tpContr) {
      newErrors.tpContr = 'Campo obrigatório';
    }
    
    // indReintegr é obrigatório
    if (!formData.indReintegr) {
      newErrors.indReintegr = 'Campo obrigatório';
    }
    
    // dtInicio é obrigatório quando visível
    if (shouldShowDtInicio && !formData.dtInicio) {
      newErrors.dtInicio = 'Campo obrigatório';
    }
    
    // dtAdmOrig é obrigatório quando tpContr é 2 ou 4
    if (isDtAdmOrigRequired && !formData.dtAdmOrig) {
      newErrors.dtAdmOrig = 'Campo obrigatório';
    }
    
    // Validar matrícula se preenchida
    if (formData.matricula && (formData.matricula.length < 1 || formData.matricula.length > 30)) {
      newErrors.matricula = 'Matrícula deve ter entre 1 e 30 caracteres';
    }
    
    // Validar código CBO se preenchido
    if (formData.codCBO) {
      const cboRegex = /^\d{6}$/;
      if (!cboRegex.test(formData.codCBO)) {
        newErrors.codCBO = 'Código CBO deve conter exatamente 6 dígitos numéricos';
      }
    }
    
    // Validações da aba de vínculo trabalhista
    if (activeTab === 'vinculo') {
      if (!formData.tpRegTrab) {
        newErrors.tpRegTrab = 'Campo obrigatório';
      }
      
      if (!formData.tpRegPrev) {
        newErrors.tpRegPrev = 'Campo obrigatório';
      }
      
      if (!formData.dtAdm) {
        newErrors.dtAdm = 'Campo obrigatório';
      }
    }
    
    // Validações dos indicadores (campos obrigatórios)
    if (!formData.indCateg) {
      newErrors.indCateg = 'Campo obrigatório';
    }
    
    if (!formData.indNatAtiv) {
      newErrors.indNatAtiv = 'Campo obrigatório';
    }
    
    if (!formData.indMotDeslig) {
      newErrors.indMotDeslig = 'Campo obrigatório';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSalvarRascunho = async () => {
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
  
  const handleProximo = async () => {
    if (!validateForm()) {
      return;
    }
    
    if (!cpf) return;
    
    setIsLoading(true);
    try {
      await FormDataService.saveFormData(cpf, formData);
      // Navegar para próxima etapa - Indicadores
      navigate(`/indicadores?cpf=${cpf}`);
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
    navigate('/');
  };
  
  // Breadcrumb items
  const breadcrumbItems = [
    {
      label: 'Início',
      onClick: () => navigate('/')
    },
    {
      label: 'Registro de Processo'
    }
  ];
  
  // Process stepper steps
  const stepperSteps = [
    {
      id: 'contrato',
      label: 'Informações do Contrato',
      status: 'current' as const
    },
    {
      id: 'consolidacao', 
      label: 'Consolidação dos Valores do Contrato',
      status: 'pending' as const
    }
  ];
  
  return (
    <PageLayout breadcrumbItems={breadcrumbItems}>
      <PageHeader
        title="Registro de Processo"
        cpf={cpf}
        formatCPF={formatCPF}
      />
      
      {/* Main Tabs */}
      <MainTabs activeTab="dados" cpf={cpf} />
      
      {/* Sub Tabs */}
      <SubTabs activeTab={activeTab as any} cpf={cpf} />
      
      {/* Process Stepper */}
      <ProcessStepper steps={stepperSteps} />
        
        {/* Formulário */}
        {activeTab === 'contrato' && (
          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Tipo de Contrato */}
              <div className="md:col-span-2">
                <SelectInput
                  value={formData.tpContr}
                  onChange={(value) => handleFieldChange('tpContr', value)}
                  options={tipoContratoOptions}
                  label="Tipo de contrato"
                  placeholder="Selecione o tipo de contrato"
                  required
                  error={errors.tpContr}
                />
              </div>
              
              {/* Matrícula */}
              <TextInput
                value={formData.matricula}
                onChange={(value) => handleFieldChange('matricula', value)}
                label="Matrícula"
                placeholder="Digite a matrícula"
                maxLength={30}
                error={errors.matricula}
                tooltip="Matrícula atribuída ao trabalhador pela empresa ou, no caso de servidor público, a matrícula constante no Sistema de Administração de Recursos Humanos do órgão."
              />
              
              {/* Data de Início (TSVE) - Condicional */}
              {shouldShowDtInicio && (
                <DateInput
                  value={formData.dtInicio}
                  onChange={(value) => handleFieldChange('dtInicio', value)}
                  label="Data de Início (TSVE)"
                  required
                  error={errors.dtInicio}
                  tooltip="Data de início de TSVE (cooperado, diretor não empregado, dirigente sindical, estagiário, trabalhador avulso, servidor público em cargo eletivo, etc.)."
                />
              )}
              
              {/* Data de Admissão Original */}
              <DateInput
                value={formData.dtAdmOrig}
                onChange={(value) => handleFieldChange('dtAdmOrig', value)}
                label="Data de Admissão Original"
                required={isDtAdmOrigRequired}
                error={errors.dtAdmOrig}
              />
              
              {/* O trabalhador foi reintegrado? */}
              <div className="md:col-span-2">
                <RadioGroup
                  value={formData.indReintegr}
                  onChange={(value) => handleFieldChange('indReintegr', value)}
                  options={[
                    { value: 'S', label: 'Sim' },
                    { value: 'N', label: 'Não' }
                  ]}
                  name="indReintegr"
                  label="O trabalhador foi reintegrado?"
                  required
                  error={errors.indReintegr}
                />
              </div>
              
              {/* Seção de Indicadores */}
              <div className="md:col-span-2 mt-8 pt-8 border-t border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-6">Indicadores do Processo</h3>
                
                <div className="space-y-6">
                  {/* Indicativo de reintegração do empregado */}
                  <RadioGroup
                    value={formData.indReint || ''}
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
                    value={formData.indCateg || ''}
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
                    value={formData.indNatAtiv || ''}
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
                    value={formData.indMotDeslig || ''}
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
              
              {/* Seção de Mudança de Categoria */}
              <div className="md:col-span-2 mt-8 pt-8 border-t border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-6">Mudança de Categoria</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Código da Categoria */}
                  <TextInput
                    value={formData.codCateg || ''}
                    onChange={(value) => handleFieldChange('codCateg', value)}
                    label="Código da Categoria"
                    placeholder="Digite o código da categoria"
                    error={errors.codCateg}
                  />

                  {/* Natureza da Atividade */}
                  <SelectInput
                    value={formData.natAtividade || ''}
                    onChange={(value) => handleFieldChange('natAtividade', value)}
                    options={[
                      {
                        value: '1',
                        label: 'Urbano',
                        description: 'Atividade urbana'
                      },
                      {
                        value: '2', 
                        label: 'Rural',
                        description: 'Atividade rural'
                      }
                    ]}
                    label="Natureza da Atividade"
                    placeholder="Selecione a natureza da atividade"
                    error={errors.natAtividade}
                  />

                  {/* Data da Mudança */}
                  <DateInput
                    value={formData.dtMudCategAtiv || ''}
                    onChange={(value) => handleFieldChange('dtMudCategAtiv', value)}
                    label="Data da Mudança"
                    placeholder="DD/MM/AAAA"
                    error={errors.dtMudCategAtiv}
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Seção de Informações Complementares do Contrato */}
          <div className="md:col-span-2 mt-8 pt-8 border-t border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-6">Informações Complementares do Contrato</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Código CBO */}
              <TextInput
                value={formData.codCBO || ''}
                onChange={(value) => handleFieldChange('codCBO', value)}
                label="Código CBO"
                placeholder="Digite o código CBO (6 dígitos)"
                maxLength={6}
                error={errors.codCBO}
                tooltip="Código da CBO – Classificação Brasileira de Ocupações (6 posições numéricas)"
              />
              
              {/* Natureza da Atividade */}
              <SelectInput
                value={formData.natAtividadeCompl || ''}
                onChange={(value) => handleFieldChange('natAtividadeCompl', value)}
                options={[
                  {
                    value: '1',
                    label: 'Trabalho urbano',
                    description: 'Atividade desenvolvida em área urbana'
                  },
                  {
                    value: '2', 
                    label: 'Trabalho rural',
                    description: 'Atividade desenvolvida em área rural'
                  }
                ]}
                label="Natureza da Atividade"
                placeholder="Selecione a natureza da atividade"
                error={errors.natAtividadeCompl}
              />
            </div>
          </div>
          
          {/* Seção de Informações de Vínculo Trabalhista */}
          <div className="md:col-span-2 mt-8 pt-8 border-t border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-6">Informações de Vínculo Trabalhista</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Tipo de regime trabalhista */}
              <SelectInput
                value={formData.tpRegTrab || ''}
                onChange={(value) => handleFieldChange('tpRegTrab', value)}
                options={[
                  {
                    value: '1',
                    label: 'CLT – Consolidação das Leis do Trabalho',
                    description: 'CLT – Consolidação das Leis do Trabalho e legislações trabalhistas específicas'
                  },
                  {
                    value: '2',
                    label: 'Estatutário/legislações específicas',
                    description: 'Estatutário/legislações específicas (servidor temporário, militar, agente político etc.)'
                  }
                ]}
                label="Tipo de regime trabalhista"
                placeholder="Selecione o tipo de regime trabalhista"
                required
                error={errors.tpRegTrab}
              />
              
              {/* Tipo de regime previdenciário */}
              <SelectInput
                value={formData.tpRegPrev || ''}
                onChange={(value) => handleFieldChange('tpRegPrev', value)}
                options={[
                  {
                    value: '1',
                    label: 'RGPS',
                    description: 'Regime Geral de Previdência Social – RGPS'
                  },
                  {
                    value: '2',
                    label: 'RPPS',
                    description: 'Regime Próprio de Previdência Social – RPPS'
                  },
                  {
                    value: '3',
                    label: 'Regime no exterior',
                    description: 'Regime de Previdência Social no exterior'
                  }
                ]}
                label="Tipo de regime previdenciário"
                placeholder="Selecione o tipo de regime previdenciário"
                required
                error={errors.tpRegPrev}
              />
              
              {/* Data de admissão */}
              <DateInput
                value={formData.dtAdm || ''}
                onChange={(value) => handleFieldChange('dtAdm', value)}
                label="Data de admissão"
                placeholder="DD/MM/AAAA"
                required
                error={errors.dtAdm}
                tooltip="Data de admissão do trabalhador. Deve ser posterior à data de nascimento e, se existir, anterior ou igual à data de óbito."
              />
              
              {/* Código relativo ao tipo de contrato em tempo parcial */}
              <SelectInput
                value={formData.tpRegTrabParc || ''}
                onChange={(value) => handleFieldChange('tpRegTrabParc', value)}
                options={[
                  {
                    value: '0',
                    label: 'Não é contrato em tempo parcial',
                    description: 'Contrato de trabalho em tempo integral'
                  },
                  {
                    value: '1',
                    label: 'Limitado a 25 horas semanais',
                    description: 'Contrato em tempo parcial limitado a 25 horas semanais'
                  },
                  {
                    value: '2',
                    label: 'Limitado a 30 horas semanais',
                    description: 'Contrato em tempo parcial limitado a 30 horas semanais'
                  },
                  {
                    value: '3',
                    label: 'Limitado a 26 horas semanais',
                    description: 'Contrato em tempo parcial limitado a 26 horas semanais'
                  }
                ]}
                label="Código relativo ao tipo de contrato em tempo parcial"
                placeholder="Selecione o tipo de contrato"
                error={errors.tpRegTrabParc}
              />
            </div>
          </div>
        )}
        
        {activeTab === 'consolidacao' && <ConsolidacaoTab cpf={cpf} />}
        
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