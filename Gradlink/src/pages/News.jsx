import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Newspaper, Calendar, Tag, X, Loader2, ArrowRight, Search } from 'lucide-react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../utils/firebaseClient';

const categoryColors = {
  admissions: { bg: 'bg-blue-500/10', text: 'text-blue-500', border: 'border-blue-500/20' },
  scholarship: { bg: 'bg-yellow-500/10', text: 'text-yellow-600', border: 'border-yellow-500/20' },
  visa: { bg: 'bg-purple-500/10', text: 'text-purple-500', border: 'border-purple-500/20' },
  event: { bg: 'bg-green-500/10', text: 'text-green-500', border: 'border-green-500/20' },
  announcement: { bg: 'bg-primary/10', text: 'text-primary', border: 'border-primary/20' },
};

const getCategoryStyle = (cat = 'announcement') =>
  categoryColors[cat.toLowerCase()] || categoryColors.announcement;

const News = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('');

  useEffect(() => {
    const fetchNews = async () => {
      try {
        try {
          const q = query(collection(db, 'news'), orderBy('created_at', 'desc'));
          const snap = await getDocs(q);
          setArticles(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        } catch {
          const snap = await getDocs(collection(db, 'news'));
          setArticles(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        }
      } catch (err) {
        console.error('Error fetching news:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, []);

  const categories = [...new Set(articles.map(a => a.category).filter(Boolean))];

  const filtered = articles.filter(article => {
    const q = searchQuery.toLowerCase();
    const matchSearch = !q ||
      article.title?.toLowerCase().includes(q) ||
      article.summary?.toLowerCase().includes(q) ||
      article.content?.toLowerCase().includes(q);
    const matchCat = !activeCategory || article.category === activeCategory;
    return matchSearch && matchCat;
  });

  return (
    <div className="pt-10 pb-20 min-h-screen">
      <div className="container mx-auto px-4 md:px-6 max-w-5xl">

        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary font-medium text-sm border border-primary/20 mb-6"
          >
            <Newspaper className="w-4 h-4" /> Latest News
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="mb-4"
          >
            News & Updates
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-muted-foreground"
          >
            Stay informed with the latest updates on international education, admissions, and opportunities.
          </motion.p>
        </div>

        {/* Search + Filter */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="flex flex-col sm:flex-row gap-3 mb-6"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search news..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm"
            />
          </div>
          {categories.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setActiveCategory('')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${!activeCategory ? 'bg-primary text-white' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
              >
                All
              </button>
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(prev => prev === cat ? '' : cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${activeCategory === cat ? 'bg-primary text-white' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </motion.div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-24 gap-3 text-muted-foreground">
            <Loader2 className="w-6 h-6 animate-spin" /> Loading news...
          </div>
        ) : filtered.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20 glass-card rounded-2xl">
            <Newspaper className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">
              {articles.length === 0 ? 'No News Yet' : 'No Results Found'}
            </h3>
            <p className="text-muted-foreground">
              {articles.length === 0
                ? 'Check back soon for the latest updates and news.'
                : 'Try adjusting your search or filters.'}
            </p>
          </motion.div>
        ) : (
          <div className="space-y-5">
            {filtered.map((article, idx) => {
              const style = getCategoryStyle(article.category);
              return (
                <motion.article
                  key={article.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => setSelectedArticle(article)}
                  className="glass-card rounded-2xl p-6 flex flex-col md:flex-row gap-5 cursor-pointer hover:border-primary/50 hover:-translate-y-0.5 transition-all duration-300 hover:shadow-xl group"
                >
                  {article.image && (
                    <div className="shrink-0 w-full md:w-48 h-32 md:h-auto rounded-xl overflow-hidden bg-muted">
                      <img
                        src={article.image}
                        alt={article.title}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  )}
                  <div className="flex-grow min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      {article.category && (
                        <span className={`px-2.5 py-0.5 rounded-md text-xs font-bold uppercase tracking-wide border ${style.bg} ${style.text} ${style.border}`}>
                          <Tag className="w-3 h-3 inline mr-1" />{article.category}
                        </span>
                      )}
                      {article.created_at && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(article.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors line-clamp-2">
                      {article.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                      {article.summary || article.content}
                    </p>
                    <span className="inline-flex items-center gap-1 text-sm text-primary font-semibold mt-3 group-hover:gap-2 transition-all">
                      Read more <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </motion.article>
              );
            })}
          </div>
        )}
      </div>

      {/* Article Detail Modal */}
      <AnimatePresence>
        {selectedArticle && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 sm:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedArticle(null)}
              className="fixed inset-0 bg-background/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl max-h-[88vh] flex flex-col glass-card rounded-2xl overflow-hidden z-10 shadow-2xl border border-primary/20"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-3.5 shrink-0 border-b border-border/60 bg-muted/30">
                <div className="flex items-center gap-2 flex-wrap min-w-0 pr-2">
                  {selectedArticle.category && (
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${getCategoryStyle(selectedArticle.category).bg} ${getCategoryStyle(selectedArticle.category).text}`}>
                      {selectedArticle.category}
                    </span>
                  )}
                  {selectedArticle.created_at && (
                    <span className="text-xs text-muted-foreground">
                      {new Date(selectedArticle.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setSelectedArticle(null)}
                  className="p-1.5 rounded-full bg-muted hover:bg-red-500/10 hover:text-red-500 text-muted-foreground transition-colors shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Content */}
              <div className="overflow-y-auto min-h-0 p-5 space-y-4">
                {selectedArticle.image && (
                  <img
                    src={selectedArticle.image}
                    alt={selectedArticle.title}
                    className="w-full h-48 object-cover rounded-xl"
                  />
                )}
                <h2 className="text-xl font-bold">{selectedArticle.title}</h2>
                {selectedArticle.summary && (
                  <p className="text-sm text-primary font-medium border-l-2 border-primary pl-3">{selectedArticle.summary}</p>
                )}
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                  {selectedArticle.content}
                </p>
              </div>

              {/* Footer */}
              <div className="shrink-0 px-5 py-3 border-t border-border/60 bg-muted/20 flex justify-end">
                <button
                  onClick={() => setSelectedArticle(null)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-border hover:bg-muted transition-colors text-muted-foreground"
                >
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

export default News;
