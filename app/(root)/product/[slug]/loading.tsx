import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

const ProductLoading = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
        {/* Images Column */}
        <div className="col-span-2">
          <Skeleton className="h-[400px] w-full rounded-lg mb-4" />
          <div className="flex gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-24 w-24 rounded-lg" />
            ))}
          </div>
        </div>

        {/* Details Column */}
        <div className="col-span-2 p-5">
          <div className="flex flex-col gap-6">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-8 w-3/4" />
            <div className="flex flex-col gap-2">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-4 w-32" />
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <Skeleton className="h-8 w-32" />
            </div>
          </div>
          <div className="mt-10">
            <Skeleton className="h-6 w-48 mb-4" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>

        {/* Action Column */}
        <div>
          <Card>
            <CardContent className="p-4">
              <div className="mb-2 flex justify-between">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-24" />
              </div>
              <div className="mb-2 flex justify-between">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-6 w-24" />
              </div>
              <div className="flex-center mt-4">
                <Skeleton className="h-10 w-full" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-16">
        <Skeleton className="h-8 w-48 mb-4" />
        <Skeleton className="h-4 w-64 mb-8" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full mb-4" />
                <div className="flex space-x-4">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-40" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductLoading; 