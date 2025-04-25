export interface Product {
  id: number;
  name: string;
  brand: string;
  price: number;
  image: string;
  category: string;
  size: number;
  description: string;
}

export interface CartItem extends Product {
  _id: any;
  quantity: number;
  selectedSize: number;
}

export interface User {
  email: string;
  name: string;
}

