export type SocialLike = {
  id_like: number;
  id_sesion: number;
  author_uid: string;
  created_at: string;
};

export type SocialComment = {
  id_comment: number;
  id_sesion: number;
  author_uid: string;
  texto: string;
  created_at: string;
  updated_at: string | null;
};

export type LikesSummary = {
  id_sesion: number;
  count: number;
  likedByMe: boolean;
};

export type CommentInput = {
  texto: string;
};
