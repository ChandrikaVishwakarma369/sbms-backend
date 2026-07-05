import express from "express";
import { addProduct, getProducts, deleteProduct ,searchProducts,updateProduct, getLowStockProducts} from "../controllers/productController.js";
import { auth, admin } from "../middleware/authMiddleware.js";
import { allowRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.post("/add", auth, admin, addProduct);
router.get("/", auth, getProducts);
router.delete("/:id", auth, admin, deleteProduct);
router.get("/search", auth, searchProducts); 
router.get("/low-stock", auth, getLowStockProducts); 
router.put("/:id", auth, allowRoles("ADMIN"), updateProduct);  

export default router;