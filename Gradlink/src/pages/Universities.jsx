import { motion } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import { MapPin, Building, Search } from 'lucide-react';
import universitiesData from '../data/universities.json';

const Universities = () => {
  const [searchParams] = useSearchParams();
  const initialCountry = searchParams.get('country');
  
  // Basic implementation without complex filtering for demo
  return (
    <div className="pt-10 pb-20 bg-muted/30">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="max-w-2xl">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 text-4xl"
            >
              Partner Universities
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-muted-foreground"
            >
              We partner with prestigious institutions globally to offer you the best choices.
            </motion.p>
          </div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="relative max-w-sm w-full"
          >
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search universities..." 
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
          </motion.div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {universitiesData.map((uni, idx) => (
            <motion.div
              key={uni.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="glass-card rounded-2xl overflow-hidden flex flex-col group hover:-translate-y-1 transition-all duration-300"
            >
              <div className="aspect-video relative overflow-hidden">
                <img 
                  src={uni.image} 
                  alt={uni.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur text-foreground px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                  {uni.ranking}
                </div>
              </div>
              <div className="p-6 flex flex-col flex-grow">
                <h3 className="text-xl font-bold mb-2">{uni.name}</h3>
                <div className="flex items-center gap-1.5 text-muted-foreground text-sm mb-6">
                  <MapPin className="w-4 h-4" />
                  {uni.location}
                </div>
                <div className="mt-auto">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                    <Building className="w-4 h-4" />
                    Top Programs
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {uni.programs.map(prog => (
                      <span key={prog} className="text-xs px-2.5 py-1 rounded-md bg-primary/10 text-primary font-medium">
                        {prog}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Universities;
