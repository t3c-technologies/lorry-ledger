// components/MainCanvas.js
"use client";

import Drivers from "../app/modules/Drivers";
import Trucks from "@/app/modules/Trucks";

const MainCanvas = ({ activeItem = "drivers" }) => {
  const renderContent = () => {
    switch (activeItem) {
      case "dashboard":
        return <h2>Dashboard Overview</h2>;
      case "drivers":
        return <Drivers />;
      case "trips":
        return <h2>Trips Management</h2>;
      case "vehicles":
        return <Trucks />;
      case "parties":
        return <h2>Parties Management</h2>;
      case "settings":
        return <h2>Settings</h2>;
      default:
        return <h2>Select an item from the sidebar</h2>;
    }
  };

  return (
    <main className="flex-1 bg-secondary p-2">
      <div className="bg-white rounded-lg p-2 min-h-full">
        {renderContent()}
      </div>
    </main>
  );
};

export default MainCanvas;
