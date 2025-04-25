import { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { Product } from '../types';

export default function Products() {
  const { addToCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [filters, setFilters] = useState({ category: '', priceRange: '', size: '' });
  //const [selectedSize, setSelectedSize] = useState<number>(0);

  useEffect(() => {
    fetch('http://localhost:5000/api/products')
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch((error) => console.error('Error fetching products:', error));
  }, []);

  const filteredProducts = products.filter(product => {
    if (filters.category && product.category.toLowerCase() !== filters.category.toLowerCase()) return false;
    if (filters.size && product.size !== Number(filters.size)) return false;
    if (filters.priceRange) {
      const [min, max] = filters.priceRange.split('-').map(Number);
      if (max) {
        if (product.price < min || product.price > max) return false;
      } else {
        if (product.price < min) return false;
      }
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col gap-8 md:flex-row">
        {/* Filters */}
        <div className="w-full space-y-4 md:w-64">
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
            <option value="200-">Rs.200+</option>
          </select>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 flex-1">
          {filteredProducts.map(product => (
            <div key={product.id} className="border rounded-lg overflow-hidden">
              <img src={`http://localhost:5000${product.image}`} alt={product.name} className="w-full h-48 object-cover rounded-md" />
              <div className="p-4">
                <h3 className="text-lg font-semibold">{product.name}</h3>
                <p className="text-gray-600">Brand: {product.brand}</p>
                <p className="text-gray-600">Category: {product.category}</p>
                <p className="text-gray-600">Size: {product.size}</p>
                <p className="text-gray-600">Price: Rs.{product.price}</p>
                <button onClick={() => addToCart(product, product.size)} className="mt-4 w-full bg-black text-white py-2 rounded-md hover:bg-gray-800">
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
