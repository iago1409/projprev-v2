import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '../components/layout/PageLayout';
import { PageHeader } from '../components/layout/PageHeader';
import { ActionButtons } from '../components/ui/ActionButtons';

function InformacoesDecisao() {
  const navigate = useNavigate();

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
      label: 'Múltiplos Eventos',
      onClick: () => navigate('/processo/multiplos-eventos')
    },
    {
      label: 'Informações da Decisão ou Acordo'
    }
  ];

  const handleVoltar = () => {
    navigate('/processo/multiplos-eventos');
  };

  const handleProximo = () => {
    // Não implementado ainda
  };

  return (
    <PageLayout breadcrumbItems={breadcrumbItems}>
      <PageHeader
        title="Informações da Decisão ou Acordo"
        subtitle="Etapa em construção…"
      />
      
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <div className="bg-blue-50 p-6 rounded-lg">
            <p className="text-blue-800 text-sm">
              Esta seção será implementada nas próximas iterações do sistema.
              Por enquanto, você pode voltar para a etapa anterior ou retornar ao início.
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <ActionButtons
        onPrevious={handleVoltar}
        onNext={handleProximo}
        showCancel={false}
        showSaveDraft={false}
        nextLabel="Próximo"
        nextDisabled={true}
      />
    </PageLayout>
  );
}

export default InformacoesDecisao;