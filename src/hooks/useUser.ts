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

  useEffect(() => {
    const fetchUser = async () => {
      try {
        // Use relative URL in development to avoid CORS issues
        const baseUrl = process.env.NODE_ENV === 'development'
          ? 'http://localhost:3001/api'  // Next.js proxy
          : 'http://localhost:8080';     // Direct API call in production

        const res = await fetch(`${baseUrl}/auth/me`, {
          credentials: "include", // send the httpOnly cookie
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!res.ok) {
          console.warn(`HTTP error! status: ${res.status}`);
          setUser(null);
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
  }, []);

  return { user, loading };
}
