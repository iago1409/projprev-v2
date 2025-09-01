import React from 'react';

interface ConsolidacaoTabProps {
  cpf: string;
}

export const ConsolidacaoTab: React.FC<ConsolidacaoTabProps> = ({ cpf }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
      <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Consolidação dos Valores do Contrato
        </h3>
        <p className="text-gray-600">
          Esta seção será implementada em breve.
        </p>
        {cpf && (
          <p className="text-sm text-gray-500 mt-2">
            CPF: {cpf}
          </p>
        )}
      </div>
    </div>
  );
};