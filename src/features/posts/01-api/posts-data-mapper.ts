import {PostDocument} from "../03-domain/post-db-model";
import {PostMongoType} from "../types/dto";
import {PostViewModel} from "../types/post-view-model";

export class PostsDataMapper {
  constructor() {}
  static toPostView(postDoc: PostMongoType | PostDocument): PostViewModel {
    return {
      id: postDoc._id.toString(),
      title: postDoc.title,
      shortDescription: postDoc.shortDescription,
      content: postDoc.content,
      blogId: postDoc.blogId,
      blogName: postDoc.blogName,
      createdAt: postDoc.createdAt?.toString(),
    };
  }
}
