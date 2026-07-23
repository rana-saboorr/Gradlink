import { motion } from 'framer-motion';
import { Target, Lightbulb, Shield, Users } from 'lucide-react';

const About = () => {
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
            About Gradlink
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-muted-foreground"
          >
            Gradlink is a trusted and fast growing international student recruitment consultancy based in Johar Town, Lahore. We specialise in providing professional guidance and admission support to students aiming to pursue higher education in top universities across the UK, Australia, USA, Ireland, and Europe. Our mission is to empower students to achieve their academic and career goals through personalised consulting and ongoing support.
          </motion.p>
        </div>

        {/* Vision & Mission */}
        <div className="grid md:grid-cols-2 gap-8 mb-20">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="glass-card p-8 rounded-2xl"
          >
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6 text-primary">
              <Lightbulb className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold mb-4">Our Vision</h2>
            <p className="text-muted-foreground leading-relaxed">
              To be the world's most trusted educational consulting firm, empowering students to unlock their full potential through global education opportunities. We envision a world where every student has access to quality guidance for their academic journey.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="glass-card p-8 rounded-2xl"
          >
            <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center mb-6 text-secondary">
              <Target className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
            <p className="text-muted-foreground leading-relaxed">
              To provide personalized, ethical, and comprehensive consulting services that simplify the complex process of studying abroad. We strive to match students with institutions that align with their academic goals, financial capacity, and career aspirations.
            </p>
          </motion.div>
        </div>

        {/* Values */}
        <div className="text-center mb-12">
          <h2 className="mb-4">Our Core Values</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { icon: Shield, title: "Integrity", desc: "We maintain the highest ethical standards in all our student dealings and university partnerships." },
            { icon: Users, title: "Student-Centric", desc: "Our students' success and well-being are at the heart of every recommendation we make." },
            { icon: Target, title: "Excellence", desc: "We continuously strive for excellence in our knowledge base and service delivery." }
          ].map((val, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="text-center p-6"
            >
              <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-6 text-primary">
                <val.icon className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-3">{val.title}</h3>
              <p className="text-muted-foreground">{val.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default About;