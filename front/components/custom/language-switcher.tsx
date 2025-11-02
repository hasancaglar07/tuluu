"use client";
import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { i18n } from "@/i18n-config";
import { FormattedMessage, useIntl } from "react-intl";
// import { useLocalizedRouter } from "@/hooks/useLocalizedRouter";

export default function LanguageCurrency({
  className,
}: {
  className?: string;
}) {
  const router = useRouter();
  const currentPathname = usePathname();
  const { locales } = i18n;
  const { locale } = useIntl();

  const switchLocale = (newLocale: string) => {
    // set cookie for next-i18n-router
    const days = 30;
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    const expires = date.toUTCString();
    document.cookie = `NEXT_LOCALE=${newLocale};expires=${expires};path=/`;

    if (locale === i18n.defaultLocale) {
      //if local current is default there is no local visible so add new local instead of replace
      router.push("/" + newLocale + currentPathname);
    } else {
      // local is visible so replace it only
      router.push(currentPathname.replace(`/${locale}`, `/${newLocale}`));
    }

    router.refresh();
  };

  return (
    <div
      className={cn(
        "w-auto flex items-center flex-wrap justify-center gap-x-2"
      )}
    >
      <span
        className={cn(
          "hidden md:block uppercase tracking-tighter text-gray-400 font-thin"
        )}
      >
        <FormattedMessage id={`header.site_language`} />
      </span>
      <Select onValueChange={(val) => switchLocale(val)} defaultValue={locale}>
        <SelectTrigger className={cn("", className)}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {locales.map((item, idx) => (
            <SelectItem value={item.lang} key={idx}>
              <div className="flex gap-1 justify-start uppercase">
                <Image src={item.image} width={20} height="20" alt="flag" />
                {item.lang}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
