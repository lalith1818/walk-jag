import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <div>
      <div className="relative h-[600px]">
        <img
          src="images/homepageimg.jfif"
          alt="Hero"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-5xl font-bold mb-4">Step into Style</h1>
            <p className="text-xl mb-8">Discover our latest collection of premium footwear</p>
            <Link
              to="/products"
              className="inline-flex items-center bg-white text-black px-6 py-3 rounded-md hover:bg-gray-100"
            >
              Shop Now <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Featured Categories</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: "Running",
              image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff",
            },
            {
              title: "Casual",
              image: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77",
            },
            {
              title: "Sport",
              image: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa",
            },
          ].map((category, index) => (
            <Link to="/products" key={index} className="group">
              <div className="relative h-80 overflow-hidden rounded-lg">
                <img
                  src={category.image}
                  alt={category.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                  <h3 className="text-white text-2xl font-bold">{category.title}</h3>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}