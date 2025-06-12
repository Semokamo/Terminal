import React from 'react';

interface IconProps {
  className?: string;
}

const EmailIcon: React.FC<IconProps> = ({ className }) => (
  <svg 
    className={className || "w-16 h-16 text-blue-400"} 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    xmlns="http://www.w3.org/2000/svg" 
    aria-hidden="true"
  >
    <path fillRule="evenodd" clipRule="evenodd" d="M20 4H4C2.89543 4 2 4.89543 2 6V18C2 19.1046 2.89543 20 4 20H20C21.1046 20 22 19.1046 22 18V6C22 4.89543 21.1046 4 20 4ZM20 6L12 11L4 6H20ZM4 18V8.23607L11.3396 12.3551C11.7205 12.5655 12.2795 12.5655 12.6604 12.3551L20 8.23607V18H4Z" />
  </svg>
);

export default EmailIcon;
