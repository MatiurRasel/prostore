"use client";

import ProductCard from "@/components/shared/product/product-card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X, TrendingUp, Sparkles } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { FilterSheet } from "@/components/shared/filter-sheet";
import { useToast } from '@/hooks/use-toast';
import { ToastAction } from '@/components/ui/toast';
import { useRouter } from 'next/navigation';
import { Product } from "@/types";
import { motion, AnimatePresence } from "framer-motion";

interface SearchClientProps {
  q: string;
  category: string;
  price: string;
  rating: string;
  sort: string;
  page: string;
  products: (Product & { isAiSuggested?: boolean })[];
  categories: { category: string }[];
  topSearches: string[];
  totalPages: number;
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
  topSearches,
  totalPages,
  sortOrders,
  prices,
  ratings,
}: SearchClientProps) => {
  const { toast } = useToast();
  const router = useRouter();

  const getFilterUrl = ({
    c,
    p,
    s,
    r,
    pg,
    query
  }: {
    c?: string;
    p?: string;
    s?: string;
    r?: string;
    pg?: string;
    query?: string;
  }) => {
    const params = { q: query || q, category, price, rating, sort, page };

    if (c) params.category = c;
    if (s) params.sort = s;
    if (p) params.price = p;
    if (r) params.rating = r;
    if (pg) params.page = pg;

    return `/search?${new URLSearchParams(params).toString()}`;
  };

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
        {/* Desktop Filters */}
        <div className="hidden md:block w-64 space-y-8">
          {/* Trending Searches */}
          {topSearches.length > 0 && (
            <div className="p-4 bg-muted/30 rounded-xl border border-border/50">
              <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                Trending Searches
              </h3>
              <div className="flex flex-wrap gap-2">
                {topSearches.map((s) => (
                  <Link
                    key={s}
                    href={getFilterUrl({ query: s })}
                    className="text-xs px-2.5 py-1.5 rounded-full bg-background border border-border hover:border-primary hover:text-primary transition-all duration-200"
                  >
                    {s}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Category Filters */}
          <div>
            <h3 className="text-sm font-medium mb-4">Department</h3>
            <div className="space-y-1">
              <Link
                href={getFilterUrl({ c: 'all' })}
                className={`block text-sm px-3 py-2 rounded-lg transition-colors ${category === 'all'
                  ? 'bg-primary text-primary-foreground font-medium'
                  : 'hover:bg-muted'
                  }`}
              >
                Any
              </Link>
              {categories.map((x) => (
                <Link
                  key={x.category}
                  href={getFilterUrl({ c: x.category })}
                  className={`block text-sm px-3 py-2 rounded-lg transition-colors ${category === x.category
                    ? 'bg-primary text-primary-foreground font-medium'
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
            <div className="space-y-1">
              <Link
                href={getFilterUrl({ p: 'all' })}
                className={`block text-sm px-3 py-2 rounded-lg transition-colors ${price === 'all'
                  ? 'bg-primary text-primary-foreground font-medium'
                  : 'hover:bg-muted'
                  }`}
              >
                Any
              </Link>
              {prices.map((p) => (
                <Link
                  key={p.value}
                  href={getFilterUrl({ p: p.value })}
                  className={`block text-sm px-3 py-2 rounded-lg transition-colors ${price === p.value
                    ? 'bg-primary text-primary-foreground font-medium'
                    : 'hover:bg-muted'
                    }`}
                >
                  {p.name}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {/* Header & Mobile Filters */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold tracking-tight">
              {q !== 'all' ? `Results for "${q}"` : 'All Products'}
            </h1>
            <div className="md:hidden">
              <FilterSheet
                categories={categories}
                prices={prices}
                ratings={ratings}
                category={category}
                price={price}
                rating={rating}
              />
            </div>
          </div>

          {/* Active Filters Bar */}
          <AnimatePresence>
            {(q !== 'all' || category !== 'all' || price !== 'all' || rating !== 'all') && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-6 p-4 bg-card rounded-xl border shadow-sm flex flex-wrap items-center gap-3"
              >
                <span className="text-sm font-medium text-muted-foreground">Active Filters:</span>
                {q !== 'all' && q !== '' && (
                  <Badge variant="secondary" className="gap-1 px-3 py-1">
                    <span>&quot;{q}&quot;</span>
                    <Link href={getFilterUrl({ query: 'all' })}>
                      <X className="h-3 w-3 hover:text-destructive transition-colors" />
                    </Link>
                  </Badge>
                )}
                {category !== 'all' && category !== '' && (
                  <Badge variant="secondary" className="gap-1 px-3 py-1">
                    <span>{category}</span>
                    <Link href={getFilterUrl({ c: 'all' })}>
                      <X className="h-3 w-3 hover:text-destructive transition-colors" />
                    </Link>
                  </Badge>
                )}
                {price !== 'all' && price !== '' && (
                  <Badge variant="secondary" className="gap-1 px-3 py-1">
                    <span>{price}</span>
                    <Link href={getFilterUrl({ p: 'all' })}>
                      <X className="h-3 w-3 hover:text-destructive transition-colors" />
                    </Link>
                  </Badge>
                )}
                <Button variant="ghost" size="sm" asChild className="ml-auto text-xs h-8">
                  <Link href="/search">Clear All</Link>
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Sort & Info */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div className="text-sm text-muted-foreground font-medium">
              Showing {products.length} {products.length === 1 ? 'product' : 'products'}
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium whitespace-nowrap">Sort by:</span>
              <div className="flex gap-1 bg-muted/50 p-1 rounded-lg border border-border/50">
                {sortOrders.map((s) => (
                  <Link
                    key={s}
                    href={getFilterUrl({ s })}
                    className={`text-xs px-3 py-1.5 rounded-md transition-all ${sort === s
                      ? 'bg-background text-foreground shadow-sm font-semibold'
                      : 'text-muted-foreground hover:text-foreground'
                      }`}
                  >
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <motion.div
            layout
            initial="hidden"
            animate="visible"
            variants={{
              visible: {
                transition: {
                  staggerChildren: 0.05
                }
              }
            }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {products.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="col-span-full text-center py-20 bg-muted/10 rounded-3xl border-2 border-dashed border-border/50"
              >
                <div className="max-w-xs mx-auto">
                  <div className="bg-muted w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                    <X className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">No products found</h3>
                  <p className="text-muted-foreground text-sm">
                    We couldn&apos;t find anything matching your criteria. Try adjusting your search or &quot;Clear All&quot; to start over.
                  </p>
                </div>
              </motion.div>
            ) : (
              products.map((product) => (
                <motion.div
                  layout
                  key={product.id}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0 }
                  }}
                  transition={{ type: "spring", stiffness: 260, damping: 20 }}
                  className="relative group h-full"
                >
                  {product.isAiSuggested && (
                    <div className="absolute -top-2 -left-2 z-10">
                      <Badge className="bg-gradient-to-r from-blue-600 to-indigo-600 text-[10px] px-2 py-0.5 border-none shadow-lg flex items-center gap-1 animate-pulse">
                        <Sparkles className="h-2.5 w-2.5" />
                        AI RELEVANT
                      </Badge>
                    </div>
                  )}
                  <ProductCard
                    product={product}
                    onAddToCart={handleAddToCart}
                  />
                </motion.div>
              ))
            )}
          </motion.div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-12 gap-3 items-center">
              <Button
                variant="outline"
                size="icon"
                asChild
                disabled={Number(page) <= 1}
                className="w-10 h-10 rounded-xl"
              >
                <Link href={getFilterUrl({ pg: (Number(page) - 1).toString() })}>
                  <ChevronLeft className="h-5 w-5" />
                </Link>
              </Button>
              <div className="text-sm font-semibold px-4 py-2 bg-muted/30 rounded-lg">
                Page {page} of {totalPages}
              </div>
              <Button
                variant="outline"
                size="icon"
                asChild
                disabled={Number(page) >= totalPages}
                className="w-10 h-10 rounded-xl"
              >
                <Link href={getFilterUrl({ pg: (Number(page) + 1).toString() })}>
                  <ChevronRight className="h-5 w-5" />
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchClient;