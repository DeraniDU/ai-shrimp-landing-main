'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-sm dark:bg-gray-900/90 border-b border-gray-200 dark:border-gray-700 shadow-sm">
      <nav className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-20 flex items-center justify-between h-16">
        <Link href="/" className="text-xl font-bold text-cyan-600 dark:text-cyan-400 hover:text-cyan-800 dark:hover:text-cyan-200">
          AI Shrimp Farming
        </Link>

        {/* Desktop navigation */}
        <ul className="hidden md:flex gap-10">
          <NavLink href="/">Home</NavLink>
          <NavLink href="/about">About Us</NavLink>
          <NavLink href="/contact">Contact Us</NavLink>
          <NavLink href="/features">Features</NavLink>
        </ul>

        {/* Mobile menu button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
          className="md:hidden inline-flex items-center justify-center rounded-md p-2 text-cyan-600 hover:text-cyan-800 dark:text-cyan-400 dark:hover:text-cyan-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            {menuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </nav>

      {/* Mobile nav menu */}
      {menuOpen && (
        <ul className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 px-6 py-4 flex flex-col gap-4 shadow-md">
          <MobileNavLink href="/" onClick={() => setMenuOpen(false)}>
            Home
          </MobileNavLink>
          <MobileNavLink href="/about" onClick={() => setMenuOpen(false)}>
            About Us
          </MobileNavLink>
          <MobileNavLink href="/contact" onClick={() => setMenuOpen(false)}>
            Contact Us
          </MobileNavLink>
          <MobileNavLink href="/features" onClick={() => setMenuOpen(false)}>
            Features
          </MobileNavLink>
        </ul>
      )}
    </header>
  );
}

function NavLink({
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
        className="relative text-gray-700 dark:text-gray-300 hover:text-cyan-600 dark:hover:text-cyan-400 font-medium transition-colors"
      >
        {children}
        <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-cyan-600 dark:bg-cyan-400 transition-all group-hover:w-full"></span>
      </Link>
    </li>
  );
}

function MobileNavLink({
  href,
  children,
  onClick,
}: {
  href: string;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <li>
      <Link
        href={href}
        onClick={onClick}
        className="block px-3 py-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-cyan-100 dark:hover:bg-cyan-900 hover:text-cyan-700 dark:hover:text-cyan-300 font-medium transition-colors"
      >
        {children}
      </Link>
    </li>
  );
}
