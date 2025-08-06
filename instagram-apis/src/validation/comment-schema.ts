// libs
import { z } from "zod";

import { REQUIRED_MESSAGE, MESSAGES_VALIDATION } from "@/constants";

export const commentSchema = z.object({
  postId: z.coerce.number().refine(val => !isNaN(val), {
    message: MESSAGES_VALIDATION.INVALID_ID_NUMBER
  }),
  authorId: z.coerce.number().refine(val => !isNaN(val), {
    message: MESSAGES_VALIDATION.INVALID_AUTHOR_ID
  }),
  content: z.string().min(1, REQUIRED_MESSAGE("content")),
});

export const updateCommentSchema = commentSchema.partial().extend({
  id: z.coerce.number().refine(val => !isNaN(val), {
    message: MESSAGES_VALIDATION.INVALID_ID_NUMBER
  })
});
