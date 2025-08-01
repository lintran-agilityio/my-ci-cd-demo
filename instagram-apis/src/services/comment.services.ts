import { Comment, Post, User } from "@/models";
import { findAllData } from "@/utils";

type ParamCreateCommentType = {
  postId: number;
  authorId: number;
  content: string;
};

class CommentsServices {
  getAll = async (offset: number, limit: number) => {
    try {
      return findAllData({
        model: Comment,
        offset,
        limit,
        order: ['createdAt', 'DESC']
      });
    } catch (error) {
      throw error;
    }
  };

  getPostsComment = async (offset: number, limit: number, postId: number) => {
    try {
      const { rows, count } = await Comment.findAndCountAll({
        where: { postId },
        offset,
        limit,
        order: [['createdAt', 'DESC']],
        include: [
          {
            model: Post,
            as: 'post',
            attributes: ['id', 'title'],
            include: [
              {
                model: User,
                as: 'author',
                attributes: ['userId', 'username', 'email'],
              },
            ],
          },
        ],
      });

      const resFormatted = {
          data: rows,
          meta: {
            pagination: {
              limit,
              offset,
              total: count
            }
          }
        };
      
        return resFormatted;
    } catch (error) {
      throw error;
    }
  };

  getPostsCommentById = async (commentId: number, postId: number) => {
    try {
      return await Comment.findOne({
        where: {
          id: commentId,
          postId
        },
        include: [{
          model: Post,
          as: 'post',
          attributes: ['id', 'title']
        }]
      });
    } catch (error) {
      throw error;
    }
  };

  create = async ({ postId, authorId, content }: ParamCreateCommentType) => {
    try {
      return await Comment.create({ postId, authorId, content });
    } catch (error) {
      throw error;
    }
  };

  deletePostsComments = async (postId: number) => {
    try {
      return await Comment.destroy({
        where: { postId },
      });
    } catch (error) {
      throw error;
    }
  };

  deletePostsCommentById = async (postId: number, commentId: number) => {
    try {
      return await Comment.destroy({
        where: { postId, id: commentId },
      });
    } catch (error) {
      throw error;
    }
  };
};

export const commentServices = new CommentsServices();
