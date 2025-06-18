/* =========================
   File: withAuth.js
   Purpose: Making all the business logic routes protected
========================= */

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation"; // Use `next/navigation` for `app` directory
import { api } from "../utils/api"; // Axios instance for API requests
import { API_ENDPOINTS } from "../utils/endpoints"; // Axios instance for API requests
import { notifyError } from "../components/Notification";

const withAuth = (WrappedComponent) => {
  return (props) => {
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState(null);

    useEffect(() => {
      const checkAuth = async () => {
        try {
          // Verify authentication with the backend
          await api.get(API_ENDPOINTS.auth.verify);
          setIsAuthenticated(true);
        } catch (error) {
          setIsAuthenticated(false);
          notifyError("Please login to continue.");
          router.push("/"); // Redirect to login page
        }
      };

      checkAuth();
    }, [router]);

    // Render a loading spinner or placeholder while authentication is being verified
    if (isAuthenticated === null) {
      return <div>Loading...</div>;
    }

    // Render the wrapped component if authenticated
    return isAuthenticated ? <WrappedComponent {...props} /> : null;
  };
};

export default withAuth;
