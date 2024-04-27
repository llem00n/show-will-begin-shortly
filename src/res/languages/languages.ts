import { uk } from "./uk";

export type MessageTitle =
  | "error.save_corrupted"
  | "error.save_corrupted_desc"
  | "error.no_saved_game_available"
  | "dialog.classroom-intro.teacher.replica #1"
  | "dialog.classroom-intro.kira.replica #1"
  | "dialog.classroom-intro.teacher.name"
  | "dialog.classroom-intro.kira.name"
  | "dialog.classroom-intro.teacher.replica #2"
  | "dialog.classroom-intro.kira.replica #2"
  | "dialog.classroom-intro.teacher.replica #3"
  | "dialog.classroom-intro.???.name"
  | "dialog.classroom-intro.???.replica #1"
  | "dialog.classroom-intro.???.replica #2"
  | "dialog.classroom-intro.???.replica #3"
  | "dialog.classroom-intro.???.replica #4"
  | "street.run-for-your-life"
  | "street.clowns-are-bad"
  | "goods.banana.name"
  | "goods.banana.desc"
  | "goods.muffinRecipe.name"
  | "goods.muffinRecipe.desc"
  | "goods.bomb.name"
  | "goods.bomb.desc"
  | "party.alex.name"
  | "party.alex.replica #1"
  | "party.alex.replica #2"
  | "party.alex.replica #3"
  | "party.gorilla.name"
  | "party.gorilla.replica #1"
  | "party.alex.replica #4"

export type LanguagePack = Record<MessageTitle, string>;
export type LanguagePackName = "uk";

export const LANGUAGE_PACKS: Record<LanguagePackName, LanguagePack> = {
  uk,
};
