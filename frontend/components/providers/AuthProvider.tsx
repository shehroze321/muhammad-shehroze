'use client';

import { useEffect } from 'react';
import { useGetProfileQuery } from '@/lib/api/authApi';
import { useAppDispatch } from '@/lib/store/hooks';
import { setUser, setLoading } from '@/lib/store/slices/authSlice';
import Cookies from 'js-cookie';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const token = Cookies.get('auth_token');
  
  const { data, isLoading, error } = useGetProfileQuery(undefined, {
    skip: !token,
  });

  useEffect(() => {
    dispatch(setLoading(isLoading));
    
    if (data?.data) {
      console.log('AuthProvider - User data updated:', {
        userId: data.data.id,
        email: data.data.email,
        freeQuotaUsed: data.data.freeQuotaUsed,
        freeQuotaLimit: data.data.freeQuotaLimit,
        remaining: data.data.freeQuotaLimit - data.data.freeQuotaUsed
      });
      dispatch(setUser(data.data));
    } else if (error) {
      dispatch(setUser(null));
    }
  }, [data, isLoading, error, dispatch]);

  return <>{children}</>;
}

