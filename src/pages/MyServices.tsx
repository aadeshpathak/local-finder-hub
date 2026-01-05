import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Service {
  id: string;
  title: string;
  category: string;
  description: string;
  location: string;
  price: string;
  providerId: string;
  providerName: string;
  providerUsername: string;
  rating: number;
  reviewCount: number;
  availability: string;
  image: string;
  createdAt: Date;
}

export default function MyServices() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchServices();
    }
  }, [user]);

  const fetchServices = async () => {
    if (!user) return;
    try {
      const q = query(collection(db, 'services'), where('providerId', '==', user.uid));
      const querySnapshot = await getDocs(q);
      const servicesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate(),
      })) as Service[];
      setServices(servicesData);
    } catch (error) {
      console.error('Error fetching services:', error);
      toast({
        title: "Error",
        description: "Failed to load services.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteService = async (serviceId: string) => {
    try {
      await deleteDoc(doc(db, 'services', serviceId));
      setServices(services.filter(service => service.id !== serviceId));
      toast({
        title: "Success",
        description: "Service deleted successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete service.",
        variant: "destructive",
      });
    }
  };

  if (!user) {
    return <div>Please log in to view your services.</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold">My Services</h1>
            <Button onClick={() => navigate('/manage-service')}>
              Add New Service
            </Button>
          </div>

          {loading ? (
            <div className="text-center">Loading services...</div>
          ) : services.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">You haven't added any services yet.</p>
                <Button className="mt-4" onClick={() => navigate('/manage-service')}>
                  Add Your First Service
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {services.map((service) => (
                <Card key={service.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{service.title}</CardTitle>
                        <Badge variant="secondary" className="mt-1">{service.category}</Badge>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/manage-service/${service.id}`)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteService(service.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-2">{service.description}</p>
                    <div className="flex justify-between items-center text-sm">
                      <span>Location: {service.location}</span>
                      <span className="font-semibold">₹{service.price}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm mt-2">
                      <span>Rating: {service.rating.toFixed(1)} ({service.reviewCount} reviews)</span>
                      <Badge variant={service.availability === 'available' ? 'default' : 'secondary'}>
                        {service.availability}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}