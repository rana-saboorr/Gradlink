import { useEffect, useState } from "react";
import { motion } from 'framer-motion';
import { supabase } from '../utils/supabaseClient';

const Gallery = () => {
  const [images, setImages] = useState([]);

  useEffect(() => {
    const getImages = async () => {
      const { data } = await supabase
        .from('gallery')
        .select('*')
        .order('created_at', { ascending: false });

      setImages(data || []);
    };

    getImages();
  }, []);

  return (
    <div className="pt-10 pb-20">
      <div className="container mx-auto px-4 md:px-6">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            Gallery
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-muted-foreground"
          >
            Explore moments, achievements, and experiences from our students and university partners.
          </motion.p>
        </div>

        {/* Images Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 max-w-5xl mx-auto">
          {images.map((img, index) => (
            <motion.div
              key={img.id}
              initial={{
                opacity: 0,
                scale: 0.9
              }}
              whileInView={{
                opacity: 1,
                scale: 1
              }}
              viewport={{
                once: true
              }}
              transition={{
                delay: (index % 3) * 0.1
              }}
              className="
                aspect-square
                rounded-2xl
                overflow-hidden
                cursor-pointer
                group
                shadow-md
              "
            >
              <img
                src={img.image_url}
                alt={`Gradlink Gallery ${index + 1}`}
                loading="lazy"
                className="
                  w-full
                  h-full
                  object-cover
                  group-hover:scale-110
                  transition-transform
                  duration-500
                "
              />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Gallery;