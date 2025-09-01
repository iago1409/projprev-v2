import React from 'react';

interface Step {
  id: string;
  label: string;
  status: 'completed' | 'current' | 'pending';
}

interface ProcessStepperProps {
  steps: Step[];
  className?: string;
}

export const ProcessStepper: React.FC<ProcessStepperProps> = ({ steps, className = '' }) => {
  return (
    <div className={`mb-8 ${className}`}>
      <div className="flex items-center">
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            <div className="flex items-center">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                step.status === 'completed' 
                  ? 'bg-green-500 text-white'
                  : step.status === 'current'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-300 text-gray-600'
              }`}>
                {step.status === 'completed' ? '✓' : index + 1}
              </div>
              <span className={`ml-2 text-sm font-medium ${
                step.status === 'completed'
                  ? 'text-green-600'
                  : step.status === 'current'
                  ? 'text-blue-600'
                  : 'text-gray-500'
              }`}>
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div className={`flex-1 mx-4 h-px ${
                step.status === 'completed' 
                  ? 'bg-green-500'
                  : step.status === 'current'
                  ? 'bg-blue-500'
                  : 'bg-gray-300'
              }`}></div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
