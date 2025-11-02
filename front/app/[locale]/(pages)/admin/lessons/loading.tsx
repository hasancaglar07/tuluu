import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function LessonsLoading() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-10 w-[250px]" />
        <Skeleton className="h-4 w-[350px] mt-2" />
      </div>

      <div className="flex gap-2">
        <Skeleton className="h-10 w-[150px]" />
        <Skeleton className="h-10 w-[150px]" />
        <Skeleton className="h-10 w-[150px]" />
        <Skeleton className="h-10 w-[150px]" />
      </div>

      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i} className="overflow-hidden">
          <CardHeader className="p-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-[200px]" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
            <Skeleton className="h-4 w-[300px] mt-2" />
          </CardHeader>

          <CardContent className="p-4 pt-0">
            <div className="mt-4 pl-6 space-y-4">
              <div className="flex justify-between items-center">
                <Skeleton className="h-5 w-[100px]" />
                <Skeleton className="h-8 w-[120px]" />
              </div>

              {Array.from({ length: 2 }).map((_, j) => (
                <Card key={j}>
                  <CardHeader className="p-3">
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-5 w-[180px]" />
                      <Skeleton className="h-8 w-8 rounded-full" />
                    </div>
                    <Skeleton className="h-3 w-[250px] mt-2" />
                  </CardHeader>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
