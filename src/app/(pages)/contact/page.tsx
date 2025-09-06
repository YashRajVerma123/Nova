import { Mail, MessageSquare, User } from "lucide-react";
import ContactForm from "@/components/contact-form";

const ContactPage = () => {
  return (
    <div className="container mx-auto px-4 py-16">
      <section className="text-center mb-16 animate-fade-in-up">
        <h1 className="text-4xl md:text-6xl font-headline font-bold tracking-tight mb-4">
          Get In Touch<span className="text-primary">.</span>
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
          Have a question, a story tip, or feedback? We'd love to hear from you.
        </p>
      </section>

      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="flex flex-col justify-center">
            <h2 className="text-3xl font-headline font-bold mb-4">Contact Information</h2>
            <p className="text-muted-foreground mb-8">
                Reach out to us through the following channels. Our team will get back to you as soon as possible.
            </p>
            <div className="space-y-6">
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-primary/10 rounded-full">
                       <Mail className="h-6 w-6 text-primary"/>
                    </div>
                    <div>
                        <h3 className="font-semibold">Email</h3>
                        <p className="text-muted-foreground">General Inquiries & Support</p>
                        <a href="mailto:help.novablog@gmail.com" className="text-primary hover:underline">
                            help.novablog@gmail.com
                        </a>
                    </div>
                </div>
                 <div className="flex items-start gap-4">
                    <div className="p-3 bg-primary/10 rounded-full">
                       <MessageSquare className="h-6 w-6 text-primary"/>
                    </div>
                    <div>
                        <h3 className="font-semibold">Social Media</h3>
                        <p className="text-muted-foreground">Follow us for updates</p>
                        <div className="flex space-x-2 mt-1">
                          <a href="#" className="text-primary hover:underline">Twitter</a>
                          <span>/</span>
                          <a href="#" className="text-primary hover:underline">LinkedIn</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div className="glass-card p-8">
          <h2 className="text-2xl font-headline font-bold mb-6 text-center">Send us a message</h2>
          <ContactForm />
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
