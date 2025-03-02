"use client";

import { useState, useEffect } from "react";
import Header from "../../components/Header";
import Sidebar from "../../components/SideBar";
import MainCanvas from "../../components/MainCanvas";
import withAuth from "../../utils/withAuth";



const Dashboard = () => {
  const [activeItem, setActiveItem] = useState("drivers");
  const [userName, setUserName] = useState("");

  useEffect(() => {
    // Fetch user details from localStorage or an API
    const user = JSON.parse(localStorage.getItem("user")); // Replace with an API call if needed
    if (user) {
      setUserName(user.name);
    }
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

export default withAuth(Dashboard);
