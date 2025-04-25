import Razorpay from 'razorpay';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// For testing purposes, use these default values if environment variables are not set
const key_id = process.env.RAZORPAY_KEY_ID || 'rzp_test_TvIJ3qmt5faM08';
const key_secret = process.env.RAZORPAY_KEY_SECRET || 'Z1gU6x7eEnJom3AYwyf0kPHG';

console.log('Using Razorpay Key ID:', key_id);

export const razorpay = new Razorpay({
  key_id,
  key_secret,
}); 