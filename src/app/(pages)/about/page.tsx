import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Newspaper, Rss, ShieldCheck } from "lucide-react";
import Image from "next/image";

const features = [
  {
    icon: <Newspaper className="h-8 w-8 text-primary" />,
    title: "In-Depth Analysis",
    description: "We go beyond the headlines to provide context and analysis, helping you understand the 'why' behind the news.",
  },
  {
    icon: <Rss className="h-8 w-8 text-primary" />,
    title: "Always Current",
    description: "Our team works around the clock to bring you the latest developments as they happen.",
  },
  {
    icon: <ShieldCheck className="h-8 w-8 text-primary" />,
    title: "Unbiased Reporting",
    description: "We are committed to fair and impartial journalism, presenting all sides of the story.",
  },
];

const stats = [
    { value: "100+", label: "Articles Published" },
    { value: "24/7", label: "News Coverage" },
    { value: "50k+", label: "Monthly Readers" },
    { value: "10+", label: "Expert Authors" },
];

const AboutPage = () => {
  return (
    <div className="container mx-auto px-4 py-16">
      <section className="text-center mb-24 animate-fade-in-up">
        <h1 className="text-4xl md:text-6xl font-headline font-bold tracking-tight mb-4">
          About Nova<span className="text-primary">.</span>
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
          Cutting through the noise, delivering clarity. We are your essential destination for making sense of today's complex world.
        </p>
      </section>

      <section className="relative mb-24">
         <Image 
            src="https://picsum.photos/1200/500?random=10"
            alt="Our Team"
            width={1200}
            height={500}
            data-ai-hint="team meeting"
            className="rounded-xl object-cover"
         />
         <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent rounded-xl"></div>
      </section>

      <section className="mb-24">
        <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-headline font-bold">Our Core Principles</h2>
            <p className="text-muted-foreground mt-2">What drives us to deliver the best content.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="glass-card text-center p-8 transition-transform transform hover:-translate-y-2">
              <div className="inline-block p-4 bg-primary/10 rounded-full mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-headline font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>
      
      <section className="bg-secondary rounded-xl p-8 md:p-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat) => (
                <div key={stat.label}>
                    <p className="text-4xl md:text-5xl font-bold font-headline text-primary">{stat.value}</p>
                    <p className="text-sm md:text-base text-muted-foreground mt-2">{stat.label}</p>
                </div>
            ))}
        </div>
      </section>

    </div>
  );
};

export default AboutPage;
