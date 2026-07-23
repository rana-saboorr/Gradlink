import { motion } from 'framer-motion';

const Terms = () => {
  return (
    <div className="pt-10 pb-20">
      <div className="container mx-auto px-4 md:px-6 max-w-4xl">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4"
        >
          Terms of Service
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
              1. Acceptance of Terms
            </h2>

            <p>
              By accessing our website or using Gradlink's educational
              consultancy services, you agree to comply with these Terms of
              Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">
              2. Our Services
            </h2>

            <p>Our services include:</p>

            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li>Educational counselling</li>
              <li>University selection</li>
              <li>Application assistance</li>
              <li>Visa guidance</li>
              <li>Scholarship guidance</li>
              <li>Career counselling</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">
              3. Student Responsibilities
            </h2>

            <ul className="list-disc pl-6 space-y-2">
              <li>Provide accurate information.</li>
              <li>Submit genuine documents.</li>
              <li>Meet university deadlines.</li>
              <li>Respond promptly to communication.</li>
              <li>Pay applicable fees on time.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">
              4. No Guarantee
            </h2>

            <p>
              Admission decisions are made solely by universities. Visa
              approvals are decided by the relevant immigration authorities.
              Gradlink cannot guarantee admission, scholarships, or visa
              approval.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">
              5. Fees
            </h2>

            <p>
              Any consultancy or service fees will be clearly communicated
              before services are provided. University application fees and visa
              fees are separate unless stated otherwise.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">
              6. Intellectual Property
            </h2>

            <p>
              All website content, branding, graphics, and materials remain the
              property of Gradlink unless otherwise stated.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">
              7. Limitation of Liability
            </h2>

            <p>
              Gradlink shall not be liable for losses resulting from university
              admission decisions, visa refusals, scholarship decisions,
              inaccurate information supplied by applicants, or delays caused by
              third parties.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">
              8. Termination
            </h2>

            <p>
              We reserve the right to discontinue services if false information,
              fraudulent documents, or misuse of our services is identified.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">
              9. Changes to Terms
            </h2>

            <p>
              These Terms of Service may be updated periodically. Continued use
              of our services constitutes acceptance of the revised terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">
              10. Contact
            </h2>

            <p>
              For any questions regarding these Terms of Service, please contact
              Gradlink through our Contact page.
            </p>
          </section>
        </motion.div>
      </div>
    </div>
  );
};

export default Terms;
