import express from "express";
import { addProduct, getProducts, deleteProduct ,searchProducts,updateProduct} from "../controllers/productController.js";
import { auth, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/add",auth,admin, addProduct);
router.get("/", getProducts);
router.delete("/:id", auth,admin,deleteProduct);
router.get("/search", searchProducts); 
router.put("/:id", updateProduct);  

export default router;