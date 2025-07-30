import { Post } from "./Post.model";
import { User } from "./User.model";

Post.belongsTo(User, { foreignKey: 'authorId', as: 'author' });
User.hasMany(Post, { foreignKey: 'authorId', as: 'posts' });

export {
    User,
    Post
}