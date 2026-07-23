import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import clsx from 'clsx';
import logo from '../utils/logo.png';
import logoDark from '../utils/dark-logo.png';


const NAV_LINKS = [
  { name: 'Home', path: '/' },
  { name: 'About', path: '/about' },
  { name: 'Services', path: '/services' },
  { name: 'Destinations', path: '/destinations' },
  { name: 'Universities', path: '/universities' },
  { name: 'Team', path: '/team' },
];

const MORE_LINKS = [
  { name: 'Careers', path: '/careers' },
  { name: 'Gallery', path: '/gallery' },
  { name: 'FAQs', path: '/faqs' },
  { name: 'News', path: '/news' },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const moreRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
    setMoreOpen(false);
  }, [location]);

  // Close "More" dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (moreRef.current && !moreRef.current.contains(e.target)) {
        setMoreOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      {/* ─── Fixed Navbar Bar (NEVER changes height) ─── */}
      <nav
        className={clsx(
          'fixed top-0 w-full z-50 transition-all duration-300',
          scrolled ? 'glass py-3' : 'bg-transparent py-5'
        )}
      >
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 group">
              <img
                src={theme === 'dark' ? logoDark : logo}
                alt="Gradlink Logo"
                className="h-9 w-auto object-contain group-hover:scale-105 transition-transform duration-300"
              />
              <span className="text-xl font-extrabold tracking-tight text-gradient">Gradlink</span>
            </Link>

            {/* Desktop Nav — swaps content entirely when "More" is open.
                moreRef wraps whichever state is showing, so outside
                clicks correctly close the expanded state. Same gap/height
                classes in both states, so the navbar itself never resizes. */}
            <div className="hidden lg:flex items-center gap-6" ref={moreRef}>
              {!moreOpen ? (
                <>
                  {NAV_LINKS.map((link) => (
                    <Link
                      key={link.path}
                      to={link.path}
                      className={clsx(
                        'text-sm font-medium transition-all duration-200 relative after:absolute after:bottom-[-4px] after:left-0 after:h-[2px] after:rounded-full after:bg-primary after:transition-all after:duration-300',
                        location.pathname === link.path
                          ? 'text-primary after:w-full'
                          : 'text-foreground/75 hover:text-primary after:w-0 hover:after:w-full'
                      )}
                    >
                      {link.name}
                    </Link>
                  ))}

                  <button
                    onClick={() => setMoreOpen(true)}
                    className="text-sm font-medium transition-colors duration-200 flex items-center gap-1 text-foreground/75 hover:text-primary"
                  >
                    More
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>

                  <div className="flex items-center gap-3 ml-2 pl-4 border-l border-border">
                    <button
                      onClick={toggleTheme}
                      aria-label="Toggle theme"
                      className="w-9 h-9 rounded-full flex items-center justify-center text-base hover:bg-muted transition-colors"
                    >
                      {theme === 'dark' ? '☀️' : '🌙'}
                    </button>
                    <Link to="/contact" className="btn-primary">
                      Contact Us
                    </Link>
                    <Link to="/admin" className="btn-outline text-xs px-3 py-2">
                      Admin
                    </Link>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-between w-full animate-in fade-in slide-in-from-top-1 duration-150">
                  <div className="flex items-center gap-6">
                    {MORE_LINKS.map((link) => (
                      <Link
                        key={link.path}
                        to={link.path}
                        onClick={() => setMoreOpen(false)}
                        className={clsx(
                          'text-sm font-medium transition-colors duration-200',
                          location.pathname === link.path
                            ? 'text-primary'
                            : 'text-foreground/75 hover:text-primary'
                        )}
                      >
                        {link.name}
                      </Link>
                    ))}
                  </div>

                  <button
                    onClick={() => setMoreOpen(false)}
                    aria-label="Close menu"
                    className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-muted transition-colors text-foreground/75 hover:text-primary"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Toggle */}
            <div className="lg:hidden flex items-center gap-3">
              <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-muted transition-colors">
                {theme === 'dark' ? '☀️' : '🌙'}
              </button>
              <button
                className="p-2 rounded-lg text-foreground hover:bg-muted transition-colors"
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Toggle mobile menu"
              >
                {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* ─── Mobile Nav (full-width panel, BELOW the navbar) ─── */}
      {isOpen && (
        <div
          className="fixed z-40 lg:hidden w-full glass border-t border-border shadow-2xl"
          style={{ top: scrolled ? '56px' : '72px' }}
        >
          <div className="flex flex-col py-2">
            {[...NAV_LINKS, ...MORE_LINKS].map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={clsx(
                  'px-6 py-3 text-sm font-medium transition-colors',
                  location.pathname === link.path
                    ? 'text-primary bg-primary/5'
                    : 'text-foreground/80 hover:text-primary hover:bg-primary/5'
                )}
              >
                {link.name}
              </Link>
            ))}
            <div className="px-6 pt-4 pb-4 flex flex-col gap-3 border-t border-border mt-2">
              <Link to="/contact" className="btn-primary text-center">
                Contact Us
              </Link>
              <Link to="/admin" className="btn-outline text-center text-sm">
                Admin Portal
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;