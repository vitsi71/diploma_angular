export interface ArticleType {
  id:string,
  text:string,
  comments:CommentType[],
  commentsCount: number,
  title:string,
  description:string,
  image:string,
  date:Date,
  category:string,
  url:string
}

export interface CommentType {
  id:string,
  text:string,
  date:Date,
  likesCount: number,
  dislikesCount: number,
  user: {
    id: string,
    name: string
  }
}

export interface CommentsType {
  allCount: number,
  comments:CommentType[]
}

