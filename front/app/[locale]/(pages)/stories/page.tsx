import { StoryLibrary } from "@/components/modules/story/library";
import { getSubscription } from "@/actions/subscription";
import MobileHeaderDashboard from "@/components/modules/header/user/mobile";
import LeftSidebarDashboard from "@/components/modules/sidebar/user/dashboard/left";
import RightSidebarDashboard from "@/components/modules/sidebar/user/dashboard/right";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Hikaye Kütüphanesi - TULU",
  description:
    "Küçük kaşifiniz için özenle seçilmiş, eğitici ve eğlenceli hikaye kitaplarına göz atın.",
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

  const subscription = await getSubscription();

  return (
    <div className="flex flex-col md:flex-row h-screen overflow-hidden bg-white">
      <MobileHeaderDashboard />
      <LeftSidebarDashboard />
      
      <main className="flex-1 overflow-y-auto h-full p-4 md:p-8">
        <div className="mx-auto max-w-4xl w-full">
          <StoryLibrary languageId={languageId ?? null} />
        </div>
      </main>
      
      <RightSidebarDashboard subscription={subscription} />
    </div>
  );
}
