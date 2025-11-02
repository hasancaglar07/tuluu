"use client";

import { useLocalizedRouter } from "@/hooks/useLocalizedRouter";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function NoExercises({ lessonId }: { lessonId: string }) {
  const router = useLocalizedRouter();

  const handleGoToDashboard = () => {
    // router.push("/admin/lessons" + lessonId);
    router.push("/dashboard");
  };

  const handleGoToAdminDashboard = () => {
    window.open(`/admin/lessons/${lessonId}`, "_blank");
  };

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 py-16 h-full">
      <Image
        src="https://cdn-icons-png.flaticon.com/128/9018/9018927.png" // Replace with a relevant image or illustration
        alt="No Exercises Available"
        width={150}
        height={150}
      />
      <h2 className="text-2xl font-semibold text-center text-gray-800">
        Aucun exercice disponible pour cette leçon.
      </h2>
      <p className="text-center text-gray-500">
        Cette leçon n’a pas encore d’exercices à compléter. Reviens plus tard ou
        explore d’autres leçons.
      </p>
      <Button onClick={handleGoToDashboard} size="lg" variant="default">
        Retour au tableau de bord
      </Button>

      <Button onClick={handleGoToAdminDashboard} size="lg" variant="secondary">
        Créer des exercices
      </Button>
    </div>
  );
}
