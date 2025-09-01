import React from 'react';

interface ActionButtonsProps {
  onCancel?: () => void;
  onSaveDraft?: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
  isLoading?: boolean;
  cancelLabel?: string;
  saveDraftLabel?: string;
  previousLabel?: string;
  nextLabel?: string;
  showCancel?: boolean;
  showSaveDraft?: boolean;
  showPrevious?: boolean;
  showNext?: boolean;
  nextDisabled?: boolean;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  onCancel,
  onSaveDraft,
  onPrevious,
  onNext,
  isLoading = false,
  cancelLabel = 'CANCELAR',
  saveDraftLabel = 'SALVAR RASCUNHO',
  previousLabel = 'ANTERIOR',
  nextLabel = 'PRÓXIMO',
  showCancel = true,
  showSaveDraft = true,
  showPrevious = true,
  showNext = true,
  nextDisabled = false
}) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 sm:space-x-4">
      <div className="flex space-x-4">
        {showCancel && onCancel && (
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {cancelLabel}
          </button>
        )}
        {showSaveDraft && onSaveDraft && (
          <button
            onClick={onSaveDraft}
            disabled={isLoading}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {saveDraftLabel}
          </button>
        )}
      </div>
      
      <div className="flex space-x-4">
        {showPrevious && onPrevious && (
          <button
            onClick={onPrevious}
            disabled={isLoading}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {previousLabel}
          </button>
        )}
        {showNext && onNext && (
          <button
            onClick={onNext}
            disabled={isLoading || nextDisabled}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {nextLabel}
          </button>
        )}
      </div>
    </div>
  );
};
