import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, FileText, Briefcase, ChevronRight, X, CheckCircle2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';

const iconMap = { GraduationCap: BookOpen, Passport: FileText, Briefcase: Briefcase };

const Services = () => {
  const [servicesData, setServicesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState(null);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const { data, error } = await supabase.from('services').select('*').order('created_at', { ascending: true });
        if (error) throw error;
        if (data) setServicesData(data);
      } catch (err) {
        console.error('Error fetching services from Supabase:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  if (loading) {
    return <div className="pt-32 pb-20 text-center text-muted-foreground min-h-[60vh]">Loading services...</div>;
  }

  return (
    <div className="pt-10 pb-20">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">Our Services</motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-lg text-muted-foreground">
            Comprehensive support tailored to your educational aspirations.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {servicesData.map((service, idx) => {
            const Icon = iconMap[service.icon] || BookOpen;
            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                onClick={() => setSelectedService(service)}
                className="glass-card flex flex-col rounded-2xl p-7 hover:-translate-y-1.5 transition-all duration-300 cursor-pointer hover:shadow-xl hover:border-primary/40 group"
              >
                <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-5 text-primary group-hover:scale-110 transition-transform shrink-0">
                  <Icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold mb-2 break-words">{service.title}</h3>
                <p className="text-muted-foreground mb-5 line-clamp-3 leading-relaxed break-words text-sm flex-grow">{service.description}</p>

                {Array.isArray(service.features) && service.features.length > 0 && (
                  <ul className="space-y-2 mb-5">
                    {service.features.slice(0, 3).map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                        <span className="truncate">{feature}</span>
                      </li>
                    ))}
                    {service.features.length > 3 && (
                      <p className="text-xs text-primary font-medium">+{service.features.length - 3} more...</p>
                    )}
                  </ul>
                )}

                <div className="pt-3 border-t border-border/60 flex items-center justify-between">
                  <Link to="/contact" onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-muted hover:bg-primary hover:text-white rounded-lg font-semibold transition-colors text-sm">
                    Book Session <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                  <span className="text-xs text-muted-foreground">click for details</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ─── Service Detail Modal ─── */}
      <AnimatePresence>
        {selectedService && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 sm:p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedService(null)}
              className="fixed inset-0 bg-background/80 backdrop-blur-md" />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-xl max-h-[88vh] flex flex-col glass-card rounded-2xl overflow-hidden z-10 shadow-2xl border border-primary/20"
            >
              {/* Sticky Header */}
              <div className="flex items-center justify-between px-5 py-3.5 shrink-0 border-b border-border/60 bg-muted/30">
                <div className="flex items-center gap-3 min-w-0 pr-2">
                  <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center text-primary shrink-0">
                    {(() => { const Icon = iconMap[selectedService.icon] || BookOpen; return <Icon className="w-5 h-5" />; })()}
                  </div>
                  <h3 className="text-sm font-bold truncate">{selectedService.title}</h3>
                </div>
                <button onClick={() => setSelectedService(null)}
                  className="p-1.5 rounded-full bg-muted hover:bg-red-500/10 hover:text-red-500 text-muted-foreground transition-colors shrink-0">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="overflow-y-auto min-h-0 p-5 space-y-4 [word-break:break-word] break-words">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Description</p>
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line [word-break:break-word] break-words">
                    {selectedService.description}
                  </p>
                </div>

                {Array.isArray(selectedService.features) && selectedService.features.length > 0 && (
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">What's Included</p>
                    <ul className="grid sm:grid-cols-2 gap-2">
                      {selectedService.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-2.5 p-2.5 rounded-lg bg-muted/50 border border-border/60">
                          <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                          <span className="text-xs font-medium [word-break:break-word] break-words">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Sticky Footer - small buttons bottom-right */}
              <div className="shrink-0 px-5 py-3 border-t border-border/60 bg-muted/20 flex items-center justify-end gap-2">
                <button onClick={() => setSelectedService(null)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-border hover:bg-muted transition-colors text-muted-foreground">
                  Close
                </button>
                <Link to="/contact"
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors inline-flex items-center gap-1">
                  Book Consultation <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Services;
