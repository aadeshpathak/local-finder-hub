import { CheckCircle, Star, Shield, TrendingUp, Users, Award } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface ProviderInfoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProviderInfoModal({ open, onOpenChange }: ProviderInfoModalProps) {
  const { toast } = useToast();

  const benefits = [
    {
      icon: Users,
      title: 'Reach More Customers',
      description: 'Get discovered by thousands of homeowners in your area looking for your services.'
    },
    {
      icon: Star,
      title: 'Build Your Reputation',
      description: 'Collect reviews and ratings to showcase your quality work and expertise.'
    },
    {
      icon: Shield,
      title: 'Verified Badge',
      description: 'Get verified to stand out from the competition and build customer trust.'
    },
    {
      icon: TrendingUp,
      title: 'Grow Your Business',
      description: 'Track your performance with analytics and insights to optimize your profile.'
    },
  ];

  const handleApply = () => {
    onOpenChange(false);
    toast({
      title: "Demo Mode",
      description: "Provider registration is disabled in demo mode. This is a frontend-only prototype.",
      duration: 4000,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="text-center">
          <div className="mx-auto w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
            <Award className="w-7 h-7 text-primary" />
          </div>
          <DialogTitle className="text-2xl font-bold">Become a Provider</DialogTitle>
          <DialogDescription className="text-base">
            Join thousands of professionals growing their business with LocalPro
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {benefits.map((benefit, index) => (
            <div 
              key={index}
              className="flex gap-4 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
            >
              <div className="shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <benefit.icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold text-foreground">{benefit.title}</h4>
                <p className="text-sm text-muted-foreground">{benefit.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-5 h-5 text-primary" />
            <span className="font-semibold text-foreground">Free to Join</span>
          </div>
          <p className="text-sm text-muted-foreground">
            No upfront costs. Only pay when you get booked. Start growing your business today.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mt-6">
          <Button className="flex-1" size="lg" onClick={handleApply}>
            Apply Now
          </Button>
          <Button variant="outline" size="lg" onClick={() => onOpenChange(false)}>
            Maybe Later
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
