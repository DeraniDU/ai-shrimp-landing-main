'use client';

import { useEffect, useState } from 'react';
import { FaFacebookF, FaTwitter, FaLinkedinIn } from 'react-icons/fa';

export default function Footer() {
  const [year, setYear] = useState<number | null>(null);

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  return (
    <footer className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 mt-20 py-10">
      <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-20 flex flex-col md:flex-row justify-between items-center gap-6">
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          © {year ?? '2025'} AI Shrimp Farming Project. All rights reserved.
        </p>

        <nav className="flex gap-6">
          <FooterLink href="/about">About Us</FooterLink>
          <FooterLink href="/contact">Contact Us</FooterLink>
          <FooterLink href="#features">Features</FooterLink>
        </nav>

        {/* Social icons */}
        <div className="flex gap-4 text-gray-600 dark:text-gray-400">
          <SocialLink href="https://facebook.com" label="Facebook" icon={<FaFacebookF />} />
          <SocialLink href="https://twitter.com" label="Twitter" icon={<FaTwitter />} />
          <SocialLink href="https://linkedin.com" label="LinkedIn" icon={<FaLinkedinIn />} />
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
    <a
      href={href}
      className="text-sm hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
    >
      {children}
    </a>
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
      className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors text-lg"
    >
      {icon}
    </a>
  );
}
