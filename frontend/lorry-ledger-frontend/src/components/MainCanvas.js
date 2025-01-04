// components/MainCanvas.js
"use client";

import { Main } from "next/document";

const MainCanvas = ({ activeItem }) => {
    const renderContent = () => {
      switch (activeItem) {
        case 'dashboard':
          return <h2>Dashboard Overview</h2>;
        case 'drivers':
          return <h2>Drivers Management</h2>;
        case 'trips':
          return <h2>Trips Management</h2>;
        case 'vehicles':
          return <h2>Vehicles Management</h2>;
        case 'parties':
          return <h2>Parties Management</h2>;
        case 'settings':
          return <h2>Settings</h2>;
        default:
          return <h2>Select an item from the sidebar</h2>;
      }
    };
  
    return (
      <main className="flex-1 bg-secondary p-6">
        <div className="bg-white rounded-lg p-6 min-h-full">
          {renderContent()}
        </div>
      </main>
    );
  };

  export default MainCanvas;