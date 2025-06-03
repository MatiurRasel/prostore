import ProductList from "@/components/shared/product/product-list";
import { getLatestProducts, getFeaturedProducts } from "@/lib/actions/product.actions";
import ProductCarousel from "@/components/shared/product/product-carousel";
import ViewAllProductsButton from "@/components/view-all-products-button";
import IconBoxes from "@/components/icon-boxes";
import DealCountdown from "@/components/deal-countdown";

const Homepage = async () => {
  const latestProducts = await getLatestProducts();
  const featuredProducts = await getFeaturedProducts();
  // Ensure only plain objects are passed to Client Components
  const plainLatestProducts = JSON.parse(JSON.stringify(latestProducts));
  const plainFeaturedProducts = JSON.parse(JSON.stringify(featuredProducts));
  return ( 
  <>
    {plainFeaturedProducts.length > 0 && 
      <ProductCarousel data={plainFeaturedProducts} />
    }
    <ProductList 
      data={plainLatestProducts} 
      title={'Newest Arrivals'}
      limit={4}>
    </ProductList> 
    <ViewAllProductsButton />
    <DealCountdown/>
    <IconBoxes/>
  </>
  );
}
 
export default Homepage;