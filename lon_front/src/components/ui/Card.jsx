export function Card({ className = "", children }) {
    return (
      <div className={`
        bg-white 
        rounded-lg 
        shadow-md 
        overflow-hidden
        ${className}
      `}>
        {children}
      </div>
    );
  }
  
  Card.Header = function CardHeader({ className = "", children }) {
    return (
      <div className={`
        px-6 
        py-4 
        border-b 
        border-gray-200
        ${className}
      `}>
        {children}
      </div>
    );
  };
  
  Card.Body = function CardBody({ className = "", children }) {
    return (
      <div className={`
        px-6 
        py-4
        ${className}
      `}>
        {children}
      </div>
    );
  };