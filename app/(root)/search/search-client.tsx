"use client";

import ProductCard from "@/components/shared/product/product-card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { FilterSheet } from "@/components/shared/filter-sheet";
import { useToast } from '@/hooks/use-toast';
import { ToastAction } from '@/components/ui/toast';
import { useRouter } from 'next/navigation';
import { Product } from "@/types";

interface SearchClientProps {
  q: string;
  category: string;
  price: string;
  rating: string;
  sort: string;
  page: string;
  products: Product[];
  categories: { category: string }[];
  totalPages: number;
  getFilterUrl: (args: { c?: string; p?: string; s?: string; r?: string; pg?: string }) => string;
  sortOrders: string[];
  prices: { name: string; value: string }[];
  ratings: number[];
}

const SearchClient = ({
  q,
  category,
  price,
  rating,
  sort,
  page,
  products,
  categories,
  totalPages,
  getFilterUrl,
  sortOrders,
  prices,
  ratings,
}: SearchClientProps) => {
  const { toast } = useToast();
  const router = useRouter();

  const handleAddToCart = () => {
    toast({
      description: 'Added to cart successfully',
      action: (
        <ToastAction
          className="bg-primary text-white hover:bg-gray-800"
          altText="Go To Cart"
          onClick={() => router.push('/cart')}
        >
          Go To Cart
        </ToastAction>
      )
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Mobile Filter Button */}
        <div className="flex items-center justify-between md:hidden">
          <h2 className="text-lg font-semibold">Filters</h2>
          <FilterSheet
            categories={categories}
            prices={prices}
            ratings={ratings}
            category={category}
            price={price}
            rating={rating}
          />
        </div>

        {/* Desktop Filters */}
        <div className="hidden md:block w-64 space-y-8">
          {/* Category Filters */}
          <div>
            <h3 className="text-sm font-medium mb-4">Department</h3>
            <div className="space-y-3">
              <Link
                href={getFilterUrl({ c: 'all' })}
                className={`block text-sm px-3 py-2 rounded-md ${
                  category === 'all'
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted'
                }`}
              >
                Any
              </Link>
              {categories.map((x) => (
                <Link
                  key={x.category}
                  href={getFilterUrl({ c: x.category })}
                  className={`block text-sm px-3 py-2 rounded-md ${
                    category === x.category
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted'
                  }`}
                >
                  {x.category}
                </Link>
              ))}
            </div>
          </div>

          {/* Price Filters */}
          <div>
            <h3 className="text-sm font-medium mb-4">Price</h3>
            <div className="space-y-3">
              <Link
                href={getFilterUrl({ p: 'all' })}
                className={`block text-sm px-3 py-2 rounded-md ${
                  price === 'all'
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted'
                }`}
              >
                Any
              </Link>
              {prices.map((p) => (
                <Link
                  key={p.value}
                  href={getFilterUrl({ p: p.value })}
                  className={`block text-sm px-3 py-2 rounded-md ${
                    price === p.value
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted'
                  }`}
                >
                  {p.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Rating Filters */}
          <div>
            <h3 className="text-sm font-medium mb-4">Customer Ratings</h3>
            <div className="space-y-3">
              <Link
                href={getFilterUrl({ r: 'all' })}
                className={`block text-sm px-3 py-2 rounded-md ${
                  rating === 'all'
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted'
                }`}
              >
                Any
              </Link>
              {ratings.map((r) => (
                <Link
                  key={r}
                  href={getFilterUrl({ r: `${r}` })}
                  className={`block text-sm px-3 py-2 rounded-md ${
                    rating === r.toString()
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted'
                  }`}
                >
                  {`${r} stars & up`}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {/* Active Filters */}
          {(q !== 'all' || category !== 'all' || price !== 'all' || rating !== 'all') && (
            <div className="mb-6 p-4 bg-card rounded-lg border shadow-sm">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-sm font-medium">Active Filters:</span>
                {q !== 'all' && q !== '' && (
                  <Badge variant="secondary" className="gap-1">
                    <span>Query: {q}</span>
                    <Link href={getFilterUrl({})}>
                      <X className="h-3 w-3" />
                    </Link>
                  </Badge>
                )}
                {category !== 'all' && category !== '' && (
                  <Badge variant="secondary" className="gap-1">
                    <span>Category: {category}</span>
                    <Link href={getFilterUrl({ c: 'all' })}>
                      <X className="h-3 w-3" />
                    </Link>
                  </Badge>
                )}
                {price !== 'all' && price !== '' && (
                  <Badge variant="secondary" className="gap-1">
                    <span>Price: {price}</span>
                    <Link href={getFilterUrl({ p: 'all' })}>
                      <X className="h-3 w-3" />
                    </Link>
                  </Badge>
                )}
                {rating !== 'all' && rating !== '' && (
                  <Badge variant="secondary" className="gap-1">
                    <span>Rating: {rating} stars & up</span>
                    <Link href={getFilterUrl({ r: 'all' })}>
                      <X className="h-3 w-3" />
                    </Link>
                  </Badge>
                )}
                <Button variant="ghost" size="sm" asChild className="ml-auto">
                  <Link href="/search">Clear All</Link>
                </Button>
              </div>
            </div>
          )}

          {/* Sort Options */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 p-4 bg-card rounded-lg border shadow-sm">
            <div className="text-sm text-muted-foreground">
              {products.length} products found
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <span className="text-sm font-medium">Sort by:</span>
              <div className="flex flex-wrap gap-2">
                {sortOrders.map((s) => (
                  <Link
                    key={s}
                    href={getFilterUrl({ s })}
                    className={`text-sm px-3 py-1.5 rounded-md transition-colors ${
                      sort === s
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted hover:bg-muted/80'
                    }`}
                  >
                    {s}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <h3 className="text-lg font-medium">No products found</h3>
                <p className="text-muted-foreground mt-2">
                  Try adjusting your search or filter criteria
                </p>
              </div>
            ) : (
              products.map((product) => (
                <ProductCard key={product.id} product={product} onAddToCart={() => handleAddToCart()} />
              ))
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="icon"
                  asChild
                  disabled={Number(page) <= 1}
                  className="h-9 w-9"
                >
                  <Link href={getFilterUrl({ pg: (Number(page) - 1).toString() })}>
                    <ChevronLeft className="h-4 w-4" />
                  </Link>
                </Button>
                <span className="text-sm font-medium">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  asChild
                  disabled={Number(page) >= totalPages}
                  className="h-9 w-9"
                >
                  <Link href={getFilterUrl({ pg: (Number(page) + 1).toString() })}>
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchClient; 