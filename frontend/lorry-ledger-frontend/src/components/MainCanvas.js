// components/MainCanvas.js
"use client";

import Parties from "@/app/modules/Parties";
import Drivers from "../app/modules/Drivers";
import Trucks from "@/app/modules/Trucks";
import Suppliers from "@/app/modules/Suppliers";
import TripsMain from "@/app/modules/TripsMain";
import LorryReceipt from "@/app/modules/LorryReceipt";

const MainCanvas = ({ activeItem = "drivers" }) => {
  const renderContent = () => {
    switch (activeItem) {
      case "dashboard":
        return <h2>Dashboard Overview</h2>;
      case "drivers":
        return <Drivers />;
      case "trips":
        return <TripsMain />;
      case "vehicles":
        return <Trucks />;
      case "parties":
        return <Parties />;
      case "suppliers":
        return <Suppliers />;
      case "lorryReceipts":
        return <LorryReceipt />;
      case "settings":
        return <h2>Settings</h2>;
      default:
        return <h2>Select an item from the sidebar</h2>;
    }
  };

  return (
    <main className="flex-1 bg-secondary p-2 overflow-auto h-screen">
      <div className="bg-white rounded-lg p-2 min-h-full">
        {renderContent()}
      </div>
    </main>
  );
};

export default MainCanvas;
