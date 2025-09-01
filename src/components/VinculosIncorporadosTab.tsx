import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { TextInput } from './TextInput';
import { SelectInput } from './SelectInput';
import { DateInput } from './DateInput';

interface VinculoIncorporado {
  id: string;
  matricIncorp: string;
  codCateg: string;
  dtInicio: string;
}

interface VinculosIncorporadosTabProps {
  cpf: string;
}

export const VinculosIncorporadosTab: React.FC<VinculosIncorporadosTabProps> = ({ cpf }) => {
  const [vinculos, setVinculos] = useState<VinculoIncorporado[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<VinculoIncorporado>({
    id: '',
    matricIncorp: '',
    codCateg: '',
    dtInicio: ''
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Opções para categoria (baseado na imagem)
  const categoriaOptions = [
    { value: '', label: 'Selecione a categoria', description: 'Selecione uma das opções disponíveis' },
    { value: '101', label: '101 - Empregado', description: 'Empregado em geral' },
    { value: '102', label: '102 - Empregado Doméstico', description: 'Trabalhador doméstico' },
    { value: '103', label: '103 - Trabalhador Rural', description: 'Trabalhador em atividade rural' },
    { value: '104', label: '104 - Aprendiz', description: 'Menor aprendiz' },
    { value: '105', label: '105 - Estagiário', description: 'Estudante estagiário' },
    { value: '106', label: '106 - Servidor Público', description: 'Servidor público estatutário' },
    { value: '107', label: '107 - Militar', description: 'Militar das Forças Armadas' },
    { value: '108', label: '108 - Agente Político', description: 'Agente político' },
    { value: '109', label: '109 - Cooperado', description: 'Cooperado de cooperativa de trabalho' },
    { value: '110', label: '110 - Diretor não empregado', description: 'Diretor não empregado' },
    { value: '111', label: '111 - Trabalhador Avulso', description: 'Trabalhador avulso' }
  ];

  const handleIncluirClick = () => {
    if (vinculos.length >= 99) {
      alert('Máximo de 99 vínculos incorporados permitidos');
      return;
    }
    
    setFormData({
      id: Date.now().toString(),
      matricIncorp: '',
      codCateg: '',
      dtInicio: ''
    });
    setFormErrors({});
    setShowForm(true);
  };

  const handleFormFieldChange = (field: keyof VinculoIncorporado, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Limpar erro do campo
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.matricIncorp.trim()) {
      errors.matricIncorp = 'Campo obrigatório';
    } else if (formData.matricIncorp.length > 30) {
      errors.matricIncorp = 'Máximo 30 caracteres';
    }

    if (!formData.codCateg) {
      errors.codCateg = 'Campo obrigatório';
    }

    if (!formData.dtInicio.trim()) {
      errors.dtInicio = 'Campo obrigatório';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSalvar = () => {
    if (!validateForm()) {
      return;
    }

    // Adicionar o vínculo à lista
    setVinculos(prev => [...prev, { ...formData }]);
    
    // Fechar formulário
    setShowForm(false);
    setFormData({
      id: '',
      matricIncorp: '',
      codCateg: '',
      dtInicio: ''
    });
    setFormErrors({});
  };

  const handleCancelar = () => {
    setShowForm(false);
    setFormData({
      id: '',
      matricIncorp: '',
      codCateg: '',
      dtInicio: ''
    });
    setFormErrors({});
  };

  const handleRemoverVinculo = (id: string) => {
    setVinculos(prev => prev.filter(v => v.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Botão de Incluir */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Vínculos Incorporados
          </h2>
          <span className="text-sm text-gray-500">
            {vinculos.length} de 99 vínculos
          </span>
        </div>
        
        <button
          onClick={handleIncluirClick}
          disabled={vinculos.length >= 99}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>INCLUIR INFORMAÇÃO DE VÍNCULO/CONTRATO INCORPORADO</span>
        </button>
      </div>

      {/* Lista de Vínculos Existentes */}
      {vinculos.length > 0 && (
        <div className="space-y-4">
          {vinculos.map((vinculo, index) => (
            <div key={vinculo.id} className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Vínculo Incorporado #{index + 1}
                </h3>
                <button
                  onClick={() => handleRemoverVinculo(vinculo.id)}
                  className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                  title="Remover vínculo"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Matrícula:</span>
                  <p className="text-gray-900">{vinculo.matricIncorp}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Categoria:</span>
                  <p className="text-gray-900">
                    {categoriaOptions.find(opt => opt.value === vinculo.codCateg)?.label || vinculo.codCateg}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Data de Início:</span>
                  <p className="text-gray-900">{vinculo.dtInicio}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal/Overlay do Formulário */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header do Modal */}
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 rounded-t-lg">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Incluir Vínculo/Contrato Incorporado
                </h3>
                <button
                  onClick={handleCancelar}
                  className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Conteúdo do Modal */}
            <div className="p-6">
              <div className="space-y-6">
                {/* Matrícula Incorporada */}
                <TextInput
                  value={formData.matricIncorp}
                  onChange={(value) => handleFormFieldChange('matricIncorp', value)}
                  label="Matrícula incorporada"
                  placeholder="Digite a matrícula"
                  required
                  error={formErrors.matricIncorp}
                  maxLength={30}
                  tooltip="Matrícula cujo vínculo/contrato passou a integrar período de unicidade contratual reconhecido judicialmente"
                />

                {/* Categoria */}
                <SelectInput
                  value={formData.codCateg}
                  onChange={(value) => handleFormFieldChange('codCateg', value)}
                  options={categoriaOptions}
                  label="Categoria"
                  placeholder="Selecione a categoria"
                  required
                  error={formErrors.codCateg}
                />

                {/* Data de Início de TSVE */}
                <DateInput
                  value={formData.dtInicio}
                  onChange={(value) => handleFormFieldChange('dtInicio', value)}
                  label="Data de início de TSVE"
                  placeholder="DD/MM/AAAA"
                  required
                  error={formErrors.dtInicio}
                  tooltip="Data de início cujo contrato passou a integrar período de unicidade contratual reconhecido judicialmente"
                />
              </div>
            </div>

            {/* Footer do Modal */}
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 rounded-b-lg">
              <div className="flex justify-end space-x-3">
                <button
                  onClick={handleCancelar}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                >
                  CANCELAR
                </button>
                <button
                  onClick={handleSalvar}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                >
                  SALVAR
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};