import Image from "next/image";

const team = [
  {
    name: "Deranindu Gunasekara",
    title: "Undergraduate, SLIIT (Malabe) – BSc (Hons) IT",
    email: "nimal.perera@sliit.lk",
    phone: "+94 71 123 4567",
    img: "/team1.jpg",
  },
  {
    name: "Raveen De Silva",
    title: "Undergraduate, SLIIT (Malabe) – BSc (Hons) IT",
    email: "samanthi.silva@sliit.lk",
    phone: "+94 71 234 5678",
    img: "/team2.jpg",
  },
  {
    name: "Samadi Senavirathne",
    title: "Undergraduate, SLIIT (Malabe) – BSc (Hons) IT",
    email: "kavindu.fernando@sliit.lk",
    phone: "+94 77 345 6789",
    img: "/team3.jpg",
  },
  {
    name: "Piyumali Palihawadana",
    title: "Undergraduate, SLIIT (Malabe) – BSc (Hons) IT",
    email: "shehani.gunawardena@sliit.lk",
    phone: "+94 77 456 7890",
    img: "/team4.jpg",
  },
];

export default function ContactPage() {
  return (
    <div className="min-h-screen px-4 py-10 sm:px-8 bg-white text-gray-900">
      <div className="max-w-3xl mx-auto text-center mb-12">
        <h1 className="text-4xl font-extrabold mb-3">Contact Us</h1>
        <p className="text-lg text-gray-600">
          If you wish to collaborate, have questions, or want to learn more, feel free to contact our student team below.
        </p>
      </div>

      {/* Our Team Section */}
      <section>
        <h2 className="text-2xl font-bold text-center mb-8">Our Student Team</h2>
        <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 max-w-3xl mx-auto">
          {team.map((member, idx) => (
            <div
              key={idx}
              className="bg-white rounded-xl border border-gray-200 shadow p-6 flex flex-col items-center text-center hover:shadow-lg transition-shadow"
            >
              <div className="mb-4">
                <Image
                  src={member.img}
                  alt={`Profile of ${member.name}`}
                  width={96}
                  height={96}
                  className="rounded-full object-cover bg-gray-200"
                />
              </div>
              <h3 className="text-lg font-semibold">{member.name}</h3>
              <p className="text-gray-600 mb-3">{member.title}</p>
              <p className="text-gray-500 text-sm mb-1">
                Email: <span className="break-all">{member.email}</span>
              </p>
              <p className="text-gray-500 text-sm">
                Phone: {member.phone}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
