// pages/dashboard.js
"use client";

import { useState, useEffect } from 'react';
import Header from '../../components/Header';
import Sidebar from '../../components/SideBar';
import MainCanvas from '../../components/MainCanvas';

const Dashboard = () => {
  const [activeItem, setActiveItem] = useState('dashboard');
  const [userName, setUserName] = useState('');

  useEffect(() => {
    // Get user data from local storage or API
    // const user = JSON.parse(localStorage.getItem('user'));
    // if (user) {
    //   setUserName(user.name);
    // }
  }, []);

  // Protect route
  useEffect(() => {
    // const token = localStorage.getItem('token');
    // if (!token) {
    //   window.location.href = '/login';
    // }
  }, []);

  return (
    <div className="flex h-screen">
      <Sidebar activeItem={activeItem} setActiveItem={setActiveItem} />
      <div className="flex flex-col flex-1">
        <Header userName={userName} />
        <MainCanvas activeItem={activeItem} />
      </div>
    </div>
  );
};

export default Dashboard;