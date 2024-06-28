import mongoose from "mongoose";

const sharedPostsSchema = new mongoose.Schema(
  {
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Post",
    },

    userName: { type: String, required: true, ref: "User" },
    postTitle: { type: String, required: true },
    postSlug: { type: String, required: true },
    postContent: { type: String, required: true },
    postAuthor: { type: String, required: true },
    postDate: { type: String, required: true },
    postTime: { type: String, required: true },
  },
  { timestamps: true }
);

const sharedPostSchema = new mongoose.Schema(
  {
    _id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    userName: { type: String, required: true, ref: "User" },
    sharedPosts: [sharedPostsSchema],
  },
  { timestamps: true }
);

export const SharedPostModel = mongoose.model("Shared Post", sharedPostSchema);
