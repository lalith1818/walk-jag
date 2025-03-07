export interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
  size: number[];
  color: string[];
  description: string;
}

export interface CartItem extends Product {
  quantity: number;
  selectedSize: number;
  selectedColor: string;
}

export interface User {
  email: string;
  name: string;
}