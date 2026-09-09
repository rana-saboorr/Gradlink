import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Clock, ArrowRight, Building2, Loader2, Briefcase, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../utils/firebaseClient';

const Careers = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        try {
          const q = query(collection(db, 'jobs'), orderBy('created_at', 'desc'));
          const snap = await getDocs(q);
          setJobs(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        } catch {
          const snap = await getDocs(collection(db, 'jobs'));
          setJobs(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        }
      } catch (err) {
        console.error('Error fetching jobs:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  return (
    <div className="pt-10 pb-20 min-h-screen">
      <div className="container mx-auto px-4 md:px-6 max-w-5xl">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
            Join Our Team
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="text-lg text-muted-foreground">
            Help us shape the future of global education. We're always looking for passionate individuals to join Gradlink.
          </motion.p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 gap-3 text-muted-foreground">
            <Loader2 className="w-6 h-6 animate-spin" /> Loading positions...
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-20 glass-card rounded-2xl">
            <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">No Open Positions</h3>
            <p className="text-muted-foreground">There are no job openings right now. Check back soon!</p>
          </div>
        ) : (
          <div className="space-y-5">
            {jobs.map((job, idx) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                onClick={() => setSelectedJob(job)}
                className="glass-card rounded-2xl p-6 flex flex-col md:flex-row md:items-center gap-5 hover:border-primary/50 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer hover:shadow-xl group"
              >
                <div className="flex-grow min-w-0">
                  <div className="flex items-center gap-2 mb-2.5 flex-wrap">
                    <span className="px-2.5 py-1 bg-secondary/10 text-secondary text-xs font-bold uppercase tracking-wide rounded-md border border-secondary/20">
                      {job.department}
                    </span>
                    <span className="px-2.5 py-1 bg-primary/10 text-primary text-xs font-bold uppercase tracking-wide rounded-md border border-primary/20">
                      {job.type}
                    </span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {new Date(job.deadline).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold mb-1.5 group-hover:text-primary transition-colors break-words">{job.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2 break-words mb-3">{job.description}</p>
                  <div className="flex flex-wrap gap-3 text-xs text-foreground/70 font-medium">
                    <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-primary" /> {job.location}</span>
                    <span className="flex items-center gap-1"><Building2 className="w-3.5 h-3.5 text-primary" /> {job.department}</span>
                  </div>
                </div>
                <div className="shrink-0 flex items-center gap-3">
                  <Link
                    to={job.apply_link || '/contact'}
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-all shadow-md shadow-primary/20 text-sm whitespace-nowrap"
                  >
                    Apply Now <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* ─── Job Detail Modal ─── */}
      <AnimatePresence>
        {selectedJob && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 sm:p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedJob(null)}
              className="fixed inset-0 bg-background/80 backdrop-blur-md" />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-xl max-h-[88vh] flex flex-col glass-card rounded-2xl overflow-hidden z-10 shadow-2xl border border-primary/20"
            >
              {/* Sticky Header */}
              <div className="flex items-center justify-between px-5 py-3.5 shrink-0 border-b border-border/60 bg-muted/30">
                <div className="flex items-center gap-2 min-w-0 pr-2 flex-wrap">
                  <span className="px-2 py-0.5 bg-secondary/10 text-secondary text-xs font-bold rounded">{selectedJob.department}</span>
                  <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs font-bold rounded">{selectedJob.type}</span>
                </div>
                <button onClick={() => setSelectedJob(null)}
                  className="p-1.5 rounded-full bg-muted hover:bg-red-500/10 hover:text-red-500 text-muted-foreground transition-colors shrink-0">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="overflow-y-auto min-h-0 p-5 space-y-4 [word-break:break-word] break-words">
                <div>
                  <h2 className="text-xl font-bold mb-3 break-words">{selectedJob.title}</h2>
                  <div className="flex flex-wrap gap-3 text-xs text-muted-foreground pb-4 border-b border-border/60">
                    <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-primary" /> {selectedJob.location}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-primary" /> Deadline: {new Date(selectedJob.deadline).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Role Overview</p>
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line [word-break:break-word] break-words">
                    {selectedJob.description}
                  </p>
                </div>
              </div>

              {/* Sticky Footer - small buttons bottom-right */}
              <div className="shrink-0 px-5 py-3 border-t border-border/60 bg-muted/20 flex items-center justify-end gap-2">
                <button onClick={() => setSelectedJob(null)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-border hover:bg-muted transition-colors text-muted-foreground">
                  Close
                </button>
                <Link to={selectedJob.apply_link || '/contact'}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors inline-flex items-center gap-1">
                  Apply Now <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Careers;
