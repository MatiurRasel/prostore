import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

const HomeLoading = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Featured Products Carousel Skeleton */}
      <div className="mb-12">
        <Skeleton className="h-[400px] w-full rounded-lg" />
      </div>

      {/* Newest Arrivals Section */}
      <div className="my-10">
        <Skeleton className="h-8 w-48 mb-4" />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="w-full">
              <CardContent className="p-4">
                <Skeleton className="h-48 w-full mb-4" />
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-6 w-3/4 mb-4" />
                <div className="flex justify-between items-center">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-8 w-24" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Deal Countdown Skeleton */}
      <div className="my-10">
        <Skeleton className="h-[200px] w-full rounded-lg" />
      </div>

      {/* Icon Boxes Skeleton */}
      <div className="my-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomeLoading; 