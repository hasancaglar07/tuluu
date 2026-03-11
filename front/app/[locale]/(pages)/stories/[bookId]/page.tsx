import { StoryReader } from "@/components/modules/story/reader";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

type ReaderPageProps = {
  params: Promise<{ bookId: string }>;
  searchParams?: Promise<{ languageId?: string | string[] }>;
};

export const metadata: Metadata = {
  title: "Hikaye Oku - TULU",
  description:
    "Güzelce resmedilmiş hikayelerin sayfalarını çevirin ve samimi bir anlatımla dinleyin.",
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
    <div className="h-screen h-[100dvh] w-full bg-white overflow-hidden absolute inset-0 z-50">
      <StoryReader languageId={languageId ?? null} bookId={bookId} />
    </div>
  );
}
