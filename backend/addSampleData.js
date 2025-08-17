import mongoose from 'mongoose';
import { Products } from './Models/Product.js';

// Connect to MongoDB
mongoose.connect(
  "mongodb+srv://codesnippet02:RitvWpYMQotElP8v@cluster0.tmblrvd.mongodb.net/",{
    dbName:"MERN_E_Commerce"
  }
).then(()=>console.log("MongoDB Connected Successfully...!")).catch((err)=>console.log(err));

const sampleProducts = [
  {
    title: "iPhone 14 Pro",
    description: "Latest Apple iPhone with advanced camera system",
    price: 89999,
    category: "mobiles",
    qty: 10,
    imgSrc: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400"
  },
  {
    title: "MacBook Pro M2",
    description: "Powerful laptop for professionals",
    price: 129999,
    category: "laptops", 
    qty: 5,
    imgSrc: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400"
  },
  {
    title: "Canon EOS R5",
    description: "Professional mirrorless camera",
    price: 299999,
    category: "cameras",
    qty: 3,
    imgSrc: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400"
  },
  {
    title: "Sony WH-1000XM4",
    description: "Noise cancelling wireless headphones",
    price: 25999,
    category: "headphones",
    qty: 15,
    imgSrc: "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400"
  },
  {
    title: "Samsung Galaxy S23",
    description: "Android flagship smartphone",
    price: 74999,
    category: "mobiles",
    qty: 8,
    imgSrc: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400"
  },
  {
    title: "Dell XPS 13",
    description: "Ultrabook for productivity",
    price: 89999,
    category: "laptops",
    qty: 7,
    imgSrc: "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=400"
  }
];

const addSampleData = async () => {
  try {
    // Clear existing products
    await Products.deleteMany({});
    console.log("Cleared existing products");
    
    // Add sample products
    const products = await Products.insertMany(sampleProducts);
    console.log("Sample products added:", products.length);
    
    process.exit(0);
  } catch (error) {
    console.error("Error adding sample data:", error);
    process.exit(1);
  }
};

addSampleData();