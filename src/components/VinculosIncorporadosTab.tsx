import React, { useState, useEffect } from 'react';
import { Plus, X, Calendar } from 'lucide-react';
import { TextInput } from './TextInput';
import { SelectInput } from './SelectInput';
import { DateInput } from './DateInput';
import { FormDataService } from '../services/formDataService';

interface VinculoIncorporado {
  id: string;
  matriculaIncorp: string;
  codCateg: string;
  dtInicio: string;
}

interface VinculosIncorporadosTabProps {
  cpf: string;
}

interface FormErrors {
  [key: string]: {
    matriculaIncorp?: string;
    codCateg?: string;
    dtInicio?: string;
  };
}

export const VinculosIncorporadosTab: React.FC<VinculosIncorporadosTabProps> = ({ cpf }) => {
  const [vinculos, setVinculos] = useState<VinculoIncorporado[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newVinculo, setNewVinculo] = useState<VinculoIncorporado>({
    id: '',
    matriculaIncorp: '',
    codCateg: '',
    dtInicio: ''
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  // Opções para categoria (baseado na imagem)
  const categoriaOptions = [
    { value: '', label: 'Selecione a categoria', description: 'Selecione uma das opções disponíveis' },
    { value: '101', label: '101 - Empregado', description: 'Empregado em geral' },
    { value: '102', label: '102 - Empregado Doméstico', description: 'Trabalhador doméstico' },
    { value: '103', label: '103 - Trabalhador Avulso', description: 'Trabalhador avulso' },
    { value: '104', label: '104 - Empregado - Aprendiz', description: 'Menor aprendiz' },
    { value: '105', label: '105 - Servidor Público', description: 'Servidor público estatutário' },
    { value: '106', label: '106 - Militar', description: 'Militar das Forças Armadas' },
    { value: '107', label: '107 - Agente Político', description: 'Agente político' },
    { value: '108', label: '108 - Bolsista', description: 'Bolsista' },
    { value: '109', label: '109 - Estagiário', description: 'Estagiário' },
    { value: '110', label: '110 - Cooperado', description: 'Cooperado' },
    { value: '111', label: '111 - Diretor não empregado', description: 'Diretor não empregado' }
  ];

  // Carregar vínculos salvos ao montar o componente
  useEffect(() => {
    const loadVinculos = async () => {
      if (cpf) {
        try {
          const savedVinculos = await FormDataService.getVinculosIncorporados(cpf);
          setVinculos(savedVinculos);
        } catch (error) {
          console.error('Erro ao carregar vínculos:', error);
        }
      }
    };
    
    loadVinculos();
  }, [cpf]);

  const generateId = (): string => {
    return `vinculo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const handleIncluirClick = () => {
    if (vinculos.length >= 99) {
      alert('Máximo de 99 vínculos permitidos');
      return;
    }
    
    setNewVinculo({
      id: generateId(),
      matriculaIncorp: '',
      codCateg: '',
      dtInicio: ''
    });
    setIsAdding(true);
    setErrors({});
  };

  const handleCancelarInclusao = () => {
    setIsAdding(false);
    setNewVinculo({
      id: '',
      matriculaIncorp: '',
      codCateg: '',
      dtInicio: ''
    });
    setErrors({});
  };

  const handleFieldChange = (field: keyof VinculoIncorporado, value: string) => {
    setNewVinculo(prev => ({ ...prev, [field]: value }));
    
    // Limpar erro do campo quando começar a digitar
    if (errors.new && errors.new[field]) {
      setErrors(prev => ({
        ...prev,
        new: {
          ...prev.new,
          [field]: undefined
        }
      }));
    }
  };

  const validateNewVinculo = (): boolean => {
    const newErrors: FormErrors = { new: {} };
    
    // Matrícula incorporada (obrigatório)
    if (!newVinculo.matriculaIncorp) {
      newErrors.new!.matriculaIncorp = 'Campo obrigatório';
    } else if (newVinculo.matriculaIncorp.length < 1 || newVinculo.matriculaIncorp.length > 30) {
      newErrors.new!.matriculaIncorp = 'Deve ter entre 1 e 30 caracteres';
    }
    
    // Categoria (obrigatório)
    if (!newVinculo.codCateg) {
      newErrors.new!.codCateg = 'Campo obrigatório';
    }
    
    // Data de início (obrigatório)
    if (!newVinculo.dtInicio) {
      newErrors.new!.dtInicio = 'Campo obrigatório';
    }
    
    // Verificar se matrícula já existe
    const matriculaExiste = vinculos.some(v => v.matriculaIncorp === newVinculo.matriculaIncorp);
    if (matriculaExiste) {
      newErrors.new!.matriculaIncorp = 'Matrícula já cadastrada';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors.new || {}).length === 0;
  };

  const handleSalvarVinculo = async () => {
    if (!validateNewVinculo()) {
      return;
    }
    
    setIsLoading(true);
    try {
      const novosVinculos = [...vinculos, newVinculo];
      setVinculos(novosVinculos);
      
      // Salvar no serviço
      await FormDataService.saveVinculosIncorporados(cpf, novosVinculos);
      
      // Resetar formulário
      setIsAdding(false);
      setNewVinculo({
        id: '',
        matriculaIncorp: '',
        codCateg: '',
        dtInicio: ''
      });
      setErrors({});
      
    } catch (error) {
      console.error('Erro ao salvar vínculo:', error);
      alert('Erro ao salvar vínculo');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoverVinculo = async (id: string) => {
    if (confirm('Deseja realmente remover este vínculo?')) {
      try {
        const novosVinculos = vinculos.filter(v => v.id !== id);
        setVinculos(novosVinculos);
        
        // Salvar no serviço
        await FormDataService.saveVinculosIncorporados(cpf, novosVinculos);
      } catch (error) {
        console.error('Erro ao remover vínculo:', error);
        alert('Erro ao remover vínculo');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Título da seção */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Vínculos/Contratos Incorporados
        </h2>
        <p className="text-gray-600 mb-6">
          Adicione informações sobre vínculos ou contratos que foram incorporados ao processo.
        </p>
        
        {/* Botão de incluir */}
        <button
          onClick={handleIncluirClick}
          disabled={isAdding || vinculos.length >= 99}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          + INCLUIR INFORMAÇÃO DE VÍNCULO/CONTRATO INCORPORADO
        </button>
        
        {vinculos.length >= 99 && (
          <p className="mt-2 text-sm text-amber-600">
            Máximo de 99 vínculos atingido
          </p>
        )}
      </div>

      {/* Lista de vínculos existentes */}
      {vinculos.length > 0 && (
        <div className="space-y-4">
          {vinculos.map((vinculo, index) => (
            <div key={vinculo.id} className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Vínculo {index + 1}
                </h3>
                <button
                  onClick={() => handleRemoverVinculo(vinculo.id)}
                  className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors"
                  title="Remover vínculo"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Matrícula Incorporada
                  </label>
                  <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded border">
                    {vinculo.matriculaIncorp}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Categoria
                  </label>
                  <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded border">
                    {categoriaOptions.find(opt => opt.value === vinculo.codCateg)?.label || vinculo.codCateg}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data de Início de TSVE
                  </label>
                  <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded border">
                    {vinculo.dtInicio}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal/Overlay para incluir novo vínculo */}
      {isAdding && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header do modal */}
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 rounded-t-lg">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">
                  Incluir Vínculo/Contrato Incorporado
                </h3>
                <button
                  onClick={handleCancelarInclusao}
                  className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            {/* Conteúdo do modal */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Matrícula Incorporada */}
                <TextInput
                  value={newVinculo.matriculaIncorp}
                  onChange={(value) => handleFieldChange('matriculaIncorp', value)}
                  label="Matrícula Incorporada"
                  placeholder="Digite a matrícula"
                  required
                  error={errors.new?.matriculaIncorp}
                  maxLength={30}
                  tooltip="Informar a matrícula incorporada (matrícula cujo vínculo/contrato passou a integrar período de unicidade contratual reconhecido judicialmente)"
                />
                
                {/* Categoria */}
                <SelectInput
                  value={newVinculo.codCateg}
                  onChange={(value) => handleFieldChange('codCateg', value)}
                  options={categoriaOptions}
                  label="Categoria"
                  placeholder="Selecione a categoria"
                  required
                  error={errors.new?.codCateg}
                />
                
                {/* Data de Início de TSVE */}
                <DateInput
                  value={newVinculo.dtInicio}
                  onChange={(value) => handleFieldChange('dtInicio', value)}
                  label="Data de Início de TSVE"
                  placeholder="DD/MM/AAAA"
                  required
                  error={errors.new?.dtInicio}
                  tooltip="Data de início de TSVE (data de início cujo contrato passou a integrar período de unicidade contratual reconhecido judicialmente)"
                />
              </div>
              
              {/* Informações adicionais */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="text-sm font-medium text-blue-900 mb-2">
                  Informações sobre os campos:
                </h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li><strong>Matrícula Incorporada:</strong> Matrícula cujo vínculo/contrato passou a integrar período de unicidade contratual</li>
                  <li><strong>Categoria:</strong> Código da categoria do trabalhador (código categoria cujo contrato passou a integrar período de unicidade contratual)</li>
                  <li><strong>Data de Início:</strong> Data de início cujo contrato passou a integrar período de unicidade contratual reconhecido judicialmente</li>
                </ul>
              </div>
            </div>
            
            {/* Footer do modal */}
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 rounded-b-lg flex justify-end space-x-3">
              <button
                onClick={handleCancelarInclusao}
                disabled={isLoading}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
              >
                CANCELAR
              </button>
              <button
                onClick={handleSalvarVinculo}
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
              >
                {isLoading ? 'SALVANDO...' : 'SALVAR'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};