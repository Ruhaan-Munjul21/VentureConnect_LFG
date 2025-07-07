import { motion } from "framer-motion";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Dr. Sarah Chen",
    title: "CEO, NeuroGen Therapeutics",
    image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=80&h=80",
    quote: "VentriLinks connected us with the perfect Series A lead in just 3 weeks. The AI matching was incredibly accurate - they understood our CNS focus and found investors with real expertise in neurological therapeutics.",
    metric: "Series A: $12M raised"
  },
  {
    name: "Michael Rodriguez",
    title: "Partner, BioVenture Capital",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=80&h=80",
    quote: "The quality of deal flow has dramatically improved since using VentriLinks. We're seeing startups that perfectly match our investment thesis - oncology companies at the right stage with strong IP positions.",
    metric: "3 investments made via platform"
  },
  {
    name: "Dr. Emily Watson",
    title: "Co-founder, CellThera",
    image: "https://images.unsplash.com/photo-1494790108755-2616b612b510?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=80&h=80",
    quote: "The platform's AI insights helped us refine our pitch and identify exactly what investors were looking for in cell therapy companies. We closed our seed round 40% faster than expected.",
    metric: "Seed round: $4.5M raised"
  }
];

export default function Testimonials() {
  return (
    <section id="testimonials" className="py-20 bg-gradient-to-br from-muted/50 to-blue-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-primary mb-6">Success Stories</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Hear from biotech founders and investors who've transformed their fundraising with VentriLinks
          </p>
        </motion.div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div 
              key={index}
              className="bg-background p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center mb-6">
                <img 
                  src={testimonial.image} 
                  alt={`${testimonial.name}, ${testimonial.title}`} 
                  className="w-16 h-16 rounded-full object-cover mr-4" 
                />
                <div>
                  <h4 className="font-bold text-primary">{testimonial.name}</h4>
                  <p className="text-sm text-muted-foreground">{testimonial.title}</p>
                </div>
              </div>
              <div className="flex mb-4">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-current" />
                  ))}
                </div>
              </div>
              <blockquote className="text-muted-foreground italic leading-relaxed">
                "{testimonial.quote}"
              </blockquote>
              <div className="mt-4 text-sm text-muted-foreground">
                {testimonial.metric}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
