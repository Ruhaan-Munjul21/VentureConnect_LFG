import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export default function Waitlist() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch waitlist count
  const { data: waitlistData } = useQuery({
    queryKey: ["/api/waitlist/count"],
  });

  // Waitlist signup mutation
  const waitlistMutation = useMutation({
    mutationFn: async (email: string) => {
      const response = await apiRequest("POST", "/api/waitlist", { email });
      return response.json();
    },
    onSuccess: () => {
      setIsSubmitted(true);
      setEmail("");
      toast({
        title: "Successfully joined waitlist!",
        description: "We'll notify you when early access opens.",
      });
      // Invalidate waitlist count to update it
      queryClient.invalidateQueries({ queryKey: ["/api/waitlist/count"] });
    },
    onError: (error: any) => {
      const message = error.message?.includes("409") 
        ? "Email already registered for waitlist" 
        : "Please enter a valid email address";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({
        title: "Error",
        description: "Please enter your email address",
        variant: "destructive",
      });
      return;
    }
    waitlistMutation.mutate(email);
  };

  const handleTryBeta = () => {
    window.open('http://localhost:5000/get-matched', '_blank');
  };

  return (
    <section id="waitlist" className="py-20 bg-gradient-to-r from-accent to-accent-purple">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.h2 
          className="text-4xl md:text-5xl font-bold text-white mb-6"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          Ready to Transform Your Fundraising?
        </motion.h2>
        <motion.p 
          className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
        >
          Try our beta platform now or join the waitlist for updates on new features and improvements.
        </motion.p>
        
        {/* Try Beta CTA */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
        >
          <Button 
            onClick={handleTryBeta}
            className="bg-gradient-to-r from-green-600 to-green-700 text-white px-8 py-4 text-lg font-semibold hover:from-green-700 hover:to-green-800 transform hover:scale-105 transition-all duration-200 shadow-lg"
            size="lg"
          >
            🚀 Try Beta - Get Matched Now
          </Button>
          <p className="text-blue-100 text-sm mt-2">
            Get instant access to our AI-powered VC matching platform
          </p>
        </motion.div>

        {/* Divider */}
        <motion.div 
          className="flex items-center justify-center my-8"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <div className="border-t border-blue-200 flex-grow"></div>
          <span className="px-4 text-blue-100 text-sm">OR</span>
          <div className="border-t border-blue-200 flex-grow"></div>
        </motion.div>
        
        <motion.div 
          className="bg-white/10 backdrop-blur-sm rounded-lg p-6 mb-8 inline-block"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          viewport={{ once: true }}
        >
          <div className="flex items-center justify-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-white font-semibold">
                {waitlistData?.count || 0}
              </span>
              <span className="text-blue-100">startups on waitlist</span>
            </div>
          </div>
        </motion.div>
        
        {!isSubmitted ? (
          <motion.form 
            className="max-w-md mx-auto"
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="flex flex-col sm:flex-row gap-4">
              <Input 
                type="email" 
                placeholder="Enter your email address" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 px-6 py-4 text-gray-900 placeholder-gray-500 bg-white border-0 focus:ring-4 focus:ring-white/30"
                required
              />
              <Button 
                type="submit" 
                disabled={waitlistMutation.isPending}
                className="bg-white text-accent px-8 py-4 font-semibold hover:bg-gray-100 transition-colors duration-200 whitespace-nowrap"
              >
                {waitlistMutation.isPending ? "Joining..." : "Join Waitlist"}
              </Button>
            </div>
            <p className="text-blue-100 text-sm mt-4">
              Get notified about new features, improvements, and exclusive access to premium tools.
            </p>
          </motion.form>
        ) : (
          <motion.div 
            className="mt-6 p-4 bg-green-500/20 rounded-lg"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <p className="text-white">🎉 You're on the list! We'll notify you about updates and new features.</p>
          </motion.div>
        )}
      </div>
    </section>
  );
}