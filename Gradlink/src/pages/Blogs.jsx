import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Calendar, User, Tag, X, Loader2, ArrowRight, Search, Clock } from 'lucide-react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../utils/firebaseClient';

const tagColors = [
  'bg-blue-500/10 text-blue-500',
  'bg-purple-500/10 text-purple-500',
  'bg-green-500/10 text-green-600',
  'bg-orange-500/10 text-orange-500',
  'bg-pink-500/10 text-pink-500',
  'bg-teal-500/10 text-teal-500',
];

const Blogs = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTag, setActiveTag] = useState('');

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        try {
          const q = query(collection(db, 'blogs'), orderBy('created_at', 'desc'));
          const snap = await getDocs(q);
          setPosts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        } catch {
          const snap = await getDocs(collection(db, 'blogs'));
          setPosts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        }
      } catch (err) {
        console.error('Error fetching blogs:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  // Collect unique tags
  const allTags = [...new Set(posts.flatMap(p => p.tags || []).filter(Boolean))];

  const filtered = posts.filter(post => {
    const q = searchQuery.toLowerCase();
    const matchSearch = !q ||
      post.title?.toLowerCase().includes(q) ||
      post.excerpt?.toLowerCase().includes(q) ||
      post.author?.toLowerCase().includes(q) ||
      post.tags?.some(t => t.toLowerCase().includes(q));
    const matchTag = !activeTag || post.tags?.includes(activeTag);
    return matchSearch && matchTag;
  });

  // Estimate read time
  const readTime = (content = '') => {
    const words = content.trim().split(/\s+/).length;
    return Math.max(1, Math.round(words / 200));
  };

  return (
    <div className="pt-10 pb-20 min-h-screen">
      <div className="container mx-auto px-4 md:px-6 max-w-5xl">

        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary/10 text-secondary font-medium text-sm border border-secondary/20 mb-6"
          >
            <BookOpen className="w-4 h-4" /> Our Blog
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="mb-4"
          >
            Insights & Stories
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-muted-foreground"
          >
            Tips, stories, and expert insights from the world of international education.
          </motion.p>
        </div>

        {/* Search + Tags */}
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
              placeholder="Search articles, authors, tags..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-secondary/50 transition-all text-sm"
            />
          </div>
          {allTags.length > 0 && (
            <div className="flex flex-wrap gap-2 items-center">
              <button
                onClick={() => setActiveTag('')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${!activeTag ? 'bg-secondary text-white' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
              >
                All
              </button>
              {allTags.slice(0, 6).map(tag => (
                <button
                  key={tag}
                  onClick={() => setActiveTag(prev => prev === tag ? '' : tag)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${activeTag === tag ? 'bg-secondary text-white' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
                >
                  #{tag}
                </button>
              ))}
            </div>
          )}
        </motion.div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-24 gap-3 text-muted-foreground">
            <Loader2 className="w-6 h-6 animate-spin" /> Loading articles...
          </div>
        ) : filtered.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20 glass-card rounded-2xl">
            <BookOpen className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">
              {posts.length === 0 ? 'No Blog Posts Yet' : 'No Results Found'}
            </h3>
            <p className="text-muted-foreground">
              {posts.length === 0
                ? 'Our team is working on insightful articles. Check back soon!'
                : 'Try adjusting your search or tag filters.'}
            </p>
          </motion.div>
        ) : (
          <>
            {/* Featured post (first one) */}
            {filtered.length > 0 && !searchQuery && !activeTag && (
              <motion.article
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                onClick={() => setSelectedPost(filtered[0])}
                className="glass-card rounded-2xl overflow-hidden mb-6 cursor-pointer hover:border-secondary/50 hover:-translate-y-0.5 transition-all duration-300 hover:shadow-2xl group md:flex"
              >
                {filtered[0].cover_image && (
                  <div className="md:w-2/5 shrink-0 h-56 md:h-auto overflow-hidden bg-muted">
                    <img
                      src={filtered[0].cover_image}
                      alt={filtered[0].title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  </div>
                )}
                <div className="p-6 md:p-8 flex flex-col justify-center">
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className="px-2.5 py-0.5 bg-secondary/10 text-secondary text-xs font-bold rounded-md border border-secondary/20 uppercase tracking-wide">
                      Featured
                    </span>
                    {filtered[0].tags?.slice(0, 2).map((tag, i) => (
                      <span key={tag} className={`px-2.5 py-0.5 text-xs font-medium rounded-md ${tagColors[i % tagColors.length]}`}>
                        #{tag}
                      </span>
                    ))}
                  </div>
                  <h2 className="text-2xl font-bold mb-3 group-hover:text-secondary transition-colors line-clamp-2">
                    {filtered[0].title}
                  </h2>
                  <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3 mb-4">
                    {filtered[0].excerpt || filtered[0].content}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    {filtered[0].author && (
                      <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" /> {filtered[0].author}</span>
                    )}
                    {filtered[0].created_at && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(filtered[0].created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> {readTime(filtered[0].content)} min read
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-1 text-sm text-secondary font-semibold mt-4 group-hover:gap-2 transition-all">
                    Read article <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </motion.article>
            )}

            {/* Rest of posts */}
            <div className="grid md:grid-cols-2 gap-6">
              {(searchQuery || activeTag ? filtered : filtered.slice(1)).map((post, idx) => (
                <motion.article
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => setSelectedPost(post)}
                  className="glass-card rounded-2xl overflow-hidden cursor-pointer hover:border-secondary/50 hover:-translate-y-0.5 transition-all duration-300 hover:shadow-xl group flex flex-col"
                >
                  {post.cover_image && (
                    <div className="h-44 overflow-hidden bg-muted shrink-0">
                      <img
                        src={post.cover_image}
                        alt={post.title}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  )}
                  <div className="p-5 flex flex-col flex-grow">
                    <div className="flex flex-wrap gap-1.5 mb-2.5">
                      {post.tags?.slice(0, 2).map((tag, i) => (
                        <span key={tag} className={`px-2 py-0.5 text-xs font-medium rounded-md ${tagColors[i % tagColors.length]}`}>
                          #{tag}
                        </span>
                      ))}
                    </div>
                    <h3 className="font-bold mb-2 group-hover:text-secondary transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed mb-3 flex-grow">
                      {post.excerpt || post.content}
                    </p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground mt-auto pt-3 border-t border-border/50">
                      <div className="flex items-center gap-3">
                        {post.author && (
                          <span className="flex items-center gap-1"><User className="w-3 h-3" /> {post.author}</span>
                        )}
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {readTime(post.content)} min
                        </span>
                      </div>
                      {post.created_at && (
                        <span>{new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                      )}
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Post Detail Modal */}
      <AnimatePresence>
        {selectedPost && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 sm:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedPost(null)}
              className="fixed inset-0 bg-background/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl max-h-[88vh] flex flex-col glass-card rounded-2xl overflow-hidden z-10 shadow-2xl border border-secondary/20"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-3.5 shrink-0 border-b border-border/60 bg-muted/30">
                <div className="flex flex-wrap items-center gap-2 min-w-0 pr-2">
                  {selectedPost.tags?.slice(0, 2).map((tag, i) => (
                    <span key={tag} className={`px-2 py-0.5 rounded text-xs font-bold ${tagColors[i % tagColors.length]}`}>
                      #{tag}
                    </span>
                  ))}
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" /> {readTime(selectedPost.content)} min read
                  </span>
                </div>
                <button
                  onClick={() => setSelectedPost(null)}
                  className="p-1.5 rounded-full bg-muted hover:bg-red-500/10 hover:text-red-500 text-muted-foreground transition-colors shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Content */}
              <div className="overflow-y-auto min-h-0 p-5 space-y-4">
                {selectedPost.cover_image && (
                  <img
                    src={selectedPost.cover_image}
                    alt={selectedPost.title}
                    className="w-full h-48 object-cover rounded-xl"
                  />
                )}
                <h2 className="text-xl font-bold">{selectedPost.title}</h2>
                <div className="flex items-center gap-4 text-xs text-muted-foreground pb-3 border-b border-border/60">
                  {selectedPost.author && (
                    <span className="flex items-center gap-1"><User className="w-3.5 h-3.5 text-secondary" /> {selectedPost.author}</span>
                  )}
                  {selectedPost.created_at && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-secondary" />
                      {new Date(selectedPost.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </span>
                  )}
                </div>
                {selectedPost.excerpt && (
                  <p className="text-sm text-secondary font-medium border-l-2 border-secondary pl-3">{selectedPost.excerpt}</p>
                )}
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                  {selectedPost.content}
                </p>
              </div>

              {/* Footer */}
              <div className="shrink-0 px-5 py-3 border-t border-border/60 bg-muted/20 flex justify-end">
                <button
                  onClick={() => setSelectedPost(null)}
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

export default Blogs;
