import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Settings, Wrench, X } from 'lucide-react';

interface OnboardingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: () => void;
}

export default function OnboardingModal({ open, onOpenChange, onComplete }: OnboardingModalProps) {
  const [step, setStep] = useState<'choice' | 'provider-tutorial'>('choice');

  const handleChoice = (isProvider: boolean) => {
    if (isProvider) {
      setStep('provider-tutorial');
    } else {
      onComplete();
      onOpenChange(false);
    }
  };

  const handleSkip = () => {
    onComplete();
    onOpenChange(false);
  };

  if (step === 'choice') {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Welcome to LocalPro!</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              What brings you here today?
            </p>
            <div className="grid gap-3">
              <Button
                variant="outline"
                className="h-auto p-4 justify-start"
                onClick={() => handleChoice(false)}
              >
                <div className="text-left">
                  <div className="font-semibold">I'm looking to hire services</div>
                  <div className="text-sm text-muted-foreground">Find trusted professionals for your needs</div>
                </div>
              </Button>
              <Button
                variant="outline"
                className="h-auto p-4 justify-start"
                onClick={() => handleChoice(true)}
              >
                <div className="text-left">
                  <div className="font-semibold">I want to become a service provider</div>
                  <div className="text-sm text-muted-foreground">Offer your services to customers</div>
                </div>
              </Button>
            </div>
            <Button variant="ghost" onClick={handleSkip} className="w-full">
              Skip for now
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wrench className="w-5 h-5" />
            Getting Started as a Provider
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-muted-foreground">
            Great! Here's how to get started with offering your services:
          </p>

          <div className="space-y-3">
            <Card className="border-primary/20">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Settings className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <h4 className="font-semibold">1. Complete Your Profile</h4>
                    <p className="text-sm text-muted-foreground">
                      Go to Settings to add your personal information, skills, and service areas.
                    </p>
                    <Button
                      size="sm"
                      className="mt-2"
                      onClick={() => {
                        window.location.href = '/settings';
                        onComplete();
                        onOpenChange(false);
                      }}
                    >
                      Go to Settings
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-primary/20">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Wrench className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <h4 className="font-semibold">2. Add Your First Service</h4>
                    <p className="text-sm text-muted-foreground">
                      Create your service listing with details, pricing, and location.
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-2"
                      onClick={() => {
                        window.location.href = '/settings';
                        onComplete();
                        onOpenChange(false);
                      }}
                    >
                      Add Service
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex gap-2 pt-4">
            <Button onClick={handleSkip} variant="outline" className="flex-1">
              Skip Tutorial
            </Button>
            <Button onClick={() => {
              onComplete();
              onOpenChange(false);
            }} className="flex-1">
              Got it!
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}