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

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex flex-col font-sans bg-white text-gray-900">

      {/* HERO SECTION */}
      <section className="relative h-[350px] sm:h-[450px] md:h-[600px] w-full overflow-hidden">

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
            <div className="absolute inset-0 bg-black/40" />
          </div>
        ))}

        {/* HERO CONTENT */}
        <div className="relative z-10 h-full flex items-center justify-center px-4">
          <div className="max-w-3xl text-center text-white">

            <h1 className="text-3xl sm:text-4xl md:text-6xl font-extrabold mb-4 md:mb-6 leading-tight drop-shadow-lg">
              AI-powered Shrimp Farming in Sri Lanka
            </h1>

            <p className="text-base sm:text-lg md:text-2xl max-w-2xl mx-auto mb-6 md:mb-8 drop-shadow-md">
              Revolutionizing Sri Lankan shrimp farms with real-time water quality monitoring, smart AI feeding, disease detection, and an intelligent assistant.
            </p>

            <div className="flex gap-3 md:gap-4 justify-center flex-wrap">
              <Link
                href="/about"
                className="px-6 py-2 sm:px-8 sm:py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-lg shadow-lg transition-all transform hover:scale-105 text-sm sm:text-base"
              >
                Learn More
              </Link>
              <Link
                href="/contact"
                className="px-6 py-2 sm:px-8 sm:py-3 bg-white hover:bg-gray-100 text-cyan-600 font-semibold rounded-lg shadow-lg transition-all transform hover:scale-105 text-sm sm:text-base"
              >
                Contact Us
              </Link>
            </div>

          </div>
        </div>

        {/* SLIDE INDICATORS */}
        <div className="absolute bottom-6 md:bottom-8 left-1/2 transform -translate-x-1/2 flex gap-2 z-20">
          {heroImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all ${
                index === currentSlide
                  ? 'bg-white w-6 sm:w-8'
                  : 'bg-white/50 hover:bg-white/75'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </section>

      {/* INTRO VIDEO */}
      <section className="py-12 sm:py-16 px-5 sm:px-8 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8 sm:mb-10">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold mb-3 text-gray-900">
              Watch Our Introduction
            </h2>
            <p className="text-sm sm:text-lg text-gray-600 max-w-2xl mx-auto">
              Discover how AquaNext is revolutionizing shrimp farming with cutting-edge AI technology.
            </p>
          </div>

          <div className="rounded-xl sm:rounded-2xl overflow-hidden shadow-xl sm:shadow-2xl">
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

      {/* FEATURE CARDS */}
      <main className="max-w-5xl mx-auto grid gap-6 sm:gap-10 grid-cols-1 sm:grid-cols-2 px-5 sm:px-8 py-12 sm:py-16">

        {/* Feature Card */}
        {[
          {
            link: "/waterqualitymonitoring",
            color: "bg-cyan-100 text-cyan-600",
            title: "Water Quality Monitoring",
            desc: "Advanced sensors track pH, oxygen, ammonia and more—24/7.",
            icon: (
              <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
            )
          },
          {
            link: "/feeding",
            color: "bg-green-100 text-green-600",
            title: "Automated Feed System",
            desc: "AI feeding reduces waste and boosts growth efficiency.",
            icon: (
              <path d="M10 3.5a1.5 1.5 0 013 0V4a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-.5a1.5 1.5 0 000 3h.5a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-.5a1.5 1.5 0 00-3 0v.5a1 1 0 01-1 1H6a1 1 0 01-1-1v-3a1 1 0 00-1-1h-.5a1.5 1.5 0 010-3H4a1 1 0 001-1V6a1 1 0 011-1h3a1 1 0 001-1v-.5z" />
            )
          },
          {
            link: "/disease-detection",
            color: "bg-red-100 text-red-600",
            title: "Disease Identifier",
            desc: "AI spots early signs of disease to prevent outbreaks.",
            icon: (
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            )
          },
          {
            link: "/ai-assistant",
            color: "bg-purple-100 text-purple-600",
            title: "AI Agent",
            desc: "Your smart digital assistant for insights & automation.",
            icon: (
              <>
                <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
              </>
            )
          }
        ].map((f, i) => (
          <Link href={f.link} key={i} className="block group">
            <div className="bg-white rounded-xl border border-gray-200 shadow-lg p-5 sm:p-8 flex flex-col items-center text-center hover:shadow-xl transition-all transform hover:-translate-y-1 cursor-pointer h-full">

              <div className={`w-12 h-12 sm:w-16 sm:h-16 ${f.color} rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <svg className="w-8 h-8 sm:w-10 sm:h-10" fill="currentColor" viewBox="0 0 20 20">
                  {f.icon}
                </svg>
              </div>

              <h2 className="text-lg sm:text-xl font-bold mb-2">{f.title}</h2>
              <p className="text-gray-600 text-sm sm:text-base">{f.desc}</p>

            </div>
          </Link>
        ))}

      </main>

      {/* RESEARCH SECTION */}
      <section className="bg-gray-50 py-12 sm:py-16 px-5 sm:px-8">
        <div className="max-w-4xl mx-auto text-center">

          <h2 className="text-2xl sm:text-3xl font-bold mb-4">Shrimp Farming Research Insights</h2>

          <p className="text-gray-700 text-sm sm:text-base mb-8 sm:mb-10">
            Explore sustainable practices, innovations, and global trends shaping the future of shrimp farming.
          </p>

          <div className="grid gap-5 sm:gap-6 grid-cols-1 sm:grid-cols-2">
            {[
              "Sustainable Practices",
              "AI in Aquaculture",
              "Global Market Trends",
              "Disease Management",
            ].map((title, idx) => (
              <article
                key={idx}
                className="bg-white rounded-xl border border-gray-200 shadow-md p-5 sm:p-6 hover:shadow-lg transition-shadow"
              >
                <h3 className="text-lg font-bold mb-2">{title}</h3>
                <p className="text-gray-600 text-sm sm:text-base">
                  Learn how cutting-edge research is improving shrimp farming worldwide.
                </p>
              </article>
            ))}
          </div>

        </div>
      </section>

    </div>
  );
}
