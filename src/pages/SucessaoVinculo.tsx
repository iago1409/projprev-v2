import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '../components/layout/PageLayout';
import { PageHeader } from '../components/layout/PageHeader';
import { ActionButtons } from '../components/ui/ActionButtons';
import { TextInput } from '../components/TextInput';
import { SelectInput } from '../components/SelectInput';
import { RadioGroup } from '../components/RadioGroup';
import { DateInput } from '../components/DateInput';

/**
 * TEMPLATE PAGE - Página modelo para desenvolvimento
 * 
 * Esta página serve como um template/guia para a criação de novas páginas no sistema.
 * 
 * COMPONENTES UTILIZADOS:
 * 
 * 1. PageLayout: Layout padrão com breadcrumb integrado
 *    - Wrap principal da página
 *    - Breadcrumb automático baseado nos items fornecidos
 *    - Container responsivo centralizado
 * 
 * 2. PageHeader: Cabeçalho padronizado
 *    - Título principal da página
 *    - Subtítulo opcional
 *    - Exibição de CPF formatado (quando aplicável)
 * 
 * 3. ActionButtons: Botões de ação padronizados
 *    - Cancelar, Salvar Rascunho, Anterior, Próximo
 *    - Estados de loading
 *    - Configuração flexível de quais botões mostrar
 * 
 * 4. Form Components: Componentes de formulário reutilizáveis
 *    - TextInput: Campo de texto simples
 *    - SelectInput: Campo de seleção
 *    - RadioGroup: Grupo de radio buttons
 *    - DateInput: Campo de data com máscara
 * 
 * COMO USAR ESTE TEMPLATE:
 * 
 * 1. Copie este arquivo para uma nova página
 * 2. Altere o nome da função e do arquivo
 * 3. Ajuste o breadcrumb items conforme a navegação
 * 4. Personalize o título e subtítulo no PageHeader
 * 5. Adicione os campos de formulário necessários
 * 6. Configure os botões de ação conforme a necessidade
 * 7. Implemente a lógica de validação e submissão
 * 
 * ESTRUTURA PADRÃO:
 * - PageLayout (container principal)
 *   - PageHeader (título e informações da página)
 *   - Form Section (campos de entrada)
 *   - ActionButtons (botões de navegação/ação)
 */

// Interface para os dados do formulário (CUSTOMIZE CONFORME NECESSÁRIO)
interface FormData {
  campo1: string;
  campo2: string;
  campo3: string;
  campo4: string;
}

// Interface para erros de validação (CUSTOMIZE CONFORME NECESSÁRIO)
interface FormErrors {
  campo1?: string;
  campo2?: string;
  campo3?: string;
  campo4?: string;
}

export const SucessaoVinculo: React.FC = () => {
  const navigate = useNavigate();
  
  // Estado do formulário (CUSTOMIZE CONFORME NECESSÁRIO)
  const [formData, setFormData] = useState<FormData>({
    campo1: '',
    campo2: '',
    campo3: '',
    campo4: ''
  });
  
  // Estado de erros (CUSTOMIZE CONFORME NECESSÁRIO)
  const [errors, setErrors] = useState<FormErrors>({});
  
  // Estado de loading
  const [isLoading, setIsLoading] = useState(false);
  
  // Configuração do breadcrumb (CUSTOMIZE CONFORME NECESSÁRIO)
  const breadcrumbItems = [
    {
      label: 'Início',
      onClick: () => navigate('/')
    },
    {
      label: 'Seção Anterior',
      onClick: () => navigate('/secao-anterior') // AJUSTE A ROTA
    },
    {
      label: 'Página Template' // PÁGINA ATUAL - SEM onClick
    }
  ];
  
  // Opções para campos select (CUSTOMIZE CONFORME NECESSÁRIO)
  const opcoesCampo2 = [
    { value: '', label: 'Selecione uma opção', description: 'Selecione uma das opções disponíveis' },
    { value: '1', label: 'Opção 1', description: 'Descrição da opção 1' },
    { value: '2', label: 'Opção 2', description: 'Descrição da opção 2' },
    { value: '3', label: 'Opção 3', description: 'Descrição da opção 3' }
  ];
  
  // Opções para radio buttons (CUSTOMIZE CONFORME NECESSÁRIO)
  const opcoesCampo3 = [
    { value: 'S', label: 'Sim' },
    { value: 'N', label: 'Não' }
  ];
  
  // Função para atualizar campos do formulário
  const handleFieldChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Limpar erro do campo quando começar a digitar
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };
  
  // Função de validação (IMPLEMENTE CONFORME NECESSÁRIO)
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    // Exemplo de validação
    if (!formData.campo1) {
      newErrors.campo1 = 'Campo obrigatório';
    }
    
    if (!formData.campo2) {
      newErrors.campo2 = 'Campo obrigatório';
    }
    
    if (formData.campo1 && formData.campo1.length < 3) {
      newErrors.campo1 = 'Deve ter pelo menos 3 caracteres';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handlers para os botões de ação (IMPLEMENTE CONFORME NECESSÁRIO)
  const handleCancel = () => {
    navigate('/'); // AJUSTE A ROTA DE CANCELAMENTO
  };
  
  const handleSaveDraft = async () => {
    setIsLoading(true);
    try {
      // IMPLEMENTE A LÓGICA DE SALVAR RASCUNHO
      console.log('Salvando rascunho:', formData);
      alert('Rascunho salvo com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar rascunho:', error);
      alert('Erro ao salvar rascunho');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handlePrevious = () => {
    navigate('/secao-anterior'); // AJUSTE A ROTA DA PÁGINA ANTERIOR
  };
  
  const handleNext = async () => {
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    try {
      // IMPLEMENTE A LÓGICA DE SALVAR E NAVEGAR
      console.log('Salvando dados:', formData);
      navigate('/proxima-secao'); // AJUSTE A ROTA DA PRÓXIMA PÁGINA
    } catch (error) {
      console.error('Erro ao salvar dados:', error);
      alert('Erro ao salvar dados');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <PageLayout breadcrumbItems={breadcrumbItems}>
      {/* Cabeçalho da Página */}
      <PageHeader
        title="Página Template" // CUSTOMIZE O TÍTULO
        subtitle="Esta é uma página modelo para desenvolvimento" // CUSTOMIZE O SUBTÍTULO
        // cpf="12345678901" // DESCOMENTE E FORNEÇA CPF SE NECESSÁRIO
        // formatCPF={formatCPF} // DESCOMENTE E IMPORTE A FUNÇÃO SE NECESSÁRIO
      />
      
      {/* Seção do Formulário */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-6 pb-3 border-b border-gray-200">
          Dados do Formulário {/* CUSTOMIZE O TÍTULO DA SEÇÃO */}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Campo de Texto Simples */}
          <TextInput
            value={formData.campo1}
            onChange={(value) => handleFieldChange('campo1', value)}
            label="Campo de Texto" // CUSTOMIZE O LABEL
            placeholder="Digite aqui..." // CUSTOMIZE O PLACEHOLDER
            required
            error={errors.campo1}
            tooltip="Esta é uma dica de ajuda para o campo" // OPCIONAL
            maxLength={50} // OPCIONAL
          />
          
          {/* Campo de Seleção */}
          <SelectInput
            value={formData.campo2}
            onChange={(value) => handleFieldChange('campo2', value)}
            options={opcoesCampo2}
            label="Campo de Seleção" // CUSTOMIZE O LABEL
            placeholder="Selecione uma opção" // CUSTOMIZE O PLACEHOLDER
            required
            error={errors.campo2}
          />
          
          {/* Campo de Data */}
          <DateInput
            value={formData.campo4}
            onChange={(value) => handleFieldChange('campo4', value)}
            label="Data" // CUSTOMIZE O LABEL
            required
            error={errors.campo4}
            tooltip="Formato: DD/MM/AAAA" // OPCIONAL
          />
          
          {/* Radio Group - Ocupa toda a largura */}
          <div className="md:col-span-2">
            <RadioGroup
              value={formData.campo3}
              onChange={(value) => handleFieldChange('campo3', value)}
              options={opcoesCampo3}
              name="campo3"
              label="Campo de Escolha" // CUSTOMIZE O LABEL
              required
              error={errors.campo3}
            />
          </div>
        </div>
        
        {/* Seção Adicional (OPCIONAL) */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Seção Adicional {/* CUSTOMIZE CONFORME NECESSÁRIO */}
          </h3>
          
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-blue-800 text-sm">
              Aqui você pode adicionar informações adicionais, dicas ou seções especiais do formulário.
            </p>
          </div>
        </div>
      </div>
      
      {/* Botões de Ação */}
      <ActionButtons
        onCancel={handleCancel}
        onSaveDraft={handleSaveDraft}
        onPrevious={handlePrevious}
        onNext={handleNext}
        isLoading={isLoading}
        // Configuração opcional dos botões (descomente conforme necessário):
        // showCancel={true}
        // showSaveDraft={true}
        // showPrevious={true}
        // showNext={true}
        // cancelLabel="CANCELAR"
        // saveDraftLabel="SALVAR RASCUNHO"
        // previousLabel="ANTERIOR"
        // nextLabel="PRÓXIMO"
      />
    </PageLayout>
  );
};
