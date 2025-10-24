'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import Api from '@/services/Api';
import { AxiosResponse } from 'axios';
import { User } from '@/data/dtos/user.dto';

type UserContextType = {
  user: User | null;
  loading: boolean;
  error: string | null;
  refreshUser: () => Promise<void>;
};

const UserContext = createContext<UserContextType>({
  user: null,
  loading: true,
  error: null,
  refreshUser: async () => {},
});

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const response = await Api.getMe();
      
      if (!response) {
        throw new Error('No response from server');
      }
      
      setUser(response.data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch user data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <UserContext.Provider 
      value={{ 
        user, 
        loading, 
        error,
        refreshUser: fetchUser 
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}