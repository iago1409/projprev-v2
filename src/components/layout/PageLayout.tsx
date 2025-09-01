import React from 'react';

interface PageLayoutProps {
  children: React.ReactNode;
  breadcrumbItems?: Array<{
    label: string;
    href?: string;
    onClick?: () => void;
  }>;
  className?: string;
}

export const PageLayout: React.FC<PageLayoutProps> = ({
  children,
  breadcrumbItems = [],
  className = ''
}) => {
  return (
    <div className={`min-h-screen bg-white ${className}`}>
      {/* Breadcrumb */}
      {breadcrumbItems.length > 0 && (
        <div className="bg-gray-50 border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <nav className="text-sm text-gray-600">
              {breadcrumbItems.map((item, index) => (
                <span key={index}>
                  {item.onClick ? (
                    <button
                      onClick={item.onClick}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      {item.label}
                    </button>
                  ) : (
                    <span className={index === breadcrumbItems.length - 1 ? 'text-gray-600' : 'text-blue-600'}>
                      {item.label}
                    </span>
                  )}
                  {index < breadcrumbItems.length - 1 && <span className="mx-2">→</span>}
                </span>
              ))}
            </nav>
          </div>
        </div>
      )}
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </div>
    </div>
  );
};
