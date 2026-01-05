import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { categories } from '@/data/services';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { uploadToCloudinary, uploadProfilePicture } from '@/lib/cloudinary';
import { ArrowLeft, User, Wrench, FileText, Camera, Save } from 'lucide-react';

export default function Settings() {
  const { profile, updateProfile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: profile?.name || '',
    phone: profile?.phone || '',
    skills: profile?.skills?.join(', ') || '',
    username: profile?.username || '',
    isProvider: profile?.isProvider || false,
    services: profile?.services?.join(', ') || '',
    experience: profile?.experience || '',
    socialLinks: profile?.socialLinks?.join(', ') || '',
    resume: profile?.resume || '',
    locations: profile?.locations?.join(', ') || '',
    timings: profile?.timings || '',
    profilePic: profile?.profilePic || '',
    profilePicThumbnail: profile?.profilePicThumbnail || '',
  });

  const [serviceData, setServiceData] = useState({
    title: '',
    category: '',
    description: '',
    location: '',
    price: '',
  });

  const [locationSuggestions, setLocationSuggestions] = useState<any[]>([]);
  const [uploadingPic, setUploadingPic] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);

  const checkUsernameUnique = async (username: string) => {
    const querySnapshot = await getDocs(collection(db, 'users'));
    const existingUser = querySnapshot.docs.find(doc => doc.data().username === username && doc.id !== profile?.uid);
    return !existingUser;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (formData.username && formData.username !== profile?.username) {
        const isUnique = await checkUsernameUnique(formData.username);
        if (!isUnique) {
          toast({
            title: "Error",
            description: "Username already taken.",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }
      }
      const updates = {
        ...formData,
        skills: formData.skills.split(',').map(s => s.trim()).filter(Boolean),
        services: formData.services.split(',').map(s => s.trim()).filter(Boolean),
        socialLinks: formData.socialLinks.split(',').map(s => s.trim()).filter(Boolean),
        locations: formData.locations.split(',').map(s => s.trim()).filter(Boolean),
      };
      await updateProfile(updates);
      toast({
        title: "Success",
        description: "Profile updated successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

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
    setFormData({ ...formData, locations: value });
    fetchLocationSuggestions(value);
  };

  const selectLocation = (location: any) => {
    setFormData({ ...formData, locations: location.display_name });
    setLocationSuggestions([]);
  };

  const handleProfilePicUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPic(true);
    try {
      const { url, thumbnail } = await uploadProfilePicture(file);
      setFormData({ ...formData, profilePic: url, profilePicThumbnail: thumbnail });
      toast({
        title: "Success",
        description: "Profile picture uploaded successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload profile picture.",
        variant: "destructive",
      });
    } finally {
      setUploadingPic(false);
    }
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingResume(true);
    try {
      const url = await uploadToCloudinary(file);
      setFormData({ ...formData, resume: url });
      toast({
        title: "Success",
        description: "Resume uploaded successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload resume.",
        variant: "destructive",
      });
    } finally {
      setUploadingResume(false);
    }
  };

  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    try {
      await addDoc(collection(db, 'services'), {
        ...serviceData,
        providerId: profile.uid,
        providerName: profile.name || profile.email,
        providerUsername: profile.username,
        rating: 0,
        reviewCount: 0,
        availability: 'available',
        image: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&h=300&fit=crop',
        createdAt: new Date(),
      });
      setServiceData({ title: '', category: '', description: '', location: '', price: '' });
      toast({
        title: "Success",
        description: "Service added successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add service.",
        variant: "destructive",
      });
    }
  };

  if (!profile) {
    return <div>Please log in to access settings.</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header with Back Button */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => navigate(-1)}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
              <div>
                <h1 className="text-3xl font-bold">Account Settings</h1>
                <p className="text-muted-foreground">Manage your profile and preferences</p>
              </div>
            </div>
          </div>

          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="services" className="flex items-center gap-2">
                <Wrench className="w-4 h-4" />
                Services
              </TabsTrigger>
              <TabsTrigger value="documents" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Documents
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="w-5 h-5" />
                      Basic Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="Enter your full name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="Enter your phone number"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        placeholder="Choose a unique username"
                      />
                    </div>
                    <div>
                      <Label htmlFor="profilePic" className="flex items-center gap-2">
                        <Camera className="w-4 h-4" />
                        Profile Picture
                      </Label>
                      <Input
                        id="profilePic"
                        type="file"
                        accept="image/*"
                        onChange={handleProfilePicUpload}
                        disabled={uploadingPic}
                      />
                      {uploadingPic && <p className="text-sm text-muted-foreground">Uploading...</p>}
                      {formData.profilePic && (
                        <div className="mt-2">
                          <img src={formData.profilePic} alt="Profile" className="w-20 h-20 rounded-full object-cover" />
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Professional Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="skills">Skills (comma-separated)</Label>
                      <Input
                        id="skills"
                        value={formData.skills}
                        onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                        placeholder="e.g., Plumbing, Electrical, Carpentry"
                      />
                      {formData.skills && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {formData.skills.split(',').map((skill, index) => (
                            <Badge key={index} variant="secondary">{skill.trim()}</Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="isProvider">Are you a service provider?</Label>
                      <Select
                        value={formData.isProvider ? 'yes' : 'no'}
                        onValueChange={(value) => setFormData({ ...formData, isProvider: value === 'yes' })}
                      >
                        <SelectTrigger className="w-full md:w-48">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="yes">Yes</SelectItem>
                          <SelectItem value="no">No</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {formData.isProvider && (
                      <>
                        <div>
                          <Label htmlFor="services">Services Offered (comma-separated)</Label>
                          <Input
                            id="services"
                            value={formData.services}
                            onChange={(e) => setFormData({ ...formData, services: e.target.value })}
                            placeholder="e.g., Plumbing, Electrical"
                          />
                          {formData.services && (
                            <div className="flex flex-wrap gap-2 mt-2">
                              {formData.services.split(',').map((service, index) => (
                                <Badge key={index} variant="secondary">{service.trim()}</Badge>
                              ))}
                            </div>
                          )}
                        </div>
                        <div>
                          <Label htmlFor="experience">Experience</Label>
                          <Textarea
                            id="experience"
                            value={formData.experience}
                            onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                            placeholder="Describe your experience"
                            rows={3}
                          />
                        </div>
                        <div className="relative">
                          <Label htmlFor="locations">Service Locations (comma-separated)</Label>
                          <Input
                            id="locations"
                            value={formData.locations}
                            onChange={handleLocationChange}
                            placeholder="e.g., Mumbai, Maharashtra"
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
                        <div>
                          <Label htmlFor="timings">Available Timings</Label>
                          <Input
                            id="timings"
                            value={formData.timings}
                            onChange={(e) => setFormData({ ...formData, timings: e.target.value })}
                            placeholder="e.g., Mon-Fri 9AM-6PM"
                          />
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>

                <div className="flex justify-end">
                  <Button type="submit" disabled={loading} className="flex items-center gap-2">
                    <Save className="w-4 h-4" />
                    {loading ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </form>
            </TabsContent>

            <TabsContent value="services" className="space-y-6">
              {formData.isProvider ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Wrench className="w-5 h-5" />
                      Add New Service
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleAddService} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="service-title">Service Title</Label>
                          <Input
                            id="service-title"
                            value={serviceData.title}
                            onChange={(e) => setServiceData({ ...serviceData, title: e.target.value })}
                            placeholder="e.g., Home Plumbing Repair"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="service-category">Category</Label>
                          <Select
                            value={serviceData.category}
                            onValueChange={(value) => setServiceData({ ...serviceData, category: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              {categories.map((cat) => (
                                <SelectItem key={cat} value={cat}>
                                  {cat}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="service-description">Description</Label>
                        <Textarea
                          id="service-description"
                          value={serviceData.description}
                          onChange={(e) => setServiceData({ ...serviceData, description: e.target.value })}
                          placeholder="Describe your service"
                          rows={3}
                          required
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="service-location">Location</Label>
                          <Input
                            id="service-location"
                            value={serviceData.location}
                            onChange={(e) => setServiceData({ ...serviceData, location: e.target.value })}
                            placeholder="e.g., Downtown"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="service-price">Starting Price</Label>
                          <Input
                            id="service-price"
                            value={serviceData.price}
                            onChange={(e) => setServiceData({ ...serviceData, price: e.target.value })}
                            placeholder="e.g., ₹500"
                            required
                          />
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <Button type="submit" className="flex items-center gap-2">
                          <Wrench className="w-4 h-4" />
                          Add Service
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="text-center py-8">
                    <Wrench className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Service Provider Features</h3>
                    <p className="text-muted-foreground mb-4">
                      Become a service provider to add and manage your services.
                    </p>
                    <Button onClick={() => setFormData({ ...formData, isProvider: true })}>
                      Become a Provider
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="documents" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Additional Documents
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="socialLinks">Social Links (comma-separated)</Label>
                    <Input
                      id="socialLinks"
                      value={formData.socialLinks}
                      onChange={(e) => setFormData({ ...formData, socialLinks: e.target.value })}
                      placeholder="e.g., https://linkedin.com/in/yourprofile"
                    />
                  </div>
                  <div>
                    <Label htmlFor="resume" className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Resume/CV
                    </Label>
                    <Input
                      id="resume"
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleResumeUpload}
                      disabled={uploadingResume}
                    />
                    {uploadingResume && <p className="text-sm text-muted-foreground">Uploading...</p>}
                    {formData.resume && (
                      <div className="mt-2">
                        <a
                          href={formData.resume}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline flex items-center gap-2"
                        >
                          <FileText className="w-4 h-4" />
                          View Resume
                        </a>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}