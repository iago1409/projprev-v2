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
import { motivoDesligamentoOptions } from '../data/motivoDesligamentoOptions';
import { tipoRegimeTrabOptions, tipoRegimePrevOptions, tipoContratoParcialOptions } from '../data/tipoRegimeOptions';

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
    indContr: 'S', // Default para S
    dtDeslig: '',
    mtvDeslig: '',
    dtProjFimAPI: '',
    tpRegTrab: '',
    tpRegPrev: '',
    dtAdm: '',
    tpRegTrabParc: ''
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
  
  // Função para validar se uma data é igual ou posterior a outra
  const isDateEqualOrAfter = (dateString1: string, dateString2: string): boolean => {
    if (!dateString1 || !dateString2) return true;
    
    const parseDate = (dateStr: string): Date => {
      const [day, month, year] = dateStr.split('/').map(Number);
      return new Date(year, month - 1, day);
    };
    
    const date1 = parseDate(dateString1);
    const date2 = parseDate(dateString2);
    
    return date1 >= date2;
  };
  
  // Função para validar se data não é superior à data atual + 10 dias
  const isDateWithin10Days = (dateString: string): boolean => {
    if (!dateString) return true;
    
    const [day, month, year] = dateString.split('/').map(Number);
    const inputDate = new Date(year, month - 1, day);
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 10);
    
    return inputDate <= maxDate;
  };
  
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
    
    // Validações da seção de desligamento
    if (formData.dtDeslig) {
      // Validar se dtDeslig é igual ou posterior à dtAdm
      if (formData.dtAdm && !isDateEqualOrAfter(formData.dtDeslig, formData.dtAdm)) {
        newErrors.dtDeslig = 'Data deve ser igual ou posterior à data de admissão';
      }
      
      // Validar se dtDeslig não é superior à data atual + 10 dias
      if (!isDateWithin10Days(formData.dtDeslig)) {
        newErrors.dtDeslig = 'Data não pode ser superior à data atual acrescida de 10 dias';
      }
    }
    
    // Validar motivo de desligamento se data de desligamento estiver preenchida
    if (formData.dtDeslig && !formData.mtvDeslig) {
      newErrors.mtvDeslig = 'Campo obrigatório quando data de desligamento é informada';
    }
    
    // Validar dtProjFimAPI se informada
    if (formData.dtProjFimAPI) {
      if (!formData.dtDeslig) {
        newErrors.dtProjFimAPI = 'Data de desligamento deve ser informada primeiro';
      } else if (!isDateEqualOrAfter(formData.dtProjFimAPI, formData.dtDeslig)) {
        newErrors.dtProjFimAPI = 'Data deve ser igual ou posterior à data de desligamento';
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
          <>
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

            </div>
          </div>
          </>
        )}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-6 pb-3 border-b border-gray-200">
            Indicadores do Processo
          </h3>
          
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
        
        {/* Seção de Informações do Desligamento */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-6 pb-3 border-b border-gray-200">
            Informações do Desligamento
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Data de Desligamento */}
            <DateInput
              value={formData.dtDeslig}
              onChange={(value) => handleFieldChange('dtDeslig', value)}
              label="Data de Desligamento"
              error={errors.dtDeslig}
              tooltip="Data de desligamento do trabalhador"
            />
            
            {/* Motivo de Desligamento */}
            <SelectInput
              value={formData.mtvDeslig}
              onChange={(value) => handleFieldChange('mtvDeslig', value)}
              options={motivoDesligamentoOptions}
              label="Motivo de Desligamento"
              placeholder="Selecione o motivo"
              error={errors.mtvDeslig}
            />
            
            {/* Data Projetada para Fim do Aviso Prévio Indenizado */}
            <div className="md:col-span-2">
              <DateInput
                value={formData.dtProjFimAPI}
                onChange={(value) => handleFieldChange('dtProjFimAPI', value)}
                label="Data Projetada para Fim do Aviso Prévio Indenizado"
                error={errors.dtProjFimAPI}
                tooltip="Data projetada para o fim do aviso prévio indenizado"
              />
            </div>
          </div>
        </div>
        

        
        {/* Seção de Mudança de Categoria */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-6 pb-3 border-b border-gray-200">
            Mudança de Categoria
          </h3>
          
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
        
        {/* Seção de Informações Complementares do Contrato */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-6 pb-3 border-b border-gray-200">
            Informações Complementares do Contrato
          </h3>
          
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
        
        {activeTab === 'consolidacao' && <ConsolidacaoTab cpf={cpf} />}


              {/* Aba de Vínculo Trabalhista */}
        {activeTab === 'vinculo' && (
          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-6 pb-3 border-b border-gray-200">
              Informações de Vínculo Trabalhista
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Tipo de Regime Trabalhista */}
              <div className="md:col-span-2">
                <SelectInput
                  value={formData.tpRegTrab || ''}
                  onChange={(value) => handleFieldChange('tpRegTrab', value)}
                  options={tipoRegimeTrabOptions}
                  label="Tipo de regime trabalhista"
                  placeholder="Selecione o tipo de regime trabalhista"
                  required
                  error={errors.tpRegTrab}
                />
              </div>
              
              {/* Tipo de Regime Previdenciário */}
              <div className="md:col-span-2">
                <SelectInput
                  value={formData.tpRegPrev || ''}
                  onChange={(value) => handleFieldChange('tpRegPrev', value)}
                  options={tipoRegimePrevOptions}
                  label="Tipo de regime previdenciário"
                  placeholder="Selecione o tipo de regime previdenciário"
                  required
                  error={errors.tpRegPrev}
                />
              </div>
              
              {/* Data de Admissão */}
              <DateInput
                value={formData.dtAdm || ''}
                onChange={(value) => handleFieldChange('dtAdm', value)}
                label="Data de admissão"
                required
                error={errors.dtAdm}
                tooltip="Data de admissão do trabalhador. Deve ser posterior à data de nascimento."
              />
              
              {/* Código relativo ao tipo de contrato em tempo parcial */}
              <SelectInput
                value={formData.tpRegTrabParc || ''}
                onChange={(value) => handleFieldChange('tpRegTrabParc', value)}
                options={tipoContratoParcialOptions}
                label="Código relativo ao tipo de contrato em tempo parcial"
                placeholder="Selecione o tipo de contrato"
                error={errors.tpRegTrabParc}
              />
            </div>
          </div>
        )}
        
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-6 pb-3 border-b border-gray-200">
        
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