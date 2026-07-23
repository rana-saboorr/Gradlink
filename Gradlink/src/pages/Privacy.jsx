import { motion } from 'framer-motion';

const Privacy = () => {
  return (
    <div className="pt-10 pb-20">
      <div className="container mx-auto px-4 md:px-6 max-w-4xl">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4"
        >
          Privacy Policy
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-muted-foreground mb-10"
        >
          Last Updated: {new Date().toLocaleDateString()}
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="space-y-8 text-muted-foreground leading-8"
        >
          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">
              1. Introduction
            </h2>
            <p>
              Gradlink values your privacy and is committed to protecting your
              personal information. This Privacy Policy explains how we collect,
              use, store, and protect the information you provide while using
              our website or educational consultancy services.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">
              2. Information We Collect
            </h2>

            <ul className="list-disc pl-6 space-y-2">
              <li>Full name</li>
              <li>Email address</li>
              <li>Phone number</li>
              <li>Educational qualifications and academic records</li>
              <li>Passport information (when required)</li>
              <li>English language test scores (IELTS, TOEFL, PTE, etc.)</li>
              <li>Visa-related documents provided by you</li>
              <li>Messages and enquiries submitted through our website</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">
              3. How We Use Your Information
            </h2>

            <p>Your information may be used to:</p>

            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li>Provide educational counselling.</li>
              <li>Recommend universities and study programs.</li>
              <li>Prepare and submit university applications.</li>
              <li>Assist with visa applications.</li>
              <li>Contact you regarding your application.</li>
              <li>Improve our website and services.</li>
              <li>Comply with legal obligations.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">
              4. Sharing of Information
            </h2>

            <p>
              We only share your information when necessary with universities,
              colleges, scholarship providers, visa authorities, trusted
              partners, or when required by law.
            </p>

            <p className="mt-3">
              We do not sell your personal information to third parties.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">
              5. Data Security
            </h2>

            <p>
              We implement reasonable administrative and technical safeguards to
              protect your personal information against unauthorized access,
              misuse, loss, or disclosure.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">
              6. Data Retention
            </h2>

            <p>
              We retain your information only as long as necessary to provide
              our services, comply with legal obligations, and resolve disputes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">
              7. Your Rights
            </h2>

            <p>You may request to:</p>

            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li>Access your personal information.</li>
              <li>Correct inaccurate information.</li>
              <li>Request deletion of your data where legally permitted.</li>
              <li>Withdraw consent for future communications.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">
              8. Cookies
            </h2>

            <p>
              Our website may use cookies and similar technologies to improve
              user experience, website functionality, and analytics.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">
              9. Changes to this Policy
            </h2>

            <p>
              We may update this Privacy Policy periodically. Any updates will
              be posted on this page with a revised "Last Updated" date.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">
              10. Contact Us
            </h2>

            <p>
              If you have questions regarding this Privacy Policy, please
              contact Gradlink through our Contact page.
            </p>
          </section>
        </motion.div>
      </div>
    </div>
  );
};

export default Privacy;
