
import React from 'react';
import { Github, Twitter, Linkedin, Mail } from 'lucide-react';
import { useScrollReveal } from '@/utils/animations';

const Footer: React.FC = () => {
  const { ref, isIntersecting } = useScrollReveal();

  return (
    <footer
      ref={ref}
      className={`border-t border-border py-16 transition-opacity duration-1000 ${isIntersecting ? 'opacity-100' : 'opacity-0'
        }`}
    >
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="space-y-4">
            <div className="flex items-center">
              <img
                src="/assets/logo.jpg"
                alt="MOMENTO Logo"
                className="h-10 w-10 rounded-lg object-cover mr-2"
              />
              <span className="text-xl font-display font-semibold text-white">MOMENTO</span>
            </div>
            <p className="text-white">
              The ultimate AI-powered coding platform, designed to help you write, debug, and execute code efficiently.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-100 hover:text-white transition-colors">
                <Github className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-100 hover:text-white transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-100 hover:text-white transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-100 hover:text-white transition-colors">
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-display font-medium text-lg mb-4 text-white">Platform</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-100 hover:text-white transition-colors">Features</a></li>
              <li><a href="#" className="text-gray-100 hover:text-white transition-colors">Editor</a></li>
              <li><a href="#" className="text-gray-100 hover:text-white transition-colors">AI Capabilities</a></li>
              <li><a href="#" className="text-gray-100 hover:text-white transition-colors">API Documentation</a></li>
              <li><a href="#" className="text-gray-100 hover:text-white transition-colors">Integrations</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-display font-medium text-lg mb-4 text-white">Company</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-100 hover:text-white transition-colors">About Us</a></li>
              <li><a href="#" className="text-gray-100 hover:text-white transition-colors">Careers</a></li>
              <li><a href="#" className="text-gray-100 hover:text-white transition-colors">Blog</a></li>
              <li><a href="#" className="text-gray-100 hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-gray-100 hover:text-white transition-colors">Terms of Service</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-display font-medium text-lg mb-4 text-white">Support</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-100 hover:text-white transition-colors">Help Center</a></li>
              <li><a href="#" className="text-gray-100 hover:text-white transition-colors">Contact Us</a></li>
              <li><a href="#" className="text-gray-100 hover:text-white transition-colors">Community</a></li>
              <li><a href="#" className="text-gray-100 hover:text-white transition-colors">Status</a></li>
              <li><a href="#" className="text-gray-100 hover:text-white transition-colors">Feedback</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-white/20 text-center">
          <p className="text-gray-100 text-sm">
            © {new Date().getFullYear()} MOMENTO. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
