import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { X, ExternalLink } from 'lucide-react';
import { supabase } from '../utils/supabaseClient';

const Linkedin = ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>;
const Twitter = ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>;

const Team = () => {
  const [teamData, setTeamData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState(null);

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const { data, error } = await supabase.from('team').select('*').order('id', { ascending: true });
        if (error) throw error;
        if (data) setTeamData(data);
      } catch (err) {
        console.error('Error fetching team from Supabase:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTeam();
  }, []);

  if (loading) {
    return <div className="pt-32 pb-20 text-center text-muted-foreground min-h-[60vh]">Loading team...</div>;
  }

  return (
    <div className="pt-10 pb-20">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
            Meet Our Experts
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-lg text-muted-foreground">
            Our team of seasoned professionals is committed to guiding you at every step of your journey.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {teamData.map((member, idx) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              onClick={() => setSelectedMember(member)}
              className="glass-card rounded-3xl overflow-hidden group text-center cursor-pointer hover:-translate-y-1.5 transition-all duration-300 hover:shadow-xl hover:border-primary/40 flex flex-col"
            >
              <div className="aspect-square overflow-hidden relative">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="bg-background/90 text-foreground text-xs font-semibold px-3 py-1.5 rounded-full shadow border border-border">
                    Click to view bio
                  </span>
                </div>
              </div>
              <div className="px-6 py-5 flex flex-col flex-grow">
                <h3 className="text-xl font-bold mb-1 break-words">{member.name}</h3>
                <p className="text-primary font-medium text-sm mb-3 break-words">{member.role}</p>
                <p className="text-muted-foreground text-sm line-clamp-3 leading-relaxed break-words flex-grow">{member.bio}</p>
                <div className="flex items-center justify-center gap-3 mt-4 pt-4 border-t border-border/60">
                  {member.linkedin_url && (
                    <a href={member.linkedin_url} target="_blank" rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-white transition-colors">
                      <Linkedin className="w-4 h-4" />
                    </a>
                  )}
                  {member.twitter_url && (
                    <a href={member.twitter_url} target="_blank" rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-white transition-colors">
                      <Twitter className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ─── Detail Modal ─── */}
      <AnimatePresence>
        {selectedMember && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 sm:p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedMember(null)}
              className="fixed inset-0 bg-background/80 backdrop-blur-md" />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-xl max-h-[88vh] flex flex-col glass-card rounded-2xl overflow-hidden z-10 shadow-2xl border border-primary/20"
            >
              {/* Sticky Header */}
              <div className="flex items-center justify-between px-5 py-3.5 shrink-0 border-b border-border/60 bg-muted/30 backdrop-blur-sm">
                <div className="flex items-center gap-2.5 min-w-0">
                  <img src={selectedMember.image} alt={selectedMember.name}
                    className="w-9 h-9 rounded-full object-cover border border-border shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-bold truncate leading-tight">{selectedMember.name}</p>
                    <p className="text-xs text-primary truncate">{selectedMember.role}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedMember(null)}
                  className="p-1.5 rounded-full bg-muted hover:bg-red-500/10 hover:text-red-500 text-muted-foreground transition-colors shrink-0 ml-2">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="overflow-y-auto min-h-0 p-5 space-y-4 [word-break:break-word] break-words">
                <div className="flex flex-col sm:flex-row gap-4 items-center sm:items-start">
                  <img src={selectedMember.image} alt={selectedMember.name}
                    className="w-28 h-28 rounded-xl object-cover shrink-0 border-2 border-primary/20 shadow" />
                  <div className="text-center sm:text-left">
                    <h2 className="text-xl font-bold break-words">{selectedMember.name}</h2>
                    <p className="text-primary font-semibold text-sm mb-3 break-words">{selectedMember.role}</p>
                    <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                      {selectedMember.linkedin_url && (
                        <a href={selectedMember.linkedin_url} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors text-xs font-semibold">
                          <Linkedin className="w-3.5 h-3.5" /> LinkedIn <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                      {selectedMember.twitter_url && (
                        <a href={selectedMember.twitter_url} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted text-foreground hover:bg-primary hover:text-white transition-colors text-xs font-semibold">
                          <Twitter className="w-3.5 h-3.5" /> Twitter <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-border/60">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">About</p>
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line [word-break:break-word] break-words">
                    {selectedMember.bio}
                  </p>
                </div>
              </div>

              {/* Sticky Footer with small action button */}
              <div className="shrink-0 px-5 py-3 border-t border-border/60 bg-muted/20 flex items-center justify-end gap-2">
                <button onClick={() => setSelectedMember(null)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-border hover:bg-muted transition-colors text-muted-foreground">
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Team;
