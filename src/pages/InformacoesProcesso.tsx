import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '../components/layout/PageLayout';
import { PageHeader } from '../components/layout/PageHeader';
import { ActionButtons } from '../components/ui/ActionButtons';
import { MainTabs } from '../components/navigation/MainTabs';
import { maskCNPJ, unmaskDocument, maskDate, isValidDate, formatDateToISO } from '../utils/masks';
import { validateCNPJ } from '../utils/validators';
import { ProcessoService } from '../services/ProcessoService';

interface FormData {
  origem: string;
  nrProcTrab: string;
  dtSent: string;
  ufVar: string;
  codMunic: string;
  idVar: string;
  dtCCP: string;
  tpCCP: string;
  cnpjCCP: string;
  obsProcTrab: string;
}

interface FormErrors {
  origem?: string;
  nrProcTrab?: string;
  dtSent?: string;
  ufVar?: string;
  codMunic?: string;
  idVar?: string;
  dtCCP?: string;
  tpCCP?: string;
  cnpjCCP?: string;
  obsProcTrab?: string;
}

function InformacoesProcesso() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    origem: '',
    nrProcTrab: '',
    dtSent: '',
    ufVar: '',
    codMunic: '',
    idVar: '',
    dtCCP: '',
    tpCCP: '',
    cnpjCCP: '',
    obsProcTrab: ''
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  // Simular um processo_id para fins de demonstração
  const processoId = 'processo_001';

  const origemOptions = [
    { value: '', label: 'Selecione...' },
    { value: '1', label: 'Processo Judicial' },
    { value: '2', label: 'Demanda submetida à CCP ou ao NINTER' }
  ];

  const ufOptions = [
    { value: '', label: 'Selecione...' },
    { value: 'AC', label: 'AC - Acre' },
    { value: 'AL', label: 'AL - Alagoas' },
    { value: 'AP', label: 'AP - Amapá' },
    { value: 'AM', label: 'AM - Amazonas' },
    { value: 'BA', label: 'BA - Bahia' },
    { value: 'CE', label: 'CE - Ceará' },
    { value: 'DF', label: 'DF - Distrito Federal' },
    { value: 'ES', label: 'ES - Espírito Santo' },
    { value: 'GO', label: 'GO - Goiás' },
    { value: 'MA', label: 'MA - Maranhão' },
    { value: 'MT', label: 'MT - Mato Grosso' },
    { value: 'MS', label: 'MS - Mato Grosso do Sul' },
    { value: 'MG', label: 'MG - Minas Gerais' },
    { value: 'PA', label: 'PA - Pará' },
    { value: 'PB', label: 'PB - Paraíba' },
    { value: 'PR', label: 'PR - Paraná' },
    { value: 'PE', label: 'PE - Pernambuco' },
    { value: 'PI', label: 'PI - Piauí' },
    { value: 'RJ', label: 'RJ - Rio de Janeiro' },
    { value: 'RN', label: 'RN - Rio Grande do Norte' },
    { value: 'RS', label: 'RS - Rio Grande do Sul' },
    { value: 'RO', label: 'RO - Rondônia' },
    { value: 'RR', label: 'RR - Roraima' },
    { value: 'SC', label: 'SC - Santa Catarina' },
    { value: 'SP', label: 'SP - São Paulo' },
    { value: 'SE', label: 'SE - Sergipe' },
    { value: 'TO', label: 'TO - Tocantins' }
  ];

  const tpCCPOptions = [
    { value: '', label: 'Selecione...' },
    { value: '1', label: 'CCP no âmbito da empresa' },
    { value: '2', label: 'CCP no âmbito do sindicato' },
    { value: '3', label: 'NINTER' }
  ];

  // Limpar dados do ramo quando origem mudar
  const clearRamoData = async (novaOrigem: string) => {
    if (novaOrigem === '1') {
      // Limpar dados do ramo direito (CCP/NINTER)
      const ramoDireitoTags = ['infoProcesso.dtCCP', 'infoProcesso.tpCCP', 'infoProcesso.cnpjCCP'];
      await ProcessoService.clearGroupData(processoId, ramoDireitoTags);
      
      setFormData(prev => ({
        ...prev,
        dtCCP: '',
        tpCCP: '',
        cnpjCCP: ''
      }));
      
      // Limpar erros do ramo direito
      setErrors(prev => ({
        ...prev,
        dtCCP: undefined,
        tpCCP: undefined,
        cnpjCCP: undefined
      }));
    } else if (novaOrigem === '2') {
      // Limpar dados do ramo esquerdo (Judicial)
      const ramoEsquerdoTags = ['infoProcesso.dtSent', 'infoProcesso.ufVar', 'infoProcesso.codMunic', 'infoProcesso.idVar'];
      await ProcessoService.clearGroupData(processoId, ramoEsquerdoTags);
      
      setFormData(prev => ({
        ...prev,
        dtSent: '',
        ufVar: '',
        codMunic: '',
        idVar: ''
      }));
      
      // Limpar erros do ramo esquerdo
      setErrors(prev => ({
        ...prev,
        dtSent: undefined,
        ufVar: undefined,
        codMunic: undefined,
        idVar: undefined
      }));
    }
  };

  // Limpar CNPJ quando tpCCP mudar para "1" (empresa)
  const clearCnpjCCP = async () => {
    await ProcessoService.clearField(processoId, 'infoProcesso.cnpjCCP');
    
    setFormData(prev => ({
      ...prev,
      cnpjCCP: ''
    }));
    
    setErrors(prev => ({
      ...prev,
      cnpjCCP: undefined
    }));
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    let processedValue = value;
    
    // Aplicar máscaras
    if (field === 'cnpjCCP') {
      processedValue = maskCNPJ(value);
    } else if (field === 'dtSent' || field === 'dtCCP') {
      processedValue = maskDate(value);
    } else if (field === 'codMunic') {
      // Permitir apenas dígitos para código IBGE
      processedValue = value.replace(/\D/g, '').slice(0, 7);
    } else if (field === 'idVar') {
      // Permitir apenas dígitos para ID da vara
      processedValue = value.replace(/\D/g, '').slice(0, 4);
    } else if (field === 'obsProcTrab') {
      // Limitar a 1999 caracteres
      processedValue = value.slice(0, 1999);
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

    // Lógica especial para mudanças de origem
    if (field === 'origem' && processedValue !== formData.origem) {
      clearRamoData(processedValue);
    }

    // Lógica especial para tpCCP
    if (field === 'tpCCP' && processedValue === '1' && formData.cnpjCCP) {
      clearCnpjCCP();
    }
  };

  const isDateInFuture = (dateString: string): boolean => {
    if (!isValidDate(dateString)) return false;
    
    const [day, month, year] = dateString.split('/').map(Number);
    const inputDate = new Date(year, month - 1, day);
    const today = new Date();
    today.setHours(23, 59, 59, 999); // Fim do dia atual
    
    return inputDate > today;
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Validar origem (sempre obrigatório)
    if (!formData.origem) {
      newErrors.origem = 'Campo obrigatório';
    } else if (!['1', '2'].includes(formData.origem)) {
      newErrors.origem = 'Valor inválido';
    }

    // Validar campos específicos por origem
    if (formData.origem === '1') {
      // Ramo Esquerdo - Processo Judicial
      
      // Número do processo
      if (!formData.nrProcTrab) {
        newErrors.nrProcTrab = 'Campo obrigatório';
      } else if (formData.nrProcTrab.length < 1 || formData.nrProcTrab.length > 20) {
        newErrors.nrProcTrab = 'Deve ter entre 1 e 20 caracteres';
      }

      // Data da sentença
      if (!formData.dtSent) {
        newErrors.dtSent = 'Campo obrigatório';
      } else if (!isValidDate(formData.dtSent)) {
        newErrors.dtSent = 'Formato inválido';
      } else if (isDateInFuture(formData.dtSent)) {
        newErrors.dtSent = 'Data não pode ser futura';
      }

      // UF da vara
      if (!formData.ufVar) {
        newErrors.ufVar = 'Campo obrigatório';
      } else if (!ufOptions.some(uf => uf.value === formData.ufVar)) {
        newErrors.ufVar = 'UF inválida';
      }

      // Código do município
      if (!formData.codMunic) {
        newErrors.codMunic = 'Campo obrigatório';
      } else if (formData.codMunic.length !== 7) {
        newErrors.codMunic = 'Código IBGE deve ter 7 dígitos';
      }

      // ID da vara
      if (!formData.idVar) {
        newErrors.idVar = 'Campo obrigatório';
      } else if (formData.idVar.length < 1 || formData.idVar.length > 4) {
        newErrors.idVar = 'Deve ter entre 1 e 4 dígitos';
      }

    } else if (formData.origem === '2') {
      // Ramo Direito - CCP/NINTER
      
      // Número do acordo
      if (!formData.nrProcTrab) {
        newErrors.nrProcTrab = 'Campo obrigatório';
      } else if (formData.nrProcTrab.length < 1 || formData.nrProcTrab.length > 15) {
        newErrors.nrProcTrab = 'Deve ter entre 1 e 15 caracteres';
      }

      // Data da celebração
      if (!formData.dtCCP) {
        newErrors.dtCCP = 'Campo obrigatório';
      } else if (!isValidDate(formData.dtCCP)) {
        newErrors.dtCCP = 'Formato inválido';
      } else if (isDateInFuture(formData.dtCCP)) {
        newErrors.dtCCP = 'Data não pode ser futura';
      }

      // Âmbito de celebração
      if (!formData.tpCCP) {
        newErrors.tpCCP = 'Campo obrigatório';
      } else if (!['1', '2', '3'].includes(formData.tpCCP)) {
        newErrors.tpCCP = 'Valor inválido';
      }

      // CNPJ do sindicato (condicional)
      if (['2', '3'].includes(formData.tpCCP)) {
        if (!formData.cnpjCCP) {
          newErrors.cnpjCCP = 'Campo obrigatório';
        } else {
          const unmaskedCNPJ = unmaskDocument(formData.cnpjCCP);
          if (unmaskedCNPJ.length !== 14) {
            newErrors.cnpjCCP = 'CNPJ deve ter 14 dígitos';
          } else if (!validateCNPJ(unmaskedCNPJ)) {
            newErrors.cnpjCCP = 'CNPJ inválido';
          }
        }
      }
    }

    // Validar observações (opcional, mas se preenchido deve respeitar limite)
    if (formData.obsProcTrab && formData.obsProcTrab.length > 1999) {
      newErrors.obsProcTrab = 'Máximo 1999 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSalvarRascunho = async () => {
    setIsLoading(true);
    try {
      const dataToSave: Record<string, string> = {};

      // Sempre salvar origem
      if (formData.origem) {
        dataToSave['infoProcesso.origem'] = formData.origem;
      }

      // Salvar campos baseado na origem
      if (formData.origem === '1') {
        // Ramo Esquerdo - Processo Judicial
        if (formData.nrProcTrab) dataToSave['infoProcesso.nrProcTrab'] = formData.nrProcTrab;
        if (formData.dtSent) dataToSave['infoProcesso.dtSent'] = formatDateToISO(formData.dtSent);
        if (formData.ufVar) dataToSave['infoProcesso.ufVar'] = formData.ufVar;
        if (formData.codMunic) dataToSave['infoProcesso.codMunic'] = formData.codMunic;
        if (formData.idVar) dataToSave['infoProcesso.idVar'] = formData.idVar;
      } else if (formData.origem === '2') {
        // Ramo Direito - CCP/NINTER
        if (formData.nrProcTrab) dataToSave['infoProcesso.nrProcTrab'] = formData.nrProcTrab;
        if (formData.dtCCP) dataToSave['infoProcesso.dtCCP'] = formatDateToISO(formData.dtCCP);
        if (formData.tpCCP) dataToSave['infoProcesso.tpCCP'] = formData.tpCCP;
        if (formData.cnpjCCP) dataToSave['infoProcesso.cnpjCCP'] = unmaskDocument(formData.cnpjCCP);
      }

      // Campo comum
      if (formData.obsProcTrab) {
        dataToSave['infoProcesso.obsProcTrab'] = formData.obsProcTrab;
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
        'infoProcesso.origem': formData.origem
      };

      // Salvar campos baseado na origem
      if (formData.origem === '1') {
        // Ramo Esquerdo - Processo Judicial
        dataToSave['infoProcesso.nrProcTrab'] = formData.nrProcTrab;
        dataToSave['infoProcesso.dtSent'] = formatDateToISO(formData.dtSent);
        dataToSave['infoProcesso.ufVar'] = formData.ufVar;
        dataToSave['infoProcesso.codMunic'] = formData.codMunic;
        dataToSave['infoProcesso.idVar'] = formData.idVar;
      } else if (formData.origem === '2') {
        // Ramo Direito - CCP/NINTER
        dataToSave['infoProcesso.nrProcTrab'] = formData.nrProcTrab;
        dataToSave['infoProcesso.dtCCP'] = formatDateToISO(formData.dtCCP);
        dataToSave['infoProcesso.tpCCP'] = formData.tpCCP;
        
        if (['2', '3'].includes(formData.tpCCP) && formData.cnpjCCP) {
          dataToSave['infoProcesso.cnpjCCP'] = unmaskDocument(formData.cnpjCCP);
        }
      }

      // Campo comum
      if (formData.obsProcTrab) {
        dataToSave['infoProcesso.obsProcTrab'] = formData.obsProcTrab;
      }

      await ProcessoService.saveFormData(processoId, dataToSave);
      
      // Navegar para a próxima etapa
      navigate('/processo/informacoes-do-trabalhador');
    } catch (error) {
      alert('Erro ao salvar dados');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnterior = () => {
    navigate('/dados-processo');
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
      label: 'Informações do Processo'
    }
  ];

  return (
    <PageLayout breadcrumbItems={breadcrumbItems}>
      <PageHeader
        title="Informações do Processo"
        subtitle="Preencha as informações sobre o processo ou demanda"
      />
      
      {/* Main Tabs */}
      <MainTabs activeTab="dados" />
      
      <div className="max-w-2xl mx-auto">
        {/* Formulário */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            {/* Grupo 0 - Origem do Processo */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 pb-3 border-b border-gray-200">
                Tipo de Processo/Demanda
              </h2>

              <div>
                <label htmlFor="origem" className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de processo/demanda <span className="text-red-500">*</span>
                </label>
                <select
                  id="origem"
                  value={formData.origem}
                  onChange={(e) => handleInputChange('origem', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                    errors.origem ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                >
                  {origemOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {errors.origem && (
                  <p className="mt-2 text-sm text-red-600">{errors.origem}</p>
                )}
              </div>
            </div>

            {/* Ramo Esquerdo - Processo Judicial */}
            {formData.origem === '1' && (
              <div className="mb-8 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-6 pb-3 border-b border-blue-200">
                  Processo Judicial
                </h3>

                <div className="space-y-6">
                  {/* Número do Processo */}
                  <div>
                    <label htmlFor="nrProcTrab" className="block text-sm font-medium text-gray-700 mb-2">
                      Número do Processo Trabalhista / ata / conciliação <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="nrProcTrab"
                      value={formData.nrProcTrab}
                      onChange={(e) => handleInputChange('nrProcTrab', e.target.value)}
                      placeholder="1 a 20 caracteres"
                      maxLength={20}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                        errors.nrProcTrab ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                    />
                    {errors.nrProcTrab && (
                      <p className="mt-2 text-sm text-red-600">{errors.nrProcTrab}</p>
                    )}
                  </div>

                  {/* Data da Sentença */}
                  <div>
                    <label htmlFor="dtSent" className="block text-sm font-medium text-gray-700 mb-2">
                      Data da Sentença <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="dtSent"
                      value={formData.dtSent}
                      onChange={(e) => handleInputChange('dtSent', e.target.value)}
                      placeholder="DD/MM/AAAA"
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                        errors.dtSent ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                    />
                    {errors.dtSent && (
                      <p className="mt-2 text-sm text-red-600">{errors.dtSent}</p>
                    )}
                  </div>

                  {/* UF da Vara */}
                  <div>
                    <label htmlFor="ufVar" className="block text-sm font-medium text-gray-700 mb-2">
                      UF da Vara <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="ufVar"
                      value={formData.ufVar}
                      onChange={(e) => handleInputChange('ufVar', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                        errors.ufVar ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                    >
                      {ufOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    {errors.ufVar && (
                      <p className="mt-2 text-sm text-red-600">{errors.ufVar}</p>
                    )}
                  </div>

                  {/* Código do Município */}
                  <div>
                    <label htmlFor="codMunic" className="block text-sm font-medium text-gray-700 mb-2">
                      Município da Vara (código IBGE) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="codMunic"
                      value={formData.codMunic}
                      onChange={(e) => handleInputChange('codMunic', e.target.value)}
                      placeholder="0000000"
                      maxLength={7}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                        errors.codMunic ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                    />
                    {errors.codMunic && (
                      <p className="mt-2 text-sm text-red-600">{errors.codMunic}</p>
                    )}
                    <p className="mt-2 text-xs text-gray-500">
                      Código IBGE com exatamente 7 dígitos
                    </p>
                  </div>

                  {/* ID da Vara */}
                  <div>
                    <label htmlFor="idVar" className="block text-sm font-medium text-gray-700 mb-2">
                      Identificador da Vara <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="idVar"
                      value={formData.idVar}
                      onChange={(e) => handleInputChange('idVar', e.target.value)}
                      placeholder="1 a 4 dígitos"
                      maxLength={4}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                        errors.idVar ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                    />
                    {errors.idVar && (
                      <p className="mt-2 text-sm text-red-600">{errors.idVar}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Ramo Direito - CCP/NINTER */}
            {formData.origem === '2' && (
              <div className="mb-8 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-6 pb-3 border-b border-green-200">
                  Demanda CCP/NINTER
                </h3>

                <div className="space-y-6">
                  {/* Número do Acordo */}
                  <div>
                    <label htmlFor="nrProcTrab" className="block text-sm font-medium text-gray-700 mb-2">
                      Número do Acordo CCP/NINTER <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="nrProcTrab"
                      value={formData.nrProcTrab}
                      onChange={(e) => handleInputChange('nrProcTrab', e.target.value)}
                      placeholder="1 a 15 caracteres"
                      maxLength={15}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                        errors.nrProcTrab ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                    />
                    {errors.nrProcTrab && (
                      <p className="mt-2 text-sm text-red-600">{errors.nrProcTrab}</p>
                    )}
                  </div>

                  {/* Data da Celebração */}
                  <div>
                    <label htmlFor="dtCCP" className="block text-sm font-medium text-gray-700 mb-2">
                      Data da celebração do acordo (CCP/NINTER) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="dtCCP"
                      value={formData.dtCCP}
                      onChange={(e) => handleInputChange('dtCCP', e.target.value)}
                      placeholder="DD/MM/AAAA"
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                        errors.dtCCP ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                    />
                    {errors.dtCCP && (
                      <p className="mt-2 text-sm text-red-600">{errors.dtCCP}</p>
                    )}
                  </div>

                  {/* Âmbito de Celebração */}
                  <div>
                    <label htmlFor="tpCCP" className="block text-sm font-medium text-gray-700 mb-2">
                      Âmbito de celebração do acordo (CCP/NINTER) <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="tpCCP"
                      value={formData.tpCCP}
                      onChange={(e) => handleInputChange('tpCCP', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                        errors.tpCCP ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                    >
                      {tpCCPOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    {errors.tpCCP && (
                      <p className="mt-2 text-sm text-red-600">{errors.tpCCP}</p>
                    )}
                  </div>

                  {/* CNPJ do Sindicato (condicional) */}
                  {['2', '3'].includes(formData.tpCCP) && (
                    <div>
                      <label htmlFor="cnpjCCP" className="block text-sm font-medium text-gray-700 mb-2">
                        CNPJ do sindicato representante <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="cnpjCCP"
                        value={formData.cnpjCCP}
                        onChange={(e) => handleInputChange('cnpjCCP', e.target.value)}
                        placeholder="00.000.000/0000-00"
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                          errors.cnpjCCP ? 'border-red-300 bg-red-50' : 'border-gray-300'
                        }`}
                      />
                      {errors.cnpjCCP && (
                        <p className="mt-2 text-sm text-red-600">{errors.cnpjCCP}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Campo Comum - Observações */}
            {formData.origem && (
              <div className="pt-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-6 pb-3 border-b border-gray-200">
                  Observações
                </h3>

                <div>
                  <label htmlFor="obsProcTrab" className="block text-sm font-medium text-gray-700 mb-2">
                    Observações relacionadas ao processo
                  </label>
                  <textarea
                    id="obsProcTrab"
                    value={formData.obsProcTrab}
                    onChange={(e) => handleInputChange('obsProcTrab', e.target.value)}
                    placeholder="Observações opcionais sobre o processo..."
                    rows={4}
                    maxLength={1999}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-vertical ${
                      errors.obsProcTrab ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                  />
                  <div className="flex justify-between items-center mt-2">
                    <div>
                      {errors.obsProcTrab && (
                        <p className="text-sm text-red-600">{errors.obsProcTrab}</p>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">
                      {formData.obsProcTrab.length} de 1999 caracteres
                    </p>
                  </div>
                </div>
              </div>
            )}
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

export default InformacoesProcesso;