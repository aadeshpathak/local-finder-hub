import { MapPin, Menu, X, User, LogOut, Settings, MessageCircle, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessagesModal } from './MessagesModal';
import { deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';

interface HeaderProps {
  onSignIn: () => void;
  onGetStarted: () => void;
  onBrowseServices: () => void;
  onHowItWorks: () => void;
  onForProviders: () => void;
}

export function Header({ onSignIn, onGetStarted, onBrowseServices, onHowItWorks, onForProviders }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [messagesModalOpen, setMessagesModalOpen] = useState(false);
  const { user, profile, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleNavClick = (action: () => void) => {
    setMobileMenuOpen(false);
    action();
  };

  const handleLogout = async () => {
    await logout();
  };

  const handleSettings = () => {
    navigate('/settings');
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'users', user.uid));
      await logout();
      toast({
        title: "Account Deleted",
        description: "Your account has been permanently deleted.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete account.",
        variant: "destructive",
      });
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl hero-gradient flex items-center justify-center">
              <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg sm:text-xl text-foreground">
              Local<span className="text-primary">Pro</span>
            </span>
          </a>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            <button
              onClick={onBrowseServices}
              className="text-sm font-medium text-foreground hover:text-primary transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-sm"
            >
              Browse Services
            </button>
            {user ? (
              <>
                {profile?.isProvider && (
                  <button
                    onClick={() => navigate('/manage-service')}
                    className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-sm"
                  >
                    Add/Manage Service
                  </button>
                )}
                <button
                  onClick={() => setMessagesModalOpen(true)}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-sm"
                >
                  Messages
                </button>
                {profile?.role === 'admin' && (
                  <button
                    onClick={() => navigate('/admin')}
                    className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-sm"
                  >
                    Admin Panel
                  </button>
                )}
              </>
            ) : (
              <>
                <button
                  onClick={onHowItWorks}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-sm"
                >
                  How It Works
                </button>
                <button
                  onClick={onForProviders}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-sm"
                >
                  For Providers
                </button>
              </>
            )}
          </nav>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2">
                    <Avatar className="w-6 h-6">
                      <AvatarImage src={profile?.profilePicThumbnail || profile?.profilePic} alt={profile?.name || 'User'} />
                      <AvatarFallback>
                        <User className="w-4 h-4" />
                      </AvatarFallback>
                    </Avatar>
                    {profile?.name || user.email?.split('@')[0]}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => navigate('/my-info')}>
                    <User className="w-4 h-4 mr-2" />
                    My Info
                  </DropdownMenuItem>
                  {profile?.isProvider && (
                    <DropdownMenuItem onClick={() => navigate('/my-services')}>
                      My Services
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={() => navigate('/messages')}>
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Messages
                  </DropdownMenuItem>
                  {profile?.isProvider && (
                    <DropdownMenuItem onClick={() => navigate('/my-reviews')}>
                      My Reviews
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={handleSettings}>
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </DropdownMenuItem>
                  {profile?.role === 'admin' && (
                    <DropdownMenuItem onClick={() => navigate('/admin')}>
                      Admin Panel
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleDeleteAccount} className="text-red-600">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Account
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button
                  variant="ghost"
                  onClick={onSignIn}
                  className="text-sm font-medium"
                >
                  Sign In
                </Button>
                <Button onClick={onGetStarted}>
                  Get Started
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden h-11 w-11 flex items-center justify-center hover:bg-muted rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border animate-fade-in">
            <nav className="flex flex-col gap-4">
              <button
                onClick={() => handleNavClick(onBrowseServices)}
                className="text-sm font-medium text-foreground text-left hover:text-primary transition-colors"
              >
                Browse Services
              </button>
              {user ? (
                <>
                  {profile?.isProvider && (
                    <button
                      onClick={() => handleNavClick(() => navigate('/manage-service'))}
                      className="text-sm font-medium text-muted-foreground text-left hover:text-foreground transition-colors"
                    >
                      Add/Manage Service
                    </button>
                  )}
                  <button
                    onClick={() => handleNavClick(() => setMessagesModalOpen(true))}
                    className="text-sm font-medium text-muted-foreground text-left hover:text-foreground transition-colors"
                  >
                    Messages
                  </button>
                  {profile?.role === 'admin' && (
                    <button
                      onClick={() => handleNavClick(() => navigate('/admin'))}
                      className="text-sm font-medium text-muted-foreground text-left hover:text-foreground transition-colors"
                    >
                      Admin Panel
                    </button>
                  )}
                  <hr className="border-border" />
                  <div className="text-sm font-medium text-foreground">
                    {profile?.name || user.email?.split('@')[0]}
                  </div>
                  <button
                    onClick={() => handleNavClick(() => navigate('/my-info'))}
                    className="text-sm font-medium text-muted-foreground text-left hover:text-foreground transition-colors"
                  >
                    My Info
                  </button>
                  {profile?.isProvider && (
                    <button
                      onClick={() => handleNavClick(() => navigate('/my-services'))}
                      className="text-sm font-medium text-muted-foreground text-left hover:text-foreground transition-colors"
                    >
                      My Services
                    </button>
                  )}
                  <button
                    onClick={() => handleNavClick(() => navigate('/messages'))}
                    className="text-sm font-medium text-muted-foreground text-left hover:text-foreground transition-colors"
                  >
                    Messages
                  </button>
                  {profile?.isProvider && (
                    <button
                      onClick={() => handleNavClick(() => navigate('/my-reviews'))}
                      className="text-sm font-medium text-muted-foreground text-left hover:text-foreground transition-colors"
                    >
                      My Reviews
                    </button>
                  )}
                  <button
                    onClick={() => handleNavClick(handleSettings)}
                    className="text-sm font-medium text-muted-foreground text-left hover:text-foreground transition-colors"
                  >
                    Settings
                  </button>
                  {profile?.role === 'admin' && (
                    <button
                      onClick={() => handleNavClick(() => navigate('/admin'))}
                      className="text-sm font-medium text-muted-foreground text-left hover:text-foreground transition-colors"
                    >
                      Admin Panel
                    </button>
                  )}
                  <Button variant="outline" className="w-full text-red-600" onClick={() => handleNavClick(handleDeleteAccount)}>
                    Delete Account
                  </Button>
                  <Button variant="outline" className="w-full" onClick={() => handleNavClick(handleLogout)}>
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => handleNavClick(onHowItWorks)}
                    className="text-sm font-medium text-muted-foreground text-left hover:text-foreground transition-colors"
                  >
                    How It Works
                  </button>
                  <button
                    onClick={() => handleNavClick(onForProviders)}
                    className="text-sm font-medium text-muted-foreground text-left hover:text-foreground transition-colors"
                  >
                    For Providers
                  </button>
                  <hr className="border-border" />
                  <button
                    onClick={() => handleNavClick(onSignIn)}
                    className="text-sm font-medium text-muted-foreground text-left hover:text-foreground transition-colors"
                  >
                    Sign In
                  </button>
                  <Button className="w-full" onClick={() => handleNavClick(onGetStarted)}>
                    Get Started
                  </Button>
                </>
              )}
            </nav>
          </div>
        )}
      </div>

      <MessagesModal open={messagesModalOpen} onOpenChange={setMessagesModalOpen} />
    </header>
  );
}
