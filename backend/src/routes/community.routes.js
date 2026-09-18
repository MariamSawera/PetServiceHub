import express from "express";
import protectRoute from "../middleware/protectRoute.js";
import {
  createComment,
  createPost,
  deleteComment,
  deletePost,
  getPost,
  listComments,
  listPosts,
  updatePost,
} from "../controllers/community.controller.js";

const router = express.Router();

router.get("/posts", listPosts);
router.get("/posts/:postId", getPost);
router.get("/posts/:postId/comments", listComments);

router.use(protectRoute);
router.post("/posts", createPost);
router.patch("/posts/:postId", updatePost);
router.delete("/posts/:postId", deletePost);
router.post("/posts/:postId/comments", createComment);
router.delete("/comments/:commentId", deleteComment);

export default router;
