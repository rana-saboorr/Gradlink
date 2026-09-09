import { motion } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import { MapPin, Building, Search, X } from 'lucide-react';
import { useState, useMemo } from 'react';
import universitiesData from '../data/universities.json';

const Universities = () => {
  const [searchParams] = useSearchParams();
  const initialCountry = searchParams.get('country') || '';

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCountry, setActiveCountry] = useState(initialCountry);

  // Get unique countries from data
  const countries = useMemo(() => {
    const seen = new Set();
    return universitiesData
      .map(u => u.country || u.location?.split(',').pop()?.trim())
      .filter(c => c && !seen.has(c) && seen.add(c));
  }, []);

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return universitiesData.filter(uni => {
      const matchesSearch = !q ||
        uni.name?.toLowerCase().includes(q) ||
        uni.location?.toLowerCase().includes(q) ||
        uni.programs?.some(p => p.toLowerCase().includes(q));
      const matchesCountry = !activeCountry ||
        uni.id === activeCountry ||
        uni.country === activeCountry ||
        uni.location?.toLowerCase().includes(activeCountry.toLowerCase());
      return matchesSearch && matchesCountry;
    });
  }, [searchQuery, activeCountry]);

  return (
    <div className="pt-10 pb-20 bg-muted/30">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
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
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search universities, programs..."
              className="w-full pl-10 pr-10 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </motion.div>
        </div>

        {/* Country Filter Pills */}
        {countries.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap gap-2 mb-8"
          >
            <button
              onClick={() => setActiveCountry('')}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                !activeCountry
                  ? 'bg-primary text-white shadow-md shadow-primary/20'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              All
            </button>
            {countries.map(country => (
              <button
                key={country}
                onClick={() => setActiveCountry(prev => prev === country ? '' : country)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                  activeCountry === country
                    ? 'bg-primary text-white shadow-md shadow-primary/20'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {country}
              </button>
            ))}
          </motion.div>
        )}

        {/* Results count */}
        <p className="text-sm text-muted-foreground mb-6">
          Showing <span className="font-semibold text-foreground">{filtered.length}</span> of {universitiesData.length} universities
          {searchQuery && <span> for "<span className="font-medium text-primary">{searchQuery}</span>"</span>}
        </p>

        {filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20 glass-card rounded-2xl"
          >
            <Search className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">No universities found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filters.</p>
            <button
              onClick={() => { setSearchQuery(''); setActiveCountry(''); }}
              className="mt-4 px-4 py-2 bg-primary/10 text-primary rounded-xl font-medium text-sm hover:bg-primary/20 transition"
            >
              Clear filters
            </button>
          </motion.div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map((uni, idx) => (
              <motion.div
                key={uni.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
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
        )}
      </div>
    </div>
  );
};

export default Universities;
