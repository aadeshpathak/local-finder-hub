import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft } from 'lucide-react';

export default function MyInfo() {
  const { profile } = useAuth();
  const navigate = useNavigate();

  if (!profile) {
    return <div>Please log in to view your info.</div>;
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

          <h1 className="text-2xl sm:text-3xl font-bold mb-8">My Information</h1>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Profile Picture</CardTitle>
            </CardHeader>
            <CardContent>
              <Avatar className="w-24 h-24">
                <AvatarImage src={profile.profilePicThumbnail || profile.profilePic} alt={profile.name || 'User'} />
                <AvatarFallback>
                  <span className="text-2xl">{profile.name?.charAt(0) || profile.email?.charAt(0)}</span>
                </AvatarFallback>
              </Avatar>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Full Name</label>
                <p className="text-sm text-muted-foreground">{profile.name || 'Not provided'}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Email</label>
                <p className="text-sm text-muted-foreground">{profile.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Phone</label>
                <p className="text-sm text-muted-foreground">{profile.phone || 'Not provided'}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Username</label>
                <p className="text-sm text-muted-foreground">{profile.username || 'Not provided'}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Role</label>
                <p className="text-sm text-muted-foreground">{profile.role}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Service Provider</label>
                <p className="text-sm text-muted-foreground">{profile.isProvider ? 'Yes' : 'No'}</p>
              </div>
            </CardContent>
          </Card>

          {profile.isProvider && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Professional Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Skills</label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {profile.skills?.map((skill, index) => (
                      <Badge key={index} variant="secondary">{skill}</Badge>
                    )) || 'None'}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Services</label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {profile.services?.map((service, index) => (
                      <Badge key={index} variant="secondary">{service}</Badge>
                    )) || 'None'}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Experience</label>
                  <p className="text-sm text-muted-foreground">{profile.experience || 'Not provided'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Locations</label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {profile.locations?.map((location, index) => (
                      <Badge key={index} variant="secondary">{location}</Badge>
                    )) || 'None'}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Timings</label>
                  <p className="text-sm text-muted-foreground">{profile.timings || 'Not provided'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Resume</label>
                  {profile.resume ? (
                    <a href={profile.resume} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
                      View Resume
                    </a>
                  ) : (
                    <p className="text-sm text-muted-foreground">Not provided</p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Social Links</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {profile.socialLinks?.map((link, index) => (
                    <a key={index} href={link} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
                      {link}
                    </a>
                  )) || 'None'}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Verified</label>
                <p className="text-sm text-muted-foreground">{profile.verified ? 'Yes' : 'No'}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}