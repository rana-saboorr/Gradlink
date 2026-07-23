import { motion } from 'framer-motion';

const Privacy = () => {
  return (
    <div className="pt-10 pb-20">
      <div className="container mx-auto px-4 md:px-6 max-w-3xl">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          Privacy Policy
        </motion.h1>
        
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="prose dark:prose-invert max-w-none text-muted-foreground"
        >
          <p className="mb-4">Last updated: {new Date().toLocaleDateString()}</p>
          
          <h2 className="text-xl font-bold text-foreground mt-8 mb-4">1. Information We Collect</h2>
          <p className="mb-4">
            We collect information that you provide directly to us, including when you fill out a form, request a consultation, or communicate with us. This may include your name, email address, phone number, academic history, and any other information you choose to provide.
          </p>

          <h2 className="text-xl font-bold text-foreground mt-8 mb-4">2. How We Use Your Information</h2>
          <p className="mb-4">
            We use the information we collect to provide, maintain, and improve our services. Specifically, we use it to evaluate your profile for university admissions, communicate with you about your application status, and send you relevant updates.
          </p>

          <h2 className="text-xl font-bold text-foreground mt-8 mb-4">3. Data Security</h2>
          <p className="mb-4">
            We implement appropriate technical and organizational security measures to protect your personal information against accidental or unlawful destruction, loss, alteration, or unauthorized disclosure.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Privacy;
