
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Mail } from "lucide-react";

const NewsletterSignup = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsSubmitting(true);
    
    // Simulate newsletter signup - in a real app, you'd integrate with Mailchimp or similar
    setTimeout(() => {
      toast({
        title: "Subscribed Successfully!",
        description: "You'll receive our latest news updates in your inbox.",
      });
      setEmail("");
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <Card className="bg-primary text-primary-foreground">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-2">
          <Mail className="h-8 w-8" />
        </div>
        <CardTitle className="text-xl">Stay Updated</CardTitle>
        <p className="text-primary-foreground/80">
          Get the latest Kenyan news delivered to your inbox
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-3">
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="bg-white text-foreground"
          />
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
          >
            {isSubmitting ? "Subscribing..." : "Subscribe Now"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default NewsletterSignup;
