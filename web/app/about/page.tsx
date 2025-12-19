// app/about/page.tsx
import Image from "next/image";

export default function AboutPage() {
  return (
    <div className="min-h-screen px-4 py-10 sm:px-8 bg-white text-gray-900">
      <div className="max-w-3xl mx-auto text-center mb-12">
        <h1 className="text-4xl font-extrabold mb-3">About Us</h1>
        <p className="text-lg text-gray-600">
          Our mission is to transform shrimp farming in Sri Lanka through advanced AI technology and sustainable innovation.
        </p>
      </div>

      <section className="max-w-3xl mx-auto mb-16">
        <h2 className="text-2xl font-bold mb-4">Who We Are</h2>
        <p className="text-gray-700">
          We are a passionate team of undergraduate students from SLIIT (Malabe), specializing in Information Technology and driven to modernize aquaculture with real-time monitoring, AI-powered decision-making, and smart automation. Our diverse skill sets and dedication fuel our vision for sustainable, efficient, and profitable shrimp farms across Sri Lanka.
        </p>
      </section>

      <section className="max-w-3xl mx-auto mb-16">
        <h2 className="text-2xl font-bold mb-4">Our Project</h2>
        <p className="text-gray-700">
          The <span className="font-semibold text-cyan-600">AI Shrimp Farming Project</span> introduces state-of-the-art solutions for water quality monitoring, automated feeding, disease detection, and a knowledgeable AI assistant. By empowering farmers with data-driven insights and automated systems, we aim to boost shrimp yields, minimize losses, and promote environmentally responsible practices.
        </p>
      </section>

    

      <section className="max-w-3xl mx-auto text-center">
        <h2 className="text-xl font-bold mb-2">Our Commitment</h2>
        <p className="text-gray-700">
          We believe in making technology accessible and impactful for all Sri Lankan shrimp farmers. Through research, innovation, and collaboration, we strive to pave the way for a more prosperous and sustainable aquaculture industry.
        </p>
      </section>
    </div>
  );
}
