import { MESSAGES_VALIDATION } from "@/constants";
import { Post } from "@/models";
import { IPostAttributes } from "@/models/Post.model";
import { findAllData } from "@/utils";

class PostServices {
  getAll = async (offset: number, limit: number) => {
    try {
      return await findAllData({
        model: Post,
        offset,
        limit,
        order: ['createdAt', 'DESC'],
      });
    } catch (error) {
      throw error;
    }
  };

  existSlug = async (slug: string) => {
    try {
      return await Post.findOne({ where: { slug }});
    } catch (error: unknown) {
      throw error;
    }
  };

  create = async (payload: IPostAttributes) => {
    try {
      return await Post.create(payload);
    } catch (error: unknown) {
      throw error;
    }
  };

  get = async (postId: number) => {
    try {
      return await Post.findByPk(postId)
    } catch (error) {
      throw error;
    }
  };

  getPostByAuthorId = async (userId: number, postId: number) => {
    try {
      return await Post.findOne({
        where: {
          id: postId,
          authorId: userId
        }
      })
    } catch (error: unknown) {
      throw error;
    }
  };

  update = async (post: Post, payload: IPostAttributes) => {
    try {
      // validate slug unique
      const existSlugPost = await Post.findOne({ where: { slug: payload.slug }});

      if (existSlugPost) {
        return { message: MESSAGES_VALIDATION.INVALID_SLUG_POST }
      }
      await post.update(payload);

      return { message: '' };
    } catch (error: unknown) {
      throw error;
    }
  };

  deletePosts = async () => {
    try {
      return await Post.destroy({
        where: {},
        truncate: true
      })
    } catch (error: unknown) {
      throw error;
    }
  };

  deleteUsersPostById = async (
    postId: number,
    currentUserId: number,
    isAdminUser: boolean,
    userIdNumber: number
  ) => {
    try {
      return await Post.destroy({
        where: { id: postId }
      });
    } catch (error: unknown) {
      throw error;
    }
  }
};

export const postService = new PostServices();
