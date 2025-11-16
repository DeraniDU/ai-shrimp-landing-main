'use client';

import { useEffect, useState } from 'react';
import { FaFacebookF, FaTwitter, FaLinkedinIn, FaInstagram } from 'react-icons/fa';
import Link from 'next/link';

export default function Footer() {
  const [year, setYear] = useState<number | null>(null);

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  return (
    <footer className="bg-gray-900 text-gray-300 pt-12 pb-6">
      <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-20">
        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* About Column */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">AquaNext</h3>
                <p className="text-xs text-gray-400">Smart Aquaculture</p>
              </div>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              Revolutionizing shrimp farming in Sri Lanka through AI-powered monitoring, 
              automated feeding systems, and intelligent disease detection for sustainable aquaculture.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <FooterLink href="/">Home</FooterLink>
              <FooterLink href="/about">About Us</FooterLink>
              <FooterLink href="/feeding">Feeding System</FooterLink>
              <FooterLink href="/contact">Contact</FooterLink>
            </ul>
          </div>

          {/* Features */}
          <div>
            <h4 className="text-white font-semibold mb-4">Features</h4>
            <ul className="space-y-2">
              <FooterLink href="/feeding">Automated Feeding</FooterLink>
              <FooterLink href="/water-quality">Water Quality</FooterLink>
              <FooterLink href="/disease">Disease Detection</FooterLink>
              <FooterLink href="/ai-assistant">AI Assistant</FooterLink>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-800 my-8"></div>

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-400 text-sm">
            © {year ?? '2025'} AquaNext Project. All rights reserved.
          </p>

          {/* Social Icons */}
          <div className="flex gap-4">
            <SocialLink href="https://facebook.com" label="Facebook" icon={<FaFacebookF />} />
            <SocialLink href="https://twitter.com" label="Twitter" icon={<FaTwitter />} />
            <SocialLink href="https://linkedin.com" label="LinkedIn" icon={<FaLinkedinIn />} />
          </div>

          {/* Additional Links */}
          <div className="flex gap-4 text-sm">
            <a href="/privacy" className="text-gray-400 hover:text-cyan-400 transition-colors">
              Privacy Policy
            </a>
            <a href="/terms" className="text-gray-400 hover:text-cyan-400 transition-colors">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <li>
      <Link
        href={href}
        className="text-sm text-gray-400 hover:text-cyan-400 transition-colors flex items-center gap-2 group"
      >
        <span className="w-0 h-0.5 bg-cyan-400 group-hover:w-3 transition-all"></span>
        {children}
      </Link>
    </li>
  );
}

function SocialLink({
  href,
  label,
  icon,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
}) {
  return (
    <a
      href={href}
      aria-label={label}
      target="_blank"
      rel="noopener noreferrer"
      className="w-10 h-10 bg-gray-800 hover:bg-gradient-to-br hover:from-cyan-500 hover:to-blue-600 text-gray-400 hover:text-white rounded-lg flex items-center justify-center transition-all transform hover:scale-110"
    >
      {icon}
    </a>
  );
}