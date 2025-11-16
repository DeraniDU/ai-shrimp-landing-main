import React from 'react';

const insights = [
  {
    title: "Sustainable Practices",
    description: "Learn how eco-friendly methods are reshaping shrimp farming for a greener future.",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    color: "from-green-500 to-emerald-600"
  },
  {
    title: "AI in Aquaculture",
    description: "Discover how artificial intelligence is driving efficiency and innovation in aquaculture.",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    color: "from-blue-500 to-cyan-600"
  },
  {
    title: "Global Market Trends",
    description: "Stay updated on the latest market trends and demands in the shrimp farming industry.",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
      </svg>
    ),
    color: "from-purple-500 to-indigo-600"
  },
  {
    title: "Disease Management",
    description: "Explore cutting-edge research on preventing and managing diseases in shrimp farms.",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    color: "from-red-500 to-pink-600"
  }
];

export default function InsightsPage() {
  return (
    <div className="min-h-screen bg-gray-50 px-4 py-12 sm:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Shrimp Farming Research Insights
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Explore the latest research and advancements in shrimp farming, including sustainable practices, innovative technologies, and global trends.
          </p>
        </div>

        {/* Insights Grid */}
        <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          {insights.map((insight, idx) => (
            <div
              key={idx}
              className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group"
            >
              {/* Icon Header */}
              <div className={`bg-gradient-to-br ${insight.color} p-6 flex items-center justify-center`}>
                <div className="text-white transform group-hover:scale-110 transition-transform duration-300">
                  {insight.icon}
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {insight.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {insight.description}
                </p>
              </div>

              {/* Learn More Link */}
              <div className="px-6 pb-6">
                <button className="w-full border border-cyan-600 text-cyan-600 rounded-lg px-4 py-2 text-sm font-medium hover:bg-cyan-600 hover:text-white transition-colors flex items-center justify-center gap-2 group">
                  <span>Learn More</span>
                  <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Resources Section */}
        <div className="mt-16">
          <div className="bg-white rounded-xl border border-gray-200 p-8 md:p-12 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Stay Informed
            </h2>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Access comprehensive research papers, case studies, and expert insights to stay ahead in the rapidly evolving shrimp farming industry.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <button className="bg-cyan-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-cyan-700 transition-colors">
                View All Research
              </button>
              <button className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors">
                Subscribe to Updates
              </button>
            </div>
          </div>
        </div>

        {/* Statistics Section */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
            <div className="text-3xl font-bold text-cyan-600 mb-2">150+</div>
            <div className="text-sm text-gray-600">Research Papers</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">50+</div>
            <div className="text-sm text-gray-600">Case Studies</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">30+</div>
            <div className="text-sm text-gray-600">Expert Contributors</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">24/7</div>
            <div className="text-sm text-gray-600">Access Available</div>
          </div>
        </div>
      </div>
    </div>
  );
}