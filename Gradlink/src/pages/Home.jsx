import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Globe, Users, Award, BookOpen, Bell, Calendar, CheckCircle, X, CheckCircle2 } from 'lucide-react';
import { supabase } from '../utils/supabaseClient';

const iconMap = {
  GraduationCap: BookOpen,
  Briefcase: BookOpen,
  Passport: BookOpen,
};

const Home = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [servicesData, setServicesData] = useState([]);
  const [selectedAnn, setSelectedAnn] = useState(null);
  const [selectedService, setSelectedService] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: annData } = await supabase.from('announcements').select('*').order('created_at', { ascending: false });
        if (annData) setAnnouncements(annData);
        const { data: srvData } = await supabase.from('services').select('*').order('created_at', { ascending: true });
        if (srvData) setServicesData(srvData);
      } catch (err) {
        console.error('Error fetching data:', err);
      }
    };
    fetchData();
  }, []);

  const fadeIn = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };
  const staggerContainer = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.2 } } };

  const announcementColors = (type) => {
    if (type === 'warning') return { border: 'border-t-orange-500', icon: 'bg-orange-500/10 text-orange-500', badge: 'bg-orange-500/10 text-orange-500' };
    if (type === 'success') return { border: 'border-t-green-500', icon: 'bg-green-500/10 text-green-500', badge: 'bg-green-500/10 text-green-500' };
    return { border: 'border-t-primary', icon: 'bg-primary/10 text-primary', badge: 'bg-primary/10 text-primary' };
  };

  return (
    <div className="overflow-hidden">

      {/* Hero */}
      <section className="relative pt-20 pb-32 lg:pt-32 lg:pb-40 flex items-center min-h-[90vh]">
        <div className="absolute inset-0 z-[-1] bg-[url('https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=2070')] bg-cover bg-center">
          <div className="absolute inset-0 bg-background/90 dark:bg-background/95 backdrop-blur-sm"></div>
        </div>
        <div className="container mx-auto px-4 md:px-6">
          <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="max-w-3xl mx-auto text-center">
            <motion.div variants={fadeIn} className="inline-block mb-6 px-4 py-1.5 rounded-full bg-primary/10 text-primary font-medium text-sm border border-primary/20">Your Global Education Partner</motion.div>
            <motion.h1 variants={fadeIn} className="mb-6">
              Shape Your Future With <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">World-Class</span> Education
            </motion.h1>
            <motion.p variants={fadeIn} className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              Expert guidance for international university admissions, visa processing, and career counseling to help you achieve your global dreams.
            </motion.p>
            <motion.div variants={fadeIn} className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/contact" className="w-full sm:w-auto px-8 py-4 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-all hover:scale-105 flex items-center justify-center gap-2 shadow-lg shadow-primary/20">
                Get Free Consultation <ArrowRight className="w-5 h-5" />
              </Link>
              <Link to="/universities" className="w-full sm:w-auto px-8 py-4 bg-card text-foreground border border-border rounded-xl font-semibold hover:bg-muted transition-all flex items-center justify-center">
                Explore Universities
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 border-y border-border bg-muted/50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { icon: Globe, count: '50+', label: 'Partner Universities' },
              { icon: Users, count: '10k+', label: 'Students Placed' },
              { icon: Award, count: '99%', label: 'Visa Success Rate' },
              { icon: BookOpen, count: '15+', label: 'Years Experience' },
            ].map((stat, idx) => (
              <motion.div key={idx} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.1 }} className="text-center">
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4 text-primary"><stat.icon className="w-6 h-6" /></div>
                <h3 className="text-3xl font-bold mb-1">{stat.count}</h3>
                <p className="text-muted-foreground text-sm font-medium uppercase tracking-wider">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Announcements */}
      {announcements.length > 0 && (
        <section className="py-24 bg-muted/30">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="mb-4">Latest Updates &amp; Announcements</h2>
              <p className="text-muted-foreground">Stay informed with the latest news from Gradlink.</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {announcements.map((ann, idx) => {
                const colors = announcementColors(ann.type);
                return (
                  <motion.div key={ann.id || idx} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.1 }}
                    onClick={() => setSelectedAnn(ann)}
                    className={`glass-card p-8 rounded-2xl border-t-4 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl cursor-pointer ${colors.border}`}
                  >
                    <div className="flex items-center gap-3 mb-5">
                      <div className={`p-2.5 rounded-xl ${colors.icon}`}><Bell className="w-5 h-5" /></div>
                      <span className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${colors.badge}`}>{ann.type || 'info'}</span>
                    </div>
                    <h3 className="font-bold text-xl mb-3 break-words">{ann.title}</h3>
                    <p className="text-muted-foreground leading-relaxed mb-6 line-clamp-3 break-words">{ann.message}</p>
                    <div className="flex items-center justify-between gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-t border-border pt-4">
                      <span className="flex items-center gap-1.5 truncate"><Calendar className="w-4 h-4 shrink-0" /> Valid until: {ann.expires ? new Date(ann.expires).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}</span>
                      <span className="text-primary font-bold lowercase shrink-0">details →</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Services */}
      <section className="py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="mb-4">Comprehensive Services</h2>
            <p className="text-muted-foreground">We provide end-to-end support for your educational journey abroad.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {servicesData.slice(0, 3).map((service, idx) => {
              const Icon = iconMap[service.icon] || BookOpen;
              return (
                <motion.div key={service.id || idx} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.2 }}
                  onClick={() => setSelectedService(service)}
                  className="glass-card p-8 rounded-2xl group hover:-translate-y-2 transition-all duration-300 cursor-pointer hover:shadow-xl hover:border-primary/40 flex flex-col justify-between"
                >
                  <div>
                    <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-6 text-primary group-hover:scale-110 transition-transform shrink-0"><Icon className="w-7 h-7" /></div>
                    <h3 className="text-xl font-bold mb-3 break-words">{service.title}</h3>
                    <p className="text-muted-foreground mb-6 line-clamp-3 leading-relaxed break-words">{service.description}</p>
                    {Array.isArray(service.features) && (
                      <ul className="space-y-2 mb-6">
                        {service.features.slice(0, 3).map((f, i) => (
                          <li key={i} className="flex items-center gap-2 text-sm">
                            <CheckCircle className="w-4 h-4 text-primary shrink-0" />
                            <span className="truncate">{f}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <Link to="/services" onClick={(e) => e.stopPropagation()} className="inline-flex items-center gap-2 text-primary font-medium hover:gap-3 transition-all pt-2">
                    Learn more <ArrowRight className="w-4 h-4" />
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary"></div>
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
        <div className="container mx-auto px-4 md:px-6 relative z-10 text-center">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="max-w-3xl mx-auto text-white">
            <h2 className="text-white mb-6">Ready to Start Your Journey?</h2>
            <p className="text-white/80 text-lg mb-10">Book a free consultation with our expert counselors and take the first step towards your dream university.</p>
            <Link to="/contact" className="inline-flex px-8 py-4 bg-white text-primary rounded-xl font-bold hover:bg-white/90 transition-all hover:scale-105 shadow-xl">Schedule Free Consultation</Link>
          </motion.div>
        </div>
      </section>

      {/* ─── Announcement Modal ─── */}
      <AnimatePresence>
        {selectedAnn && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 sm:p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedAnn(null)} className="fixed inset-0 bg-background/80 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg max-h-[88vh] flex flex-col glass-card rounded-2xl overflow-hidden z-10 shadow-2xl border border-primary/20">
              <div className="flex items-center justify-between px-5 py-3.5 shrink-0 border-b border-border/60 bg-muted/30">
                <div className="flex items-center gap-2.5 min-w-0 pr-2">
                  <div className={`p-2 rounded-lg shrink-0 ${announcementColors(selectedAnn.type).icon}`}><Bell className="w-4 h-4" /></div>
                  <span className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded ${announcementColors(selectedAnn.type).badge}`}>{selectedAnn.type || 'info'}</span>
                </div>
                <button onClick={() => setSelectedAnn(null)} className="p-1.5 rounded-full bg-muted hover:bg-red-500/10 hover:text-red-500 text-muted-foreground transition-colors shrink-0"><X className="w-4 h-4" /></button>
              </div>
              <div className="overflow-y-auto min-h-0 p-5 space-y-4 [word-break:break-word] break-words">
                <h2 className="text-xl font-bold break-words">{selectedAnn.title}</h2>
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line [word-break:break-word] break-words">{selectedAnn.message}</p>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-3 border-t border-border/60">
                  <Calendar className="w-3.5 h-3.5 shrink-0" />
                  Valid until: {selectedAnn.expires ? new Date(selectedAnn.expires).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}
                </div>
              </div>
              <div className="shrink-0 px-5 py-3 border-t border-border/60 bg-muted/20 flex items-center justify-end gap-2">
                <button onClick={() => setSelectedAnn(null)} className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-border hover:bg-muted transition-colors text-muted-foreground">Close</button>
                <Link to="/contact" className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors inline-flex items-center gap-1">Contact Us <ArrowRight className="w-3 h-3" /></Link>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── Service Modal ─── */}
      <AnimatePresence>
        {selectedService && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 sm:p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedService(null)} className="fixed inset-0 bg-background/80 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-xl max-h-[88vh] flex flex-col glass-card rounded-2xl overflow-hidden z-10 shadow-2xl border border-primary/20">
              <div className="flex items-center justify-between px-5 py-3.5 shrink-0 border-b border-border/60 bg-muted/30">
                <div className="flex items-center gap-3 min-w-0 pr-2">
                  <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center text-primary shrink-0">
                    {(() => { const Icon = iconMap[selectedService.icon] || BookOpen; return <Icon className="w-5 h-5" />; })()}
                  </div>
                  <h3 className="text-sm font-bold truncate">{selectedService.title}</h3>
                </div>
                <button onClick={() => setSelectedService(null)} className="p-1.5 rounded-full bg-muted hover:bg-red-500/10 hover:text-red-500 text-muted-foreground transition-colors shrink-0"><X className="w-4 h-4" /></button>
              </div>
              <div className="overflow-y-auto min-h-0 p-5 space-y-4 [word-break:break-word] break-words">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Description</p>
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line [word-break:break-word] break-words">{selectedService.description}</p>
                </div>
                {Array.isArray(selectedService.features) && selectedService.features.length > 0 && (
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">What's Included</p>
                    <ul className="grid sm:grid-cols-2 gap-2">
                      {selectedService.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-2 p-2.5 rounded-lg bg-muted/50 border border-border/60">
                          <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                          <span className="text-xs font-medium [word-break:break-word] break-words">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              <div className="shrink-0 px-5 py-3 border-t border-border/60 bg-muted/20 flex items-center justify-end gap-2">
                <button onClick={() => setSelectedService(null)} className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-border hover:bg-muted transition-colors text-muted-foreground">Close</button>
                <Link to="/contact" className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors inline-flex items-center gap-1">Book Now <ArrowRight className="w-3 h-3" /></Link>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Home;
