import mongoose from "mongoose";

// ✅ Item sub-schema
const itemSchema = new mongoose.Schema(
  {
    name:   { type: String, required: true, trim: true },
    qty:    { type: Number, required: true, min: 0.01 },
    rate:   { type: Number, required: true, min: 0 },
    amount: { type: Number }, // auto: qty * rate
  },
  { _id: false }
);

const invoiceSchema = new mongoose.Schema(
  {
    invoiceId: {
      type: String,
      unique: true,
    },

    customerName: {
      type: String,
      required: [true, "Customer name is required"],
      trim: true,
    },

    date: {
      type: Date,
      required: [true, "Invoice date is required"],
    },

    // ✅ NEW
    dueDate: {
      type: Date,
      default: null,
    },

    // ✅ items array — subtotal inhi se calculate hoga
    items: {
      type: [itemSchema],
      validate: {
        validator: (arr) => arr && arr.length > 0,
        message: "At least one item is required",
      },
    },

    subtotal:   { type: Number, default: 0 }, // auto from items
    gstPercent: {
      type: Number,
      enum: { values: [0, 5, 12, 18, 28], message: "GST must be 0,5,12,18 or 28" },
      default: 18,
    },
    gst:   { type: Number, default: 0 },   // auto
    total: { type: Number, default: 0 },   // auto

    status: {
      type: String,
      // ✅ OVERDUE bhi rakha hai — backend cron/query set karega
      enum: ["PENDING", "PAID", "OVERDUE"],
      default: "PENDING",
    },

    // ✅ NEW
    paymentMethod: {
      type: String,
      enum: ["Cash", "UPI", "Bank Transfer", "Cheque", "Card", null],
      default: null,
    },

    // ✅ NEW
    notes: {
      type: String,
      trim: true,
      default: null,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

// ── Pre-save: invoiceId + item amounts + subtotal + gst + total ───────────────
invoiceSchema.pre("save", async function () {
  // Auto invoiceId
  if (!this.invoiceId) {
    const count = await mongoose.model("Invoice").countDocuments();
    this.invoiceId = `INV${String(count + 1).padStart(3, "0")}`;
  }

  // ✅ Har item ka amount calculate karo
  if (this.items && this.items.length > 0) {
    this.items = this.items.map((item) => ({
      ...item,
      amount: Math.round(item.qty * item.rate),
    }));

    // ✅ Subtotal = sum of all item amounts
    this.subtotal = this.items.reduce((sum, item) => sum + item.amount, 0);
  }

  // GST + Total
  this.gst   = Math.round((this.subtotal * this.gstPercent) / 100);
  this.total = this.subtotal + this.gst;
});

const Invoice = mongoose.model("Invoice", invoiceSchema);
export default Invoice;