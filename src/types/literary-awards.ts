export type AwardCategory = "grand_prize" | "nominee" | "reader_choice" | "new_writer";

export interface AwardWinner {
  title: string;
  author: string;
  year: number;
  session?: number; // 第○回
  category: AwardCategory;
  genre: "novel" | "manga" | "nonfiction" | "essay" | "mystery" | "sf" | "horror";
  description: string; // 50-100文字の作品紹介
  themes: string[]; // ["恋愛", "歴史", "社会問題"]
  workId?: string;
  amazonKeyword?: string;
}

export interface LiteraryAward {
  id: string; // "honya-taisho"
  name: string; // "本屋大賞"
  officialName?: string;
  description: string; // 100-150文字の賞の説明
  icon: string; // 絵文字
  accentColor: string; // Tailwind color class
  startYear: number;
  frequency: "annual" | "biannual";
  announcementMonth?: number;
  prestige: "major" | "notable";
  winners: AwardWinner[];
}
