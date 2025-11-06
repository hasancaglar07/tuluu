import { StoryReader } from "@/components/modules/story/reader";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

type ReaderPageProps = {
  params: Promise<{ bookId: string }>;
  searchParams?: Promise<{ languageId?: string | string[] }>;
};

export const metadata: Metadata = {
  title: "Story Reader - TULU",
  description:
    "Flip through beautifully illustrated stories and listen to friendly narration.",
};

export default async function StoryReaderPage({
  params,
  searchParams,
}: ReaderPageProps) {
  const resolvedParams = await params;
  const resolvedSearch = (await searchParams) ?? {};

  const languageParam = resolvedSearch.languageId;
  const languageId = Array.isArray(languageParam)
    ? languageParam[0]
    : languageParam;
  const bookId = resolvedParams.bookId;

  return (
    <section className="py-16">
      <StoryReader languageId={languageId ?? null} bookId={bookId} />
    </section>
  );
}
