const variants = {
    primary: "bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500",
    secondary: "bg-secondary-600 text-white hover:bg-secondary-700 focus:ring-secondary-500",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
    outline: "border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-primary-500",
  };
  
  const sizes = {
    sm: "px-2 py-1 text-sm",
    md: "px-4 py-2",
    lg: "px-6 py-3 text-lg",
  };
  
  export function Button({ 
    variant = "primary", 
    size = "md", 
    className = "", 
    children, 
    ...props 
  }) {
    return (
      <button
        className={`
          ${variants[variant]}
          ${sizes[size]}
          rounded-md
          font-medium
          focus:outline-none focus:ring-2 focus:ring-offset-2
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-colors
          ${className}
        `}
        {...props}
      >
        {children}
      </button>
    );
  }