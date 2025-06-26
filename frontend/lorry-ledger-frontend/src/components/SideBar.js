// components/Sidebar.js

"use client";

import { Truck, Users, MapPin, Building, Settings, User } from "lucide-react";

const Sidebar = ({ activeItem, setActiveItem }) => {
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: MapPin },
    { id: "drivers", label: "Drivers", icon: Users },
    { id: "trips", label: "Trips", icon: Truck },
    { id: "vehicles", label: "Vehicles", icon: Truck },
    { id: "parties", label: "Parties", icon: Building },
    { id: "suppliers", label: "Suppliers", icon: User },
    { id: "lorryReceipts", label: "Lorry Receipts", icon: User },
    { id: "invoice", label: "Invoice", icon: User },
    { id: "customers", label: "Customers", icon: Users },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-primary">Lorry Ledger</h2>
      </div>

      <nav className="mt-6">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveItem(item.id)}
            className={`flex items-center space-x-3 w-full px-6 py-4 text-left
              ${
                activeItem === item.id
                  ? "bg-primary text-white"
                  : "text-textPrimary hover:bg-secondary"
              }`}
          >
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
