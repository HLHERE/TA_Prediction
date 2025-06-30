import React from 'react';

interface FooterProps {
  companyName: string;
}

const Footer: React.FC<FooterProps> = ( ) => {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="bg-slate-100 dark:bg-gray-900/80 text-slate-600 dark:text-gray-400 py-4 sm:py-6 text-center shadow-top transition-colors duration-300">
      <div className="container mx-auto px-4">
        <p className="text-sm">&copy; {currentYear}  Made by Mochamad haykal Alvegio Hadian | 213040028 | Teknik Informatika Universitas Pasundan</p>
        <p className="text-xs mt-1"></p>
      </div>
    </footer>
  );
};

export default Footer;