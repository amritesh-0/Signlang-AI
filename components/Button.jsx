
import React from 'react';

const Button = ({
    children,
    variant = 'primary',
    size = 'md',
    isLoading,
    className,
    ...props
}) => {
    const variants = {
        primary: 'bg-indigo-600 text-white hover:bg-indigo-700 active:bg-indigo-800 focus:ring-indigo-500',
        secondary: 'bg-slate-100 text-slate-900 hover:bg-slate-200 active:bg-slate-300 focus:ring-slate-400',
        outline: 'border-2 border-slate-200 text-slate-700 hover:border-indigo-600 hover:text-indigo-600 focus:ring-indigo-500',
        danger: 'bg-red-500 text-white hover:bg-red-600 active:bg-red-700 focus:ring-red-400',
        accent: 'bg-teal-500 text-white hover:bg-teal-600 active:bg-teal-700 focus:ring-teal-400',
    };

    const sizes = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-5 py-2.5 text-base',
        lg: 'px-8 py-3.5 text-lg font-semibold',
        xl: 'px-10 py-5 text-xl font-bold',
    };

    return (
        <button
            className={`
        relative inline-flex items-center justify-center rounded-xl transition-all duration-200 
        disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2
        ${variants[variant]} ${sizes[size]} ${className || ''}
      `}
            disabled={isLoading}
            {...props}
        >
            {isLoading ? (
                <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                </>
            ) : children}
        </button>
    );
};

export default Button;
