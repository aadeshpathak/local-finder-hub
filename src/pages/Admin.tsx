import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, updateDoc, deleteDoc, query, where, orderBy, limit, onSnapshot, addDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Trash2, Search, Users, Wrench, Star, BarChart3, Shield, AlertTriangle, Image, CheckCircle, XCircle } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

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

export default function Admin() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProviders: 0,
    verifiedProviders: 0,
    totalServices: 0,
    totalReviews: 0,
    averageRating: 0,
    totalViews: 0,
  });
  const [userServices, setUserServices] = useState<Record<string, number>>({});
  const [services, setServices] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [locationStats, setLocationStats] = useState<Record<string, number>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterVerified, setFilterVerified] = useState('all');
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [locationData, setLocationData] = useState<any[]>([]);
  const [recentServices, setRecentServices] = useState<any[]>([]);
  const [recentReviews, setRecentReviews] = useState<any[]>([]);

  useEffect(() => {
    if (profile?.role !== 'admin') {
      navigate('/');
      return;
    }

    // Set up real-time listeners
    const unsubscribeUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      const userList: UserProfile[] = [];
      snapshot.forEach((doc) => {
        userList.push(doc.data() as UserProfile);
      });
      setUsers(userList);

      // Calculate location stats
      const locationCount: Record<string, number> = {};
      userList.filter(u => u.isProvider).forEach(user => {
        if (user.locations && user.locations.length > 0) {
          user.locations.forEach((location: string) => {
            locationCount[location] = (locationCount[location] || 0) + 1;
          });
        }
      });
      setLocationStats(locationCount);
      const locationChartData = Object.entries(locationCount).map(([name, value]) => ({ name, value }));
      setLocationData(locationChartData);
      setLoading(false); // Set loading to false after initial data load
    });

    const unsubscribeServices = onSnapshot(collection(db, 'services'), (snapshot) => {
      const servicesList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setServices(servicesList);

      // Count services per user
      const servicesByUser: Record<string, number> = {};
      servicesList.forEach((service: any) => {
        const providerId = service.providerId;
        servicesByUser[providerId] = (servicesByUser[providerId] || 0) + 1;
      });
      setUserServices(servicesByUser);

      // Prepare category data for chart
      const categories = servicesList.reduce((acc, service: any) => {
        acc[service.category] = (acc[service.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      const categoryChartData = Object.entries(categories).map(([name, value]) => ({ name, value }));
      setCategoryData(categoryChartData);
    });

    const unsubscribeReviews = onSnapshot(collection(db, 'reviews'), (snapshot) => {
      const reviewsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setReviews(reviewsList);
    });

    const unsubscribeViews = onSnapshot(collection(db, 'pageViews'), (snapshot) => {
      const totalViews = snapshot.size;
      setStats(prev => ({ ...prev, totalViews }));
    });

    const recentServicesQuery = query(collection(db, 'services'), orderBy('createdAt', 'desc'), limit(5));
    const unsubscribeRecentServices = onSnapshot(recentServicesQuery, (snapshot) => {
      setRecentServices(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const recentReviewsQuery = query(collection(db, 'reviews'), orderBy('createdAt', 'desc'), limit(5));
    const unsubscribeRecentReviews = onSnapshot(recentReviewsQuery, (snapshot) => {
      setRecentReviews(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // Calculate stats when data changes
    const calculateStats = () => {
      const totalUsers = users.length;
      const totalProviders = users.filter(u => u.isProvider).length;
      const verifiedProviders = users.filter(u => u.isProvider && u.verified).length;
      const totalServices = services.length;
      const totalReviews = reviews.length;
      const averageRating = totalReviews > 0
        ? (reviews as any[]).reduce((sum, r) => sum + (r.rating || 0), 0) / totalReviews
        : 0;

      setStats(prev => ({
        ...prev,
        totalUsers,
        totalProviders,
        verifiedProviders,
        totalServices,
        totalReviews,
        averageRating
      }));
    };

    // Initial stats calculation
    calculateStats();

    // Cleanup listeners on unmount
    return () => {
      unsubscribeUsers();
      unsubscribeServices();
      unsubscribeReviews();
      unsubscribeViews();
      unsubscribeRecentServices();
      unsubscribeRecentReviews();
    };
  }, [profile, navigate]);

  // Recalculate stats when data changes
  useEffect(() => {
    const totalUsers = users.length;
    const totalProviders = users.filter(u => u.isProvider).length;
    const verifiedProviders = users.filter(u => u.isProvider && u.verified).length;
    const totalServices = services.length;
    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0
      ? (reviews as any[]).reduce((sum, r) => sum + (r.rating || 0), 0) / totalReviews
      : 0;

    setStats(prev => ({
      ...prev,
      totalUsers,
      totalProviders,
      verifiedProviders,
      totalServices,
      totalReviews,
      averageRating
    }));
  }, [users, services, reviews]);

  const toggleVerification = async (userId: string, currentVerified: boolean) => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        verified: !currentVerified,
      });

      // Send notification to provider
      if (!currentVerified) { // Only when verifying, not unverifying
        await addDoc(collection(db, 'notifications'), {
          userId: userId,
          type: 'verification',
          title: 'Account Verified!',
          message: 'Congratulations! Your service provider account has been verified by our admin team. You now have a verified badge on your profile.',
          read: false,
          createdAt: new Date(),
        });
      }

      setUsers(users.map(user =>
        user.uid === userId ? { ...user, verified: !currentVerified } : user
      ));
      toast({
        title: "Success",
        description: `User ${!currentVerified ? 'verified' : 'unverified'}.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update verification.",
        variant: "destructive",
      });
    }
  };

  const deleteUser = async (userId: string, userName: string) => {
    if (!confirm(`Are you sure you want to delete user ${userName}? This action cannot be undone.`)) {
      return;
    }
    try {
      await deleteDoc(doc(db, 'users', userId));
      setUsers(users.filter(user => user.uid !== userId));
      toast({
        title: "Success",
        description: "User deleted successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete user.",
        variant: "destructive",
      });
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.username?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesVerified = filterVerified === 'all' ||
                           (filterVerified === 'verified' && user.verified) ||
                           (filterVerified === 'unverified' && !user.verified);
    return matchesSearch && matchesRole && matchesVerified;
  });

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => navigate(-1)}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                <p className="text-muted-foreground">Manage users, services, and platform analytics</p>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalUsers}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Providers</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalProviders}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Verified</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.verifiedProviders}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Services</CardTitle>
                <Wrench className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalServices}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Reviews</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalReviews}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.averageRating.toFixed(1)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Page Views</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalViews}</div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="users" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="users">User Management</TabsTrigger>
              <TabsTrigger value="services">Service Oversight</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="media">Media Gallery</TabsTrigger>
            </TabsList>

            <TabsContent value="users" className="space-y-6">
              {/* Search and Filters */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Search className="w-5 h-5" />
                    Search & Filter Users
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <Input
                        placeholder="Search by name, email, or username..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full"
                      />
                    </div>
                    <Select value={filterRole} onValueChange={setFilterRole}>
                      <SelectTrigger className="w-full sm:w-48">
                        <SelectValue placeholder="Filter by role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Roles</SelectItem>
                        <SelectItem value="user">Users</SelectItem>
                        <SelectItem value="admin">Admins</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={filterVerified} onValueChange={setFilterVerified}>
                      <SelectTrigger className="w-full sm:w-48">
                        <SelectValue placeholder="Verification status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Users</SelectItem>
                        <SelectItem value="verified">Verified</SelectItem>
                        <SelectItem value="unverified">Unverified</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Users List */}
              <Card>
                <CardHeader>
                  <CardTitle>Users ({filteredUsers.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {filteredUsers.map((user) => (
                      <div key={user.uid} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold truncate">{user.name || user.email}</h3>
                            <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                              {user.role}
                            </Badge>
                            {user.isProvider && (
                              <Badge variant="outline">Provider</Badge>
                            )}
                            {user.verified && (
                              <Badge variant="default">Verified</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                          {user.isProvider && (
                            <p className="text-sm text-muted-foreground">
                              Services: {userServices[user.uid] || 0}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          {user.isProvider && user.role !== 'admin' && (
                            <>
                              <label className="text-sm hidden sm:block">Verified</label>
                              <Switch
                                checked={user.verified || false}
                                onCheckedChange={() => toggleVerification(user.uid, user.verified || false)}
                              />
                            </>
                          )}
                          {user.role !== 'admin' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => deleteUser(user.uid, user.name || user.email)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                    {filteredUsers.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        No users found matching your criteria.
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="services" className="space-y-6">
              <div className="grid gap-6 md:grid-cols-3">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Services</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4 max-h-80 overflow-y-auto">
                      {services.slice(0, 10).map((service: any) => (
                        <div key={service.id} className="p-3 border rounded-lg">
                          <h4 className="font-medium">{service.title}</h4>
                          <p className="text-sm text-muted-foreground">{service.category}</p>
                          <p className="text-sm text-muted-foreground">By: {service.providerName}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Service Categories</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {Object.entries(
                        services.reduce((acc, service: any) => {
                          acc[service.category] = (acc[service.category] || 0) + 1;
                          return acc;
                        }, {} as Record<string, number>)
                      ).map(([category, count]) => (
                        <div key={category} className="flex justify-between">
                          <span>{category}</span>
                          <Badge variant="secondary">{count as number}</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Provider Locations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 max-h-80 overflow-y-auto">
                      {Object.entries(locationStats)
                        .sort(([,a], [,b]) => (b as number) - (a as number))
                        .map(([location, count]) => (
                        <div key={location} className="flex justify-between">
                          <span className="text-sm">{location}</span>
                          <Badge variant="outline">{count as number} providers</Badge>
                        </div>
                      ))}
                      {Object.keys(locationStats).length === 0 && (
                        <p className="text-sm text-muted-foreground">No location data available</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                  <CardHeader>
                    <CardTitle>Platform Health</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Verification Rate</span>
                      <span className="font-bold">
                        {stats.totalProviders > 0 ? ((stats.verifiedProviders / stats.totalProviders) * 100).toFixed(1) : 0}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Services per Provider</span>
                      <span className="font-bold">
                        {stats.totalProviders > 0 ? (stats.totalServices / stats.totalProviders).toFixed(1) : 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Reviews per Service</span>
                      <span className="font-bold">
                        {stats.totalServices > 0 ? (stats.totalReviews / stats.totalServices).toFixed(1) : 0}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Service Categories</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={categoryData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={60}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {categoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Provider Locations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={locationData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Services</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {recentServices.map((service: any) => (
                        <div key={service.id} className="p-2 border rounded text-sm">
                          <p className="font-medium">{service.title}</p>
                          <p className="text-muted-foreground">{service.category} - {service.providerName}</p>
                        </div>
                      ))}
                      {recentServices.length === 0 && (
                        <p className="text-muted-foreground">No recent services</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Recent Reviews</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {recentReviews.map((review: any) => (
                        <div key={review.id} className="p-2 border rounded text-sm">
                          <p className="font-medium">Rating: {review.rating}/5</p>
                          <p className="text-muted-foreground">{review.comment || 'No comment'}</p>
                        </div>
                      ))}
                      {recentReviews.length === 0 && (
                        <p className="text-muted-foreground">No recent reviews</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="media" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Image className="w-5 h-5" />
                    Cloudinary Media Gallery
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Manage upload presets and monitor media uploads
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Current Configuration */}
                  <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Cloudinary Configuration</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Cloud Name:</span>
                          <code className="text-sm bg-muted px-2 py-1 rounded">
                            {import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'Not configured'}
                          </code>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Resume Preset:</span>
                          <code className="text-sm bg-muted px-2 py-1 rounded">
                            {import.meta.env.VITE_CLOUDINARY_RESUME_PRESET || 'Not configured'}
                          </code>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Profile Preset:</span>
                          <code className="text-sm bg-muted px-2 py-1 rounded">
                            {import.meta.env.VITE_CLOUDINARY_PROFILE_PRESET || 'Not configured'}
                          </code>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Upload Preset Status</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Resume Uploads (ml_default)</span>
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-yellow-500" />
                            <span className="text-sm text-yellow-600">Check Required</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Profile Pictures (profile_pics)</span>
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-yellow-500" />
                            <span className="text-sm text-yellow-600">Check Required</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Setup Instructions */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Setup Instructions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">1</div>
                          <div>
                            <h4 className="font-medium">Go to Cloudinary Dashboard</h4>
                            <p className="text-sm text-muted-foreground">
                              Visit <a href="https://cloudinary.com/console" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">cloudinary.com/console</a>
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">2</div>
                          <div>
                            <h4 className="font-medium">Navigate to Upload Settings</h4>
                            <p className="text-sm text-muted-foreground">Go to Settings → Upload</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">3</div>
                          <div>
                            <h4 className="font-medium">Create Upload Presets</h4>
                            <div className="text-sm text-muted-foreground space-y-2">
                              <p><strong>For Resumes:</strong></p>
                              <ul className="list-disc list-inside ml-4 space-y-1">
                                <li>Name: <code>ml_default</code></li>
                                <li>Mode: <strong>Unsigned</strong></li>
                                <li>Allowed formats: pdf, doc, docx</li>
                                <li>Max file size: 10MB</li>
                              </ul>
                              <p className="mt-2"><strong>For Profile Pictures:</strong></p>
                              <ul className="list-disc list-inside ml-4 space-y-1">
                                <li>Name: <code>profile_pics</code></li>
                                <li>Mode: <strong>Unsigned</strong></li>
                                <li>Allowed formats: jpg, jpeg, png, gif</li>
                                <li>Max file size: 5MB</li>
                              </ul>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">4</div>
                          <div>
                            <h4 className="font-medium">Test Uploads</h4>
                            <p className="text-sm text-muted-foreground">
                              Try uploading a resume in Settings and a profile picture to verify everything works
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Quick Actions */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-3">
                        <Button
                          variant="outline"
                          onClick={() => window.open('https://cloudinary.com/console/settings/upload', '_blank')}
                          className="flex items-center gap-2"
                        >
                          <Image className="w-4 h-4" />
                          Open Cloudinary Console
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => window.location.reload()}
                          className="flex items-center gap-2"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Refresh Status
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}