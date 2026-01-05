import { Search, Users, Calendar, ThumbsUp } from 'lucide-react';

const steps = [
  {
    icon: Search,
    title: 'Search',
    description: 'Browse our curated list of verified local service professionals.',
  },
  {
    icon: Users,
    title: 'Compare',
    description: 'Read reviews, check ratings, and compare providers side by side.',
  },
  {
    icon: Calendar,
    title: 'Book',
    description: 'Contact your chosen provider and schedule a convenient time.',
  },
  {
    icon: ThumbsUp,
    title: 'Review',
    description: 'After the job, leave a review to help others in your community.',
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">How It Works</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Finding the right service professional has never been easier. Follow these simple steps to get started.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div 
              key={index}
              className="relative text-center group"
            >
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-10 left-1/2 w-full h-0.5 bg-border" />
              )}
              
              {/* Step Number */}
              <div className="relative z-10 mx-auto w-20 h-20 rounded-2xl bg-card border-2 border-primary/20 flex items-center justify-center mb-4 group-hover:border-primary group-hover:shadow-lg transition-all duration-300">
                <step.icon className="w-8 h-8 text-primary" />
                <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center">
                  {index + 1}
                </span>
              </div>

              <h3 className="font-semibold text-lg text-foreground mb-2">{step.title}</h3>
              <p className="text-sm text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
