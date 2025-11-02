import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function QuestsLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-[250px]" />
          <Skeleton className="h-4 w-[350px] mt-2" />
        </div>
        <Skeleton className="h-10 w-[150px]" />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <Skeleton className="h-4 w-[120px]" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-[60px]" />
            <Skeleton className="h-4 w-[100px] mt-1" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <Skeleton className="h-4 w-[150px]" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-[60px]" />
            <Skeleton className="h-4 w-[100px] mt-1" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <Skeleton className="h-4 w-[130px]" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-[60px]" />
            <Skeleton className="h-4 w-[100px] mt-1" />
          </CardContent>
        </Card>
      </div>

      <div className="space-y-2">
        <div className="flex">
          <Skeleton className="h-10 w-[300px]" />
        </div>

        <div className="space-y-4 mt-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <div className="flex flex-col md:flex-row">
                <div className="flex-1 p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Skeleton className="h-6 w-[200px]" />
                      </div>
                      <Skeleton className="h-4 w-[350px] mt-1" />
                    </div>
                    <Skeleton className="h-8 w-8 rounded-md" />
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    <div>
                      <Skeleton className="h-3 w-[40px]" />
                      <Skeleton className="h-4 w-[80px] mt-1" />
                    </div>
                    <div>
                      <Skeleton className="h-3 w-[40px]" />
                      <Skeleton className="h-4 w-[80px] mt-1" />
                    </div>
                    <div>
                      <Skeleton className="h-3 w-[40px]" />
                      <Skeleton className="h-4 w-[80px] mt-1" />
                    </div>
                    <div>
                      <Skeleton className="h-3 w-[40px]" />
                      <Skeleton className="h-4 w-[120px] mt-1" />
                    </div>
                  </div>
                </div>

                <div className="bg-muted p-6 md:w-[200px]">
                  <Skeleton className="h-3 w-[80px]" />
                  <Skeleton className="h-8 w-[60px] mt-1" />
                  <Skeleton className="h-3 w-[40px] mt-4" />
                  <Skeleton className="h-4 w-[80px] mt-1" />
                  <Skeleton className="h-8 w-[100px] mt-4" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
