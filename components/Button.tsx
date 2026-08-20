import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  fullWidth = false,
  className = '',
  ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center font-bold transition-all duration-200 focus:outline-none rounded-xl border";
  
  const variants = {
    primary: "bg-black border-black text-white hover:bg-gray-800 shadow-sm active:scale-[0.99]",
    secondary: "bg-white border-gray-200 text-gray-900 hover:bg-gray-50 hover:border-gray-300 shadow-sm active:scale-[0.99]",
    outline: "bg-transparent border-gray-300 text-gray-800 hover:bg-gray-100 hover:border-gray-400",
    ghost: "bg-transparent border-transparent text-gray-600 hover:bg-gray-100 hover:text-black",
  };

  const sizes = {
    sm: "px-3.5 py-2 text-xs",
    md: "px-5 py-2.5 text-sm",
    lg: "px-6 py-3.5 text-base",
  };

  const width = fullWidth ? "w-full" : "";

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${width} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};