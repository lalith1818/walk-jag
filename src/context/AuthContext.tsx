import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import { useCart } from './CartContext';  
import { useNavigate } from 'react-router-dom';

interface User {
  id: string;
  email: string;
  name: string;
  mobile: string;
  address: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  signup: (email: string, password: string, name: string) => Promise<{ success: boolean; message?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const { clearCart } = useCart();
  
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
  
    console.log("Token from localStorage:", token);
    console.log("Stored user from localStorage:", storedUser);
  
    if (token) {
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          console.log("Parsed user:", parsedUser);
          setLoading(false);  // ✅ Ensure loading state is updated
        } catch (error) {
          console.error("Error parsing user from localStorage:", error);
          localStorage.removeItem('user');
          setLoading(false);
        }
      } else {
        // 🔥 Fetch user from backend if user data is missing
        axios.get('http://localhost:5000/user', {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then(response => {
            console.log("Fetched user from API:", response.data.user);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            setUser(response.data.user);
          })
          .catch(error => {
            console.error("Failed to fetch user:", error);
            if (error.response?.status === 401) {
              console.log("Unauthorized! Logging out...");
              logout();
            }
          })
          .finally(() => {
            console.log("Finished loading user data.");
            setLoading(false);  // ✅ Ensure `setLoading(false)` runs always
          });
      }
    } else {
      console.log("No token found, setting loading to false.");
      setLoading(false);  // ✅ Ensure `setLoading(false)` is set if no token
    }
  }, []);
  
  // Function to update user details
  const updateUser = async (updatedData: any) => {
    try {
      if (!user) {
        throw new Error('User is not logged in');
      }
      const { data } = await axios.put(`http://localhost:5000/users/${user.id}`, updatedData);
      setUser(data);
      localStorage.setItem('user', JSON.stringify(data)); // Update local storage
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };
  

  const login = async (email: string, password: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await axios.post('http://localhost:5000/login', { email, password });
  
      if (response.status === 200) {
        const userData = response.data.user;
        localStorage.setItem('token', response.data.token);
  
        if (userData) {
          localStorage.setItem('user', JSON.stringify(userData));  // ✅ Ensure user is saved
          setUser(userData);
        } else {
          console.error("Login response missing user data!");
        }
  
        return { success: true };
      } else {
        return { success: false, message: 'Invalid email or password' };
      }
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Login failed' };
    }
  };
  

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    clearCart();
    navigate('/');
  };

  const signup = async (email: string, password: string, name: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await axios.post('http://localhost:5000/signup', { email, password, name });

      if (response.status === 201) {
        const userData = response.data.user;
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        return { success: true };
      } else {
        return { success: false, message: 'Signup failed' };
      }
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Signup failed' };
    }
  };

  if (loading) {
    return <div className="text-center mt-10 text-gray-600">Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, signup }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
