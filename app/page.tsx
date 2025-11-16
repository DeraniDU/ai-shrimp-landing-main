'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { CldVideoPlayer } from 'next-cloudinary';
import 'next-cloudinary/dist/cld-video-player.css';

const heroImages = [
  '/hero/view-fish-farms-scotland-united-kingdom.jpg',
  '/hero/2.jpg',
  '/hero/3.jpg',
];

export default function EnhancedHome() {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-slide effect - changes every 2.5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex flex-col font-sans bg-white text-gray-900">
      {/* Hero Section with Image Carousel */}
      <section className="relative h-[600px] w-full overflow-hidden">
        {/* Image Slides */}
        {heroImages.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <Image
              src={image}
              alt={`Shrimp farming ${index + 1}`}
              fill
              className="object-cover"
              priority={index === 0}
            />
            {/* Overlay for better text readability */}
            <div className="absolute inset-0 bg-black/40" />
          </div>
        ))}

        {/* Hero Content */}
        <div className="relative z-10 h-full flex items-center justify-center px-4">
          <div className="max-w-4xl text-center text-white">
            <h1 className="text-5xl sm:text-6xl font-extrabold mb-6 leading-tight drop-shadow-lg">
              AI-powered Shrimp Farming in Sri Lanka
            </h1>
            <p className="text-xl sm:text-2xl max-w-3xl mx-auto mb-8 drop-shadow-md">
              Revolutionizing Sri Lankan shrimp farms with real-time water quality monitoring, 
              smart AI feeding, disease detection, and an intelligent assistant for maximum yield 
              and sustainability.
            </p>
            
            {/* Call to Action Buttons */}
            <div className="flex gap-4 justify-center flex-wrap">
              <Link
                href="/about"
                className="px-8 py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-lg shadow-lg transition-all transform hover:scale-105"
              >
                Learn More
              </Link>
              <Link
                href="/contact"
                className="px-8 py-3 bg-white hover:bg-gray-100 text-cyan-600 font-semibold rounded-lg shadow-lg transition-all transform hover:scale-105"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>

        {/* Slide Indicators */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-2 z-20">
          {heroImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentSlide
                  ? 'bg-white w-8'
                  : 'bg-white/50 hover:bg-white/75'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </section>

      {/* Introduction Video Section */}
      <section className="py-16 px-8 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-extrabold mb-4 text-gray-900">
              Watch Our Introduction
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover how AquaNext is revolutionizing shrimp farming in Sri Lanka with cutting-edge AI technology
            </p>
          </div>
          
          <div className="rounded-2xl overflow-hidden shadow-2xl">
            <CldVideoPlayer
              width="1920"
              height="1080"
              src="AQUANEXT_1_spcg1e"
              
              colors={{
                accent: '#0891b2',
                base: '#000000',
                text: '#ffffff'
              }}
              logo={false}
              fontFace="Arial"
            />
          </div>
        </div>
      </section>

      {/* Feature Boxes Section - ALL BALANCED */}
      <main className="max-w-5xl mx-auto grid gap-10 grid-cols-1 md:grid-cols-2 px-8 py-16">
        {/* Feature 1: Water Quality Monitoring */}
        <Link href="/waterqualitymonitoring" className="block group">
          <div className="bg-white rounded-xl border border-gray-200 shadow-lg p-8 flex flex-col items-center text-center hover:shadow-xl transition-all transform hover:-translate-y-1 cursor-pointer h-full">
            <div className="w-16 h-16 bg-cyan-100 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <svg className="w-10 h-10 text-cyan-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold mb-2">Water Quality Monitoring</h2>
            <p className="text-gray-600">
              Advanced sensors track critical parameters (pH, oxygen, ammonia) to keep your shrimp healthy and thriving, 24/7.
            </p>
          </div>
        </Link>

        {/* Feature 2: Automated Feed System */}
        <Link href="/feeding" className="block group">
          <div className="bg-white rounded-xl border border-gray-200 shadow-lg p-8 flex flex-col items-center text-center hover:shadow-xl transition-all transform hover:-translate-y-1 cursor-pointer h-full">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <svg className="w-10 h-10 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 3.5a1.5 1.5 0 013 0V4a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-.5a1.5 1.5 0 000 3h.5a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-.5a1.5 1.5 0 00-3 0v.5a1 1 0 01-1 1H6a1 1 0 01-1-1v-3a1 1 0 00-1-1h-.5a1.5 1.5 0 010-3H4a1 1 0 001-1V6a1 1 0 011-1h3a1 1 0 001-1v-.5z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold mb-2">Automated Feed System</h2>
            <p className="text-gray-600">
              AI-driven feeding schedules precisely deliver nutrition, reduce waste, and improve growth for higher efficiency.
            </p>
          </div>
        </Link>

        {/* Feature 3: Disease Identifier */}
        <Link href="/disease-detection" className="block group">
          <div className="bg-white rounded-xl border border-gray-200 shadow-lg p-8 flex flex-col items-center text-center hover:shadow-xl transition-all transform hover:-translate-y-1 cursor-pointer h-full">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <svg className="w-10 h-10 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <h2 className="text-xl font-bold mb-2">Disease Identifier</h2>
            <p className="text-gray-600">
              Early AI diagnosis spots health issues before outbreaks, protecting your harvest and reducing losses.
            </p>
          </div>
        </Link>

        {/* Feature 4: AI Agent */}
        <Link href="/ai-assistant" className="block group">
          <div className="bg-white rounded-xl border border-gray-200 shadow-lg p-8 flex flex-col items-center text-center hover:shadow-xl transition-all transform hover:-translate-y-1 cursor-pointer h-full">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <svg className="w-10 h-10 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold mb-2">AI Agent</h2>
            <p className="text-gray-600">
              Your digital assistant provides insights, advice, and smart analytics—right at your fingertips.
            </p>
          </div>
        </Link>
      </main>

      {/* Shrimp Research Section */}
      <section className="bg-gray-50 py-16 px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Shrimp Farming Research Insights</h2>
          <p className="text-gray-700 mb-10">
            Explore the latest research and advancements in shrimp farming, including sustainable practices, innovative technologies, and global trends.
          </p>
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2">
            <article className="bg-white rounded-xl border border-gray-200 shadow-md p-6 hover:shadow-lg transition-shadow">
              <h3 className="text-lg font-bold mb-2">Sustainable Practices</h3>
              <p className="text-gray-600">
                Learn how eco-friendly methods are reshaping shrimp farming for a greener future.
              </p>
            </article>
            <article className="bg-white rounded-xl border border-gray-200 shadow-md p-6 hover:shadow-lg transition-shadow">
              <h3 className="text-lg font-bold mb-2">AI in Aquaculture</h3>
              <p className="text-gray-600">
                Discover how artificial intelligence is driving efficiency and innovation in aquaculture.
              </p>
            </article>
            <article className="bg-white rounded-xl border border-gray-200 shadow-md p-6 hover:shadow-lg transition-shadow">
              <h3 className="text-lg font-bold mb-2">Global Market Trends</h3>
              <p className="text-gray-600">
                Stay updated on the latest market trends and demands in the shrimp farming industry.
              </p>
            </article>
            <article className="bg-white rounded-xl border border-gray-200 shadow-md p-6 hover:shadow-lg transition-shadow">
              <h3 className="text-lg font-bold mb-2">Disease Management</h3>
              <p className="text-gray-600">
                Explore cutting-edge research on preventing and managing diseases in shrimp farms.
              </p>
            </article>
          </div>
        </div>
      </section>
    </div>
  );
}