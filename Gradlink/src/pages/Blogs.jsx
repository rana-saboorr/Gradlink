import { motion } from 'framer-motion';

const Blogs = () => {
  return (
    <div className="pt-10 pb-20">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            Our Blog
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-muted-foreground"
          >
            Insights, tips, and stories from the world of international education.
          </motion.p>
        </div>
        
        <div className="text-center py-20 bg-card rounded-2xl border border-border max-w-4xl mx-auto">
          <h3 className="text-xl font-medium text-muted-foreground">No blog posts found.</h3>
          <p className="text-muted-foreground mt-2">Check back later for updates and articles.</p>
        </div>
      </div>
    </div>
  );
};

export default Blogs;
