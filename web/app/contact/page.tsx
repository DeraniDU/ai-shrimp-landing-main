import React from 'react';

const team = [
  {
    name: "Deranindu Gunasekara",
    title: "Undergraduate, SLIIT (Malabe) – BSc (Hons) IT",
    email: "deranindu@gmail.com",
    phone: "+94 71 123 4567",
    img: "/hero/deranindu.jpeg",
  },
  {
    name: "Raveen De Silva",
    title: "Undergraduate, SLIIT (Malabe) – BSc (Hons) IT",
    email: "rdesilva614@gmail.com",
    phone: "+94 71 234 5678",
    img: "/hero/raveen.jpg",
  },
  {
    name: "Samadi Senavirathne",
    title: "Undergraduate, SLIIT (Malabe) – BSc (Hons) IT",
    email: "jithmisamadi2001@gmail.com",
    phone: "+94 77 345 6789",
    img: "/hero/samadi.jpeg",
  },
  {
    name: "Piyumali Palihawadana",
    title: "Undergraduate, SLIIT (Malabe) – BSc (Hons) IT",
    email: "piyumalipalihawadana@gmail.com",
    phone: "+94 77 456 7890",
    img: "/hero/piyumali.png",
  },
];

export default function ContactPage() {
  return (
    <div className="min-h-screen px-4 py-12 sm:px-8 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Contact Us
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            If you wish to collaborate, have questions, or want to learn more, feel free to contact our student team below.
          </p>
        </div>

        {/* Team Section */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 text-center mb-10">
            Our Student Team
          </h2>
          
          <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {team.map((member, idx) => (
              <div
                key={idx}
                className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-6 flex flex-col items-center"
              >
                {/* Profile Image */}
                <div className="mb-4">
                  <img
                    src={member.img}
                    alt={`Profile of ${member.name}`}
                    className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
                  />
                </div>

                {/* Member Info */}
                <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
                  {member.name}
                </h3>
                <p className="text-sm text-gray-600 text-center mb-6 leading-relaxed">
                  {member.title}
                </p>

                {/* Contact Information */}
                <div className="w-full flex flex-col gap-3 mt-auto">
                  {/* Email Box */}
                  <a
                    href={`mailto:${member.email}`}
                    className="flex items-center gap-2 w-full border border-cyan-600 text-cyan-600 rounded-lg px-3 py-2.5 text-sm hover:bg-cyan-600 hover:text-white transition-colors"
                  >
                    <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                    <span className="truncate">{member.email}</span>
                  </a>

                  {/* Phone Box */}
                  <a
                    href={`tel:${member.phone.replace(/\s/g, "")}`}
                    className="flex items-center gap-2 w-full border border-cyan-600 text-cyan-600 rounded-lg px-3 py-2.5 text-sm hover:bg-cyan-600 hover:text-white transition-colors"
                  >
                    <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                    </svg>
                    <span>{member.phone}</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Footer Info */}
        <div className="mt-16 text-center">
          <div className="bg-white rounded-lg border border-gray-200 p-8 max-w-3xl mx-auto">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Get In Touch
            </h3>
            <p className="text-gray-600 mb-4">
              We are available to discuss collaboration opportunities and answer any questions about our automated shrimp pond monitoring system.
            </p>
            <p className="text-sm text-gray-500">
              SLIIT, Malabe Campus • Sri Lanka
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}