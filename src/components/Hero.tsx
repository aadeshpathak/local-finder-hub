import { useRef, forwardRef, useImperativeHandle } from 'react';
import { SearchBar } from './SearchBar';
import { User } from 'firebase/auth';

interface UserProfile {
  uid: string;
  email: string;
  role: 'user' | 'admin';
  name?: string;
  phone?: string;
  skills?: string[];
  username?: string;
  isProvider?: boolean;
  services?: string[];
  experience?: string;
  socialLinks?: string[];
  resume?: string;
  locations?: string[];
  timings?: string;
  profilePic?: string;
  verified?: boolean;
}

interface HeroProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  user?: User | null;
  profile?: UserProfile | null;
}

export interface HeroRef {
  focusSearch: () => void;
  highlightSearch: () => void;
}

export const Hero = forwardRef<HeroRef, HeroProps>(({ searchQuery, onSearchChange, user, profile }, ref) => {
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useImperativeHandle(ref, () => ({
    focusSearch: () => {
      searchInputRef.current?.focus();
    },
    highlightSearch: () => {
      const container = searchContainerRef.current;
      if (container) {
        container.classList.add('search-highlight');
        setTimeout(() => {
          container.classList.remove('search-highlight');
        }, 1500);
      }
    },
  }));

  return (
    <section className="relative py-16 md:py-24 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 hero-gradient opacity-5" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-accent/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

      <div className="container mx-auto px-4 relative">
        <div className="max-w-3xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium mb-6 animate-fade-in">
            <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            Trusted by 10,000+ homeowners
          </div>

          {/* Headline */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 animate-fade-in-up">
            {user ? (
              <>
                Welcome back, {profile?.name || user.email?.split('@')[0]}!
              </>
            ) : (
              <>
                Find Trusted Local
                <span className="text-primary block mt-2">Service Professionals</span>
              </>
            )}
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-fade-in-up stagger-2">
            {user ? (
              "Ready to discover amazing services tailored just for you? Let's find the perfect professional for your needs."
            ) : (
              "Connect with verified electricians, plumbers, tutors, and more in your neighborhood. Quality service, just a click away."
            )}
          </p>

          {/* Search Bar */}
          <div 
            ref={searchContainerRef}
            className="max-w-xl mx-auto animate-fade-in-up stagger-3 transition-all duration-300"
          >
            <SearchBar
              ref={searchInputRef}
              value={searchQuery}
              onChange={onSearchChange}
              placeholder="Search for services, categories, or locations..."
            />
          </div>

          {/* Quick Categories */}
          <div className="flex flex-wrap justify-center gap-3 mt-8 animate-fade-in-up stagger-4">
            <span className="text-sm text-muted-foreground">Popular:</span>
            {['Electrician', 'Plumber', 'Tutor', 'Cleaner'].map((category) => (
              <button
                key={category}
                onClick={() => onSearchChange(category)}
                className="text-sm text-primary hover:text-primary/80 font-medium transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-sm"
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
});

Hero.displayName = 'Hero';
