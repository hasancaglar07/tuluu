"use client";

import { checkLastUnitIsCompleted } from "@/actions/userprogress";
import Container from "@/components/custom/container";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { useIntl } from "react-intl";
import { useEffect, useState } from "react";

export default function Page({
  params,
}: {
  params: Promise<{ id: string; lastUnit: string }>;
}) {
  const intl = useIntl();
  const [id, setId] = useState<string>("");
  const [lastUnit, setLastUnit] = useState<string>("");
  const [check, setCheck] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadParams() {
      const resolvedParams = await params;
      setId(resolvedParams.id);
      setLastUnit(resolvedParams.lastUnit);

      // Check if last unit is completed
      const isCompleted = await checkLastUnitIsCompleted(resolvedParams.id);
      setCheck(isCompleted);
      setLoading(false);
    }
    loadParams();
  }, [params]);

  if (loading) {
    return null;
  }

  return (
    <section className="min-h-screen flex flex-col">
      <main className="flex-1 flex items-center justify-center">
        <Container>
          <div className="flex flex-col items-center justify-center gap-6 py-20 text-center">
            <div className="mb-4">
              <Image
                src="https://cdn-icons-png.flaticon.com/128/6778/6778935.png"
                alt={intl.formatMessage({ id: "unit.image.alt" })}
                className="rounded-lg shadow-lg mx-auto object-scale-down"
                width={300}
                height={200}
              />
            </div>
            <h1 className="text-3xl font-bold">
              {intl.formatMessage({ id: "unit.welcome.title" })}
            </h1>
            <p className="text-lg text-gray-600">
              {check
                ? intl.formatMessage({ id: "unit.congratulations" })
                : intl.formatMessage({ id: "unit.incomplete" })}
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
              {intl.formatMessage({ id: "unit.maybeLater" })}
            </Link>
            <Button asChild variant="secondary">
              <Link
                href={check ? `/dashboard` : `/unit/${id}/${lastUnit}/test`}
                className="text-white"
              >
                {intl.formatMessage({ id: "unit.passTest" })}
              </Link>
            </Button>
          </div>
        </Container>
      </footer>
    </section>
  );
}
