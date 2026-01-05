import { useState, useEffect, useMemo, useRef } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Hero, HeroRef } from '@/components/Hero';
import { ServiceCard } from '@/components/ServiceCard';
import { ServiceCardSkeleton } from '@/components/ServiceCardSkeleton';
import { FilterPanel, type Filters } from '@/components/FilterPanel';
import { ActiveFilters } from '@/components/ActiveFilters';
import { EmptyState } from '@/components/EmptyState';
import { HowItWorksSection } from '@/components/HowItWorksSection';
import { ServiceDetailModal } from '@/components/ServiceDetailModal';
import { AuthModal } from '@/components/AuthModal';
import { ProviderInfoModal } from '@/components/ProviderInfoModal';
import OnboardingModal from '@/components/OnboardingModal';
import { services as staticServices, type Service } from '@/data/services';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { geocodeAddress } from '@/lib/geocoding';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { TypeAnimation } from 'react-type-animation';

const initialFilters: Filters = {
  categories: [],
  locations: [],
  availability: [],
};

export default function Index() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [isLoading, setIsLoading] = useState(true);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [locationSuggestions, setLocationSuggestions] = useState<any[]>([]);

  // Modal states
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [serviceModalOpen, setServiceModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [providerModalOpen, setProviderModalOpen] = useState(false);
  const [onboardingModalOpen, setOnboardingModalOpen] = useState(false);

  // Refs
  const heroRef = useRef<HeroRef>(null);
  const servicesRef = useRef<HTMLDivElement>(null);
  const howItWorksRef = useRef<HTMLElement>(null);

  // Fetch services
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'services'));
        const servicesList: Service[] = [];
        for (const doc of querySnapshot.docs) {
          const data = doc.data();
          let latitude: number | undefined;
          let longitude: number | undefined;

          // Geocode if coordinates not present
          if (!data.latitude || !data.longitude) {
            const geocodeResult = await geocodeAddress(data.location);
            if (geocodeResult) {
              latitude = geocodeResult.lat;
              longitude = geocodeResult.lon;
            }
          } else {
            latitude = data.latitude;
            longitude = data.longitude;
          }

          servicesList.push({
            id: doc.id,
            name: data.title,
            category: data.category,
            location: data.location,
            latitude,
            longitude,
            availability: data.availability,
            rating: data.rating,
            reviewCount: data.reviewCount,
            description: data.description,
            image: data.image,
            providerId: data.providerId,
            price: data.price,
            skills: data.skills,
          });
        }
        setServices(servicesList);
      } catch (error) {
        console.error('Error fetching services:', error);
      }
    };

    fetchServices();
  }, []);

  const fetchLocationSuggestions = async (query: string) => {
    if (query.length < 3) {
      setLocationSuggestions([]);
      return;
    }
    try {
      const response = await fetch(`https://api.locationiq.com/v1/autocomplete.php?key=pk.e632041464dc3e16b0aad7141f922ec1&q=${encodeURIComponent(query)}&limit=5&countrycodes=in`);
      const data = await response.json();
      setLocationSuggestions(data);
    } catch (error) {
      console.error('Error fetching location suggestions:', error);
    }
  };

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSelectedLocation(value);
    fetchLocationSuggestions(value);
  };

  const selectLocation = (location: any) => {
    setSelectedLocation(location.display_name);
    setLocationSuggestions([]);
  };

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  // Check for onboarding
  useEffect(() => {
    if (user && profile && !profile.name && !localStorage.getItem('onboardingCompleted')) {
      setOnboardingModalOpen(true);
    }
  }, [user, profile]);

  // Reset loading when filters change
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 400);
    return () => clearTimeout(timer);
  }, [searchQuery, filters]);

  // Filter services
  const filteredServices = useMemo(() => {
    return services.filter((service) => {
      // Search query
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        !query ||
        service.name.toLowerCase().includes(query) ||
        service.category.toLowerCase().includes(query) ||
        service.location.toLowerCase().includes(query) ||
        service.description.toLowerCase().includes(query) ||
        (service.skills && service.skills.some(skill => skill.toLowerCase().includes(query)));

      // Location from picker
      const matchesSelectedLocation =
        !selectedLocation ||
        service.location.toLowerCase().includes(selectedLocation.toLowerCase());

      // Category filter
      const matchesCategory =
        filters.categories.length === 0 ||
        filters.categories.includes(service.category);

      // Location filter
      const matchesLocation =
        filters.locations.length === 0 ||
        filters.locations.includes(service.location);

      // Availability filter
      const matchesAvailability =
        filters.availability.length === 0 ||
        filters.availability.includes(service.availability);

      return matchesSearch && matchesSelectedLocation && matchesCategory && matchesLocation && matchesAvailability;
    });
  }, [searchQuery, selectedLocation, filters, services]);

  const clearAllFilters = () => {
    setFilters(initialFilters);
    setSearchQuery('');
  };

  const activeFilterCount =
    filters.categories.length +
    filters.locations.length +
    filters.availability.length;

  // Navigation handlers
  const scrollToServices = () => {
    servicesRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToHowItWorks = () => {
    howItWorksRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleGetStarted = () => {
    scrollToServices();
    setTimeout(() => {
      heroRef.current?.focusSearch();
      heroRef.current?.highlightSearch();
    }, 600);
  };

  const handleViewDetails = (service: Service) => {
    setSelectedService(service);
    setServiceModalOpen(true);
  };

  const handleOnboardingComplete = () => {
    localStorage.setItem('onboardingCompleted', 'true');
  };

  return (
    <div className="min-h-screen bg-background">
      <Header 
        onSignIn={() => setAuthModalOpen(true)}
        onGetStarted={handleGetStarted}
        onBrowseServices={scrollToServices}
        onHowItWorks={scrollToHowItWorks}
        onForProviders={() => setProviderModalOpen(true)}
      />
      <Hero
        ref={heroRef}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        user={user}
        profile={profile}
      />

      {user && (
        <div className="bg-background border-b border-border py-4">
          <div className="container mx-auto px-4">
            <div className="w-full max-w-md mx-auto relative">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Enter location (e.g., Mumbai, Maharashtra)"
                    value={selectedLocation}
                    onChange={handleLocationChange}
                    className="w-full px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  {locationSuggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 bg-background border border-border rounded-md mt-1 shadow-lg z-10 max-h-48 overflow-y-auto">
                      {locationSuggestions.map((suggestion, index) => (
                        <div
                          key={index}
                          className="px-4 py-2 hover:bg-muted cursor-pointer"
                          onClick={() => selectLocation(suggestion)}
                        >
                          {suggestion.display_name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <Button onClick={() => {}}>Search</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {user ? (
        <main className="container mx-auto px-4 pb-16" ref={servicesRef}>
          {/* Results Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                {isLoading ? 'Loading...' : `${filteredServices.length} Services Available`}
              </h2>
              <p className="text-muted-foreground text-sm mt-1">
                Find the perfect professional for your needs
              </p>
            </div>

            {/* Mobile Filter Button */}
            <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" className="lg:hidden flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4" />
                  Filters
                  {activeFilterCount > 0 && (
                    <span className="ml-1 px-2 py-0.5 bg-primary text-primary-foreground text-xs rounded-full">
                      {activeFilterCount}
                    </span>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[320px] p-0">
                <FilterPanel
                  filters={filters}
                  onChange={setFilters}
                  onClose={() => setMobileFiltersOpen(false)}
                  isMobile
                />
              </SheetContent>
            </Sheet>
          </div>

          {/* Active Filters */}
          <div className="mb-6">
            <ActiveFilters filters={filters} onChange={setFilters} />
          </div>

          {/* Main Content Grid */}
          <div className="flex gap-8">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:block w-72 shrink-0">
              <div className="sticky top-24">
                <FilterPanel filters={filters} onChange={setFilters} />
              </div>
            </aside>

            {/* Services Grid */}
            <div className="flex-1">
              {isLoading ? (
                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <ServiceCardSkeleton key={i} />
                  ))}
                </div>
              ) : filteredServices.length === 0 ? (
                <EmptyState onClearFilters={clearAllFilters} />
              ) : (
                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredServices.map((service, index) => (
                    <ServiceCard
                      key={service.id}
                      service={service}
                      index={index}
                      onViewDetails={handleViewDetails}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      ) : (
        <main className="container mx-auto px-4 pb-16" ref={servicesRef}>
          {/* Demo Services Section */}
          <div className="text-center py-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Discover Local Services
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              Sign in to explore and connect with trusted professionals in your area
            </p>
            <Button onClick={() => setAuthModalOpen(true)} size="lg">
              Get Started
            </Button>
          </div>

          {/* Demo Search Animation */}
          <div className="mb-16">
            <h3 className="text-2xl font-bold text-center mb-8">See It In Action</h3>
            <div className="max-w-md mx-auto bg-card p-6 rounded-lg border">
              <div className="relative mb-4">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground">
                  <svg fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="pl-10 pr-4 py-2 border rounded-md bg-background">
                  <TypeAnimation
                    sequence={[
                      'Plumber in Downtown',
                      2000,
                      'Electrician near me',
                      2000,
                      'Tutor for Math',
                      2000,
                    ]}
                    wrapper="span"
                    cursor={true}
                    repeat={Infinity}
                    className="text-sm"
                  />
                </div>
              </div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2, duration: 0.5 }}
                className="text-sm text-muted-foreground"
              >
                12 services found
              </motion.div>
            </div>
          </div>

          {/* Demo Services Preview */}
          <div className="mb-16 relative">
            <h3 className="text-2xl font-bold text-center mb-8">Featured Services</h3>

            {/* Floating Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <motion.div
                className="absolute top-10 left-10 w-16 h-16 bg-primary/10 rounded-full"
                animate={{
                  y: [0, -20, 0],
                  rotate: [0, 180, 360],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
              <motion.div
                className="absolute top-20 right-20 w-12 h-12 bg-secondary/20 rounded-lg"
                animate={{
                  x: [0, 30, 0],
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
              <motion.div
                className="absolute bottom-20 left-1/4 w-8 h-8 bg-accent/30 rounded-full"
                animate={{
                  y: [0, -15, 0],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            </div>

            <motion.div
              className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6 relative z-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              {staticServices.slice(0, 6).map((service, index) => (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 20, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{
                    duration: 0.5,
                    delay: index * 0.15,
                    type: 'spring',
                    stiffness: 100,
                  }}
                  whileHover={{
                    scale: 1.05,
                    transition: { duration: 0.2 },
                  }}
                >
                  <ServiceCard
                    service={service}
                    index={index}
                    onViewDetails={() => setAuthModalOpen(true)}
                  />
                </motion.div>
              ))}
            </motion.div>
          </div>
        </main>
      )}

      {/* How It Works Section */}
      <section ref={howItWorksRef}>
        <HowItWorksSection />
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg hero-gradient flex items-center justify-center">
                <svg className="w-4 h-4 text-primary-foreground" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="font-semibold text-foreground">
                Local<span className="text-primary">Pro</span>
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              made with love by prathamesh tiwari
            </p>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <ServiceDetailModal
        key={selectedService?.id}
        service={selectedService}
        open={serviceModalOpen}
        onOpenChange={setServiceModalOpen}
      />
      <AuthModal
        open={authModalOpen}
        onOpenChange={setAuthModalOpen}
      />
      <ProviderInfoModal
        open={providerModalOpen}
        onOpenChange={setProviderModalOpen}
      />
      <OnboardingModal
        open={onboardingModalOpen}
        onOpenChange={setOnboardingModalOpen}
        onComplete={handleOnboardingComplete}
      />
    </div>
  );
}
