import React, { createContext, useContext, useState } from 'react';

const TabsContext = createContext();

export function Tabs({ children, defaultValue, ...props }) {
  const [activeTab, setActiveTab] = useState(defaultValue);

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div {...props}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsContent({ value, children, ...props }) {
  const { activeTab } = useContext(TabsContext);
  if (value !== activeTab) return null;
  return <div {...props}>{children}</div>;
}

export function TabsList({ children, ...props }) {
  return <div className="flex" {...props}>{children}</div>;
}

export function TabsTrigger({ value, children, ...props }) {
  const { activeTab, setActiveTab } = useContext(TabsContext);
  return (
    <button
      className={`px-4 py-2 ${activeTab === value ? 'bg-blue-100' : 'bg-gray-200'} hover:bg-gray-300`}
      onClick={() => setActiveTab(value)}
      {...props}
    >
      {children}
    </button>
  );
}