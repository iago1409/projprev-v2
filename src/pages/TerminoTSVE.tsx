import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSearchParams } from 'react-router-dom';
import { PageLayout } from '../components/layout/PageLayout';
import { PageHeader } from '../components/layout/PageHeader';
import { ActionButtons } from '../components/ui/ActionButtons';
import { SubTabs } from '../components/navigation/SubTabs';
import { SelectInput } from '../components/SelectInput';
import { DateInput } from '../components/DateInput';
import { formatCPF } from '../utils/cpfUtils';
import { FormDataService } from '../services/formDataService';

// Interface para os dados do formulário
interface TerminoTSVEData {
  preencherInfo: boolean;
  dtTerm: string;
  mtvDesligTSV: string;
}

// Interface para erros de validação
interface FormErrors {
  dtTerm?: string;
  mtvDesligTSV?: string;
}

export const TerminoTSVE: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const cpf = searchParams.get('cpf') || '';
  const activeTab = 'termino';
  
  // Estado do formulário
  const [formData, setFormData] = useState<TerminoTSVEData>({
    preencherInfo: false,
    dtTerm: '',
    mtvDesligTSV: ''
  });
  
  // Estado de erros
  const [errors, setErrors] = useState<FormErrors>({});
  
  // Estado de loading
  const [isLoading, setIsLoading] = useState(false);
  
  // Opções para motivo de desligamento TSVE
  const motivoDesligamentoOptions = [
    { value: '', label: 'Selecione o motivo', description: 'Selecione uma das opções disponíveis' },
    { value: '01', label: '01 - Exoneração do diretor não empregado sem justa causa', description: 'Por deliberação da assembleia dos sócios cotistas ou da autoridade competente' },
    { value: '02', label: '02 - Término de mandato do diretor não empregado', description: 'Que não tenha sido reconduzido ao cargo' },
    { value: '03', label: '03 - Exoneração a pedido do diretor não empregado', description: 'Por solicitação própria' },
    { value: '04', label: '04 - Exoneração do diretor não empregado por culpa recíproca', description: 'Ou força maior' },
    { value: '05', label: '05 - Morte do diretor não empregado', description: 'Falecimento' },
    { value: '06', label: '06 - Exoneração do diretor não empregado por falência', description: 'Encerramento ou supressão de parte da empresa' },
    { value: '99', label: '99 - Outros', description: 'Outros motivos não especificados' }
  ];
  
  // Carregar dados salvos ao montar o componente
  useEffect(() => {
    const loadFormData = async () => {
      if (cpf) {
        try {
          const savedData = await FormDataService.getFormData(cpf);
          setFormData({
            preencherInfo: savedData.preencherInfo || false,
            dtTerm: savedData.dtTerm || '',
            mtvDesligTSV: savedData.mtvDesligTSV || ''
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
      label: 'Informações de término de TSVE'
    }
  ];
  
  // Função para atualizar campos do formulário
  const handleFieldChange = async (field: keyof TerminoTSVEData, value: string) => {
    const newValue = field === 'preencherInfo' ? value === 'true' : value;
    setFormData(prev => ({ ...prev, [field]: newValue }));
    
    // Limpar erro do campo quando começar a digitar
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
    
    // Salvar automaticamente
    if (cpf && (field === 'preencherInfo' || value.trim() !== '')) {
      try {
        await FormDataService.saveField(cpf, field, field === 'preencherInfo' ? String(newValue) : value);
      } catch (error) {
        console.error('Erro ao salvar campo:', error);
      }
    }
  };
  
  // Função especial para o checkbox
  const handleCheckboxChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, preencherInfo: checked }));
    
    // Se desmarcou, limpar todos os campos
    if (!checked) {
      setFormData(prev => ({
        ...prev,
        preencherInfo: false,
        dtTerm: '',
        mtvDesligTSV: ''
      }));
      
      // Limpar erros
      setErrors({});
    }
    
    // Salvar estado do checkbox
    if (cpf) {
      try {
        FormDataService.saveField(cpf, 'preencherInfo', String(checked));
      } catch (error) {
        console.error('Erro ao salvar checkbox:', error);
      }
    }
  };
  
  // Função de validação
  const validateForm = (): boolean => {
    // Se não marcou para preencher, não há o que validar
    if (!formData.preencherInfo) {
      return true;
    }
    
    const newErrors: FormErrors = {};
    
    // Validar data de término (obrigatório)
    if (!formData.dtTerm) {
      newErrors.dtTerm = 'Campo obrigatório';
    }
    
    // Validar motivo de desligamento (obrigatório)
    if (!formData.mtvDesligTSV) {
      newErrors.mtvDesligTSV = 'Campo obrigatório';
    } else if (!['01', '02', '03', '04', '05', '06', '99'].includes(formData.mtvDesligTSV)) {
      newErrors.mtvDesligTSV = 'Valor inválido';
    }
    
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
        title="Informações de término de TSVE"
        subtitle="Preencha as informações de término de TSVE"
        cpf={cpf}
        formatCPF={formatCPF}
      />
      
      {/* Sub Tabs */}
      <SubTabs activeTab={activeTab} cpf={cpf} />
      
      {/* Seção do Formulário */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-6 pb-3 border-b border-gray-200">
          Dados de Término de TSVE
        </h2>
        
        {/* Caixinha de controle */}
        <div className="mb-8">
          <div className="bg-blue-50 p-6 rounded-lg">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.preencherInfo}
                onChange={(e) => handleCheckboxChange(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-3 text-lg font-medium text-gray-900">
                Preencher informações?
              </span>
            </label>
            <p className="mt-2 text-sm text-gray-600 ml-7">
              Marque esta opção se deseja preencher as informações de término de TSVE
            </p>
          </div>
        </div>
        
        {/* Campos do formulário - só aparecem se checkbox marcado */}
        {formData.preencherInfo && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Data do término */}
            <DateInput
              value={formData.dtTerm}
              onChange={(value) => handleFieldChange('dtTerm', value)}
              label="Data do término"
              placeholder="DD/MM/AAAA"
              required
              error={errors.dtTerm}
              tooltip="Preencher com a data do término do TSVE"
            />
            
            {/* Motivo do desligamento TSVE */}
            <SelectInput
              value={formData.mtvDesligTSV}
              onChange={(value) => handleFieldChange('mtvDesligTSV', value)}
              options={motivoDesligamentoOptions}
              label="Motivo do desligamento TSVE"
              placeholder="Selecione o motivo"
              required
              error={errors.mtvDesligTSV}
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