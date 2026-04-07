import { Suspense } from "react";
import { SearchResultsSkeleton } from "@/components/SearchResultsSkeleton";
import SearchPageContent from "./SearchPageContent";

export default function SearchPage() {
  return (
    <Suspense fallback={<SearchResultsSkeleton />}>
      <SearchPageContent />
    </Suspense>
  );
}
