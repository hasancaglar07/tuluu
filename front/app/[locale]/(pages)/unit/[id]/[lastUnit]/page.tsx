import { checkLastUnitIsCompleted } from "@/actions/userprogress";
import Container from "@/components/custom/container";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

// Nextjs ISR caching strategy
export const revalidate = false;

export default async function page({
  params,
}: {
  params: Promise<{ id: string; lastUnit: string }>;
}) {
  const { id, lastUnit } = await params; // Unwrapping the promise

  //server action check if last unit is completed
  const check = await checkLastUnitIsCompleted(id);

  return (
    <section className="min-h-screen flex flex-col">
      <main className="flex-1 flex items-center justify-center">
        <Container>
          <div className="flex flex-col items-center justify-center gap-6 py-20 text-center">
            <div className="mb-4">
              <Image
                src="https://cdn-icons-png.flaticon.com/128/6778/6778935.png"
                alt="Unit illustration"
                className="rounded-lg shadow-lg mx-auto object-scale-down"
                width={300}
                height={200}
              />
            </div>
            <h1 className="text-3xl font-bold">Welcome to the Unit</h1>
            <p className="text-lg text-gray-600">
              {check
                ? "Congratulation you can move to the next Unit, let's go"
                : "You did not finish the last Unit so you need to pass this test to jump ahead to the next !"}
            </p>
          </div>
        </Container>
      </main>

      <footer className="mt-auto border-t  border-t-border bg-background">
        <Container>
          <div className="flex justify-between items-center py-6">
            <Link
              href="/dashboard"
              className="text-secondary-500 uppercase hover:text-secondary-600 transition-colors"
            >
              maybe later
            </Link>
            <Button asChild variant="secondary">
              <Link
                href={check ? `/dashboard` : `/unit/${id}/${lastUnit}/test`}
                className="text-white"
              >
                Pass the test
              </Link>
            </Button>
          </div>
        </Container>
      </footer>
    </section>
  );
}

// Nextjs dynamic metadata
export function generateMetadata() {
  return {
    title: `Page - Title here`,
    description: `Page - Description here`,
    icons: {
      icon: `path to asset file`,
    },
  };
}
