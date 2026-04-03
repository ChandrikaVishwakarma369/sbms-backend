import mongoose from "mongoose";

const invoiceSchema = new mongoose.Schema(
  {
    invoiceId: {
      type: String,
      unique: true,
      // auto-generated in pre-save hook → INV001, INV002 ...
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

    subtotal: {
      type: Number,
      required: [true, "Subtotal is required"],
      min: [1, "Subtotal must be greater than 0"],
    },

    gstPercent: {
      type: Number,
      enum: {
        values: [0, 5, 12, 18, 28],
        message: "GST must be 0, 5, 12, 18 or 28",
      },
      default: 18,
    },

    gst: { type: Number, default: 0 },   // auto-calculated
    total: { type: Number, default: 0 }, // auto-calculated

    status: {
      type: String,
      enum: ["PENDING", "PAID", "OVERDUE"],
      default: "PENDING",
    },

    // ← KEY FIELD for role-based filtering
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

// ── Auto invoiceId + GST/Total calculation on CREATE ──────────────────────────
invoiceSchema.pre("save", async function () {
  if (!this.invoiceId) {
    const count = await mongoose.model("Invoice").countDocuments();
    this.invoiceId = `INV${String(count + 1).padStart(3, "0")}`;
  }

  this.gst   = Math.round((this.subtotal * this.gstPercent) / 100);
  this.total = this.subtotal + this.gst;
});

const Invoice = mongoose.model("Invoice", invoiceSchema);
export default Invoice;