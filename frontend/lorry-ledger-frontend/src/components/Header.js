// components/Header.js

"use client";

import { useState } from 'react';
import { Bell, User, LogOut } from 'lucide-react';

import { api } from '../utils/api'; // Import the API utility
import { API_ENDPOINTS } from '../utils/endpoints'; // Import the endpoint definitions
import { handleApiError } from '../utils/errorHandler'; // Import error handler

const Header = ({ userName }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const notifications = [
    { id: 1, message: 'New trip assigned', time: '5m ago' },
    { id: 2, message: 'Vehicle maintenance due', time: '1h ago' },
  ];

  const handleLogout = async () => {
    try {
      const response = await api.post(API_ENDPOINTS.auth.logout);
      response.success
        ? router.push('/')
        : notifyError(response.message || 'Something went wrong');
    } catch (error) {
      notifyError(handleApiError(error).message);
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-primary">Welcome, {userName}</h1>
        
        <div className="flex items-center space-x-6">
          {/* Notifications */}
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 hover:bg-secondary rounded-full"
            >
              <Bell className="w-6 h-6 text-textPrimary" />
              <span className="absolute top-0 right-0 bg-danger w-2 h-2 rounded-full"></span>
            </button>
            
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200">
                <div className="p-4">
                  <h3 className="text-lg font-semibold mb-4">Notifications</h3>
                  {notifications.map(notification => (
                    <div key={notification.id} className="py-2 border-b border-gray-100">
                      <p className="text-sm text-textPrimary">{notification.message}</p>
                      <span className="text-xs text-textSecondary">{notification.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Profile */}
          <div className="relative">
            <button 
              onClick={() => setShowProfile(!showProfile)}
              className="p-2 hover:bg-secondary rounded-full"
            >
              <User className="w-6 h-6 text-textPrimary" />
            </button>
            
            {showProfile && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200">
                <div className="p-2">
                  <button 
                    onClick={handleLogout}
                    className="flex items-center space-x-2 w-full p-2 hover:bg-secondary rounded-lg"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;