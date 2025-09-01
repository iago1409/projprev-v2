import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSearchParams } from 'react-router-dom';
import { PageLayout } from '../components/layout/PageLayout';
import { PageHeader } from '../components/layout/PageHeader';
import { ActionButtons } from '../components/ui/ActionButtons';
import { SubTabs } from '../components/navigation/SubTabs';
import { TextInput } from '../components/TextInput';
import { SelectInput } from '../components/SelectInput';
import { DateInput } from '../components/DateInput';
import { formatCPF } from '../utils/cpfUtils';
import { FormDataService } from '../services/formDataService';
import { Plus, X } from 'lucide-react';

// Interface para um vínculo incorporado
interface VinculoIncorporado {
  id: string;
  matriculaIncorp: string;
  codCateg: string;
  dtInicio: string;
}

// Interface para os dados do formulário do modal
interface ModalFormData {
  matriculaIncorp: string;
  codCateg: string;
  dtInicio: string;
}

// Interface para erros de validação do modal
interface ModalFormErrors {
  matriculaIncorp?: string;
  codCateg?: string;
  dtInicio?: string;
}

export const VinculosIncorporados: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const cpf = searchParams.get('cpf') || '';
  const activeTab = 'vinculos';
  
  // Estado dos vínculos salvos
  const [vinculos, setVinculos] = useState<VinculoIncorporado[]>([]);
  
  // Estado do modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalFormData, setModalFormData] = useState<ModalFormData>({
    matriculaIncorp: '',
    codCateg: '',
    dtInicio: ''
  });
  const [modalErrors, setModalErrors] = useState<ModalFormErrors>({});
  
  // Estado de loading
  const [isLoading, setIsLoading] = useState(false);
  
  // Opções para categoria (baseado no eSocial)
  const categoriaOptions = [
    { value: '', label: 'Selecione a categoria', description: 'Selecione uma das categorias disponíveis' },
    { value: '101', label: '101 - Empregado', description: 'Empregado em geral, inclusive o empregado público da administração direta ou indireta contratado pela CLT' },
    { value: '102', label: '102 - Empregado Doméstico', description: 'Empregado doméstico' },
    { value: '103', label: '103 - Trabalhador Rural', description: 'Trabalhador rural por pequeno prazo' },
    { value: '104', label: '104 - Aprendiz', description: 'Aprendiz' },
    { value: '105', label: '105 - Servidor Público', description: 'Servidor público exercente de mandato eletivo' },
    { value: '106', label: '106 - Servidor Público CLT', description: 'Servidor público nomeado em cargo em comissão' },
    { value: '111', label: '111 - Diretor não Empregado', description: 'Diretor não empregado, com FGTS' },
    { value: '201', label: '201 - Contribuinte Individual', description: 'Contribuinte individual' },
    { value: '202', label: '202 - Contribuinte Individual Diretor', description: 'Contribuinte individual - diretor não empregado, sem FGTS' },
    { value: '301', label: '301 - Servidor Estatutário', description: 'Servidor público titular de cargo efetivo' },
    { value: '302', label: '302 - Servidor Comissionado', description: 'Servidor público ocupante de cargo exclusivamente em comissão' },
    { value: '303', label: '303 - Agente Político', description: 'Agente público' },
    { value: '306', label: '306 - Servidor Temporário', description: 'Servidor público indicado a conselho de administração' },
    { value: '309', label: '309 - Servidor Designado', description: 'Servidor público indicado para conselho fiscal ou órgão equivalente' },
    { value: '401', label: '401 - Estagiário', description: 'Estagiário' },
    { value: '701', label: '701 - Cooperado', description: 'Contribuinte individual - cooperado que presta serviços por intermédio de cooperativa de trabalho' },
    { value: '711', label: '711 - Cooperado Médico', description: 'Contribuinte individual - cooperado filiado a cooperativa de produção' },
    { value: '712', label: '712 - Transportador Cooperado', description: 'Contribuinte individual - transportador cooperado' },
    { value: '721', label: '721 - Médico Residente', description: 'Contribuinte individual - médico residente' },
    { value: '722', label: '722 - Bolsista', description: 'Contribuinte individual - bolsista' },
    { value: '723', label: '723 - Participante de Curso', description: 'Contribuinte individual - participante de curso de formação' },
    { value: '731', label: '731 - Dirigente Sindical', description: 'Contribuinte individual - dirigente sindical' },
    { value: '734', label: '734 - Trabalhador Cedido', description: 'Contribuinte individual - trabalhador cedido/em exercício descentralizado' },
    { value: '738', label: '738 - Ministro Religioso', description: 'Contribuinte individual - ministro de confissão religiosa' },
    { value: '741', label: '741 - Trabalhador Avulso', description: 'Trabalhador avulso portuário' },
    { value: '751', label: '751 - Trabalhador Avulso Não Portuário', description: 'Trabalhador avulso não portuário' },
    { value: '761', label: '761 - Trabalhador Temporário', description: 'Trabalhador temporário' },
    { value: '771', label: '771 - Trabalhador Intermitente', description: 'Trabalhador em regime de tempo parcial' },
    { value: '781', label: '781 - Menor Aprendiz', description: 'Menor aprendiz' }
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
      label: 'Vínculos Incorporados'
    }
  ];
  
  // Função para abrir o modal
  const handleIncluirVinculo = () => {
    if (vinculos.length >= 99) {
      alert('Limite máximo de 99 vínculos atingido');
      return;
    }
    
    setModalFormData({
      matriculaIncorp: '',
      codCateg: '',
      dtInicio: ''
    });
    setModalErrors({});
    setIsModalOpen(true);
  };
  
  // Função para fechar o modal
  const handleCancelarModal = () => {
    setIsModalOpen(false);
    setModalFormData({
      matriculaIncorp: '',
      codCateg: '',
      dtInicio: ''
    });
    setModalErrors({});
  };
  
  // Função para atualizar campos do modal
  const handleModalFieldChange = (field: keyof ModalFormData, value: string) => {
    setModalFormData(prev => ({ ...prev, [field]: value }));
    
    // Limpar erro do campo quando começar a digitar
    if (modalErrors[field]) {
      setModalErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };
  
  // Função de validação do modal
  const validateModalForm = (): boolean => {
    const newErrors: ModalFormErrors = {};
    
    // Validar matrícula incorporada (obrigatório)
    if (!modalFormData.matriculaIncorp) {
      newErrors.matriculaIncorp = 'Campo obrigatório';
    } else if (modalFormData.matriculaIncorp.length < 1 || modalFormData.matriculaIncorp.length > 30) {
      newErrors.matriculaIncorp = 'Deve ter entre 1 e 30 caracteres';
    } else {
      // Verificar se a matrícula já existe
      const matriculaExiste = vinculos.some(v => v.matriculaIncorp === modalFormData.matriculaIncorp);
      if (matriculaExiste) {
        newErrors.matriculaIncorp = 'Esta matrícula já foi cadastrada';
      }
    }
    
    // Validar categoria (obrigatório)
    if (!modalFormData.codCateg) {
      newErrors.codCateg = 'Campo obrigatório';
    }
    
    // Validar data de início (obrigatório)
    if (!modalFormData.dtInicio) {
      newErrors.dtInicio = 'Campo obrigatório';
    }
    
    setModalErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Função para salvar vínculo
  const handleSalvarVinculo = async () => {
    if (!validateModalForm()) {
      return;
    }
    
    if (!cpf) return;
    
    setIsLoading(true);
    try {
      // Criar novo vínculo
      const novoVinculo: VinculoIncorporado = {
        id: Date.now().toString(),
        matriculaIncorp: modalFormData.matriculaIncorp,
        codCateg: modalFormData.codCateg,
        dtInicio: modalFormData.dtInicio
      };
      
      // Adicionar à lista
      const novosVinculos = [...vinculos, novoVinculo];
      setVinculos(novosVinculos);
      
      // Salvar no serviço
      await FormDataService.saveVinculosIncorporados(cpf, novosVinculos);
      
      // Fechar modal
      setIsModalOpen(false);
      setModalFormData({
        matriculaIncorp: '',
        codCateg: '',
        dtInicio: ''
      });
      setModalErrors({});
      
    } catch (error) {
      console.error('Erro ao salvar vínculo:', error);
      alert('Erro ao salvar vínculo');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Função para remover vínculo
  const handleRemoverVinculo = async (vinculoId: string) => {
    if (!confirm('Deseja realmente remover este vínculo?')) {
      return;
    }
    
    if (!cpf) return;
    
    setIsLoading(true);
    try {
      // Remover da lista
      const novosVinculos = vinculos.filter(v => v.id !== vinculoId);
      setVinculos(novosVinculos);
      
      // Salvar no serviço
      await FormDataService.saveVinculosIncorporados(cpf, novosVinculos);
      
    } catch (error) {
      console.error('Erro ao remover vínculo:', error);
      alert('Erro ao remover vínculo');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Função para obter o nome da categoria
  const getCategoriaLabel = (codigo: string): string => {
    const categoria = categoriaOptions.find(opt => opt.value === codigo);
    return categoria ? categoria.label : codigo;
  };
  
  // Handlers para os botões de ação
  const handleCancel = () => {
    navigate('/');
  };
  
  const handleSaveDraft = async () => {
    if (!cpf) return;
    
    setIsLoading(true);
    try {
      await FormDataService.saveVinculosIncorporados(cpf, vinculos);
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
    if (!cpf) return;
    
    setIsLoading(true);
    try {
      await FormDataService.saveVinculosIncorporados(cpf, vinculos);
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
        title="Vínculos Incorporados"
        subtitle="Gerencie informações de vínculos/contratos incorporados"
        cpf={cpf}
        formatCPF={formatCPF}
      />
      
      {/* Sub Tabs */}
      <SubTabs activeTab={activeTab} cpf={cpf} />
      
      {/* Seção Principal */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
        <div className="flex justify-between items-center mb-6 pb-3 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Vínculos/Contratos Incorporados
          </h2>
          <span className="text-sm text-gray-500">
            {vinculos.length} de 99 vínculos
          </span>
        </div>
        
        {/* Botão de Incluir */}
        <div className="mb-6">
          <button
            onClick={handleIncluirVinculo}
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
        
        {/* Lista de Vínculos */}
        {vinculos.length > 0 ? (
          <div className="space-y-4">
            {vinculos.map((vinculo, index) => (
              <div key={vinculo.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 mb-2">
                      Vínculo {index + 1}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">Matrícula:</span>
                        <p className="text-gray-600">{vinculo.matriculaIncorp}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Categoria:</span>
                        <p className="text-gray-600">{getCategoriaLabel(vinculo.codCateg)}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Data de Início:</span>
                        <p className="text-gray-600">{vinculo.dtInicio}</p>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoverVinculo(vinculo.id)}
                    className="ml-4 p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors"
                    title="Remover vínculo"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>Nenhum vínculo incorporado cadastrado.</p>
            <p className="text-sm mt-1">Clique no botão acima para adicionar o primeiro vínculo.</p>
          </div>
        )}
      </div>
      
      {/* Modal de Inclusão */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header do Modal */}
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Incluir Vínculo/Contrato Incorporado
              </h3>
            </div>
            
            {/* Conteúdo do Modal */}
            <div className="px-6 py-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Matrícula Incorporada */}
                <TextInput
                  value={modalFormData.matriculaIncorp}
                  onChange={(value) => handleModalFieldChange('matriculaIncorp', value)}
                  label="Matrícula Incorporada"
                  placeholder="Digite a matrícula"
                  required
                  error={modalErrors.matriculaIncorp}
                  maxLength={30}
                  tooltip="Informar a matrícula incorporada (matrícula cujo vínculo/contrato passou a integrar período de unicidade contratual reconhecido judicialmente)"
                />
                
                {/* Categoria */}
                <SelectInput
                  value={modalFormData.codCateg}
                  onChange={(value) => handleModalFieldChange('codCateg', value)}
                  options={categoriaOptions}
                  label="Categoria"
                  placeholder="Selecione a categoria"
                  required
                  error={modalErrors.codCateg}
                />
                
                {/* Data de Início de TSVE */}
                <DateInput
                  value={modalFormData.dtInicio}
                  onChange={(value) => handleModalFieldChange('dtInicio', value)}
                  label="Data de Início de TSVE"
                  placeholder="DD/MM/AAAA"
                  required
                  error={modalErrors.dtInicio}
                  tooltip="Data de início de TSVE (data de início cujo contrato passou a integrar período de unicidade contratual reconhecido judicialmente)"
                />
              </div>
            </div>
            
            {/* Footer do Modal */}
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
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
      )}
      
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