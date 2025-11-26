"use client";

import { useState, useEffect } from "react";

export type Role = {
  priority: number;
  role_name: string;
};

export type User = {
  id: string;
  name: string;
  email_gojaks: string;
  groups: null;
  roles: Role[];
};

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  const logout = () => {
    localStorage.removeItem('access_token');
    setUser(null);
    setToken(null);
    setLoading(false);
  };

  const refetchUser = () => {
    const currentToken = localStorage.getItem('access_token');
    setToken(currentToken);
    setLoading(true);
  };

  useEffect(() => {
    if (token === null) {
      // Initial load, check localStorage
      refetchUser();
      return;
    }

    const fetchUser = async () => {
      try {
        console.log('Token from state:', token ? `${token.substring(0, 50)}...` : 'No token found');

        // Use relative URL in development to avoid CORS issues
        const baseUrl = 'https://14d87ace0ad2.ngrok-free.app';

        const headers: HeadersInit = {
          'Content-Type': 'application/json',
        };

        // Add Authorization header if token exists
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        } else {
          // No token, get fresh from localStorage
          const freshToken = localStorage.getItem('access_token');
          if (freshToken) {
            headers['Authorization'] = `Bearer ${freshToken}`;
          }
        }

        console.log('Fetching user data from:', `${baseUrl}/auth/me`);
        console.log('Headers:', headers);

        const res = await fetch(`/api/auth/me`, {
          credentials: "include", // send the httpOnly cookie
          headers:{
		 "Authorization": token ? `Bearer ${token}` : "",
   		 "Content-Type": "application/json",	
	}
        });

        console.log('Response status:', res.status);
        console.log('Response ok:', res.ok);

        if (!res.ok) {
          if (res.status === 401) {
            console.log('Unauthorized - clearing invalid token');
            logout();
          } else {
            console.warn(`HTTP error! status: ${res.status}`);
            setUser(null);
          }
          setLoading(false);
          return;
        }

        const data = await res.json();
        console.log('User data received:', data);
        setUser(data.user);
      } catch (err) {
        if (err instanceof TypeError && err.message.includes('Failed to fetch')) {
          console.warn('CORS error or network error - backend might be down or CORS not configured');
        } else {
          console.error('Error fetching user:', err);
        }
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [token]);

  return { user, loading, logout, refetchUser };
}

