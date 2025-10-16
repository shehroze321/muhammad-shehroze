'use client';

import { Menu, Sparkles, User } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAppSelector, useAppDispatch } from '@/lib/store/hooks';
import { useLogoutMutation } from '@/lib/api/authApi';
import { clearAuth } from '@/lib/store/slices/authSlice';

interface HeaderProps {
  onToggleSidebar?: () => void;
  sidebarOpen?: boolean;
  quotaRemaining?: number;
  quotaTotal?: number;
  hasActiveSubscription?: boolean;
}

export function Header({
  onToggleSidebar,
  sidebarOpen = false,
  quotaRemaining = 3,
  quotaTotal = 3,
  hasActiveSubscription = false,
}: HeaderProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const [logout, { isLoading: isLoggingOut }] = useLogoutMutation();


  const handleLogout = async () => {
    try {
      await logout().unwrap();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      // Always clear auth state and redirect
      dispatch(clearAuth());
      router.push('/');
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-lg dark:bg-gray-900/80">
      <div className="flex h-16 items-center justify-between px-4">
        {/* Left Section */}
        <div className="flex items-center gap-3">
          {/* Menu toggle for authenticated users with sidebar */}
          {onToggleSidebar && (
            <div className="relative group">
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleSidebar}
                className="flex"
              >
                <Menu className={`h-5 w-5 transition-transform duration-200 ${sidebarOpen ? 'rotate-90' : ''}`} />
              </Button>
              {/* Custom tooltip */}
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                {sidebarOpen ? "Close sidebar" : "Open sidebar"}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-gray-900"></div>
              </div>
            </div>
          )}

          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-brand">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gradient-brand">
                EchoWrite
              </h1>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          {!hasActiveSubscription && quotaRemaining !== undefined && quotaTotal !== undefined && (
            <div className="hidden sm:flex items-center gap-2 rounded-full border px-3 py-1.5 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/30 dark:to-blue-950/30">
              <Sparkles className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium">
                {quotaRemaining}/{quotaTotal} Free
              </span>
            </div>
          )}
          
          {hasActiveSubscription && (
            <div className="hidden sm:flex items-center gap-2 rounded-full border px-3 py-1.5 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30">
              <Sparkles className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-700 dark:text-green-300">
                Premium
              </span>
            </div>
          )}

          {isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10 border-2 border-purple-200">
                    <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-white">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div>
                    <p className="font-semibold">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                    {user.isEmailVerified && (
                      <p className="text-xs text-green-600 mt-1">✓ Verified</p>
                    )}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {user.isEmailVerified !== false && (
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem asChild>
                  <Link href="/subscriptions" className="cursor-pointer">
                    <Sparkles className="mr-2 h-4 w-4" />
                    Subscriptions
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="text-red-600 cursor-pointer"
                >
                  {isLoggingOut ? 'Logging out...' : 'Logout'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Login
                </Button>
              </Link>
              <Link href="/register">
                <Button
                  size="sm"
                  className="bg-gradient-brand hover:opacity-90"
                >
                  Sign Up Free
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
