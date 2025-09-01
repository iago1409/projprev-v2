import React, { useState, useEffect } from 'react';
import { Plus, X, Calendar } from 'lucide-react';
import { TextInput } from './TextInput';
import { SelectInput } from './SelectInput';
import { DateInput } from './DateInput';
import { FormDataService } from '../services/formDataService';

interface VinculoIncorporado {
  id: string;
  matricIncorp: string;
  codCateg: string;
  dtInicio: string;
}

interface VinculosIncorporadosTabProps {
  cpf: string;
}

interface FormErrors {
  matricIncorp?: string;
  codCateg?: string;
  dtInicio?: string;
}

export const VinculosIncorporadosTab: React.FC<VinculosIncorporadosTabProps> = ({ cpf }) => {
  const [vinculos, setVinculos] = useState<VinculoIncorporado[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Estado do formulário do modal
  const [formData, setFormData] = useState({
    matricIncorp: '',
    codCateg: '',
    dtInicio: ''
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  
  // Opções para categoria (baseado no eSocial)
  const categoriaOptions = [
    { value: '', label: 'Selecione a categoria', description: 'Selecione uma das opções disponíveis' },
    { value: '101', label: '101 - Empregado', description: 'Empregado em geral, inclusive o empregado público da administração direta ou indireta contratado pela CLT' },
    { value: '102', label: '102 - Empregado Doméstico', description: 'Empregado doméstico' },
    { value: '103', label: '103 - Trabalhador Rural', description: 'Trabalhador rural por pequeno prazo' },
    { value: '104', label: '104 - Aprendiz', description: 'Aprendiz' },
    { value: '105', label: '105 - Servidor Público', description: 'Servidor público exercente de mandato eletivo' },
    { value: '106', label: '106 - Servidor Público CLT', description: 'Servidor público nomeado em cargo em comissão' },
    { value: '111', label: '111 - Empregado Contrato Verde e Amarelo', description: 'Empregado contratado nos termos da Lei nº 14.020/2020' },
    { value: '201', label: '201 - Trabalhador Avulso Portuário', description: 'Trabalhador avulso portuário' },
    { value: '202', label: '202 - Trabalhador Avulso Não Portuário', description: 'Trabalhador avulso não portuário' },
    { value: '301', label: '301 - Servidor Estatutário', description: 'Servidor público titular de cargo efetivo' },
    { value: '302', label: '302 - Servidor Estatutário Comissionado', description: 'Servidor público ocupante de cargo exclusivamente em comissão' },
    { value: '303', label: '303 - Servidor Estatutário Temporário', description: 'Servidor público ou militar, ocupante de cargo, função ou emprego público temporário' },
    { value: '306', label: '306 - Militar Efetivo', description: 'Militar efetivo das Forças Armadas' },
    { value: '307', label: '307 - Militar Conscritos', description: 'Militar - conscritos' },
    { value: '308', label: '308 - Agente Político', description: 'Agente político' },
    { value: '309', label: '309 - Servidor Público Indicado', description: 'Servidor público indicado a conselho de administração' },
    { value: '401', label: '401 - Dirigente Sindical', description: 'Dirigente sindical' },
    { value: '410', label: '410 - Trabalhador Cedido', description: 'Trabalhador cedido/em exercício em outro órgão' },
    { value: '701', label: '701 - Contribuinte Individual', description: 'Contribuinte individual' },
    { value: '711', label: '711 - Contribuinte Individual Transportador', description: 'Contribuinte individual - transportador autônomo' },
    { value: '712', label: '712 - Contribuinte Individual Diretor', description: 'Contribuinte individual - diretor não empregado' },
    { value: '721', label: '721 - Contribuinte Individual Cooperado', description: 'Contribuinte individual - cooperado' },
    { value: '722', label: '722 - Contribuinte Individual Cooperado Filiado', description: 'Contribuinte individual - cooperado filiado' },
    { value: '723', label: '723 - Contribuinte Individual Transportador Cooperado', description: 'Contribuinte individual - transportador cooperado' },
    { value: '731', label: '731 - Contribuinte Individual Magistrado', description: 'Contribuinte individual - magistrado classista temporário da Justiça do Trabalho' },
    { value: '734', label: '734 - Contribuinte Individual Ministro', description: 'Contribuinte individual - ministro de confissão religiosa' },
    { value: '738', label: '738 - Contribuinte Individual Jornalista', description: 'Contribuinte individual - jornalista profissional' },
    { value: '741', label: '741 - Contribuinte Individual Leiloeiro', description: 'Contribuinte individual - leiloeiro' },
    { value: '751', label: '751 - Contribuinte Individual Médico', description: 'Contribuinte individual - médico residente' },
    { value: '761', label: '761 - Contribuinte Individual Aeronauta', description: 'Contribuinte individual - aeronauta' },
    { value: '771', label: '771 - Contribuinte Individual Membro', description: 'Contribuinte individual - membro de conselho tutelar' },
    { value: '901', label: '901 - Segurado Especial', description: 'Segurado especial' }
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
  
  // Função para abrir o modal
  const handleIncluirClick = () => {
    if (vinculos.length >= 99) {
      alert('Limite máximo de 99 vínculos atingido');
      return;
    }
    
    setFormData({
      matricIncorp: '',
      codCateg: '',
      dtInicio: ''
    });
    setErrors({});
    setIsModalOpen(true);
  };
  
  // Função para fechar o modal
  const handleCancelarModal = () => {
    setIsModalOpen(false);
    setFormData({
      matricIncorp: '',
      codCateg: '',
      dtInicio: ''
    });
    setErrors({});
  };
  
  // Função para atualizar campos do formulário
  const handleFieldChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Limpar erro do campo quando começar a digitar
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };
  
  // Função de validação
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    // Validar matrícula incorporada (obrigatório)
    if (!formData.matricIncorp) {
      newErrors.matricIncorp = 'Campo obrigatório';
    } else if (formData.matricIncorp.length < 1 || formData.matricIncorp.length > 30) {
      newErrors.matricIncorp = 'Deve ter entre 1 e 30 caracteres';
    } else {
      // Verificar se a matrícula já existe
      const matriculaExiste = vinculos.some(v => v.matricIncorp === formData.matricIncorp);
      if (matriculaExiste) {
        newErrors.matricIncorp = 'Esta matrícula já foi cadastrada';
      }
    }
    
    // Validar categoria (obrigatório)
    if (!formData.codCateg) {
      newErrors.codCateg = 'Campo obrigatório';
    }
    
    // Validar data de início (obrigatório)
    if (!formData.dtInicio) {
      newErrors.dtInicio = 'Campo obrigatório';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Função para salvar o vínculo
  const handleSalvarVinculo = async () => {
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    try {
      const novoVinculo: VinculoIncorporado = {
        id: Date.now().toString(), // ID único baseado em timestamp
        matricIncorp: formData.matricIncorp,
        codCateg: formData.codCateg,
        dtInicio: formData.dtInicio
      };
      
      const novosVinculos = [...vinculos, novoVinculo];
      setVinculos(novosVinculos);
      
      // Salvar no serviço
      await FormDataService.saveVinculosIncorporados(cpf, novosVinculos);
      
      // Fechar modal e limpar formulário
      setIsModalOpen(false);
      setFormData({
        matricIncorp: '',
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
  
  // Função para remover um vínculo
  const handleRemoverVinculo = async (id: string) => {
    if (!confirm('Tem certeza que deseja remover este vínculo?')) {
      return;
    }
    
    try {
      const novosVinculos = vinculos.filter(v => v.id !== id);
      setVinculos(novosVinculos);
      
      // Salvar no serviço
      await FormDataService.saveVinculosIncorporados(cpf, novosVinculos);
    } catch (error) {
      console.error('Erro ao remover vínculo:', error);
      alert('Erro ao remover vínculo');
    }
  };
  
  // Função para obter o nome da categoria
  const getCategoriaLabel = (codigo: string): string => {
    const categoria = categoriaOptions.find(opt => opt.value === codigo);
    return categoria ? categoria.label : codigo;
  };
  
  return (
    <div className="space-y-6">
      {/* Cabeçalho da aba */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Vínculos Incorporados
          </h2>
          <span className="text-sm text-gray-500">
            {vinculos.length} de 99 vínculos
          </span>
        </div>
        
        {/* Botão de incluir */}
        <button
          onClick={handleIncluirClick}
          disabled={vinculos.length >= 99}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>+ INCLUIR INFORMAÇÃO DE VÍNCULO/CONTRATO INCORPORADO</span>
        </button>
        
        {vinculos.length >= 99 && (
          <p className="mt-2 text-sm text-red-600">
            Limite máximo de 99 vínculos atingido
          </p>
        )}
      </div>
      
      {/* Lista de vínculos cadastrados */}
      {vinculos.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">
            Vínculos Cadastrados ({vinculos.length})
          </h3>
          
          {vinculos.map((vinculo, index) => (
            <div key={vinculo.id} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Matrícula Incorporada
                    </label>
                    <p className="text-sm text-gray-900 font-mono bg-gray-50 px-2 py-1 rounded">
                      {vinculo.matricIncorp}
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Categoria
                    </label>
                    <p className="text-sm text-gray-900 bg-gray-50 px-2 py-1 rounded">
                      {getCategoriaLabel(vinculo.codCateg)}
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Data de Início de TSVE
                    </label>
                    <p className="text-sm text-gray-900 font-mono bg-gray-50 px-2 py-1 rounded">
                      {vinculo.dtInicio}
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={() => handleRemoverVinculo(vinculo.id)}
                  className="ml-4 p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-full transition-colors"
                  title="Remover vínculo"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <div className="mt-2 text-xs text-gray-500">
                Vínculo #{index + 1}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Modal de inclusão */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Overlay */}
          <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"></div>
          
          {/* Modal */}
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              {/* Header do modal */}
              <div className="bg-gray-100 px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  Incluir Vínculo/Contrato Incorporado
                </h3>
              </div>
              
              {/* Conteúdo do modal */}
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Matrícula Incorporada */}
                  <TextInput
                    value={formData.matricIncorp}
                    onChange={(value) => handleFieldChange('matricIncorp', value)}
                    label="Matrícula Incorporada"
                    placeholder="Digite a matrícula"
                    required
                    error={errors.matricIncorp}
                    maxLength={30}
                    tooltip="Informar a matrícula incorporada (matrícula cujo vínculo/contrato passou a integrar período de unicidade contratual reconhecido judicialmente)"
                  />
                  
                  {/* Categoria */}
                  <SelectInput
                    value={formData.codCateg}
                    onChange={(value) => handleFieldChange('codCateg', value)}
                    options={categoriaOptions}
                    label="Categoria"
                    placeholder="Selecione a categoria"
                    required
                    error={errors.codCateg}
                  />
                  
                  {/* Data de Início de TSVE */}
                  <DateInput
                    value={formData.dtInicio}
                    onChange={(value) => handleFieldChange('dtInicio', value)}
                    label="Data de Início de TSVE"
                    placeholder="DD/MM/AAAA"
                    required
                    error={errors.dtInicio}
                    tooltip="Data de início de TSVE (data de início cujo contrato passou a integrar período de unicidade contratual reconhecido judicialmente)"
                  />
                </div>
                
                {/* Informação adicional */}
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Informação:</strong> Preencher com o código da categoria do trabalhador (código categoria cujo contrato passou a integrar período de unicidade contratual reconhecido judicialmente).
                  </p>
                </div>
              </div>
              
              {/* Footer do modal */}
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
                <button
                  onClick={handleCancelarModal}
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
        </div>
      )}
    </div>
  );
};