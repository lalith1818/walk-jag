import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import Razorpay from 'razorpay';

export default function Checkout() {
  const { total, items, clearCart } = useCart();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
  });

  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setUserId(user.id);
    } else {
      alert('Please log in to place an order.');
      navigate('/login');
    }
  }, [navigate]);

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        resolve(true);
      };
      script.onerror = () => {
        resolve(false);
      };
      document.body.appendChild(script);
    });
  };

  const displayRazorpay = async () => {
    try {
      setLoading(true);
      const res = await loadRazorpay();
      if (!res) {
        alert('Razorpay SDK failed to load. Are you online?');
        return;
      }

      // Create order on your backend
      const orderResponse = await fetch('http://localhost:5000/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: total * 100, // Convert to paise
          currency: 'INR',
        }),
      });

      if (!orderResponse.ok) {
        throw new Error(`Failed to create order: ${orderResponse.statusText}`);
      }

      const orderData = await orderResponse.json();

      const options = {
        key: 'rzp_test_TvIJ3qmt5faM08',
        amount: total * 100,
        currency: 'INR',
        name: 'Your Store Name',
        description: 'Payment for your order',
        order_id: orderData.id,
        handler: async function (response: any) {
          // Handle successful payment
          await handleOrderPlacement(response);
        },
        prefill: {
          name: formData.name,
          email: formData.email,
          contact: formData.phone,
        },
        theme: {
          color: '#000000',
        },
        modal: {
          ondismiss: function() {
            setLoading(false);
          }
        }
      };

      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.open();
    } catch (error: any) {
      console.error('Payment error:', error);
      alert(`Payment error: ${error.message}`);
      setLoading(false);
    }
  };

  const handleOrderPlacement = async (paymentResponse: any) => {
    try {
      const orderData = {
        userId,
        ...formData,
        items,
        total,
        paymentId: paymentResponse.razorpay_payment_id,
        orderId: paymentResponse.razorpay_order_id,
        signature: paymentResponse.razorpay_signature,
      };

      const response = await fetch('http://localhost:5000/api/place-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });

      const result = await response.json();

      if (result.success) {
        alert('Order placed successfully!');
        clearCart();
        navigate('/');
      } else {
        alert(result.message || 'Failed to place order');
      }
    } catch (error) {
      console.error('Order placement error:', error);
      alert('An error occurred while placing the order.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userId) {
      alert("User ID not found. Please log in again.");
      return;
    }

    await displayRazorpay();
  };

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Checkout</h1>

      <form onSubmit={handleSubmit} className="space-y-8 bg-white p-8 rounded-lg shadow-lg">
        <div>
          <h2 className="text-lg font-semibold mb-4">Shipping Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {['name', 'email', 'phone', 'city'].map((field) => (
              <div className="flex flex-col" key={field}>
                <label className="text-sm font-medium text-gray-700">
                  {field.charAt(0).toUpperCase() + field.slice(1)}
                </label>
                <input
                  type={field === 'email' ? 'email' : 'text'}
                  required
                  placeholder={field === 'email' ? 'john@example.com' : ''}
                  className="mt-1 w-full rounded-md border border-gray-300 shadow-sm p-2 focus:ring-black focus:border-black"
                  value={formData[field as keyof typeof formData]}
                  onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                />
              </div>
            ))}

            <div className="flex flex-col md:col-span-2">
              <label className="text-sm font-medium text-gray-700">Address</label>
              <input
                type="text"
                required
                placeholder="123 Street, Apartment 4B"
                className="mt-1 w-full rounded-md border border-gray-300 shadow-sm p-2 focus:ring-black focus:border-black"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
          <div className="bg-gray-100 p-4 rounded-md shadow-inner space-y-4">
            {items.map((item) => (
              <div key={`${item.id}-${item.selectedSize}`} className="flex justify-between">
                <span>{item.name} x {item.quantity}</span>
                <span>Rs.{(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            <div className="border-t pt-4">
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>Rs.{total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full bg-black text-white py-3 rounded-md hover:bg-gray-800 transition-all ${
            loading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {loading ? 'Processing...' : 'Proceed to Payment'}
        </button>
      </form>
    </div>
  );
}

