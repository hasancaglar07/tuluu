import { StoryLibrary } from "@/components/modules/story/library";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Story Library - TULU",
  description:
    "Browse engaging picture books tailored for your little learner.",
};

export default async function StoriesPage({
  searchParams,
}: {
  searchParams?: Promise<{ languageId?: string | string[] }>;
}) {
  const resolvedParams = (await searchParams) ?? {};
  const languageParam = resolvedParams.languageId;
  const languageId = Array.isArray(languageParam)
    ? languageParam[0]
    : languageParam;

  return (
    <section className="py-16">
      <StoryLibrary languageId={languageId ?? null} />
    </section>
  );
}
