import React from 'react';

export default function About() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold mb-4">About Walk And Jag Shoeshop</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Your premier destination for quality footwear since 2025
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center mb-16">
        <div>
          <img
            src="https://images.unsplash.com/photo-1600185365483-26d7a4cc7519"
            alt="Our Story"
            className="rounded-lg shadow-lg"
          />
        </div>
        <div>
          <h2 className="text-3xl font-bold mb-6">Our Story</h2>
          <p className="text-gray-600 mb-4">
            Founded with a passion for quality footwear, ShoePalace has grown from a small local shop
            to a leading online destination for shoe enthusiasts.
          </p>
          <p className="text-gray-600">
            We believe that every step matters, and that's why we carefully curate our collection
            to bring you the best in style, comfort, and quality.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        {[
          {
            title: "Quality First",
            description: "We partner with leading brands to bring you the finest footwear."
          },
          {
            title: "Expert Service",
            description: "Our team of shoe experts is here to help you find the perfect fit."
          },
          {
            title: "Satisfaction Guaranteed",
            description: "We stand behind every pair of shoes we sell with our satisfaction guarantee."
          }
        ].map((value, index) => (
          <div key={index} className="text-center p-6 bg-gray-50 rounded-lg">
            <h3 className="text-xl font-semibold mb-4">{value.title}</h3>
            <p className="text-gray-600">{value.description}</p>
          </div>
        ))}
      </div>

      <div className="bg-gray-50 p-8 rounded-lg">
        <h2 className="text-3xl font-bold text-center mb-8">Our Values</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[
            {
              title: "Sustainability",
              description: "We're committed to reducing our environmental impact through sustainable practices."
            },
            {
              title: "Community",
              description: "Supporting local communities through various outreach programs."
            },
            {
              title: "Innovation",
              description: "Constantly evolving to bring you the latest in footwear technology."
            },
            {
              title: "Integrity",
              description: "Operating with honesty and transparency in everything we do."
            }
          ].map((value, index) => (
            <div key={index} className="flex space-x-4">
              <div>
                <h3 className="text-xl font-semibold mb-2">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}