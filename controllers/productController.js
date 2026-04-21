import Product from "../models/Product.js";


// ➕ Add Product
export const addProduct = async (req, res) => {
  try {
    const { name, price, description, image, category, stock } = req.body;

    const product = new Product({
      name,
      price,
      description,
      image,
      category,
      stock
    });

    await product.save();

    res.status(201).json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 📦 Get All Products
export const getProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.json({ success: true, products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ❌ Delete Product
export const deleteProduct = async (req, res) => {
  try {
    const id = req.params.id;

    await Product.findByIdAndDelete(id);

    res.json({ success: true, message: "Product deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✏️ Update Product
export const updateProduct = async (req, res) => {
  try {
    const id = req.params.id;

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      req.body,
      { new: true } // updated data return karega
    );

    if (!updatedProduct) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    res.json({ success: true, product: updatedProduct });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
// 🔍 Search & Filter Products
export const searchProducts = async (req, res) => {
  try {
    const { keyword, category, minPrice, maxPrice } = req.query;

    let query = {};

    // 🔍 Search by name
    if (keyword) {
      query.name = { $regex: keyword, $options: "i" }; // case-insensitive
    }

    // 📂 Filter by category
    if (category) {
      query.category = category;
    }

    // 💰 Filter by price range
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    const products = await Product.find(query);

    res.json({ success: true, products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};