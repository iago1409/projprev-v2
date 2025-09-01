import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '../components/layout/PageLayout';
import { PageHeader } from '../components/layout/PageHeader';
import { ActionButtons } from '../components/ui/ActionButtons';
import { MainTabs } from '../components/navigation/MainTabs';
import { ProcessoService } from '../services/ProcessoService';

interface FormData {
  multiplosEnable: string;
  ideSeqTrab: string;
}

interface FormErrors {
  multiplosEnable?: string;
  ideSeqTrab?: string;
}

function MesmoProcessoMultiplosEventos() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    multiplosEnable: '',
    ideSeqTrab: ''
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  // Simular um processo_id para fins de demonstração
  const processoId = 'processo_001';

  const handleInputChange = (field: keyof FormData, value: string) => {
    let processedValue = value;
    
    // Aplicar validações específicas
    if (field === 'ideSeqTrab') {
      // Permitir apenas dígitos e limitar a 3 caracteres
      processedValue = value.replace(/\D/g, '').slice(0, 3);
    }

    setFormData(prev => ({
      ...prev,
      [field]: processedValue
    }));

    // Limpar erro do campo quando começar a digitar
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  // Controlar exibição do campo ideSeqTrab baseado na seleção da caixinha
  const handleMultiplosEnableChange = async (value: string) => {
    setFormData(prev => ({ ...prev, multiplosEnable: value }));
    
    if (value === 'N') {
      // Limpar dados do ideSeqTrab
      await ProcessoService.clearField(processoId, 'ideTrab.ideSeqTrab');
      
      setFormData(prev => ({
        ...prev,
        ideSeqTrab: ''
      }));
      
      // Limpar erros do ideSeqTrab
      setErrors(prev => ({
        ...prev,
        ideSeqTrab: undefined
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Validar seleção da caixinha
    if (!formData.multiplosEnable) {
      newErrors.multiplosEnable = 'Selecione Sim ou Não.';
    } else if (!['S', 'N'].includes(formData.multiplosEnable)) {
      newErrors.multiplosEnable = 'Valor inválido.';
    }

    // Validar ideSeqTrab apenas se multiplosEnable = 'S'
    if (formData.multiplosEnable === 'S') {
      if (!formData.ideSeqTrab) {
        newErrors.ideSeqTrab = 'Informe um número de 1 a 999.';
      } else {
        const numValue = parseInt(formData.ideSeqTrab, 10);
        
        if (!/^\d+$/.test(formData.ideSeqTrab)) {
          newErrors.ideSeqTrab = 'Apenas dígitos são permitidos.';
        } else if (formData.ideSeqTrab.length < 1 || formData.ideSeqTrab.length > 3) {
          newErrors.ideSeqTrab = 'Informe um número de 1 a 999.';
        } else if (numValue < 1 || numValue > 999 || numValue === 0) {
          newErrors.ideSeqTrab = 'Valor inválido ou reservado.';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSalvarRascunho = async () => {
    setIsLoading(true);
    try {
      const dataToSave: Record<string, string> = {};

      // Salvar campos preenchidos
      if (formData.multiplosEnable) {
        dataToSave['ideTrab.multiplos.enable'] = formData.multiplosEnable;
      }
      if (formData.multiplosEnable === 'S' && formData.ideSeqTrab) {
        dataToSave['ideTrab.ideSeqTrab'] = formData.ideSeqTrab;
      }

      await ProcessoService.saveFormData(processoId, dataToSave);
      alert('Rascunho salvo com sucesso!');
    } catch (error) {
      alert('Erro ao salvar rascunho');
    } finally {
      setIsLoading(false);
    }
  };

  const handleProximo = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const dataToSave: Record<string, string> = {
        'ideTrab.multiplos.enable': formData.multiplosEnable
      };

      // Salvar ideSeqTrab apenas se multiplosEnable = 'S'
      if (formData.multiplosEnable === 'S') {
        dataToSave['ideTrab.ideSeqTrab'] = formData.ideSeqTrab;
      }

      await ProcessoService.saveFormData(processoId, dataToSave);
      
      // Navegar para a próxima etapa
      navigate('/processo/informacoes-da-decisao');
    } catch (error) {
      alert('Erro ao salvar dados');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnterior = () => {
    navigate('/processo/informacoes-do-trabalhador');
  };

  // Breadcrumb items
  const breadcrumbItems = [
    {
      label: 'Início',
      onClick: () => navigate('/')
    },
    {
      label: 'Dados do Processo',
      onClick: () => navigate('/dados-processo')
    },
    {
      label: 'Informações do Processo',
      onClick: () => navigate('/processo/informacoes-do-processo')
    },
    {
      label: 'Informações do Trabalhador',
      onClick: () => navigate('/processo/informacoes-do-trabalhador')
    },
    {
      label: 'Múltiplos Eventos'
    }
  ];

  return (
    <PageLayout breadcrumbItems={breadcrumbItems}>
      <PageHeader
        title="Múltiplos Eventos do Mesmo Processo"
        subtitle="Configure se há múltiplos eventos associados ao mesmo processo"
      />
      
      {/* Main Tabs */}
      <MainTabs activeTab="dados" />
      
      <div className="max-w-2xl mx-auto">
        {/* Título */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Mesmo processo em múltiplos eventos</h1>
          <p className="text-gray-600 mt-2">Configure se o processo será enviado em múltiplos eventos</p>
        </div>

          {/* Formulário */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            {/* Caixinha - Sempre visível */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 pb-3 border-b border-gray-200">
                Configuração de Múltiplos Eventos
              </h2>

              <div className="bg-blue-50 p-6 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Deseja enviar o mesmo processo em múltiplos eventos?
                </h3>
                
                <div className="flex space-x-6">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="multiplosEnable"
                      value="S"
                      checked={formData.multiplosEnable === 'S'}
                      onChange={(e) => handleMultiplosEnableChange(e.target.value)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span className="ml-2 text-sm font-medium text-gray-700">Sim</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="multiplosEnable"
                      value="N"
                      checked={formData.multiplosEnable === 'N'}
                      onChange={(e) => handleMultiplosEnableChange(e.target.value)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span className="ml-2 text-sm font-medium text-gray-700">Não</span>
                  </label>
                </div>

                {errors.multiplosEnable && (
                  <p className="mt-3 text-sm text-red-600">{errors.multiplosEnable}</p>
                )}
              </div>
            </div>

            {/* Campo condicional - ideSeqTrab */}
            {formData.multiplosEnable === 'S' && (
              <div className="pt-6 border-t border-gray-200">
                <div className="bg-green-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6 pb-3 border-b border-green-200">
                    Número Sequencial
                  </h3>

                  <div>
                    <label htmlFor="ideSeqTrab" className="block text-sm font-medium text-gray-700 mb-2">
                      Número sequencial (ideSeqTrab) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="ideSeqTrab"
                      value={formData.ideSeqTrab}
                      onChange={(e) => handleInputChange('ideSeqTrab', e.target.value)}
                      placeholder="Informe um número de 1 a 999"
                      maxLength={3}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white ${
                        errors.ideSeqTrab ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                    />
                    {errors.ideSeqTrab && (
                      <p className="mt-2 text-sm text-red-600">{errors.ideSeqTrab}</p>
                    )}
                    <p className="mt-2 text-xs text-gray-500">
                      Identificador único dentro dos S-2500 do empregador que tenham os mesmos nProcTrab e cpfTrab. Valor 0 é reservado para uso interno.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Nota sobre validações futuras */}
            <div className="mt-8 p-4 bg-yellow-50 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Nota:</strong> Em versões futuras, o sistema validará automaticamente:
              </p>
              <ul className="mt-2 text-xs text-yellow-700 list-disc list-inside space-y-1">
                <li>Unicidade do ideSeqTrab entre eventos S-2500 do mesmo empregador</li>
                <li>Restrição quando todos os contratos tiverem indContr = "S"</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <ActionButtons
          onPrevious={handleAnterior}
          onSaveDraft={handleSalvarRascunho}
          onNext={handleProximo}
          isLoading={isLoading}
          showCancel={false}
          previousLabel="Anterior"
          nextLabel="Próximo"
        />
    </PageLayout>
  );
}

export default MesmoProcessoMultiplosEventos;