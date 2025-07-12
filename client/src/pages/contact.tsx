import { motion } from "framer-motion";
import { Mail, Linkedin, MapPin, Phone } from "lucide-react";
import Navigation from "@/components/layout/navigation";
import Footer from "@/components/layout/footer";

const teamMembers = [
  {
    name: "Dr. Guanghui Hu",
    title: "CEO & Co-Founder",
    email: "guanghuihu2@gmail.com",
    linkedin: "https://www.linkedin.com/in/guanghuihu/"
  },
  {
    name: "Payton Gao",
    title: "Co-Founder",
    email: "paybob.gao@gmail.com",
    linkedin: "https://www.linkedin.com/in/payton-g-1257252b0/"
  },
  {
    name: "Ruhaan Munjuluri",
    title: "Co-Founder",
    email: "ruhaanmunjuluri@gmail.com",
    linkedin: "https://www.linkedin.com/in/ruhaan-munjuluri-7678512ba/"
  },
  {
    name: "Azra Sadibasic",
    title: "Operations Manager",
    email: "azra@ventrilinks.com",
    linkedin: "https://www.linkedin.com/in/azrasadibasic/"
  }
];

export default function Contact() {
  return (
    <div className="min-h-screen">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-to-br from-blue-50/50 via-background to-purple-50/50 molecular-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl md:text-6xl font-bold text-primary mb-6">
              Get in <span className="gradient-text">Touch</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Ready to transform your biotech fundraising? Connect with our team to learn how VentriLinks can accelerate your funding journey.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-primary mb-6">Contact Our Team</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Reach out to any of our team members directly. We're here to help you navigate the biotech funding landscape.
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {teamMembers.map((member, index) => (
              <motion.div 
                key={index}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="flex items-start space-x-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-accent to-accent-purple rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-lg">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-primary mb-1">{member.name}</h3>
                    <p className="text-accent font-medium mb-4">{member.title}</p>
                    
                    <div className="space-y-3">
                      <a 
                        href={`mailto:${member.email}`}
                        className="flex items-center space-x-3 text-muted-foreground hover:text-accent transition-colors duration-200"
                      >
                        <Mail className="w-5 h-5" />
                        <span className="text-sm">{member.email}</span>
                      </a>
                      
                      <a 
                        href={member.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-3 text-muted-foreground hover:text-accent transition-colors duration-200"
                      >
                        <Linkedin className="w-5 h-5" />
                        <span className="text-sm">LinkedIn Profile</span>
                      </a>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* General Contact */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-primary mb-6">General Inquiries</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Have questions about our platform or services? We'd love to hear from you.
            </p>
          </motion.div>
          
          <motion.div 
            className="bg-white rounded-2xl p-8 shadow-lg"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-2xl font-bold text-primary mb-4">Get Started</h3>
                <p className="text-muted-foreground mb-6">
                  Ready to find the right investors for your biotech startup? Start your journey with VentriLinks today.
                </p>
                <a 
                  href="/get-matched"
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-accent to-accent-purple text-white rounded-lg hover:shadow-lg transition-all duration-200"
                >
                  Get Matched Now
                </a>
              </div>
              
              <div>
                <h3 className="text-2xl font-bold text-primary mb-4">Quick Contact</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-accent" />
                    <span className="text-muted-foreground">info@ventrilinks.com</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <MapPin className="w-5 h-5 text-accent" />
                    <span className="text-muted-foreground">United States</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
} 