import { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { Product } from '../types';

export default function Products() {
  const { addToCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [filters, setFilters] = useState({ category: '', priceRange: '', size: '' });
  const [selectedSize, setSelectedSize] = useState<number>(0);
  const [selectedColor, setSelectedColor] = useState<string>('');

  useEffect(() => {
    fetch('http://localhost:5000/api/products')
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch((error) => console.error('Error fetching products:', error));
  }, []);

  const filteredProducts = products.filter(product => {
    if (filters.category && product.category !== filters.category) return false;
    if (filters.size && product.size !== Number(filters.size)) return false;
    if (filters.priceRange) {
      const [min, max] = filters.priceRange.split('-').map(Number);
      if (product.price < min || product.price > max) return false;
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-64 space-y-4">
          <h2 className="text-lg font-semibold">Filters</h2>
          <select className="block w-full" value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })}>
            <option value="">All Categories</option>
            <option value="running">Running</option>
            <option value="casual">Casual</option>
            <option value="sport">Sport</option>
          </select>
          <select className="block w-full" value={filters.priceRange} onChange={(e) => setFilters({ ...filters, priceRange: e.target.value })}>
            <option value="">All Prices</option>
            <option value="0-100">Rs.0 - Rs.100</option>
            <option value="100-200">Rs.100 - Rs.200</option>
            <option value="200-300">Rs.200+</option>
          </select>
        </div>

        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map(product => (
            <div key={product._id} className="border rounded-lg overflow-hidden">
              <img src={product.image} alt={product.name} className="w-full h-48 object-cover" />
              <div className="p-4">
                <h3 className="text-lg font-semibold">{product.name}</h3>
                <p className="text-gray-600">Rs.{product.price}</p>
                <select className="block w-full" value={selectedSize} onChange={(e) => setSelectedSize(Number(e.target.value))}>
                  <option value={0}>Select Size</option>
                  <option value={product.size}>{product.size}</option>
                </select>
                <button onClick={() => addToCart(product, selectedSize)} disabled={!selectedSize} className="mt-4 w-full bg-black text-white py-2 rounded-md hover:bg-gray-800">
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
