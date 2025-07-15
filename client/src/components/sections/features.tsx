import { motion } from "framer-motion";
import { BarChart3, TrendingUp, Mail, CheckCircle } from "lucide-react";

const features = [
  {
    icon: BarChart3,
    title: "Investor Intelligence Engine",
    description: "Deep insights on thousands of biotech-focused VCs including investment patterns, portfolio composition, and deal preferences powered by real-time market data.",
    color: "bg-accent",
    gradient: "from-blue-50 to-cyan-50",
    features: ["Real-time investor activity tracking", "Therapeutic area expertise mapping"]
  },
  {
    icon: TrendingUp,
    title: "Startup Enrichment Pipeline",
    description: "AI-enhanced profile optimization that surfaces key differentiators, validates market potential, and positions startups for maximum investor appeal.",
    color: "bg-purple-600",
    gradient: "from-purple-50 to-pink-50",
    features: ["Automated competitive analysis", "Market validation insights"]
  },
  {
    icon: Mail,
    title: "Capital Raise Management",
    description: "Backend management system that helps startups track opportunities, craft hyperpersonalized outreach emails, and manage investor relationships through intelligent workflow assistance.",
    color: "bg-green-500",
    gradient: "from-green-50 to-teal-50",
    features: ["Hyperpersonalized email generation", "Backend startup management"]
  }
];

export default function Features() {
  return (
    <section id="features" className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-primary mb-6">Why Choose VentriLinks</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Cutting-edge technology meets industry expertise to revolutionize biotech fundraising
          </p>
        </motion.div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div 
              key={index}
              className={`bg-gradient-to-br ${feature.gradient} p-8 rounded-2xl hover:shadow-xl transition-shadow duration-300`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              viewport={{ once: true }}
            >
              <div className={`w-16 h-16 ${feature.color} rounded-xl flex items-center justify-center mb-6`}>
                <feature.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-primary mb-4">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed mb-6">
                {feature.description}
              </p>
              <ul className="space-y-2">
                {feature.features.map((item, itemIndex) => (
                  <li key={itemIndex} className="flex items-center text-sm text-muted-foreground">
                    <CheckCircle className="w-4 h-4 text-accent mr-2 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}