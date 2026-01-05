import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { collection, addDoc, updateDoc, doc, getDoc } from 'firebase/firestore';
import { categories } from '@/data/services';
import { ArrowLeft, Settings, Star, Wrench, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { uploadToCloudinary } from '@/lib/cloudinary';

const commonSkills = [
  'JavaScript', 'Python', 'Java', 'C++', 'React', 'Node.js', 'SQL', 'HTML', 'CSS',
  'Plumbing', 'Electrical', 'Carpentry', 'Painting', 'Cleaning', 'Gardening',
  'Teaching', 'Tutoring', 'Cooking', 'Photography', 'Web Design', 'Graphic Design',
  'Accounting', 'Legal', 'Medical', 'Fitness', 'Massage', 'Driving', 'Security'
];

const categoryIcons: Record<string, string> = {
  Electrician: `data:image/svg+xml;charset=utf-8,${encodeURIComponent('<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg"><rect width="400" height="300" fill="#ff6b6b"/><text x="200" y="150" font-family="Arial" font-size="24" fill="white" text-anchor="middle">Electrician</text></svg>')}`,
  Plumber: `data:image/svg+xml;charset=utf-8,${encodeURIComponent('<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg"><rect width="400" height="300" fill="#4ecdc4"/><text x="200" y="150" font-family="Arial" font-size="24" fill="white" text-anchor="middle">Plumber</text></svg>')}`,
  Tutor: `data:image/svg+xml;charset=utf-8,${encodeURIComponent('<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg"><rect width="400" height="300" fill="#45b7d1"/><text x="200" y="150" font-family="Arial" font-size="24" fill="white" text-anchor="middle">Tutor</text></svg>')}`,
  Mechanic: `data:image/svg+xml;charset=utf-8,${encodeURIComponent('<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg"><rect width="400" height="300" fill="#f9ca24"/><text x="200" y="150" font-family="Arial" font-size="24" fill="white" text-anchor="middle">Mechanic</text></svg>')}`,
  Cleaner: `data:image/svg+xml;charset=utf-8,${encodeURIComponent('<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg"><rect width="400" height="300" fill="#6c5ce7"/><text x="200" y="150" font-family="Arial" font-size="24" fill="white" text-anchor="middle">Cleaner</text></svg>')}`,
  Painter: `data:image/svg+xml;charset=utf-8,${encodeURIComponent('<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg"><rect width="400" height="300" fill="#fd79a8"/><text x="200" y="150" font-family="Arial" font-size="24" fill="white" text-anchor="middle">Painter</text></svg>')}`,
  Carpenter: `data:image/svg+xml;charset=utf-8,${encodeURIComponent('<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg"><rect width="400" height="300" fill="#00b894"/><text x="200" y="150" font-family="Arial" font-size="24" fill="white" text-anchor="middle">Carpenter</text></svg>')}`,
  Landscaper: `data:image/svg+xml;charset=utf-8,${encodeURIComponent('<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg"><rect width="400" height="300" fill="#e17055"/><text x="200" y="150" font-family="Arial" font-size="24" fill="white" text-anchor="middle">Landscaper</text></svg>')}`,
};

interface ServiceData {
  title: string;
  category: string;
  customCategory?: string;
  description: string;
  location: string;
  price: string;
  resume?: string;
  companyName?: string;
  skills?: string[];
}

export default function ManageService() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(!!id);
  const [serviceData, setServiceData] = useState<ServiceData>({
    title: profile?.name || profile?.username || '',
    category: '',
    customCategory: '',
    description: '',
    location: '',
    price: '',
    resume: '',
    companyName: '',
    skills: [],
  });
  const [locationSuggestions, setLocationSuggestions] = useState<any[]>([]);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [skillInput, setSkillInput] = useState('');
  const [skillSuggestions, setSkillSuggestions] = useState<string[]>([]);
  const locationTimeoutRef = useRef<number | undefined>();

  useEffect(() => {
    if (id) {
      fetchService();
    }
  }, [id]);

  const fetchService = async () => {
    if (!id) return;
    try {
      const docRef = doc(db, 'services', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists() && docSnap.data().providerId === user?.uid) {
        const data = docSnap.data();
        setServiceData({
          title: data.title || '',
          category: data.category || '',
          customCategory: data.customCategory || '',
          description: data.description || '',
          location: data.location || '',
          price: data.price || '',
          resume: data.resume || '',
          companyName: data.companyName || '',
          skills: data.skills || [],
        });
      } else {
        toast({
          title: "Error",
          description: "Service not found or access denied.",
          variant: "destructive",
        });
        navigate('/my-services');
      }
    } catch (error) {
      console.error('Error fetching service:', error);
      toast({
        title: "Error",
        description: "Failed to load service.",
        variant: "destructive",
      });
    } finally {
      setFetchLoading(false);
    }
  };

  const fetchLocationSuggestions = async (query: string) => {
    if (query.length < 2) {
      setLocationSuggestions([]);
      return;
    }
    try {
      const response = await fetch(`https://api.locationiq.com/v1/autocomplete.php?key=pk.e632041464dc3e16b0aad7141f922ec1&q=${encodeURIComponent(query)}&limit=10&countrycodes=in`);
      const data = await response.json();
      setLocationSuggestions(data);
    } catch (error) {
      console.error('Error fetching location suggestions:', error);
    }
  };

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setServiceData({ ...serviceData, location: value });

    if (locationTimeoutRef.current) {
      clearTimeout(locationTimeoutRef.current);
    }

    locationTimeoutRef.current = setTimeout(() => {
      fetchLocationSuggestions(value);
    }, 300) as unknown as number;
  };

  const selectLocation = (location: any) => {
    setServiceData({ ...serviceData, location: location.display_name });
    setLocationSuggestions([]);
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingResume(true);
    try {
      const url = await uploadToCloudinary(file);
      setServiceData({ ...serviceData, resume: url });
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

  const handleSkillInputChange = (value: string) => {
    setSkillInput(value);
    if (value.length > 0) {
      const filtered = commonSkills.filter(skill =>
        skill.toLowerCase().includes(value.toLowerCase()) &&
        !serviceData.skills?.includes(skill)
      );
      setSkillSuggestions(filtered.slice(0, 5));
    } else {
      setSkillSuggestions([]);
    }
  };

  const addSkill = (skill: string) => {
    if (skill && !serviceData.skills?.includes(skill)) {
      setServiceData({
        ...serviceData,
        skills: [...(serviceData.skills || []), skill]
      });
    }
    setSkillInput('');
    setSkillSuggestions([]);
  };

  const removeSkill = (skill: string) => {
    setServiceData({
      ...serviceData,
      skills: serviceData.skills?.filter(s => s !== skill) || []
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile) return;

    setLoading(true);
    try {
      let finalCategory = serviceData.category;
      if (serviceData.category === 'Write Manually') {
        if (serviceData.customCategory && categories.includes(serviceData.customCategory)) {
          finalCategory = serviceData.customCategory;
        } else if (serviceData.customCategory) {
          categories.push(serviceData.customCategory);
          finalCategory = serviceData.customCategory;
        }
      }
      const baseData = {
        ...serviceData,
        category: finalCategory,
        providerId: user.uid,
        providerName: profile.name || profile.email,
        providerUsername: profile.username,
        availability: 'available',
        image: profile.profilePic || categoryIcons[finalCategory || serviceData.category] || `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
           <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
             <rect width="400" height="300" fill="#cccccc"/>
             <text x="200" y="150" font-family="Arial" font-size="24" fill="white" text-anchor="middle">Service</text>
           </svg>
         `)}`,
      };

      if (id) {
        // For updates, don't include rating, reviewCount, or createdAt
        await updateDoc(doc(db, 'services', id), baseData);
        toast({
          title: "Success",
          description: "Service updated successfully!",
        });
      } else {
        // For new services, include initial values
        const newData = {
          ...baseData,
          rating: 0,
          reviewCount: 0,
          createdAt: new Date(),
        };
        await addDoc(collection(db, 'services'), newData);
        toast({
          title: "Success",
          description: "Service added successfully!",
        });
      }
      navigate('/my-services');
    } catch (error) {
      console.error('Service operation error:', error);
      toast({
        title: "Error",
        description: id ? "Failed to update service." : "Failed to add service.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user || !profile?.isProvider) {
    return <div>Access denied. Only service providers can manage services.</div>;
  }

  if (fetchLoading) {
    return <div className="text-center">Loading service...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <h1 className="text-2xl sm:text-3xl font-bold mb-8">
            {id ? 'Edit Service' : 'Add New Service'}
          </h1>

          {/* Quick Access Sections */}
          <div className="grid gap-4 md:grid-cols-3 mb-8">
            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/my-services')}>
              <CardContent className="p-4 text-center">
                <Wrench className="w-8 h-8 mx-auto mb-2 text-primary" />
                <h3 className="font-semibold">My Services</h3>
                <p className="text-sm text-muted-foreground">Manage your services</p>
              </CardContent>
            </Card>
            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/my-reviews')}>
              <CardContent className="p-4 text-center">
                <Star className="w-8 h-8 mx-auto mb-2 text-primary" />
                <h3 className="font-semibold">My Reviews</h3>
                <p className="text-sm text-muted-foreground">View customer feedback</p>
              </CardContent>
            </Card>
            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/settings')}>
              <CardContent className="p-4 text-center">
                <Settings className="w-8 h-8 mx-auto mb-2 text-primary" />
                <h3 className="font-semibold">Edit Account Info</h3>
                <p className="text-sm text-muted-foreground">Update your profile</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Service Details</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="title">Service Provider Name</Label>
                  <Input
                    id="title"
                    value={serviceData.title}
                    disabled
                    placeholder="Your full name will be used as the service name"
                  />
                </div>
                <div>
                  <Label htmlFor="companyName">Company Name (Optional)</Label>
                  <Input
                    id="companyName"
                    value={serviceData.companyName}
                    onChange={(e) => setServiceData({ ...serviceData, companyName: e.target.value })}
                    placeholder="e.g., ABC Services"
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
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
                {serviceData.category === 'Write Manually' && (
                  <div>
                    <Label htmlFor="customCategory">Custom Category</Label>
                    <Input
                      id="customCategory"
                      value={serviceData.customCategory}
                      onChange={(e) => setServiceData({ ...serviceData, customCategory: e.target.value })}
                      placeholder="Enter your custom category"
                      required
                    />
                  </div>
                )}
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={serviceData.description}
                    onChange={(e) => setServiceData({ ...serviceData, description: e.target.value })}
                    placeholder="Describe your service"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="skills">Skills</Label>
                  <div className="space-y-2">
                    <div className="relative">
                      <Input
                        id="skills"
                        value={skillInput}
                        onChange={(e) => handleSkillInputChange(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addSkill(skillInput);
                          }
                        }}
                        placeholder="Type a skill and press Enter"
                      />
                      {skillSuggestions.length > 0 && (
                        <div className="absolute top-full left-0 right-0 bg-background border border-border rounded-md mt-1 shadow-lg z-10 max-h-48 overflow-y-auto">
                          {skillSuggestions.map((suggestion) => (
                            <div
                              key={suggestion}
                              className="px-4 py-2 hover:bg-muted cursor-pointer"
                              onClick={() => addSkill(suggestion)}
                            >
                              {suggestion}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    {serviceData.skills && serviceData.skills.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {serviceData.skills.map((skill) => (
                          <Badge key={skill} variant="secondary" className="cursor-pointer" onClick={() => removeSkill(skill)}>
                            {skill} ×
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <div className="relative">
                    <Input
                      id="location"
                      value={serviceData.location}
                      onChange={handleLocationChange}
                      placeholder="e.g., Mumbai, Maharashtra"
                      required
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
                </div>
                <div>
                  <Label htmlFor="price">Starting Price</Label>
                  <Input
                    id="price"
                    value={serviceData.price}
                    onChange={(e) => setServiceData({ ...serviceData, price: e.target.value })}
                    placeholder="e.g., ₹500"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="resume">Resume (Optional)</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="resume"
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleResumeUpload}
                      disabled={uploadingResume}
                      className="flex-1"
                    />
                    {uploadingResume && (
                      <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full" />
                    )}
                  </div>
                  {serviceData.resume && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Resume uploaded successfully
                    </p>
                  )}
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (id ? 'Updating...' : 'Adding...') : (id ? 'Update Service' : 'Add Service')}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}