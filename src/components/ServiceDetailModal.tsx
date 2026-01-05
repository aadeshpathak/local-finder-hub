import { useState, useEffect } from 'react';
import { Star, MapPin, Phone, Mail, FileText, MessageCircle, Calendar, Clock, CheckCircle, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MapComponent } from '@/components/MapComponent';
import { useAuth } from '@/contexts/AuthContext';
import { getReviewsForService, addReview, updateReview, deleteReview, updateServiceRating } from '@/lib/reviews';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import type { Service } from '@/data/services';
import type { Review } from '@/types/review';
import type { UserProfile } from '@/contexts/AuthContext';

interface ServiceDetailModalProps {
  service: Service | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ServiceDetailModal({ service, open, onOpenChange }: ServiceDetailModalProps) {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [provider, setProvider] = useState<UserProfile | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newReview, setNewReview] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [loading, setLoading] = useState(false);
  const [existingReview, setExistingReview] = useState<Review | null>(null);
  const [currentService, setCurrentService] = useState<Service | null>(service);

  useEffect(() => {
    if (service && open) {
      setCurrentService(service);
      fetchProvider();
      fetchReviews();
    }
  }, [service, open]);

  const fetchProvider = async () => {
    if (!currentService?.providerId) return;
    try {
      const providerDoc = await getDoc(doc(db, 'users', currentService.providerId));
      if (providerDoc.exists()) {
        setProvider(providerDoc.data() as UserProfile);
      }
    } catch (error) {
      console.error('Error fetching provider:', error);
    }
  };

  const fetchReviews = async () => {
    if (!currentService) return;
    try {
      const reviewsData = await getReviewsForService(currentService.id);
      setReviews(reviewsData);
      if (user) {
        const userReview = reviewsData.find(review => review.userId === user.uid);
        setExistingReview(userReview || null);
        if (userReview) {
          setNewReview(userReview.reviewText);
          setNewRating(userReview.rating);
        } else {
          setNewReview('');
          setNewRating(5);
        }
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const handleSubmitReview = async () => {
    if (!user || !currentService || !newReview.trim()) return;

    setIsSubmittingReview(true);
    try {
      if (existingReview) {
        await updateReview(existingReview.id!, {
          rating: newRating,
          reviewText: newReview,
        });
        toast({
          title: "Success",
          description: "Review updated successfully!",
        });
      } else {
        await addReview({
          userId: user.uid,
          serviceId: currentService.id,
          rating: newRating,
          reviewText: newReview,
          userName: profile?.name || profile?.username || 'Anonymous',
        });
        toast({
          title: "Success",
          description: "Review submitted successfully!",
        });
      }
      try {
        await updateServiceRating(currentService.id);
      } catch (ratingError) {
        console.error('Failed to update service rating:', ratingError);
        // Continue anyway, rating will be updated later or manually
      }
      // Fetch updated service
      const updatedServiceDoc = await getDoc(doc(db, 'services', currentService.id));
      if (updatedServiceDoc.exists()) {
        const updatedData = updatedServiceDoc.data();
        setCurrentService({
          ...currentService,
          rating: updatedData.rating || currentService.rating,
          reviewCount: updatedData.reviewCount || currentService.reviewCount,
        });
      }
      await fetchReviews();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit review.",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!user) return;

    try {
      await deleteReview(reviewId);
      toast({
        title: "Success",
        description: "Review deleted successfully!",
      });
      try {
        await updateServiceRating(currentService.id);
      } catch (ratingError) {
        console.error('Failed to update service rating:', ratingError);
      }
      // Fetch updated service
      const updatedServiceDoc = await getDoc(doc(db, 'services', currentService.id));
      if (updatedServiceDoc.exists()) {
        const updatedData = updatedServiceDoc.data();
        setCurrentService({
          ...currentService,
          rating: updatedData.rating || currentService.rating,
          reviewCount: updatedData.reviewCount || currentService.reviewCount,
        });
      }
      await fetchReviews();
      // Reset form if deleted own review
      if (reviewId === existingReview?.id) {
        setExistingReview(null);
        setNewReview('');
        setNewRating(5);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete review.",
        variant: "destructive",
      });
    }
  };

  const statusConfig = {
    available: { label: 'Available', className: 'bg-green-100 text-green-800', icon: CheckCircle },
    busy: { label: 'Busy', className: 'bg-yellow-100 text-yellow-800', icon: Clock },
    offline: { label: 'Offline', className: 'bg-gray-100 text-gray-800', icon: X },
  };

  const status = statusConfig[service?.availability || 'offline'];
  const StatusIcon = status.icon;

  if (!currentService) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{currentService.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Service Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Service Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <img
                    src={currentService.image}
                    alt={currentService.name}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                </div>
                <div className="space-y-3">
                  <div>
                    <h3 className="font-semibold text-lg">{currentService.name}</h3>
                    <p className="text-muted-foreground">{currentService.category}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className={status.className}>
                      <StatusIcon className="w-3 h-3 mr-1" />
                      {status.label}
                    </Badge>
                  </div>

                  {currentService.price && (
                    <div>
                      <p className="text-sm text-muted-foreground">Starting Price</p>
                      <p className="text-2xl font-bold text-primary">{currentService.price}</p>
                    </div>
                  )}

                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">{currentService.rating}</span>
                    <span className="text-muted-foreground">({currentService.reviewCount} reviews)</span>
                  </div>

                  <div className="flex items-center gap-1 text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span>{currentService.location}</span>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold mb-2">Description</h4>
                <p className="text-muted-foreground">{currentService.description}</p>
              </div>
            </CardContent>
          </Card>

          {/* Provider Information */}
          {provider && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={provider.profilePicThumbnail || provider.profilePic} />
                    <AvatarFallback>{provider.name?.[0] || provider.email[0].toUpperCase()}</AvatarFallback>
                  </Avatar>
                  Provider Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-semibold">{provider.name || provider.username || 'Provider'}</h4>
                      {provider.verified && (
                        <Badge variant="secondary" className="ml-2">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </div>

                    {provider.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <span>{provider.phone}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span>{provider.email}</span>
                    </div>

                    {provider.experience && (
                      <div>
                        <p className="text-sm text-muted-foreground">Experience</p>
                        <p>{provider.experience}</p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    {provider.skills && provider.skills.length > 0 && (
                      <div>
                        <p className="text-sm text-muted-foreground">Skills</p>
                        <div className="flex flex-wrap gap-1">
                          {provider.skills.map((skill, index) => (
                            <Badge key={index} variant="outline">{skill}</Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {provider.timings && (
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span>{provider.timings}</span>
                      </div>
                    )}

                    {provider.resume && (
                      <div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(provider.resume, '_blank')}
                        >
                          <FileText className="w-4 h-4 mr-2" />
                          View Resume
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Location Map */}
          {currentService.latitude && currentService.longitude && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Location
                </CardTitle>
              </CardHeader>
              <CardContent>
                <MapComponent
                  services={[currentService]}
                  center={[currentService.latitude, currentService.longitude]}
                  zoom={15}
                  heightClass="h-64"
                />
              </CardContent>
            </Card>
          )}

          {/* Reviews Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5" />
                Reviews ({reviews.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Existing Reviews */}
              {reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="border-b pb-4 last:border-b-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {review.userName || 'Anonymous'}
                          </span>
                        </div>
                        {review.userId === user?.uid && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteReview(review.id!)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                      <p className="text-muted-foreground">{review.reviewText}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">No reviews yet.</p>
              )}

              {/* Add Review */}
              {user && (
                <>
                  <Separator />
                  <div className="space-y-4">
                    <h4 className="font-semibold">{existingReview ? 'Edit Your Review' : 'Write a Review'}</h4>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setNewRating(star)}
                          className="focus:outline-none"
                        >
                          <Star
                            className={`w-5 h-5 ${
                              star <= newRating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                    <Textarea
                      placeholder="Share your experience..."
                      value={newReview}
                      onChange={(e) => setNewReview(e.target.value)}
                      rows={3}
                    />
                    <Button
                      onClick={handleSubmitReview}
                      disabled={!newReview.trim() || isSubmittingReview}
                    >
                      {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}