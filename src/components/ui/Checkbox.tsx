import React from 'react';
import { Check } from 'lucide-react';

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  id?: string;
  label?: string;
  disabled?: boolean;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  checked,
  onChange,
  id,
  label,
  disabled = false,
}) => {
  return (
    <label
      htmlFor={id}
      className={`inline-flex items-center gap-2 cursor-pointer select-none group ${
        disabled ? 'cursor-not-allowed opacity-50' : ''
      }`}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="relative flex items-center justify-center">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only peer"
        />
        <div
          className={`w-5 h-5 rounded-lg border transition-all duration-200 flex items-center justify-center ${
            checked
              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 border-indigo-400 text-white shadow-md shadow-indigo-600/35'
              : 'border-white/20 bg-slate-900/80 group-hover:border-indigo-400/60 group-hover:bg-slate-800'
          } peer-focus-visible:ring-2 peer-focus-visible:ring-indigo-500 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-slate-900`}
        >
          <Check
            className={`w-3.5 h-3.5 stroke-[3] transition-transform duration-200 ${
              checked ? 'scale-100 opacity-100' : 'scale-50 opacity-0'
            }`}
          />
        </div>
      </div>
      {label && <span className="text-sm text-slate-300">{label}</span>}
    </label>
  );
};
