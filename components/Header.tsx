import React from "react";

interface HeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
}

const Header: React.FC<HeaderProps> = ({ title, subtitle, icon }) => {
  return (
    <header className="text-center mb-6">
      {icon && <div className="text-4xl mb-2">{icon}</div>}
      <h1 className="text-3xl font-bold text-gray-800">{title}</h1>
      {subtitle && <p className="text-gray-600 mt-1">{subtitle}</p>}
    </header>
  );
};

export default Header;
