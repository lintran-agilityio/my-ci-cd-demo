import { Post } from "@/models";
import { IPostAttributes } from "@/models/Post.model";
import { findAllData } from "@/utils";

class PostServices {
  getAll = async (offset: number, limit: number) => {
    try {
      return findAllData({
        model: Post,
        offset,
        limit,
        order: ['createdAt', 'DESC'],
        fieldOmit: "password"
      });
    } catch (error) {
      throw error;
    }
  };

  existSlug = async (slug: string) => {
    try {
      return Post.findOne({ where: { slug }});
    } catch (error) {
      console.log('error',error)
      throw error;
    }
  };

  create = async (payload: IPostAttributes) => {
    try {
      return await Post.create(payload);
    } catch (error: any) {
      console.log('Post creation error:', error);
      console.log('Error name:', error.name);
      console.log('Error message:', error.message);
      if (error.errors) {
        console.log('Validation errors:', error.errors);
      }
      throw error;
    }
  };
};

export const postService = new PostServices();
