import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { Edit3 } from 'lucide-react';

interface FormData {
  name: string;
  email: string;
  mobile: string;
  address: string;
}

interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  size: string;
}

interface Order {
  orderId: string;
  items: OrderItem[];
  totalAmount: number;
  status: string;
  createdAt: string;
}

export default function UserProfile() {
  const { user } = useAuth();
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    mobile: '',
    address: ''
  });
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (user && user.id) {
      const fetchUserDataAndOrders = async () => {
        try {
          // Step 1: Fetch user info by Mongo _id to get userId
          const userRes = await axios.get(`http://localhost:5000/users/${user.id}`);
          const fullUser = userRes.data;
          console.log('Fetched User:', fullUser);

          setFormData({
            name: fullUser.name || '',
            email: fullUser.email || '',
            mobile: fullUser.mobile || '',
            address: fullUser.address || ''
          });

          const userId = fullUser.userId; // use userId for order lookup

          // Step 2: Fetch orders using userId
          const orderRes = await axios.get(`http://localhost:5000/orders/user/${userId}`);
          console.log('Found orders:', orderRes.data);

          const formattedOrders = orderRes.data.map((order: any) => ({
            orderId: order.orderId,
            items: order.items || [],
            totalAmount: order.totalAmount || 0,
            status: order.status || 'Pending',
            createdAt: order.createdAt || new Date()
          }));

          setOrders(formattedOrders);
        } catch (error) {
          console.error('Error:', error);
          setOrders([]);
        }
      };

      fetchUserDataAndOrders();
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      if (!user) {
        setMessage('User not found.');
        setLoading(false);
        return;
      }

      const response = await axios.put(`http://localhost:5000/users/${user.id}`, formData);
      setFormData(response.data);
      setMessage('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      console.error('Update Error:', error);
      setMessage('Failed to update profile.');
    }

    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-lg mt-10">
      <h2 className="text-2xl font-bold mb-4">User Profile</h2>
      {message && <p className="text-green-500">{message}</p>}

      {!isEditing ? (
        <div className="grid grid-cols-2 gap-4 p-4 border rounded-md">
          <div><p className="text-gray-600">Full Name:</p><p className="font-semibold">{formData.name}</p></div>
          <div><p className="text-gray-600">Email Address:</p><p className="font-semibold">{formData.email}</p></div>
          <div><p className="text-gray-600">Mobile Number:</p><p className="font-semibold">{formData.mobile}</p></div>
          <div><p className="text-gray-600">Address:</p><p className="font-semibold">{formData.address}</p></div>
          <button className="col-span-2 flex items-center text-blue-500 hover:text-blue-700" onClick={() => setIsEditing(true)}>
            <Edit3 className="h-5 w-5 mr-2" /> Edit Profile
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Full Name" className="border p-2 w-full" required />
          <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email Address" className="border p-2 w-full" required disabled />
          <input type="text" name="mobile" value={formData.mobile} onChange={handleChange} placeholder="Mobile Number" className="border p-2 w-full" required />
          <input type="text" name="address" value={formData.address} onChange={handleChange} placeholder="Address" className="border p-2 w-full" required />
          <button type="submit" className="bg-black text-white p-2 rounded w-full" disabled={loading}>
            {loading ? 'Updating...' : 'Save Changes'}
          </button>
          <button type="button" className="text-gray-600 w-full mt-2" onClick={() => setIsEditing(false)}>Cancel</button>
        </form>
      )}

      {/* Orders Section */}
      <div className="mt-8">
        <h3 className="text-xl font-bold mb-4">Your Orders</h3>
        {orders.length === 0 ? (
          <p className="text-gray-600">No orders found.</p>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.orderId} className="border rounded-md p-4">
                <div className="flex justify-between items-center mb-2">
                  <p className="font-semibold">Order ID: {order.orderId}</p>
                  <span className={`px-2 py-1 rounded text-sm ${
                    order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                    order.status === 'Processing' ? 'bg-blue-100 text-blue-800' :
                    order.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {order.status}
                  </span>
                </div>
                <div className="mb-2">
                  <p className="text-gray-600">Order Date: {new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="border-t pt-2">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex justify-between mb-1">
                      <span>{item.name} (Size: {item.size}) x {item.quantity}</span>
                      <span>₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                  <div className="flex justify-between font-bold mt-2 pt-2 border-t">
                    <span>Total Amount:</span>
                    <span>₹{order.totalAmount}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
