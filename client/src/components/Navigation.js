import React from 'react';
import { Link } from 'react-router-dom';
import { Home, FileText, Users, CreditCard, PhoneCall } from "lucide-react";

const Navigation = () => {
  const navItems = [
    { icon: Home, label: "Home", path: "/" },
    { icon: FileText, label: "Projects", path: "/projects" },
    { icon: Users, label: "Team", path: "/team" },
    { icon: CreditCard, label: "Accounts", path: "/accounts" },
    { icon: PhoneCall, label: "CRM", path: "/crm" },
  ]

  return (
    <div className="bg-white p-6">
      <nav className="flex justify-between items-center mb-8">
        <div className="w-40 h-12 bg-red-500 rounded-md"></div>
        <div className="flex space-x-6">
          {navItems.map((item, index) => (
            <Link
              key={index}
              to={item.path}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <item.icon className="w-5 h-5 mr-1" />
              <span className="text-sm">{item.label}</span>
            </Link>
          ))}
        </div>
        <div className="w-12 h-12 bg-yellow-400 rounded-full"></div>
      </nav>
    </div>
  );
};

export default Navigation;