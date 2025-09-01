import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '../components/layout/PageLayout';
import { PageHeader } from '../components/layout/PageHeader';
import { ActionButtons } from '../components/ui/ActionButtons';
import { MainTabs } from '../components/navigation/MainTabs';
import { Info, Copy } from 'lucide-react';
import { maskCPF, maskCNPJ, unmaskDocument, maskDate, isValidDate, formatDateToISO } from '../utils/masks';
import { validateCPF, validateCNPJ } from '../utils/validators';
import { ProcessoService } from '../services/ProcessoService';

interface FormData {
  tpInsc: string;
  nrInsc: string;
  ideRespEnable: string;
  ideRespTpInsc: string;
  ideRespNrInsc: string;
  ideRespDtAdmRespDir: string;
  ideRespMatRespDir: string;
}

interface FormErrors {
  tpInsc?: string;
  nrInsc?: string;
  ideRespEnable?: string;
  ideRespTpInsc?: string;
  ideRespNrInsc?: string;
  ideRespDtAdmRespDir?: string;
  ideRespMatRespDir?: string;
}

// CPF de teste para QA (sempre válido)
const CPF_FIXTURE = "11144477735";

// DEBUG HINTS - DO NOT ENABLE IN PROD WITHOUT ?debug=1
const DEBUG_DOCUMENTS = [
  { type: 'CPF', masked: '111.444.777-35', raw: '11144477735' },
  { type: 'CNPJ', masked: '12.345.678/0001-95', raw: '12345678000195' },
  { type: 'CNPJ', masked: '98.765.432/0001-98', raw: '98765432000198' },
  { type: 'CNPJ', masked: '54.321.098/0001-08', raw: '54321098000108' },
  { type: 'CNPJ', masked: '31.415.926/0001-71', raw: '31415926000171' }
];

function DadosProcesso() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    tpInsc: '',
    nrInsc: '',
    ideRespEnable: '',
    ideRespTpInsc: '',
    ideRespNrInsc: '',
    ideRespDtAdmRespDir: '',
    ideRespMatRespDir: ''
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isGrupo1Valid, setIsGrupo1Valid] = useState(false);
  
  // DEBUG HINTS - DO NOT ENABLE IN PROD WITHOUT ?debug=1
  const isDebugMode = new URLSearchParams(window.location.search).get('debug') === '1';

  // Simular um processo_id para fins de demonstração
  const processoId = 'processo_001';

  const tipoInscricaoOptions = [
    { value: '', label: 'Selecione...' },
    { value: '1', label: 'CNPJ' },
    { value: '2', label: 'CPF' }
  ];

  // Breadcrumb items
  const breadcrumbItems = [
    {
      label: 'Início',
      onClick: () => navigate('/')
    },
    {
      label: 'Dados do Processo'
    }
  ];

  // Validar se o Grupo 1 está completo e válido
  const validateGrupo1 = (tpInsc: string, nrInsc: string): boolean => {
    if (!tpInsc || !['1', '2'].includes(tpInsc)) return false;
    if (!nrInsc) return false;

    const unmaskedValue = unmaskDocument(nrInsc);
    
    if (tpInsc === '1') {
      // CNPJ: 14 dígitos + checksum
      return unmaskedValue.length === 14 && validateCNPJ(unmaskedValue);
    } else if (tpInsc === '2') {
      // CPF: 11 dígitos + checksum (incluindo fixture)
      return unmaskedValue.length === 11 && 
             (validateCPF(unmaskedValue) || unmaskedValue === CPF_FIXTURE);
    }
    
    return false;
  };

  // Limpar dados do Grupo 2 quando necessário
  const clearGrupo2Data = async () => {
    const grupo2Tags = ['ideResp.enable', 'ideResp.tpInsc', 'ideResp.nrInsc', 'ideResp.dtAdmRespDir', 'ideResp.matRespDir'];
    await ProcessoService.clearGroupData(processoId, grupo2Tags);
    
    setFormData(prev => ({
      ...prev,
      ideRespEnable: '',
      ideRespTpInsc: '',
      ideRespNrInsc: '',
      ideRespDtAdmRespDir: '',
      ideRespMatRespDir: ''
    }));
    
    // Limpar erros do Grupo 2
    setErrors(prev => ({
      ...prev,
      ideRespTpInsc: undefined,
      ideRespNrInsc: undefined,
      ideRespDtAdmRespDir: undefined,
      ideRespMatRespDir: undefined
    }));
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    let processedValue = value;
    
    // Aplicar máscaras
    if (field === 'nrInsc') {
      if (formData.tpInsc === '1') {
        processedValue = maskCNPJ(value);
      } else if (formData.tpInsc === '2') {
        processedValue = maskCPF(value);
      }
    } else if (field === 'ideRespNrInsc') {
      if (formData.ideRespTpInsc === '1') {
        processedValue = maskCNPJ(value);
      } else if (formData.ideRespTpInsc === '2') {
        processedValue = maskCPF(value);
      }
    } else if (field === 'ideRespDtAdmRespDir') {
      processedValue = maskDate(value);
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

    // Validar Grupo 1 em tempo real para controlar exibição da caixinha
    if (field === 'tpInsc' || field === 'nrInsc') {
      const newTpInsc = field === 'tpInsc' ? processedValue : formData.tpInsc;
      const newNrInsc = field === 'nrInsc' ? processedValue : formData.nrInsc;
      
      const isValid = validateGrupo1(newTpInsc, newNrInsc);
      
      if (isValid !== isGrupo1Valid) {
        setIsGrupo1Valid(isValid);
        
        // Se ficou inválido, limpar Grupo 2
        if (!isValid) {
          clearGrupo2Data();
        }
      }
    }
  };

  // Limpar números de inscrição quando tipos mudarem
  useEffect(() => {
    if (formData.tpInsc && formData.nrInsc) {
      setFormData(prev => ({
        ...prev,
        nrInsc: ''
      }));
      setIsGrupo1Valid(false);
      clearGrupo2Data();
    }
  }, [formData.tpInsc]);

  useEffect(() => {
    if (formData.ideRespTpInsc && formData.ideRespNrInsc) {
      setFormData(prev => ({
        ...prev,
        ideRespNrInsc: ''
      }));
    }
  }, [formData.ideRespTpInsc]);

  // Validar Grupo 1 no onBlur
  const handleGrupo1Blur = () => {
    const isValid = validateGrupo1(formData.tpInsc, formData.nrInsc);
    
    if (isValid !== isGrupo1Valid) {
      setIsGrupo1Valid(isValid);
      
      if (!isValid) {
        clearGrupo2Data();
      }
    }
  };

  // Controlar exibição do Grupo 2 baseado na seleção da caixinha
  const handleIdeRespEnableChange = async (value: string) => {
    setFormData(prev => ({ ...prev, ideRespEnable: value }));
    
    if (value === 'N') {
      // Limpar dados do Grupo 2 (exceto ideResp.enable)
      const grupo2DataTags = ['ideResp.tpInsc', 'ideResp.nrInsc', 'ideResp.dtAdmRespDir', 'ideResp.matRespDir'];
      await ProcessoService.clearGroupData(processoId, grupo2DataTags);
      
      setFormData(prev => ({
        ...prev,
        ideRespTpInsc: '',
        ideRespNrInsc: '',
        ideRespDtAdmRespDir: '',
        ideRespMatRespDir: ''
      }));
      
      // Limpar erros do Grupo 2
      setErrors(prev => ({
        ...prev,
        ideRespTpInsc: undefined,
        ideRespNrInsc: undefined,
        ideRespDtAdmRespDir: undefined,
        ideRespMatRespDir: undefined
      }));
    }
  };

  // DEBUG HINTS - DO NOT ENABLE IN PROD WITHOUT ?debug=1
  const copyToClipboard = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      alert(`Copiado: ${value}`);
    } catch (err) {
      // Fallback para navegadores mais antigos
      const textArea = document.createElement('textarea');
      textArea.value = value;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert(`Copiado: ${value}`);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Validar tipo de inscrição
    if (!formData.tpInsc) {
      newErrors.tpInsc = 'Campo obrigatório';
    } else if (!['1', '2'].includes(formData.tpInsc)) {
      newErrors.tpInsc = 'Valor inválido';
    }

    // Validar número de inscrição
    if (!formData.nrInsc) {
      newErrors.nrInsc = 'Campo obrigatório';
    } else {
      const unmaskedValue = unmaskDocument(formData.nrInsc);
      
      if (formData.tpInsc === '1') {
        if (unmaskedValue.length !== 14) {
          newErrors.nrInsc = 'CNPJ deve ter 14 dígitos';
        } else if (!validateCNPJ(unmaskedValue)) {
          newErrors.nrInsc = 'CNPJ inválido';
        }
      } else if (formData.tpInsc === '2') {
        if (unmaskedValue.length !== 11) {
          newErrors.nrInsc = 'CPF deve ter 11 dígitos';
        } else if (!validateCPF(unmaskedValue) && unmaskedValue !== CPF_FIXTURE) {
          newErrors.nrInsc = 'CPF inválido';
        }
      } else {
        newErrors.nrInsc = 'Documento inválido';
      }
    }

    // Validar Grupo 2 apenas se estiver visível
    if (isGrupo1Valid && formData.ideRespEnable === 'S') {
      // Tipo de inscrição do responsável direto
      if (!formData.ideRespTpInsc) {
        newErrors.ideRespTpInsc = 'Campo obrigatório';
      } else if (!['1', '2'].includes(formData.ideRespTpInsc)) {
        newErrors.ideRespTpInsc = 'Valor inválido';
      }

      // Número de inscrição do responsável direto
      if (!formData.ideRespNrInsc) {
        newErrors.ideRespNrInsc = 'Campo obrigatório';
      } else {
        const unmaskedValue = unmaskDocument(formData.ideRespNrInsc);
        
        if (formData.ideRespTpInsc === '1') {
          if (unmaskedValue.length !== 14) {
            newErrors.ideRespNrInsc = 'CNPJ deve ter 14 dígitos';
          } else if (!validateCNPJ(unmaskedValue)) {
            newErrors.ideRespNrInsc = 'CNPJ inválido';
          }
        } else if (formData.ideRespTpInsc === '2') {
          if (unmaskedValue.length !== 11) {
            newErrors.ideRespNrInsc = 'CPF deve ter 11 dígitos';
          } else if (!validateCPF(unmaskedValue) && unmaskedValue !== CPF_FIXTURE) {
            newErrors.ideRespNrInsc = 'CPF inválido';
          }
        }
      }

      // Data de admissão (opcional, mas se preenchida deve ser válida)
      if (formData.ideRespDtAdmRespDir && !isValidDate(formData.ideRespDtAdmRespDir)) {
        newErrors.ideRespDtAdmRespDir = 'Data inválida';
      }

      // Matrícula (opcional, mas se preenchida deve ter 1-30 caracteres)
      if (formData.ideRespMatRespDir && (formData.ideRespMatRespDir.length < 1 || formData.ideRespMatRespDir.length > 30)) {
        newErrors.ideRespMatRespDir = 'Deve ter entre 1 e 30 caracteres';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSalvarRascunho = async () => {
    setIsLoading(true);
    try {
      const dataToSave: Record<string, string> = {
        tpInsc: formData.tpInsc,
        nrInsc: formData.nrInsc ? unmaskDocument(formData.nrInsc) : ''
      };

      // Adicionar dados do Grupo 2 se estiverem preenchidos
      if (isGrupo1Valid) {
        if (formData.ideRespEnable) {
          dataToSave['ideResp.enable'] = formData.ideRespEnable;
        }
        
        if (formData.ideRespEnable === 'S') {
          if (formData.ideRespTpInsc) {
            dataToSave['ideResp.tpInsc'] = formData.ideRespTpInsc;
          }
          if (formData.ideRespNrInsc) {
            dataToSave['ideResp.nrInsc'] = unmaskDocument(formData.ideRespNrInsc);
          }
          if (formData.ideRespDtAdmRespDir) {
            dataToSave['ideResp.dtAdmRespDir'] = formatDateToISO(formData.ideRespDtAdmRespDir);
          }
          if (formData.ideRespMatRespDir) {
            dataToSave['ideResp.matRespDir'] = formData.ideRespMatRespDir;
          }
        }
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
        tpInsc: formData.tpInsc,
        nrInsc: unmaskDocument(formData.nrInsc)
      };

      // Adicionar dados do Grupo 2 se estiverem válidos
      if (isGrupo1Valid) {
        if (formData.ideRespEnable) {
          dataToSave['ideResp.enable'] = formData.ideRespEnable;
        }
        
        if (formData.ideRespEnable === 'S') {
          dataToSave['ideResp.tpInsc'] = formData.ideRespTpInsc;
          dataToSave['ideResp.nrInsc'] = unmaskDocument(formData.ideRespNrInsc);
          
          if (formData.ideRespDtAdmRespDir) {
            dataToSave['ideResp.dtAdmRespDir'] = formatDateToISO(formData.ideRespDtAdmRespDir);
          }
          if (formData.ideRespMatRespDir) {
            dataToSave['ideResp.matRespDir'] = formData.ideRespMatRespDir;
          }
        }
      }

      await ProcessoService.saveFormData(processoId, dataToSave);
      
      // Navegar para a próxima etapa
      navigate('/processo/informacoes-do-processo');
    } catch (error) {
      alert('Erro ao salvar dados');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelar = () => {
    navigate('/');
  };

  return (
    <PageLayout breadcrumbItems={breadcrumbItems}>
      <PageHeader
        title="Dados do Processo"
        subtitle="Preencha as informações do declarante"
      />
      
      {/* Main Tabs */}
      <MainTabs activeTab="dados" />
      
      <div className="max-w-2xl mx-auto">
        {/* DEBUG HINTS - DO NOT ENABLE IN PROD WITHOUT ?debug=1 */}
        {isDebugMode && (
          <div className="mb-8 p-4 border-2 border-dashed border-yellow-300 bg-yellow-50 rounded-lg">
            <div className="flex items-center mb-3">
              <Info className="h-5 w-5 text-yellow-600 mr-2" />
              <h3 className="text-lg font-medium text-yellow-800">Dicas de Teste (DEBUG)</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">Use apenas em ambiente de homologação.</p>
            
            <div className="space-y-2">
              {DEBUG_DOCUMENTS.map((doc, index) => (
                <div key={index} className="flex items-center justify-between bg-white p-3 rounded border">
                  <div className="flex-1">
                    <span className="font-medium text-gray-700">{doc.type} (válido): </span>
                    <span className="font-mono text-blue-600">{doc.masked}</span>
                    <span className="text-sm text-gray-500 ml-2">(valor cru: {doc.raw})</span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(doc.raw)}
                    className="flex items-center space-x-1 px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                  >
                    <Copy className="h-3 w-3" />
                    <span>Copiar</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Formulário */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 pb-3 border-b border-gray-200">
            Identificação do Declarante
          </h2>

          <div className="space-y-6">
            {/* Tipo de Inscrição */}
            <div>
              <label htmlFor="tpInsc" className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Inscrição <span className="text-red-500">*</span>
              </label>
              <select
                id="tpInsc"
                value={formData.tpInsc}
                onChange={(e) => handleInputChange('tpInsc', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                  errors.tpInsc ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
              >
                {tipoInscricaoOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {errors.tpInsc && (
                <p className="mt-2 text-sm text-red-600">{errors.tpInsc}</p>
              )}
            </div>

            {/* Número de Inscrição */}
            <div>
              <label htmlFor="nrInsc" className="block text-sm font-medium text-gray-700 mb-2">
                Número de Inscrição <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="nrInsc"
                value={formData.nrInsc}
                onChange={(e) => handleInputChange('nrInsc', e.target.value)}
                onBlur={handleGrupo1Blur}
                placeholder={
                  formData.tpInsc === '1' ? '00.000.000/0000-00' :
                  formData.tpInsc === '2' ? '000.000.000-00' :
                  'Selecione o tipo de inscrição primeiro'
                }
                disabled={!formData.tpInsc}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed ${
                  errors.nrInsc ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
              />
              {errors.nrInsc && (
                <p className="mt-2 text-sm text-red-600">{errors.nrInsc}</p>
              )}
              {/* DEBUG HINTS - DO NOT ENABLE IN PROD WITHOUT ?debug=1 */}
              {isDebugMode && (
                <p className="mt-2 text-xs text-blue-600">
                  Dica de teste: CPF 111.444.777-35 ou CNPJ 12.345.678/0001-95
                </p>
              )}
            </div>
          </div>

          {/* Caixinha Condicional - só aparece se Grupo 1 estiver válido */}
          {isGrupo1Valid && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="bg-blue-50 p-6 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Informações de identificação do contribuinte (responsável direto), caso tenha havido imposição de responsabilidade indireta. Preencher infos?
                </h3>
                
                <div className="flex space-x-6">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="ideRespEnable"
                      value="S"
                      checked={formData.ideRespEnable === 'S'}
                      onChange={(e) => handleIdeRespEnableChange(e.target.value)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span className="ml-2 text-sm font-medium text-gray-700">Sim</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="ideRespEnable"
                      value="N"
                      checked={formData.ideRespEnable === 'N'}
                      onChange={(e) => handleIdeRespEnableChange(e.target.value)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span className="ml-2 text-sm font-medium text-gray-700">Não</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Grupo 2 - ideResp - só aparece se caixinha = "Sim" */}
          {isGrupo1Valid && formData.ideRespEnable === 'S' && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="bg-blue-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-6 pb-3 border-b border-blue-200">
                  Identificação do Responsável Direto
                </h3>

                <div className="space-y-6">
                  {/* Tipo de Inscrição (Responsável Direto) */}
                  <div>
                    <label htmlFor="ideRespTpInsc" className="block text-sm font-medium text-gray-700 mb-2">
                      Tipo de Inscrição (Responsável Direto) <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="ideRespTpInsc"
                      value={formData.ideRespTpInsc}
                      onChange={(e) => handleInputChange('ideRespTpInsc', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white ${
                        errors.ideRespTpInsc ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                    >
                      {tipoInscricaoOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    {errors.ideRespTpInsc && (
                      <p className="mt-2 text-sm text-red-600">{errors.ideRespTpInsc}</p>
                    )}
                  </div>

                  {/* Número de Inscrição (Responsável Direto) */}
                  <div>
                    <label htmlFor="ideRespNrInsc" className="block text-sm font-medium text-gray-700 mb-2">
                      Número de Inscrição (Responsável Direto) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="ideRespNrInsc"
                      value={formData.ideRespNrInsc}
                      onChange={(e) => handleInputChange('ideRespNrInsc', e.target.value)}
                      placeholder={
                        formData.ideRespTpInsc === '1' ? '00.000.000/0000-00' :
                        formData.ideRespTpInsc === '2' ? '000.000.000-00' :
                        'Selecione o tipo de inscrição primeiro'
                      }
                      disabled={!formData.ideRespTpInsc}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed bg-white ${
                        errors.ideRespNrInsc ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                    />
                    {errors.ideRespNrInsc && (
                      <p className="mt-2 text-sm text-red-600">{errors.ideRespNrInsc}</p>
                    )}
                    {/* DEBUG HINTS - DO NOT ENABLE IN PROD WITHOUT ?debug=1 */}
                    {isDebugMode && (
                      <p className="mt-2 text-xs text-blue-600">
                        Dica de teste: use um CPF/CNPJ válido (ex.: 111.444.777-35 ou 12.345.678/0001-95)
                      </p>
                    )}
                  </div>

                  {/* Data de Admissão no Empregador de Origem */}
                  <div>
                    <label htmlFor="ideRespDtAdmRespDir" className="block text-sm font-medium text-gray-700 mb-2">
                      Data de Admissão no Empregador de Origem (Responsável Direto)
                      <span className="ml-1 text-blue-600 cursor-help" title="Preencher com a data de admissão do trabalhador no empregador de origem (responsável direto). Em caso de TSVE sem informação de matrícula no evento S-2300, informar a data de início.">
                        ℹ️
                      </span>
                    </label>
                    <input
                      type="text"
                      id="ideRespDtAdmRespDir"
                      value={formData.ideRespDtAdmRespDir}
                      onChange={(e) => handleInputChange('ideRespDtAdmRespDir', e.target.value)}
                      placeholder="DD/MM/AAAA"
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white ${
                        errors.ideRespDtAdmRespDir ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                    />
                    {errors.ideRespDtAdmRespDir && (
                      <p className="mt-2 text-sm text-red-600">{errors.ideRespDtAdmRespDir}</p>
                    )}
                  </div>

                  {/* Matrícula no Empregador de Origem */}
                  <div>
                    <label htmlFor="ideRespMatRespDir" className="block text-sm font-medium text-gray-700 mb-2">
                      Matrícula no Empregador de Origem (Responsável Direto)
                    </label>
                    <input
                      type="text"
                      id="ideRespMatRespDir"
                      value={formData.ideRespMatRespDir}
                      onChange={(e) => handleInputChange('ideRespMatRespDir', e.target.value)}
                      placeholder="Matrícula (1-30 caracteres)"
                      maxLength={30}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white ${
                        errors.ideRespMatRespDir ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                    />
                    {errors.ideRespMatRespDir && (
                      <p className="mt-2 text-sm text-red-600">{errors.ideRespMatRespDir}</p>
                    )}
                    <p className="mt-2 text-xs text-gray-500">
                      Opcional - Entre 1 e 30 caracteres
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <ActionButtons
        onCancel={handleCancelar}
        onSaveDraft={handleSalvarRascunho}
        onNext={handleProximo}
        isLoading={isLoading}
        showPrevious={false}
        nextLabel="Próximo"
      />
    </PageLayout>
  );
}

export default DadosProcesso;