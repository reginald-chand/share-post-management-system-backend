import mongoose from "mongoose";

const sharePerUserSchema = new mongoose.Schema(
  {
    userName: { type: String, required: true, ref: "User" },
  },
  { timestamps: true }
);

const shareSchema = new mongoose.Schema(
  {
    _id: { type: mongoose.Schema.Types.ObjectId, ref: "posts" },
    shares: [sharePerUserSchema],
    totalShares: { type: Number },
  },
  { timestamps: true }
);

export const ShareModel = mongoose.model("Share", shareSchema);
