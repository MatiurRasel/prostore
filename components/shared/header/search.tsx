import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getAllCategories, getTopSearchQueries } from "@/lib/actions/product.actions";
import SearchInput from "./search-input";

const Search = async () => {
    const categories = await getAllCategories();
    const topSearches = await getTopSearchQueries(5);

    return (
        <div className="w-full">
            <div className="flex w-full items-center space-x-2">
                <Select name="category">
                    <SelectTrigger className="w-[140px] h-9 rounded-lg border-muted-foreground/20 bg-background/50 hover:bg-background transition-colors">
                        <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-border/50 shadow-xl">
                        <SelectItem key="All" value="all">All Categories</SelectItem>
                        {categories.map((x: { category: string }) => (
                            <SelectItem key={x.category} value={x.category}>
                                {x.category}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <SearchInput topSearches={topSearches} />
            </div>
        </div>
    );
}

export default Search;