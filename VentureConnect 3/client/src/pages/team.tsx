import { motion } from "framer-motion";
import { Linkedin, Mail } from "lucide-react";
import Navigation from "@/components/layout/navigation";
import Footer from "@/components/layout/footer";

const teamMembers = [
  {
    name: "Dr. Sarah Mitchell",
    title: "CEO & Co-Founder",
    bio: "Former VP of Business Development at Genentech with 15+ years in biotech. Led partnerships worth $2B+ in oncology and rare diseases.",
    image: "https://images.unsplash.com/photo-1494790108755-2616b612b510?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&h=300",
    linkedin: "#",
    email: "sarah@ventrilinks.com"
  },
  {
    name: "Michael Chen",
    title: "CTO & Co-Founder",
    bio: "Ex-Google AI researcher with expertise in NLP and matching algorithms. Built recommendation systems serving 1B+ users.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&h=300",
    linkedin: "#",
    email: "michael@ventrilinks.com"
  },
  {
    name: "Dr. Emily Rodriguez",
    title: "Head of Product",
    bio: "Former Principal at Andreessen Horowitz bio fund. Deep expertise in drug development pipelines and venture capital processes.",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&h=300",
    linkedin: "#",
    email: "emily@ventrilinks.com"
  },
  {
    name: "David Kim",
    title: "VP of Engineering",
    bio: "Senior engineering leader from Palantir specializing in data infrastructure and enterprise security for sensitive industries.",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&h=300",
    linkedin: "#",
    email: "david@ventrilinks.com"
  }
];

const advisors = [
  {
    name: "Dr. James Patterson",
    title: "Scientific Advisor",
    company: "Former CMO, Bristol Myers Squibb",
    bio: "30+ years in drug development, led 15+ compounds to market approval across multiple therapeutic areas.",
    image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&h=300"
  },
  {
    name: "Lisa Zhang",
    title: "Investment Advisor", 
    company: "Partner, Flagship Pioneering",
    bio: "Leading biotech VC with $500M+ in successful investments. Expert in Series A-C rounds for biotech startups.",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&h=300"
  }
];

export default function Team() {
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
              Meet Our <span className="gradient-text">Team</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Seasoned experts in biotech, AI, and venture capital working together to revolutionize how startups connect with investors.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Incubator Section */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-6">Backed by Industry Leaders</h2>
            <div className="bg-white rounded-2xl p-8 shadow-lg max-w-4xl mx-auto">
              <div className="flex items-center justify-center space-x-6">
                <div className="w-16 h-16 bg-gradient-to-r from-accent to-accent-purple rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-xl">WBV</span>
                </div>
                <div className="text-left">
                  <h3 className="text-2xl font-bold text-primary mb-2">WestField Bio Ventures</h3>
                  <p className="text-muted-foreground">
                    Leading biotech incubator providing mentorship, funding, and strategic guidance to VentriLinks as we scale our AI-powered matchmaking platform.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Core Team */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-primary mb-6">Core Team</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Our founding team combines decades of experience in biotech, artificial intelligence, and venture capital.
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <motion.div 
                key={index}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="text-center mb-6">
                  <img 
                    src={member.image} 
                    alt={member.name}
                    className="w-24 h-24 rounded-full object-cover mx-auto mb-4" 
                  />
                  <h3 className="text-xl font-bold text-primary mb-1">{member.name}</h3>
                  <p className="text-accent font-medium mb-3">{member.title}</p>
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                  {member.bio}
                </p>
                <div className="flex justify-center space-x-3">
                  <a 
                    href={member.linkedin} 
                    className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700 transition-colors"
                  >
                    <Linkedin className="w-5 h-5" />
                  </a>
                  <a 
                    href={`mailto:${member.email}`} 
                    className="w-10 h-10 bg-accent rounded-full flex items-center justify-center text-white hover:bg-accent/90 transition-colors"
                  >
                    <Mail className="w-5 h-5" />
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Advisors */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-primary mb-6">Strategic Advisors</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Industry veterans guiding our strategy and growth in the biotech ecosystem.
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {advisors.map((advisor, index) => (
              <motion.div 
                key={index}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
              >
                <div className="flex items-start space-x-6">
                  <img 
                    src={advisor.image} 
                    alt={advisor.name}
                    className="w-20 h-20 rounded-full object-cover flex-shrink-0" 
                  />
                  <div>
                    <h3 className="text-xl font-bold text-primary mb-1">{advisor.name}</h3>
                    <p className="text-accent font-medium mb-1">{advisor.title}</p>
                    <p className="text-sm text-muted-foreground mb-3">{advisor.company}</p>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {advisor.bio}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}