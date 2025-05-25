import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getAllCategories } from "@/lib/actions/product.actions";
import { SearchIcon } from "lucide-react";

const Search = async () => {
    const categories = await getAllCategories();
    return ( 
        <form action="/search" method="GET" className="w-full">
            <div className="flex w-full items-center space-x-2">
                <Select name="category">
                    <SelectTrigger className="w-[140px] h-9">
                        <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem key="All" value="all">All Categories</SelectItem>
                        {categories.map((x) => (
                            <SelectItem key={x.category} value={x.category}>
                                {x.category}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <div className="relative flex-1">
                    <Input
                        name="q"
                        type="text"
                        placeholder="Search products..."
                        className="h-9 w-full pl-3 pr-9"
                    />
                    <Button 
                        type="submit" 
                        size="icon" 
                        className="absolute right-0 top-0 h-9 w-9 rounded-l-none"
                    >
                        <SearchIcon className="h-4 w-4"/>
                    </Button>
                </div>
            </div>
        </form>
     );
}
 
export default Search; 