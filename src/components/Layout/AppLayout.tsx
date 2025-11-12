import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const Layout: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleSidebarToggle = (collapsed: boolean) => {
    setSidebarCollapsed(collapsed);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <div className={`transition-all duration-300 ease-in-out ${
        sidebarCollapsed ? 'w-16' : 'w-64'
      }`}>
        <Sidebar onToggle={handleSidebarToggle} />
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Navbar */}
        <Navbar />

        {/* Main content area */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
