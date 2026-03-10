"use client";

import Image from "next/image";
import { FormattedMessage } from "react-intl";
import type { Exercise } from "@/types";

type Props = {
  exercise: Exercise;
};

export default function EducationDisplay({ exercise }: Props) {
  const type = exercise?.type || "";
  const content: any = (exercise as any).educationContent || {};

  if (!type.startsWith("education_")) return null;

  if (type === "education_visual") {
    const gallery: string[] = Array.isArray(content.gallery) ? content.gallery : [];
    return (
      <div className="w-full max-w-4xl space-y-6">
        <div className="rounded-[32px] border bg-gradient-to-br from-white to-[#f1f4ff] shadow-xl p-6 flex flex-col md:flex-row items-center gap-6">
          <div className="flex-1 space-y-3 text-left">
            <p className="text-xs font-semibold text-purple-500 uppercase tracking-wider">
              <FormattedMessage id="lesson.newWord" defaultMessage="NEW WORD" />
            </p>
            {content.title && <h3 className="text-2xl font-semibold text-slate-900">{content.title}</h3>}
            {content.description && (
              <p className="text-base text-slate-700 whitespace-pre-wrap">{content.description}</p>
            )}
            {content.narrationAudioUrl && (
              <audio controls className="w-full mt-2">
                <source src={content.narrationAudioUrl} />
              </audio>
            )}
          </div>
          {content.imageUrl && (
            <div className="w-full md:w-64 aspect-square relative rounded-[28px] border bg-white shadow-inner overflow-hidden">
              <Image
                src={content.imageUrl}
                alt={content.title || "visual"}
                fill
                style={{ objectFit: "cover" }}
              />
            </div>
          )}
        </div>
        {gallery.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {gallery.map((img, idx) => (
              <div key={img + idx} className="relative w-full aspect-square rounded-2xl border overflow-hidden">
                <Image src={img} alt={`gallery-${idx + 1}`} fill style={{ objectFit: "cover" }} />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (type === "education_image_intro") {
    const cards = content.cards || [];
    return (
      <div className="w-full max-w-3xl space-y-4">
        {content.title && <h3 className="text-xl font-semibold text-center">{content.title}</h3>}
        {content.subtitle && <p className="text-center text-gray-600">{content.subtitle}</p>}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {cards.map((c: any, idx: number) => (
            <div key={idx} className="rounded-xl border p-3 space-y-2 text-center">
              {c.imageUrl && (
                <div className="relative w-full aspect-square overflow-hidden rounded-lg">
                  <Image src={c.imageUrl} alt={c.text || `card-${idx + 1}`} fill style={{ objectFit: "cover" }} />
                </div>
              )}
              {c.text && <div className="font-medium">{c.text}</div>}
              {c.audioUrl && (
                <audio controls className="w-full">
                  <source src={c.audioUrl} />
                </audio>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (type === "education_audio") {
    return (
      <div className="w-full max-w-2xl space-y-4 text-center">
        {content.title && <h3 className="text-xl font-semibold">{content.title}</h3>}
        {content.instructionText && <p className="text-gray-600">{content.instructionText}</p>}
        {content.audioUrl && (
          <audio controls autoPlay className="w-full">
            <source src={content.audioUrl} />
          </audio>
        )}
        {content.contentText && (
          <p className="text-base text-gray-700 whitespace-pre-wrap">{content.contentText}</p>
        )}
      </div>
    );
  }

  if (type === "education_video") {
    return (
      <div className="w-full max-w-3xl space-y-4 text-center">
        {content.title && <h3 className="text-xl font-semibold">{content.title}</h3>}
        {content.videoUrl && (
          <video controls poster={content.coverImageUrl} className="w-full rounded-xl border">
            <source src={content.videoUrl} />
          </video>
        )}
        {content.captions && (
          <p className="text-sm text-gray-600 whitespace-pre-wrap">{content.captions}</p>
        )}
      </div>
    );
  }

  if (type === "education_tip") {
    return (
      <div className="w-full max-w-2xl space-y-3 text-center rounded-xl border p-6" style={{ background: content.backgroundColor || undefined }}>
        {content.title && <h3 className="text-lg font-semibold">{content.title}</h3>}
        {content.content && <p className="text-base text-gray-700 whitespace-pre-wrap">{content.content}</p>}
        {content.sampleAudioUrl && (
          <audio controls className="w-full">
            <source src={content.sampleAudioUrl} />
          </audio>
        )}
      </div>
    );
  }

  return null;
}
