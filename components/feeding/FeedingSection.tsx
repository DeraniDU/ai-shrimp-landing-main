'use client';

import Image from 'next/image';

export default function FeedingSection() {
  return (
    <section className="bg-white py-20 px-6 sm:px-10 lg:px-24">
      <div className="max-w-6xl mx-auto text-gray-800">
        <h2 className="text-4xl font-extrabold text-blue-800 mb-6">
          Automated Feed Management System
        </h2>

        <p className="text-lg mb-10 leading-relaxed">
          Our intelligent feed management system revolutionizes shrimp aquaculture by using AI and IoT technologies to automatically deliver the optimal amount of feed. This ensures healthy shrimp growth, reduces costs, and minimizes waste—bringing high efficiency and sustainability to shrimp farms.
        </p>

        {/* Overview Banner */}
        <div className="relative w-full h-64 md:h-[450px] mb-12">
          <Image
            src="/feeding-banner.png"
            alt="Automated Feeding System Overview"
            layout="fill"
            objectFit="cover"
            className="rounded-xl shadow-md"
          />
        </div>

        {/* Core Features */}
        <h3 className="text-2xl font-bold text-blue-700 mb-8">📦 Core Functional Modules</h3>
        <div className="space-y-10">
          <Feature
            title="🔍 Intelligent Data Collection & Preprocessing"
            points={[
              'Captures real-time data: shrimp age, biomass, water temperature, pH, dissolved oxygen (DO)',
              'Analyzes past feeding patterns for context-aware prediction',
              'Cleans and structures all input data to maintain accuracy'
            ]}
          />
          <Feature
            title="🧠 AI-Powered Feed Prediction"
            points={[
              'Uses regression and time-series models to estimate daily feed quantity',
              'Considers shrimp growth stage and real-time environmental factors',
              'Continuously validated using RMSE, MAE for optimal performance'
            ]}
          />
          <Feature
            title="🤖 Automated IoT Feeder Integration"
            points={[
              'Connects to hardware (Arduino or Raspberry Pi)',
              'Delivers feed only under optimal pond conditions',
              'Prevents overfeeding, improves feed efficiency'
            ]}
          />
          <Feature
            title="🚤 Floating Distribution Mechanism"
            points={[
              'Autonomous boat-like system with sensor-guided navigation',
              'Evenly distributes feed across pond surface',
              'Includes container, motor control, and GPS coordination'
            ]}
          />
          <Feature
            title="📈 Real-Time Adaptive Response"
            points={[
              'Monitors environmental shifts continuously',
              'Reduces or halts feeding if conditions (e.g. oxygen, temp) become unsafe',
              'Protects shrimp health while conserving feed'
            ]}
          />
          <Feature
            title="📊 Performance Dashboard & Analytics"
            points={[
              'Displays Feed Conversion Ratio (FCR), growth rate, and cost efficiency',
              'Tracks feeding performance and makes suggestions',
              'Offers alerts, trends, and data-driven insights to farmers'
            ]}
          />
          <Feature
            title="♻️ Continuous Feedback Learning"
            points={[
              'Learns from previous results to refine future predictions',
              'Improves feed planning and AI accuracy over time',
              'Creates a smart, evolving farm ecosystem'
            ]}
          />
        </div>

        {/* Benefits Section */}
        <h3 className="text-2xl font-bold text-blue-700 mt-16 mb-4">💡 System Benefits</h3>
        <ul className="list-disc list-inside ml-4 space-y-2 text-base">
          <li>Reduces feed costs and waste significantly</li>
          <li>Enhances shrimp health, growth rate, and survival</li>
          <li>Minimizes manual labor through automation</li>
          <li>Scalable for small to industrial shrimp farms</li>
          <li>Farmer-friendly UI and mobile compatibility</li>
        </ul>

        {/* Goals Section */}
        <h3 className="text-2xl font-bold text-blue-700 mt-16 mb-4">🎯 Strategic Goals</h3>
        <ul className="list-disc list-inside ml-4 space-y-2 text-base">
          <li>Transform feeding practices using intelligent automation</li>
          <li>Improve feed conversion ratio and profit margins</li>
          <li>Minimize environmental risks via real-time adaptation</li>
          <li>Enable sustainable, high-efficiency shrimp farming for Sri Lanka and beyond</li>
        </ul>
      </div>
    </section>
  );
}

function Feature({ title, points }: { title: string; points: string[] }) {
  return (
    <div>
      <h4 className="text-lg font-semibold mb-2">{title}</h4>
      <ul className="list-disc list-inside ml-4 space-y-1">
        {points.map((point, idx) => (
          <li key={idx}>{point}</li>
        ))}
      </ul>
    </div>
  );
}
