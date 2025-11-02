import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Navigate, Link, useLocation } from 'react-router-dom';
import { 
  Users, 
  Building2, 
  Wrench, 
  DollarSign, 
  LayoutDashboard, 
  LogOut,
  UserCog,
  UserPlus,
  ClipboardList,
  BarChart3,
  StickyNote,
  ChevronDown,
  Settings
} from 'lucide-react';
import { ProfileSettings } from '@/components/ProfileSettings';
import { GlobalNoteButton } from '@/components/GlobalNoteButton';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { user, userRole, signOut, loading } = useAuth();
  const location = useLocation();
  const [profileOpen, setProfileOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const navigation = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      name: 'Clients',
      href: '/dashboard/clients',
      icon: Building2,
    },
    {
      name: 'Trainees',
      href: '/dashboard/trainees',
      icon: UserPlus,
    },
    {
      name: 'Services',
      href: '/dashboard/services',
      icon: Wrench,
    },
    {
      name: 'Orders',
      href: '/dashboard/orders',
      icon: ClipboardList,
    },
    {
      name: 'Reports',
      href: '/dashboard/reports',
      icon: BarChart3,
    },
    {
      name: 'Dash Users',
      href: '/dashboard/users',
      icon: Users,
      adminOnly: true,
    },
    {
      name: 'Admin',
      href: '/dashboard/admin',
      icon: Settings,
      adminOnly: true,
    },
  ];

  const getInitials = (firstName: string = '', lastName: string = '') => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || 'U';
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      window.location.href = '/auth';
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };
  
  const filteredNavigation = navigation.filter(item => {
    return !item.adminOnly || userRole === 'admin' || userRole === 'master';
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center px-6">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-semibold">OHS Clinic Admin</h1>
          </div>
          
          <div className="ml-auto flex items-center space-x-4">
            <Badge variant={userRole === 'admin' ? 'default' : 'secondary'}>
              {userRole?.toUpperCase()}
            </Badge>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {getInitials(user.user_metadata?.first_name, user.user_metadata?.last_name)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {`${user.user_metadata?.first_name || ''} ${user.user_metadata?.last_name || ''}`.trim() || 'User'}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setProfileOpen(true)}>
                  <UserCog className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/dashboard/action-notes">
                    <StickyNote className="mr-2 h-4 w-4" />
                    <span>Action Notes</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Horizontal Navigation */}
      <nav className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center px-6 py-3 space-x-2 overflow-x-auto">
          {filteredNavigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center space-x-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground whitespace-nowrap ${
                  isActive
                    ? 'bg-accent text-accent-foreground'
                    : 'text-foreground/70'
                }`}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Main content */}
      <main className="flex-1">
        <div className="p-6">
          {children}
        </div>
      </main>
      
      <ProfileSettings 
        open={profileOpen} 
        onOpenChange={setProfileOpen} 
      />
      
      {/* Floating Note Button - Always visible */}
      <GlobalNoteButton />
    </div>
  );
};

export default DashboardLayout;