'use client';

import Image from 'next/image';

export default function WaterQualityManagement() {
  return (
    <section className="bg-white py-20 px-6 sm:px-10 lg:px-24">
      <div className="max-w-6xl mx-auto text-gray-800">
        <h2 className="text-4xl font-extrabold text-cyan-800 mb-6">
          Water Quality Monitoring System
        </h2>

        <p className="text-lg mb-10 leading-relaxed">
          Our advanced water quality monitoring system leverages cutting-edge sensors and AI analytics to continuously track critical water parameters in shrimp ponds. This real-time monitoring ensures optimal aquatic conditions, early detection of potential issues, and data-driven decisions for maximum shrimp health and productivity.
        </p>

        {/* Overview Banner */}
        <div className="relative w-full h-64 md:h-[450px] mb-12">
          <Image
            src="/water-quality-banner.png"
            alt="Water Quality Monitoring System Overview"
            layout="fill"
            objectFit="cover"
            className="rounded-xl shadow-md"
          />
        </div>

        {/* Core Features */}
        <h3 className="text-2xl font-bold text-cyan-700 mb-8">💧 Core Monitoring Parameters</h3>
        <div className="space-y-10">
          <Feature
            title="🌡️ Temperature Monitoring"
            points={[
              'Continuous tracking of water temperature with ±0.1°C accuracy',
              'Optimal range: 28-32°C for Pacific white shrimp',
              'Alerts when temperature deviates from ideal conditions',
              'Historical temperature trends and pattern analysis'
            ]}
          />
          <Feature
            title="⚗️ pH Level Detection"
            points={[
              'Real-time pH monitoring with automated calibration',
              'Maintains optimal pH range of 7.5-8.5 for shrimp health',
              'Early warning system for acidification or alkalinity issues',
              'Integration with water treatment recommendations'
            ]}
          />
          <Feature
            title="💨 Dissolved Oxygen (DO) Tracking"
            points={[
              'Critical DO level monitoring (minimum 5 mg/L required)',
              'Prevents hypoxia and mass mortality events',
              'Automatic aerator control based on oxygen levels',
              'Night-time monitoring for oxygen depletion risks'
            ]}
          />
          <Feature
            title="🧪 Ammonia & Nitrite Detection"
            points={[
              'Monitors toxic ammonia (NH3) and nitrite (NO2-) levels',
              'Alerts when levels exceed safe thresholds (NH3 < 0.1 mg/L)',
              'Tracks nitrogen cycle efficiency in pond ecosystem',
              'Recommends water exchange or biofilter adjustments'
            ]}
          />
          <Feature
            title="🌊 Salinity Measurement"
            points={[
              'Precise salinity tracking for brackish water management',
              'Optimal range: 15-25 ppt for most shrimp species',
              'Compensates for evaporation and rainfall effects',
              'Seasonal salinity trend analysis'
            ]}
          />
          <Feature
            title="🔬 Turbidity & Water Clarity"
            points={[
              'Measures suspended particles and water transparency',
              'Detects algae blooms and excessive phytoplankton',
              'Monitors Secchi disk depth for optimal light penetration',
              'Correlates turbidity with shrimp feeding behavior'
            ]}
          />
          <Feature
            title="📡 IoT Sensor Network"
            points={[
              'Wireless multi-parameter sensors deployed across ponds',
              'Real-time data transmission every 15 minutes',
              'Solar-powered sensors with battery backup',
              'Cloud-based data storage and remote access'
            ]}
          />
        </div>

        {/* Advanced Features */}
        <h3 className="text-2xl font-bold text-cyan-700 mt-16 mb-8">🚀 Advanced AI Analytics</h3>
        <div className="space-y-10">
          <Feature
            title="🧠 Predictive Water Quality Modeling"
            points={[
              'Machine learning predicts parameter changes 24-48 hours ahead',
              'Identifies patterns leading to water quality deterioration',
              'Proactive alerts before critical thresholds are reached',
              'Seasonal and weather-based prediction models'
            ]}
          />
          <Feature
            title="📊 Real-Time Dashboard & Alerts"
            points={[
              'Live visualization of all water parameters',
              'Mobile app notifications for critical alerts',
              'Customizable warning thresholds per pond',
              'Historical data comparison and trend analysis'
            ]}
          />
          <Feature
            title="🔄 Automated Response System"
            points={[
              'Auto-activation of aerators when DO drops below threshold',
              'Smart water exchange scheduling based on parameter readings',
              'Integration with feeding system to pause during poor conditions',
              'Emergency protocols for rapid intervention'
            ]}
          />
        </div>

        {/* Benefits Section */}
        <h3 className="text-2xl font-bold text-cyan-700 mt-16 mb-4">💡 System Benefits</h3>
        <ul className="list-disc list-inside ml-4 space-y-2 text-base">
          <li>Prevents disease outbreaks through optimal water conditions</li>
          <li>Reduces shrimp mortality by up to 40% with early intervention</li>
          <li>Minimizes manual water testing labor and costs</li>
          <li>Improves feed conversion ratio through better water quality</li>
          <li>24/7 monitoring with instant mobile alerts</li>
          <li>Data-driven decisions for water treatment and pond management</li>
          <li>Regulatory compliance with environmental standards</li>
          <li>Historical data for insurance claims and productivity analysis</li>
        </ul>

        {/* Technical Specifications */}
        <h3 className="text-2xl font-bold text-cyan-700 mt-16 mb-4">⚙️ Technical Specifications</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SpecCard
            title="Sensor Accuracy"
            specs={[
              'Temperature: ±0.1°C',
              'pH: ±0.05',
              'Dissolved Oxygen: ±0.2 mg/L',
              'Salinity: ±0.5 ppt',
              'Ammonia: ±0.01 mg/L'
            ]}
          />
          <SpecCard
            title="System Features"
            specs={[
              'Measurement Frequency: Every 15 min',
              'Data Storage: Cloud-based',
              'Battery Life: 6 months (solar)',
              'Wireless Range: Up to 500m',
              'Weather Resistant: IP68 rated'
            ]}
          />
        </div>

        {/* Goals Section */}
        <h3 className="text-2xl font-bold text-cyan-700 mt-16 mb-4">🎯 Strategic Goals</h3>
        <ul className="list-disc list-inside ml-4 space-y-2 text-base">
          <li>Establish real-time water quality standards for Sri Lankan shrimp farms</li>
          <li>Reduce environmental impact through precise resource management</li>
          <li>Enable predictive aquaculture with AI-driven insights</li>
          <li>Create a scalable monitoring platform for farms of all sizes</li>
          <li>Support sustainable and profitable shrimp farming practices</li>
        </ul>

        {/* Call to Action */}
        <div className="mt-16 p-8 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl border border-cyan-200">
          <h3 className="text-2xl font-bold text-cyan-800 mb-4">Ready to Optimize Your Water Quality?</h3>
          <p className="text-gray-700 mb-6">
            Join leading shrimp farmers who have transformed their operations with our intelligent water quality monitoring system.
          </p>
          <div className="flex gap-4 flex-wrap">
            <a
              href="/contact"
              className="px-6 py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-lg shadow-md transition-all"
            >
              Request Demo
            </a>
            <a
              href="/about"
              className="px-6 py-3 bg-white hover:bg-gray-50 text-cyan-600 border-2 border-cyan-600 font-semibold rounded-lg shadow-md transition-all"
            >
              Learn More
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function Feature({ title, points }: { title: string; points: string[] }) {
  return (
    <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 hover:shadow-md transition-shadow">
      <h4 className="text-lg font-semibold mb-3 text-gray-800">{title}</h4>
      <ul className="space-y-2">
        {points.map((point, idx) => (
          <li key={idx} className="flex items-start gap-2">
            <span className="text-cyan-600 mt-1">✓</span>
            <span className="text-gray-700">{point}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SpecCard({ title, specs }: { title: string; specs: string[] }) {
  return (
    <div className="bg-white rounded-lg p-6 border border-cyan-200 shadow-sm">
      <h4 className="text-lg font-bold text-cyan-800 mb-4">{title}</h4>
      <ul className="space-y-2">
        {specs.map((spec, idx) => (
          <li key={idx} className="flex items-start gap-2 text-sm">
            <span className="text-cyan-500">•</span>
            <span className="text-gray-700">{spec}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}