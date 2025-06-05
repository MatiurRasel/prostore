import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

const SearchLoading = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Mobile Filter Button Skeleton */}
        <div className="flex items-center justify-between md:hidden">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-10 w-32" />
        </div>

        {/* Desktop Filters Skeleton */}
        <div className="hidden md:block w-64 space-y-8">
          {[1, 2, 3].map((i) => (
            <div key={i}>
              <Skeleton className="h-6 w-32 mb-4" />
              <div className="space-y-3">
                {[1, 2, 3, 4].map((j) => (
                  <Skeleton key={j} className="h-10 w-full" />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Main Content Skeleton */}
        <div className="flex-1">
          {/* Active Filters Skeleton */}
          <div className="mb-6 p-4 bg-card rounded-lg border shadow-sm">
            <Skeleton className="h-8 w-full" />
          </div>

          {/* Sort Options Skeleton */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 p-4 bg-card rounded-lg border shadow-sm">
            <Skeleton className="h-6 w-32" />
            <div className="flex gap-2">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-8 w-20" />
              ))}
            </div>
          </div>

          {/* Products Grid Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
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

          {/* Pagination Skeleton */}
          <div className="flex justify-center mt-8">
            <div className="flex items-center gap-4">
              <Skeleton className="h-9 w-9" />
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-9 w-9" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchLoading; 