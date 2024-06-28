import { ShareModel } from "../../models/share/share.model.mjs";
import { SharedPostModel } from "../../models/share/shared.model.mjs";
import { logger } from "../../configs/logger.config.mjs";
import mongoose from "mongoose";
import { shareControllerValidator } from "../../validators/share/share.controller.validator.mjs";

export const shareController = async (request, response) => {
  const { error, value } = shareControllerValidator.validate(request.body);

  if (error) {
    return response.status(400).json({ responseMessage: error.message });
  }

  const { userName, postId, userData } = value;
  const rePost = request.query.rePost;

  try {
    const database = mongoose.connection.db;

    const existingUser = await database
      .collection("users")
      .findOne({ userName: { $eq: userName } });

    if (existingUser === null || !existingUser) {
      return response.status(404).json({ responseMessage: "User not found." });
    }

    const existingPosts = await database.collection("posts").find({}).toArray();

    if (existingPosts === null || existingPosts.length === 0) {
      return response.status(404).json({ responseMessage: "Post not found." });
    }

    const existingPostIds = new Set(
      existingPosts.map((post) => post._id.toString())
    );

    if (!existingPostIds.has(postId.toString())) {
      return response.status(404).json({ responseMessage: "Post not found." });
    }

    for (const post of existingPosts) {
      const existingSharedDocument = await ShareModel.findOne({
        _id: { $eq: post._id },
      });

      if (!existingSharedDocument) {
        await ShareModel.create({ _id: post._id });
      }
    }

    const existingSharers = await ShareModel.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(postId) } },
      { $unwind: "$shares" },
      { $match: { "shares.userName": userName } },
      { $project: { userName: userName } },
    ]);

    const foundSharingUser = existingSharers.some(
      (sharingUser) => userName === sharingUser.userName
    );

    if (rePost) {
      if (foundSharingUser) {
        await ShareModel.findOneAndUpdate(
          { _id: { $eq: new mongoose.Types.ObjectId(postId) } },
          {
            $pull: { shares: { userName: userName } },
            $inc: { totalShares: -1 },
          },
          { new: true, upsert: true }
        );

        await SharedPostModel.findOneAndUpdate(
          {
            _id: { $eq: userData.id },
          },
          {
            $pull: {
              sharedPosts: {
                _id: postId,
              },
            },
          },
          { new: true, upsert: true }
        );

        return response.status(200).json({
          responseMessage: "You have successfully deleted the shared post.",
        });
      }

      for (const post of existingPosts) {
        if (post._id.equals(postId)) {
          await ShareModel.findOneAndUpdate(
            { _id: { $eq: new mongoose.Types.ObjectId(postId) } },
            {
              $push: { shares: { userName: userName } },
              $inc: { totalShares: 1 },
            },
            { new: true, upsert: true }
          );

          await SharedPostModel.findOneAndUpdate(
            {
              _id: { $eq: userData.id },
            },
            {
              userName: userData.userName,
              $push: {
                sharedPosts: {
                  _id: post._id,
                  userName: userName,
                  postTitle: post.postTitle,
                  postSlug: post.postSlug,
                  postContent: post.postContent,
                  postAuthor: post.postAuthor,
                  postDate: post.postDate,
                  postTime: post.postTime,
                },
              },
            },
            { new: true, upsert: true }
          );
        }
      }
    } else {
      return response.status(200).json({
        responseMessage: "Post cannot be shared.",
      });
    }

    return response.status(200).json({
      responseMessage: "You have successfully shared the post.",
    });
  } catch (error) {
    logger.log({
      level: "error",
      message: error,
      additional: "Internal server error.",
    });

    return response.status(500).json({
      responseMessage: "Internal server error.",
    });
  }
};
