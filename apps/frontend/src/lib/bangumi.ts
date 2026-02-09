const BGM_API = "https://api.bgm.tv";
const BGM_USERNAME = "shenley";

// SubjectType: 2=anime, 4=game
// CollectionType: 1=wish, 2=done, 3=doing

export interface BangumiSubject {
  id: number;
  name: string;
  name_cn: string;
  images: {
    large: string;
    common: string;
    medium: string;
    small: string;
    grid: string;
  } | null;
  short_summary: string;
  score: number;
  rank: number;
  date?: string;
}

export interface BangumiCollection {
  subject_id: number;
  subject_type: number;
  rate: number;
  type: number;
  comment?: string;
  updated_at: string;
  subject: BangumiSubject;
}

export interface BangumiPagedCollection {
  total: number;
  limit: number;
  offset: number;
  data: BangumiCollection[];
}

export type CollectionType = "wish" | "doing" | "done";

const collectionTypeMap: Record<CollectionType, number> = {
  wish: 1,
  done: 2,
  doing: 3,
};

export async function fetchBangumiCollections(
  subjectType: 2 | 4,
  collectionType: CollectionType,
  limit: number = 10,
  offset: number = 0,
): Promise<BangumiPagedCollection> {
  const type = collectionTypeMap[collectionType];
  const url = `${BGM_API}/v0/users/${BGM_USERNAME}/collections?subject_type=${subjectType}&type=${type}&limit=${limit}&offset=${offset}`;

  const res = await fetch(url, {
    headers: {
      "User-Agent": "shenlye/Tricore (https://github.com/shenlye/Tricore)",
    },
    next: { revalidate: 3600 },
  });

  if (!res.ok) {
    throw new Error(`Bangumi API error: ${res.status}`);
  }

  return res.json();
}
