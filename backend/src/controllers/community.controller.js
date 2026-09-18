import mongoose from "mongoose";
import Comment from "../models/Comment.js";
import Post from "../models/Post.js";

const invalidId = (id) => !mongoose.isValidObjectId(id);
const categories = ["general", "health", "behavior", "nutrition", "grooming", "advice"];

const postQuery = (query) => query.populate("author", "name role").sort({ createdAt: -1 });
const commentQuery = (query) => query.populate("author", "name role").sort({ createdAt: 1 });

export const listPosts = async (req, res) => {
  try {
    const posts = await postQuery(Post.find({ tenantId: req.tenantId })).limit(50);
    return res.json(posts);
  } catch (error) {
    console.error("listPosts error", error);
    return res.status(500).json({ message: "Server Error" });
  }
};

export const getPost = async (req, res) => {
  if (invalidId(req.params.postId)) return res.status(404).json({ message: "Post not found" });
  try {
    const post = await postQuery(Post.findOne({ _id: req.params.postId, tenantId: req.tenantId }));
    if (!post) return res.status(404).json({ message: "Post not found" });
    return res.json(post);
  } catch (error) {
    console.error("getPost error", error);
    return res.status(500).json({ message: "Server Error" });
  }
};

export const createPost = async (req, res) => {
  const { title, content, category = "general" } = req.body;
  if (!title?.trim() || !content?.trim()) return res.status(400).json({ message: "Title and content are required" });
  if (!categories.includes(category)) return res.status(400).json({ message: "Invalid post category" });

  try {
    const post = await Post.create({ tenantId: req.tenantId, author: req.user._id, title, content, category });
    return res.status(201).json(await postQuery(Post.findOne({ _id: post._id, tenantId: req.tenantId })));
  } catch (error) {
    console.error("createPost error", error);
    return res.status(400).json({ message: "Invalid post data" });
  }
};

export const updatePost = async (req, res) => {
  if (invalidId(req.params.postId)) return res.status(404).json({ message: "Post not found" });
  const updates = {};
  if (req.body.title !== undefined) updates.title = req.body.title;
  if (req.body.content !== undefined) updates.content = req.body.content;
  if (req.body.category !== undefined) updates.category = req.body.category;
  if (updates.category && !categories.includes(updates.category)) return res.status(400).json({ message: "Invalid post category" });

  try {
    const post = await postQuery(Post.findOneAndUpdate({ _id: req.params.postId, tenantId: req.tenantId, author: req.user._id }, updates, { new: true, runValidators: true }));
    if (!post) return res.status(404).json({ message: "Post not found" });
    return res.json(post);
  } catch (error) {
    console.error("updatePost error", error);
    return res.status(400).json({ message: "Invalid post data" });
  }
};

export const deletePost = async (req, res) => {
  if (invalidId(req.params.postId)) return res.status(404).json({ message: "Post not found" });
  try {
    const post = await Post.findOneAndDelete({ _id: req.params.postId, tenantId: req.tenantId, author: req.user._id });
    if (!post) return res.status(404).json({ message: "Post not found" });
    await Comment.deleteMany({ post: post._id, tenantId: req.tenantId });
    return res.json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("deletePost error", error);
    return res.status(500).json({ message: "Server Error" });
  }
};

export const listComments = async (req, res) => {
  if (invalidId(req.params.postId)) return res.status(404).json({ message: "Post not found" });
  try {
    const postExists = await Post.exists({ _id: req.params.postId, tenantId: req.tenantId });
    if (!postExists) return res.status(404).json({ message: "Post not found" });
    return res.json(await commentQuery(Comment.find({ post: req.params.postId, tenantId: req.tenantId })));
  } catch (error) {
    console.error("listComments error", error);
    return res.status(500).json({ message: "Server Error" });
  }
};

export const createComment = async (req, res) => {
  if (invalidId(req.params.postId)) return res.status(404).json({ message: "Post not found" });
  if (!req.body.content?.trim()) return res.status(400).json({ message: "Comment content is required" });
  try {
    const postExists = await Post.exists({ _id: req.params.postId, tenantId: req.tenantId });
    if (!postExists) return res.status(404).json({ message: "Post not found" });
    const comment = await Comment.create({ tenantId: req.tenantId, post: req.params.postId, author: req.user._id, content: req.body.content });
    return res.status(201).json(await commentQuery(Comment.findOne({ _id: comment._id, tenantId: req.tenantId })));
  } catch (error) {
    console.error("createComment error", error);
    return res.status(400).json({ message: "Invalid comment data" });
  }
};

export const deleteComment = async (req, res) => {
  if (invalidId(req.params.commentId)) return res.status(404).json({ message: "Comment not found" });
  try {
    const comment = await Comment.findOne({ _id: req.params.commentId, tenantId: req.tenantId });
    if (!comment) return res.status(404).json({ message: "Comment not found" });
    const post = await Post.findOne({ _id: comment.post, tenantId: req.tenantId }).select("author");
    const canDelete = comment.author.equals(req.user._id) || post?.author.equals(req.user._id);
    if (!canDelete) return res.status(403).json({ message: "You cannot delete this comment" });
    await comment.deleteOne();
    return res.json({ message: "Comment deleted successfully" });
  } catch (error) {
    console.error("deleteComment error", error);
    return res.status(500).json({ message: "Server Error" });
  }
};
