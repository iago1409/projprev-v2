import React from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  cpf?: string;
  formatCPF?: (cpf: string) => string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  cpf,
  formatCPF
}) => {
  return (
    <div className="text-center mb-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">
        {title}
      </h1>
      {subtitle && (
        <p className="text-gray-600 mt-2">{subtitle}</p>
      )}
      {cpf && formatCPF && (
        <p className="text-lg text-gray-600">
          CPF: {formatCPF(cpf)}
        </p>
      )}
    </div>
  );
};
