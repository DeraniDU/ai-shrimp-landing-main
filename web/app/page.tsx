'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { CldVideoPlayer } from 'next-cloudinary';
import 'next-cloudinary/dist/cld-video-player.css';

const stats = [
  { value: '30%', label: 'Yield Increase', icon: '📈' },
  { value: '50%', label: 'Feed Cost Reduction', icon: '💰' },
  { value: '24/7', label: 'Monitoring', icon: '🔍' },
  { value: '95%', label: 'Disease Prevention', icon: '🛡️' },
];

const benefits = [
  {
    title: 'Real-Time Monitoring',
    description: 'Get instant alerts on water quality parameters, ensuring optimal conditions 24/7.',
    icon: '📊'
  },
  {
    title: 'Cost Efficiency',
    description: 'Reduce feed waste and operational costs with AI-powered optimization.',
    icon: '💵'
  },
  {
    title: 'Disease Prevention',
    description: 'Early detection and prevention of diseases before they impact your harvest.',
    icon: '🔬'
  },
  {
    title: 'Sustainable Farming',
    description: 'Eco-friendly practices that reduce environmental impact while maximizing yield.',
    icon: '🌱'
  },
  {
    title: 'Data-Driven Insights',
    description: 'Comprehensive analytics and reports to make informed farming decisions.',
    icon: '📈'
  },
  {
    title: 'Expert Support',
    description: 'Access to aquaculture experts and continuous system improvements.',
    icon: '👥'
  }
];

const processSteps = [
  {
    step: '01',
    title: 'Installation',
    description: 'Quick setup of sensors and monitoring equipment at your farm',
    icon: '⚙️'
  },
  {
    step: '02',
    title: 'Data Collection',
    description: 'Continuous monitoring of water quality, feeding patterns, and shrimp health',
    icon: '📡'
  },
  {
    step: '03',
    title: 'AI Analysis',
    description: 'Advanced algorithms analyze data and provide actionable insights',
    icon: '🤖'
  },
  {
    step: '04',
    title: 'Optimization',
    description: 'Automated adjustments and recommendations for maximum efficiency',
    icon: '✨'
  }
];

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

            <h1 className="text-3xl sm:text-4xl md:text-6xl font-extrabold mb-4 md:mb-6 leading-tight drop-shadow-lg animate-fade-in">
              AI-powered Shrimp Farming in Sri Lanka
            </h1>

            <p className="text-base sm:text-lg md:text-2xl max-w-2xl mx-auto mb-6 md:mb-8 drop-shadow-md animate-fade-in-delay">
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

        {/* SCROLL INDICATOR */}
        <div className="absolute bottom-20 md:bottom-24 left-1/2 transform -translate-x-1/2 z-20 animate-bounce">
          <div className="flex flex-col items-center text-white/80">
            <span className="text-xs mb-2 font-medium">Scroll to explore</span>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
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
      <main className="max-w-6xl mx-auto px-5 sm:px-8 py-12 sm:py-16">
        <div className="text-center mb-10 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">
            Our Core Features
          </h2>
          <p className="text-gray-600 text-sm sm:text-lg max-w-2xl mx-auto">
            Comprehensive AI-powered solutions designed specifically for modern shrimp farming
          </p>
        </div>

        <div className="grid gap-6 sm:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              link: "/waterqualitymonitoring",
              color: "from-cyan-500 to-blue-600",
              title: "Water Quality Monitoring",
              desc: "Advanced sensors track pH, oxygen, ammonia, temperature, and more—24/7 real-time monitoring with instant alerts.",
              icon: (
                <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
              )
            },
            {
              link: "/feeding",
              color: "from-green-500 to-emerald-600",
              title: "Automated Feed System",
              desc: "AI-powered feeding reduces waste by up to 50% and optimizes feeding schedules for maximum growth efficiency.",
              icon: (
                <path d="M10 3.5a1.5 1.5 0 013 0V4a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-.5a1.5 1.5 0 000 3h.5a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-.5a1.5 1.5 0 00-3 0v.5a1 1 0 01-1 1H6a1 1 0 01-1-1v-3a1 1 0 00-1-1h-.5a1.5 1.5 0 010-3H4a1 1 0 001-1V6a1 1 0 011-1h3a1 1 0 001-1v-.5z" />
              )
            },
            {
              link: "/disease-detection",
              color: "from-red-500 to-pink-600",
              title: "Disease Identifier",
              desc: "Early AI detection of diseases and pathogens prevents outbreaks, protecting your entire harvest with 95% accuracy.",
              icon: (
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              )
            },
            {
              link: "/ai-assistant",
              color: "from-purple-500 to-indigo-600",
              title: "AI Agent",
              desc: "Your intelligent digital assistant provides insights, recommendations, and automates routine farm management tasks.",
              icon: (
                <>
                  <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                  <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
                </>
              )
            }
          ].map((f, i) => (
            <Link href={f.link} key={i} className="block group">
              <div className="bg-white rounded-xl border border-gray-200 shadow-lg p-6 sm:p-8 flex flex-col h-full hover:shadow-2xl transition-all transform hover:-translate-y-2 cursor-pointer relative overflow-hidden">
                {/* Gradient Background on Hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${f.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
                
                <div className={`w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br ${f.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all transform shadow-lg`}>
                  <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                    {f.icon}
                  </svg>
                </div>

                <h2 className="text-lg sm:text-xl font-bold mb-3 text-gray-900 group-hover:text-cyan-600 transition-colors">{f.title}</h2>
                <p className="text-gray-600 text-sm sm:text-base leading-relaxed flex-grow">{f.desc}</p>

                <div className="mt-4 flex items-center text-cyan-600 font-medium text-sm group-hover:gap-2 transition-all">
                  <span>Learn more</span>
                  <svg className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>

      {/* STATISTICS SECTION */}
      <section className="bg-gradient-to-br from-cyan-600 to-blue-600 py-12 sm:py-16 px-5 sm:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white mb-3">
              Proven Results
            </h2>
            <p className="text-cyan-50 text-sm sm:text-lg max-w-2xl mx-auto">
              See how AquaNext is transforming shrimp farming operations across Sri Lanka
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            {stats.map((stat, idx) => (
              <div
                key={idx}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center border border-white/20 hover:bg-white/20 transition-all transform hover:scale-105"
              >
                <div className="text-4xl mb-3">{stat.icon}</div>
                <div className="text-3xl sm:text-4xl font-extrabold text-white mb-2">{stat.value}</div>
                <div className="text-cyan-100 text-sm sm:text-base font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BENEFITS SECTION */}
      <section className="py-12 sm:py-16 px-5 sm:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">
              Why Choose AquaNext?
            </h2>
            <p className="text-gray-600 text-sm sm:text-lg max-w-2xl mx-auto">
              Comprehensive solutions designed to maximize your farm's potential
            </p>
          </div>
          <div className="grid gap-6 sm:gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {benefits.map((benefit, idx) => (
              <div
                key={idx}
                className="bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 p-6 sm:p-8 hover:shadow-xl transition-all transform hover:-translate-y-1"
              >
                <div className="text-5xl mb-4">{benefit.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{benefit.title}</h3>
                <p className="text-gray-600 text-sm sm:text-base leading-relaxed">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section className="py-12 sm:py-16 px-5 sm:px-8 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">
              How It Works
            </h2>
            <p className="text-gray-600 text-sm sm:text-lg max-w-2xl mx-auto">
              Simple, streamlined process to get your farm AI-powered in no time
            </p>
          </div>
          <div className="grid gap-8 sm:gap-10 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
            {processSteps.map((step, idx) => (
              <div
                key={idx}
                className="relative text-center"
              >
                <div className="bg-white rounded-xl border-2 border-cyan-200 p-6 sm:p-8 hover:border-cyan-400 hover:shadow-lg transition-all">
                  <div className="text-5xl mb-4">{step.icon}</div>
                  <div className="absolute top-4 right-4 text-cyan-600 font-extrabold text-2xl opacity-20">
                    {step.step}
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                  <p className="text-gray-600 text-sm sm:text-base">{step.description}</p>
                </div>
                {idx < processSteps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                    <svg className="w-8 h-8 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* RESEARCH SECTION */}
      <section className="bg-gray-50 py-12 sm:py-16 px-5 sm:px-8">
        <div className="max-w-4xl mx-auto text-center">

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold mb-3 text-gray-900">
            Shrimp Farming Research Insights
          </h2>

          <p className="text-gray-700 text-sm sm:text-lg mb-8 sm:mb-10 max-w-2xl mx-auto">
            Explore sustainable practices, innovations, and global trends shaping the future of shrimp farming.
          </p>

          <div className="grid gap-5 sm:gap-6 grid-cols-1 sm:grid-cols-2 mb-8">
            {[
              "Sustainable Practices",
              "AI in Aquaculture",
              "Global Market Trends",
              "Disease Management",
            ].map((title, idx) => (
              <article
                key={idx}
                className="bg-white rounded-xl border border-gray-200 shadow-md p-5 sm:p-6 hover:shadow-lg transition-all transform hover:-translate-y-1"
              >
                <h3 className="text-lg font-bold mb-2 text-gray-900">{title}</h3>
                <p className="text-gray-600 text-sm sm:text-base">
                  Learn how cutting-edge research is improving shrimp farming worldwide.
                </p>
              </article>
            ))}
          </div>

          <Link
            href="/insights"
            className="inline-block px-8 py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-lg shadow-lg transition-all transform hover:scale-105"
          >
            Explore All Research Articles →
          </Link>

        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-12 sm:py-16 px-5 sm:px-8 bg-gradient-to-br from-cyan-600 via-blue-600 to-cyan-700">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white mb-4">
            Ready to Transform Your Shrimp Farm?
          </h2>
          <p className="text-cyan-50 text-sm sm:text-lg mb-8 max-w-2xl mx-auto">
            Join leading shrimp farmers in Sri Lanka who are already benefiting from AI-powered aquaculture solutions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="px-8 py-3 bg-white hover:bg-gray-100 text-cyan-600 font-semibold rounded-lg shadow-lg transition-all transform hover:scale-105"
            >
              Get Started Today
            </Link>
            <Link
              href="/about"
              className="px-8 py-3 bg-transparent border-2 border-white text-white hover:bg-white/10 font-semibold rounded-lg transition-all transform hover:scale-105"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
