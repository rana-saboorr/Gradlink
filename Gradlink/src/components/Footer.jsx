import { Link } from "react-router-dom";
import { Mail, Phone, MapPin } from "lucide-react";
import logo from "../utils/logo.png";

// Inline SVGs for social icons
const Facebook = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
  </svg>
);
const Twitter = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
  </svg>
);
const Instagram = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);
const Linkedin = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
    <rect x="2" y="9" width="4" height="12"></rect>
    <circle cx="4" cy="4" r="2"></circle>
  </svg>
);

const Footer = () => {
  return (
    <footer className="bg-muted border-t border-border pt-10 pb-5">
      <div className="container mx-auto px-4 md:px-6">

        {/* Main grid — 2 cols on mobile, 4 on large screens */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 mb-8">

          {/* Brand column — full width on mobile */}
          <div className="col-span-2 lg:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-3 group w-fit">
              <img
                src={logo}
                alt="Gradlink Logo"
                className="h-7 w-auto object-contain group-hover:scale-105 transition-transform duration-300"
              />
              <span className="text-lg font-extrabold tracking-tight text-gradient">Gradlink</span>
            </Link>
            <p className="text-sm text-muted-foreground mb-4 max-w-xs">
              Empowering students to achieve their global education dreams with expert guidance and unwavering support.
            </p>
            <div className="flex gap-3">
              <a href="https://www.facebook.com/p/Gradlink-61575052282041/" aria-label="Facebook" className="text-muted-foreground hover:text-primary transition-colors">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" aria-label="Twitter" className="text-muted-foreground hover:text-primary transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="https://www.instagram.com/gradlink.pk" aria-label="Instagram" className="text-muted-foreground hover:text-primary transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="https://www.linkedin.com/company/gradlink-consultants" aria-label="LinkedIn" className="text-muted-foreground hover:text-primary transition-colors">
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider mb-3 text-foreground">Quick Links</h4>
            <ul className="space-y-2">
              {[
                { label: 'About Us',      path: '/about' },
                { label: 'Our Services',  path: '/services' },
                { label: 'Destinations',  path: '/destinations' },
                { label: 'Universities',  path: '/universities' },
                { label: 'Our Team',      path: '/team' },
              ].map(({ label, path }) => (
                <li key={path}>
                  <Link to={path} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider mb-3 text-foreground">Resources</h4>
            <ul className="space-y-2">
              {[
                { label: 'News & Blogs', path: '/news' },
                { label: 'Gallery',      path: '/gallery' },
                { label: 'Careers',      path: '/careers' },
                { label: 'FAQs',         path: '/faqs' },
              ].map(({ label, path }) => (
                <li key={path}>
                  <Link to={path} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider mb-3 text-foreground">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4 shrink-0 text-primary mt-0.5" />
                <span>Plaza No. 88, Block G1 Phase 1, Johar Town, Lahore, Pakistan</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="w-4 h-4 shrink-0 text-primary" />
                <span>+92 326 6662001</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="w-4 h-4 shrink-0 text-primary" />
                <span>hello@gradlink.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-5 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Gradlink Consultants. All rights reserved.</p>
          <div className="flex gap-4">
            <Link to="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
            <Link to="/terms"   className="hover:text-foreground transition-colors">Terms of Service</Link>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
