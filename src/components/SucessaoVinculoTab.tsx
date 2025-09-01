import React from 'react';

interface SucessaoVinculoTabProps {
  cpf: string;
}

export const SucessaoVinculoTab: React.FC<SucessaoVinculoTabProps> = ({ cpf }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
      <h2 className="text-xl font-semibold text-gray-900 mb-6 pb-3 border-b border-gray-200">
        Informações de Sucessão de Vínculo
      </h2>
      
      <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Informações de Sucessão de Vínculo
        </h3>
        <p className="text-gray-600">
          Os campos desta seção serão implementados em breve.
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