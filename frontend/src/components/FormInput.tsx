import React from 'react';

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

/**
 * Reusable form input component with Tailwind CSS styling
 */
export const FormInput: React.FC<FormInputProps> = ({
  label,
  error,
  ...props
}) => {
  return (
    <div className="mb-6 flex flex-col">
      <label htmlFor={props.id} className="mb-2 font-medium text-slate-900">
        {label}
      </label>
      <input
        {...props}
        className={`
          px-3 py-2 border border-slate-300 rounded-lg font-sans transition-all duration-200
          focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100
          ${error ? 'border-red-500' : ''}
        `}
      />
      {error && <span className="mt-1 text-sm text-red-600">{error}</span>}
    </div>
  );
};

export default FormInput;
