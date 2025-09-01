// src/pages/SucessaoVinculo.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PageLayout } from '../components/layout/PageLayout';
import { PageHeader } from '../components/layout/PageHeader';
import { ActionButtons } from '../components/ui/ActionButtons';
import { TextInput } from '../components/TextInput';
import { SelectInput } from '../components/SelectInput';
import { DateInput } from '../components/DateInput';
import { formatCPF } from '../utils/cpfUtils';
import { FormDataService } from '../services/formDataService';

type FieldKey =
  | 'sucessaoPreencher'
  | 'sucessaoTpInsc'
  | 'sucessaoNrInsc'
  | 'sucessaoMatricAnt'
  | 'sucessaoDtTransf';

interface SucessaoVinculoData {
  sucessaoPreencher: boolean;
  sucessaoTpInsc: string;
  sucessaoNrInsc: string;
  sucessaoMatricAnt: string;
  sucessaoDtTransf: string;
}

const DEFAULT_DATA: SucessaoVinculoData = {
  sucessaoPreencher: false,
  sucessaoTpInsc: '',
  sucessaoNrInsc: '',
  sucessaoMatricAnt: '',
  sucessaoDtTransf: '',
};

export const SucessaoVinculo: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const cpf = searchParams.get('cpf') || '';

  const [formData, setFormData] = useState<SucessaoVinculoData>(DEFAULT_DATA);
  const [isLoading, setIsLoading] = useState(false);

  // Utilitário para salvar 1 campo
  const saveField = async (field: FieldKey, value: string | boolean) => {
    if (!cpf) return;
    try {
      // Persistimos 'sucessaoPreencher' como 'S'/'N' para manter padrão com outros campos
      const toSave =
        field === 'sucessaoPreencher'
          ? (value ? 'S' : 'N')
          : (value as string);
      await FormDataService.saveField(cpf, field, toSave);
    } catch (err) {
      console.error('Erro ao salvar campo:', field, err);
    }
  };

  // Carrega rascunho existente
  useEffect(() => {
    const load = async () => {
      if (!cpf) return;
      try {
        const saved = await FormDataService.getFormData(cpf);
        const parsed: SucessaoVinculoData = {
          sucessaoPreencher:
            saved?.sucessaoPreencher === true ||
            saved?.sucessaoPreencher === 'S' ||
            saved?.sucessaoPreencher === 'true',
          sucessaoTpInsc: saved?.sucessaoTpInsc || '',
          sucessaoNrInsc: saved?.sucessaoNrInsc || '',
          sucessaoMatricAnt: saved?.sucessaoMatricAnt || '',
          sucessaoDtTransf: saved?.sucessaoDtTransf || '',
        };
        setFormData((prev) => ({ ...prev, ...parsed }));
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
      }
    };
    load();
  }, [cpf]);

  // Mudança de checkbox
  const handleToggle = async (checked: boolean) => {
    const next: SucessaoVinculoData = {
      ...formData,
      sucessaoPreencher: checked,
      ...(checked
        ? {}
        : {
            sucessaoTpInsc: '',
            sucessaoNrInsc: '',
            sucessaoMatricAnt: '',
            sucessaoDtTransf: '',
          }),
    };
    setFormData(next);

    await saveField('sucessaoPreencher', checked);
    if (!checked) {
      await Promise.all([
        saveField('sucessaoTpInsc', ''),
        saveField('sucessaoNrInsc', ''),
        saveField('sucessaoMatricAnt', ''),
        saveField('sucessaoDtTransf', ''),
      ]);
    }
  };

  // Mudança de campos visíveis
  const handleChange = async (field: FieldKey, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    await saveField(field, value);
  };

  // Breadcrumb
  const breadcrumbItems = [
    { label: 'Início', onClick: () => navigate('/') },
    { label: 'Registro de Processo' },
    { label: 'Informações de Sucessão de Vínculo' },
  ];

  // Handlers dos botões
  const handleCancel = () => navigate('/');
  const handlePrevious = () => navigate('/processo/informacoes-do-processo');
  const handleSaveDraft = async () => {
    if (!cpf) return;
    setIsLoading(true);
    try {
      await FormDataService.saveFormData(cpf, formData);
      alert('Rascunho salvo com sucesso!');
    } catch (e) {
      console.error(e);
      alert('Erro ao salvar rascunho');
    } finally {
      setIsLoading(false);
    }
  };
  const handleNext = async () => {
    if (!cpf) return;
    setIsLoading(true);
    try {
      await FormDataService.saveFormData(cpf, formData);
      navigate('/processo/vinculo'); // ajuste depois se necessário
    } catch (e) {
      console.error(e);
      alert('Erro ao salvar dados');
    } finally {
      setIsLoading(false);
    }
  };

  const showFields = formData.sucessaoPreencher;

  return (
    <PageLayout breadcrumbItems={breadcrumbItems}>
      <PageHeader
        title="Informações de Sucessão de Vínculo"
        cpf={cpf}
        formatCPF={formatCPF}
      />

      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-6 pb-3 border-b border-gray-200">
          Dados da Sucessão de Vínculo
        </h2>

        {/* Toggle */}
        <label className="flex items-center gap-3 mb-6">
          <input
            type="checkbox"
            className="h-4 w-4"
            checked={formData.sucessaoPreencher}
            onChange={(e) => handleToggle(e.target.checked)}
          />
          <span className="text-sm text-gray-900">
            Preencher informações de sucessão de vínculo?
          </span>
        </label>

        {/* Campos condicionais */}
        {showFields && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SelectInput
              value={formData.sucessaoTpInsc}
              onChange={(v) => handleChange('sucessaoTpInsc', v)}
              options={[
                { value: '1', label: '1 - CNPJ' },
                { value: '2', label: '2 - CPF' },
                { value: '5', label: '5 - CGC' },
                { value: '6', label: '6 - CEI' },
              ]}
              label="Tipo de inscrição do empregador anterior"
              placeholder="Selecione o tipo de inscrição"
            />

            <TextInput
              value={formData.sucessaoNrInsc}
              onChange={(v) => handleChange('sucessaoNrInsc', v)}
              label="Número de inscrição do empregador anterior"
              placeholder="Digite o número de inscrição"
            />

            <TextInput
              value={formData.sucessaoMatricAnt}
              onChange={(v) => handleChange('sucessaoMatricAnt', v)}
              label="Matrícula no empregador anterior"
              placeholder="Digite a matrícula anterior"
            />

            <DateInput
              value={formData.sucessaoDtTransf}
              onChange={(v) => handleChange('sucessaoDtTransf', v)}
              label="Data da transferência para o empregador atual"
              placeholder="DD/MM/AAAA"
            />
          </div>
        )}
      </div>

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
