import { motion } from 'framer-motion';

const Gallery = () => {
  // Placeholder images
  const images = Array.from({ length: 9 }).map((_, i) => `https://images.unsplash.com/photo-${1500000000000 + i * 1000000}?w=500&h=500&fit=crop`);

  return (
    <div className="pt-10 pb-20">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            Campus Gallery
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-muted-foreground"
          >
            Glimpses into the lives of our students at partner universities.
          </motion.p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 max-w-5xl mx-auto">
          {images.map((img, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: (idx % 3) * 0.1 }}
              className="aspect-square rounded-2xl overflow-hidden cursor-pointer group"
            >
              <img 
                src={img} 
                alt={`Gallery image ${idx + 1}`} 
                loading="lazy" 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Gallery;
