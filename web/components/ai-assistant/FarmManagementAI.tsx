'use client';

import Image from 'next/image';

export default function FarmManagementAI() {
  return (
    <section className="bg-white py-20 px-6 sm:px-10 lg:px-24">
      <div className="max-w-6xl mx-auto text-gray-800">
        <h2 className="text-4xl font-extrabold text-blue-800 mb-6">
          🤖 Farm Management AI Assistant
        </h2>

        <p className="text-lg mb-10 leading-relaxed">
          Farm Management AI Assistant is an intelligent, mobile-first decision support system designed to help shrimp farmers plan, monitor, and optimize farm operations. Using an AI chatbot and predictive analytics dashboard, it provides real-time insights on costs, harvest timing, resource planning, and farm performance. The system improves financial visibility, increases operational efficiency, and supports sustainable, data-driven shrimp farming through continuous monitoring, benchmarking, and impact assessment.
        </p>

        {/* Overview Banner */}
        <div className="relative w-full h-64 md:h-[450px] mb-12">
          <Image
            src="/ai-assistant/ai-assistant-banner.png"
            alt="Farm Management AI Assistant Overview"
            layout="fill"
            objectFit="cover"
            className="rounded-xl shadow-md"
          />
        </div>

        {/* Core AI Features */}
        <h3 className="text-2xl font-bold text-blue-700 mb-8">🧠 Core AI Features</h3>
        <div className="space-y-10">
          <Feature
            title="🧠 Intelligent Farm Advisory Assistant"
            description="📱 Natural Language AI (SMS / WhatsApp Enabled)"
            points={[
              'Farmers interact using simple local-language messages',
              'Ask questions on feeding, disease risk, costs, and harvest timing',
              '24/7 AI guidance without needing technical expertise',
              'Context-aware responses based on real farm data'
            ]}
          />
          <Feature
            title="🦐 Harvest Timing Optimization"
            description="⏱️ AI-Based Harvest Readiness Detection"
            points={[
              'Predicts optimal harvest window based on growth rate & water quality',
              'Balances shrimp size, market price, and mortality risk',
              'Avoids premature or delayed harvesting losses',
              'Maximizes revenue per cycle'
            ]}
          />
        </div>

        {/* Resource Planning */}
        <h3 className="text-2xl font-bold text-blue-700 mt-16 mb-8">🧺 Resource Planning & Optimization</h3>
        <div className="space-y-10">
          <Feature
            title="👨‍🌾 Labor Planning"
            points={[
              'Forecasts labor requirements per pond and cycle stage',
              'Optimizes workforce allocation and shift planning',
              'Reduces idle labor costs'
            ]}
          />
          <Feature
            title="🌾 Feed & Input Planning"
            points={[
              'Predicts feed requirements using biomass growth models',
              'Prevents overfeeding and feed wastage',
              'Aligns feed planning with water quality and FCR targets'
            ]}
          />
          <Feature
            title="💼 Capital & Asset Planning"
            points={[
              'Tracks equipment usage and maintenance schedules',
              'Assists in investment decisions (aerators, sensors, ponds)',
              'Long-term farm expansion planning support'
            ]}
          />
        </div>

        {/* Performance Analytics */}
        <h3 className="text-2xl font-bold text-blue-700 mt-16 mb-8">📊 Performance Benchmarking & KPIs</h3>
        <div className="space-y-10">
          <Feature
            title="📉 National & Regional KPI Comparison"
            points={[
              'Benchmarks farm performance against Sri Lankan shrimp farm standards',
              'Compares FCR, mortality rate, yield, and profit margins',
              'Identifies underperforming ponds or cycles',
              'Provides AI recommendations to close performance gaps'
            ]}
          />
        </div>

        {/* Predictive Analytics */}
        <h3 className="text-2xl font-bold text-blue-700 mt-16 mb-8">🚀 Predictive AI Analytics</h3>
        <div className="space-y-10">
          <Feature
            title="🔮 Future Risk & Opportunity Prediction"
            points={[
              'Predicts disease risk, mortality spikes, and cost overruns',
              'Identifies patterns impacting productivity',
              'Early alerts for financial or operational risks',
              'Supports proactive decision-making instead of reactive actions'
            ]}
          />
        </div>

        {/* Dashboard & Reports */}
        <h3 className="text-2xl font-bold text-blue-700 mt-16 mb-8">📱 Real-Time Dashboard & Reports</h3>
        <div className="space-y-10">
          <Feature
            title="📊 Live Analytics Dashboard"
            points={[
              'Weekly performance dashboards for farm owners',
              'Visual trends for cost, yield, FCR, and mortality',
              'Mobile-friendly access anytime, anywhere'
            ]}
          />
          <Feature
            title="📩 Automated Reports & Alerts"
            points={[
              'Weekly summaries shared via dashboard or messaging',
              'Monthly AI-generated performance reviews',
              'Alert notifications for deviations from targets'
            ]}
          />
        </div>

        {/* Sustainability */}
        <h3 className="text-2xl font-bold text-blue-700 mt-16 mb-8">🌱 Sustainability & Impact</h3>
        <div className="space-y-10">
          <Feature
            title="🌍 Environmental Sustainability"
            points={[
              'Reduced water usage through data-driven planning',
              'Lower chemical dependency via early disease detection',
              'Optimized feeding reduces waste and pond pollution'
            ]}
          />
          <Feature
            title="💰 Economic Sustainability"
            points={[
              'Higher yields with lower operational costs',
              'Improved income predictability and stability',
              'Reduced financial risk for small and medium farmers'
            ]}
          />
          <Feature
            title="👥 Social Impact"
            points={[
              'Skill development through AI and mobile technology',
              'Better disease containment across farming regions',
              'Strengthened food security and rural livelihoods'
            ]}
          />
        </div>

        {/* Monitoring & Evaluation */}
        <h3 className="text-2xl font-bold text-blue-700 mt-16 mb-4">📋 Monitoring & Evaluation Framework</h3>
        <Feature
          title="📅 Continuous Performance Monitoring"
          points={[
            'Weekly dashboards shared with farm owners',
            'Monthly reviews on FCR, mortality, yield, and ROI',
            'Quarterly independent audits and field assessments',
            'Annual impact assessment (economic, environmental, social)'
          ]}
        />

        {/* Key Metrics */}
        <h3 className="text-2xl font-bold text-blue-700 mt-16 mb-4">📊 Key Performance Indicators Tracked</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SpecCard
            title="Operational Metrics"
            specs={[
              'Feed Conversion Ratio (FCR)',
              'Shrimp Survival Rate (%)',
              'Average Harvest Weight (g)',
              'Production Cycle Time',
              'Water Quality Parameters'
            ]}
          />
          <SpecCard
            title="Financial Metrics"
            specs={[
              'Cost per kg of production',
              'Revenue per pond cycle',
              'Profit margin (%)',
              'ROI (Return on Investment)',
              'Price vs. Market trends'
            ]}
          />
        </div>

        {/* Goals Section */}
        <h3 className="text-2xl font-bold text-blue-700 mt-16 mb-4">🎯 Strategic Objectives</h3>
        <ul className="list-disc list-inside ml-4 space-y-2 text-base">
          <li>Digitize shrimp farm management across Sri Lanka</li>
          <li>Enable AI-driven, data-backed farming decisions</li>
          <li>Improve profitability while protecting the environment</li>
          <li>Empower rural farmers with accessible AI technology</li>
          <li>Build a scalable smart aquaculture ecosystem</li>
        </ul>

        {/* Call to Action */}
        <div className="mt-16 p-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
          <h3 className="text-2xl font-bold text-blue-800 mb-4">Ready to Transform Your Farm with AI?</h3>
          <p className="text-gray-700 mb-6">
            Join progressive shrimp farmers who are leveraging artificial intelligence to make smarter decisions, reduce costs, and maximize yields.
          </p>
          <div className="flex gap-4 flex-wrap">
            <a
              href="/contact"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition-all"
            >
              Request Demo
            </a>
            <a
              href="/about"
              className="px-6 py-3 bg-white hover:bg-gray-50 text-blue-600 border-2 border-blue-600 font-semibold rounded-lg shadow-md transition-all"
            >
              Learn More
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function Feature({ title, description, points }: { title: string; description?: string; points: string[] }) {
  return (
    <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 hover:shadow-md transition-shadow">
      <h4 className="text-lg font-semibold mb-2 text-gray-800">{title}</h4>
      {description && <p className="text-sm font-medium text-blue-600 mb-3">{description}</p>}
      <ul className="space-y-2">
        {points.map((point, idx) => (
          <li key={idx} className="flex items-start gap-2">
            <span className="text-blue-600 mt-1">✓</span>
            <span className="text-gray-700">{point}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SpecCard({ title, specs }: { title: string; specs: string[] }) {
  return (
    <div className="bg-white rounded-lg p-6 border border-blue-200 shadow-sm">
      <h4 className="text-lg font-bold text-blue-800 mb-4">{title}</h4>
      <ul className="space-y-2">
        {specs.map((spec, idx) => (
          <li key={idx} className="flex items-start gap-2 text-sm">
            <span className="text-blue-500">•</span>
            <span className="text-gray-700">{spec}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
