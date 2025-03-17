import React from 'react';
import Link from 'next/link';

const LogoIcon = () => (
  <div className="p-1.5 rounded">
    <svg width="32" height="32" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="#000000" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3">
      <polyline points="50.83 18.04 55.47 18.04 55.47 51.97 8.53 51.97 8.53 18.04 13.05 18.04" />
      <path d="M49.83,47V12c-13.57.44-17.89,6-17.89,6s-5.44-6.23-17.88-6V47a44.38,44.38,0,0,1,17.88,5S41.8,47.33,49.83,47Z" />
      <line x1="31.94" y1="18.04" x2="31.94" y2="51.97" />
    </svg>
  </div>
);

const Logo = ({ 
  withText = true, 
  linkWrapper = true 
}: { 
  withText?: boolean;
  linkWrapper?: boolean;
}) => {
  const LogoContent = () => (
    <div className="flex items-center space-x-2 select-none flex-shrink-0">
      <LogoIcon />
      {withText && (
        <h1 className="text-xl font-bold">
          <span className="text-black">Surf</span><span className="text-black">Academy</span>
        </h1>
      )}
    </div>
  );

  if (linkWrapper) {
    return (
      <Link href="/" className="flex items-center space-x-2 select-none flex-shrink-0">
        <LogoContent />
      </Link>
    );
  }

  return <LogoContent />;
};

export default Logo; 