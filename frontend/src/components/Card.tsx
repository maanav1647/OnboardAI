import React from 'react';

interface CardProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * Reusable Card component with Tailwind CSS styling
 */
export const Card: React.FC<CardProps> = ({
  title,
  description,
  children,
  className = '',
}) => {
  return (
    <div className={`bg-white rounded-lg shadow-md p-6 transition-shadow duration-200 hover:shadow-lg ${className}`}>
      {title && <h2 className="text-2xl font-bold mb-2 text-slate-900">{title}</h2>}
      {description && <p className="text-slate-600 mb-4">{description}</p>}
      <div>{children}</div>
    </div>
  );
};

export default Card;
