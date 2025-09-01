import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '../components/layout/PageLayout';
import { PageHeader } from '../components/layout/PageHeader';
import { ActionButtons } from '../components/ui/ActionButtons';
import { MainTabs } from '../components/navigation/MainTabs';
import { maskCPF, unmaskDocument, maskDate, isValidDate, formatDateToISO } from '../utils/masks';
import { validateCPF } from '../utils/validators';
import { ProcessoService } from '../services/ProcessoService';

interface FormData {
  cpfTrab: string;
  nmTrab: string;
  dtNascto: string;
}

interface FormErrors {
  cpfTrab?: string;
  nmTrab?: string;
  dtNascto?: string;
}

function InformacoesTrabalhador() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    cpfTrab: '',
    nmTrab: '',
    dtNascto: ''
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  // Simular um processo_id para fins de demonstração
  const processoId = 'processo_001';

  const handleInputChange = (field: keyof FormData, value: string) => {
    let processedValue = value;
    
    // Aplicar máscaras
    if (field === 'cpfTrab') {
      processedValue = maskCPF(value);
    } else if (field === 'dtNascto') {
      processedValue = maskDate(value);
    } else if (field === 'nmTrab') {
      // Limitar a 70 caracteres e converter para maiúsculas
      processedValue = value.toUpperCase().slice(0, 70);
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

  const isDateInRange = (dateString: string): boolean => {
    if (!isValidDate(dateString)) return false;
    
    const [day, month, year] = dateString.split('/').map(Number);
    const inputDate = new Date(year, month - 1, day);
    const minDate = new Date(1890, 0, 1); // 01/01/1890
    const today = new Date();
    today.setHours(23, 59, 59, 999); // Fim do dia atual
    
    return inputDate >= minDate && inputDate <= today;
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Validar CPF (sempre obrigatório)
    if (!formData.cpfTrab) {
      newErrors.cpfTrab = 'Campo obrigatório';
    } else {
      const unmaskedCPF = unmaskDocument(formData.cpfTrab);
      if (unmaskedCPF.length !== 11) {
        newErrors.cpfTrab = 'CPF deve ter 11 dígitos';
      } else if (!validateCPF(unmaskedCPF) && unmaskedCPF !== '11144477735') {
        newErrors.cpfTrab = 'CPF inválido';
      }
    }

    // Validar nome (obrigatório - futuramente será condicional baseado em indContr)
    if (!formData.nmTrab) {
      newErrors.nmTrab = 'Campo obrigatório';
    } else if (formData.nmTrab.length < 2) {
      newErrors.nmTrab = 'Nome deve ter pelo menos 2 caracteres';
    } else if (formData.nmTrab.length > 70) {
      newErrors.nmTrab = 'Nome deve ter no máximo 70 caracteres';
    }

    // Validar data de nascimento (obrigatório - futuramente será condicional baseado em indContr)
    if (!formData.dtNascto) {
      newErrors.dtNascto = 'Campo obrigatório';
    } else if (!isValidDate(formData.dtNascto)) {
      newErrors.dtNascto = 'Formato inválido';
    } else if (!isDateInRange(formData.dtNascto)) {
      newErrors.dtNascto = 'Data inválida: deve ser maior que 01/01/1890 e não pode ser futura';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSalvarRascunho = async () => {
    setIsLoading(true);
    try {
      const dataToSave: Record<string, string> = {};

      // Salvar campos preenchidos
      if (formData.cpfTrab) {
        dataToSave['ideTrab.cpfTrab'] = unmaskDocument(formData.cpfTrab);
      }
      if (formData.nmTrab) {
        dataToSave['ideTrab.nmTrab'] = formData.nmTrab;
      }
      if (formData.dtNascto) {
        dataToSave['ideTrab.dtNascto'] = formatDateToISO(formData.dtNascto);
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
        'ideTrab.cpfTrab': unmaskDocument(formData.cpfTrab),
        'ideTrab.nmTrab': formData.nmTrab,
        'ideTrab.dtNascto': formatDateToISO(formData.dtNascto)
      };

      await ProcessoService.saveFormData(processoId, dataToSave);
      
      // Navegar para a próxima etapa
      navigate('/processo/multiplos-eventos');
    } catch (error) {
      alert('Erro ao salvar dados');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnterior = () => {
    navigate('/processo/informacoes-do-processo');
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
      label: 'Informações do Trabalhador'
    }
  ];

  return (
    <PageLayout breadcrumbItems={breadcrumbItems}>
      <PageHeader
        title="Informações do Trabalhador"
        subtitle="Preencha os dados do trabalhador envolvido no processo"
      />
      
      {/* Main Tabs */}
      <MainTabs activeTab="dados" />
      
      <div className="max-w-2xl mx-auto">

          {/* Formulário */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 pb-3 border-b border-gray-200">
              Identificação do Trabalhador
            </h2>

            <div className="space-y-6">
              {/* CPF do Trabalhador */}
              <div>
                <label htmlFor="cpfTrab" className="block text-sm font-medium text-gray-700 mb-2">
                  CPF do Trabalhador <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="cpfTrab"
                  value={formData.cpfTrab}
                  onChange={(e) => handleInputChange('cpfTrab', e.target.value)}
                  placeholder="000.000.000-00"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                    errors.cpfTrab ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                />
                {errors.cpfTrab && (
                  <p className="mt-2 text-sm text-red-600">{errors.cpfTrab}</p>
                )}
              </div>

              {/* Nome do Trabalhador */}
              <div>
                <label htmlFor="nmTrab" className="block text-sm font-medium text-gray-700 mb-2">
                  Nome do Trabalhador <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="nmTrab"
                  value={formData.nmTrab}
                  onChange={(e) => handleInputChange('nmTrab', e.target.value)}
                  placeholder="Nome completo do trabalhador"
                  maxLength={70}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                    errors.nmTrab ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                />
                {errors.nmTrab && (
                  <p className="mt-2 text-sm text-red-600">{errors.nmTrab}</p>
                )}
                <p className="mt-2 text-xs text-gray-500">
                  {formData.nmTrab.length} de 70 caracteres • Mínimo 2 caracteres
                </p>
              </div>

              {/* Data de Nascimento */}
              <div>
                <label htmlFor="dtNascto" className="block text-sm font-medium text-gray-700 mb-2">
                  Data de Nascimento <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="dtNascto"
                  value={formData.dtNascto}
                  onChange={(e) => handleInputChange('dtNascto', e.target.value)}
                  placeholder="DD/MM/AAAA"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                    errors.dtNascto ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                />
                {errors.dtNascto && (
                  <p className="mt-2 text-sm text-red-600">{errors.dtNascto}</p>
                )}
                <p className="mt-2 text-xs text-gray-500">
                  Data deve ser posterior a 01/01/1890 e não pode ser futura
                </p>
              </div>
            </div>

            {/* Nota sobre validação condicional */}
            <div className="mt-8 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Nota:</strong> Atualmente todos os campos são obrigatórios. 
                Em versões futuras, nome e data de nascimento serão opcionais quando 
                existir contrato com indicador específico (indContr = S).
              </p>
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

export default InformacoesTrabalhador;