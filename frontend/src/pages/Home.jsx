
export default function Home() {
  return (
    <div className="max-w-4xl mx-auto text-center">
      {/* Hero Title */}
      <h2 className="text-5xl font-extrabold text-gray-900 mb-4">
        Give the <span className="text-red-600">Gift of Life</span>
      </h2>

      {/* Subheading */}
      <p className="text-gray-600 text-lg mb-8">
        Join our community of donors and help patients in need.  
        Every drop counts, every donor makes a difference.
      </p>

      {/* Call to Action */}
      <button className="bg-red-600 hover:bg-rose-600 text-white px-8 py-4 rounded-lg shadow-lg font-semibold transition">
        Become a Donor
      </button>

      {/* Highlight Card */}
      <div className="mt-12 bg-white shadow-md rounded-xl p-8">
        <h3 className="text-2xl font-bold text-gray-800 mb-3">
          Why Donate Blood?
        </h3>
        <p className="text-gray-600 leading-relaxed">
          Blood donation is a simple, safe way to make a huge impact.  
          With just one donation, you can save up to <span className="text-red-500 font-semibold">3 lives</span>.  
          Be the reason someone smiles today.
        </p>
      </div>
    </div>
  );
}