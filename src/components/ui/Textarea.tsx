import React from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  required?: boolean;
  maxLength?: number;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, required, maxLength, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        <div className="flex justify-between items-center mb-1.5">
          {label && (
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide">
              {label} {required && <span className="text-red-500">*</span>}
            </label>
          )}
          {maxLength && (
            <span className="text-[10px] text-gray-400 font-medium">
              {(props.value as string)?.length || 0}/{maxLength}
            </span>
          )}
        </div>
        {/* Fake Rich Text Toolbar for MVP Design matching */}
        {props.id === 'description' && (
          <div className="border border-b-0 border-gray-200 bg-gray-50/80 rounded-t-lg px-3 py-2 flex gap-3 text-gray-500 border-b border-gray-100">
            <button type="button" className="text-sm font-serif font-bold hover:text-gray-900">B</button>
            <button type="button" className="text-sm font-serif italic hover:text-gray-900">I</button>
            <button type="button" className="text-sm font-serif underline hover:text-gray-900">U</button>
            <div className="w-px h-4 bg-gray-300 self-center"></div>
            <button type="button" className="text-xs hover:text-gray-900">List</button>
            <button type="button" className="text-xs hover:text-gray-900">Link</button>
          </div>
        )}
        <textarea
          ref={ref}
          maxLength={maxLength}
          className={`w-full px-4 py-3 border rounded-lg text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#5022C3]/20 focus:border-[#5022C3] bg-gray-50/50 hover:bg-gray-50 text-gray-900 placeholder:text-gray-400 min-h-[100px] resize-y ${
            props.id === 'description' ? 'rounded-t-none border-t-0' : ''
          } ${error ? 'border-red-300 bg-red-50/30' : 'border-gray-200'} ${className}`}
          {...props}
        />
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';
