import React from 'react';

export function Select({ children, ...props }) {
  return (
    <select className="border border-gray-300 rounded px-3 py-2 w-full" {...props}>
      {children}
    </select>
  );
}

export function SelectContent({ children }) {
  return <>{children}</>;
}

export function SelectItem({ children, ...props }) {
  return <option {...props}>{children}</option>;
}

export function SelectTrigger({ children }) {
  return <>{children}</>;
}

export function SelectValue({ children }) {
  return <>{children}</>;
}