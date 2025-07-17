import React from 'react';
import { Button } from '@/lib/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Calendar, LogOut, User, BarChart3, ArrowLeft } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/lib/ui/dropdown-menu';

type AppScreen = 'calendar' | 'stats';

interface AppHeaderProps {
  currentScreen: AppScreen;
  onNavigate: (screen: AppScreen) => void;
}

export const AppHeader = React.forwardRef<HTMLDivElement, AppHeaderProps>(
  ({ currentScreen, onNavigate }, ref) => {
    const { user, signOut } = useAuth();
    const router = useRouter();

    const getPageTitle = () => {
      switch (currentScreen) {
        case 'stats':
          return '会議統計';
        case 'calendar':
        default:
          return 'Awesome Calendar';
      }
    };

    const showBackButton = currentScreen !== 'calendar';

    const handleSignOut = async () => {
      await signOut();
      router.push('/auth/signin');
    };

    return (
      <header ref={ref} className="bg-background border-b border-border">
        <div className="flex items-center justify-between h-14 px-4">
          <div className="flex items-center space-x-4">
            {showBackButton ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigate('calendar')}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">戻る</span>
              </Button>
            ) : (
              <div className="flex items-center space-x-2">
                <Calendar className="h-6 w-6" />
                <span className="text-xl">Awesome Calendar</span>
              </div>
            )}
            
            {showBackButton && (
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5" />
                <span className="text-lg">{getPageTitle()}</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-2">
            {currentScreen === 'calendar' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigate('stats')}
                className="gap-2"
              >
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">統計</span>
              </Button>
            )}
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">{user?.name || user?.email}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleSignOut} className="gap-2">
                  <LogOut className="h-4 w-4" />
                  ログアウト
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
    );
  }
);

AppHeader.displayName = 'AppHeader';