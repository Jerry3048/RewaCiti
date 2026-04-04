import { Skeleton } from "./Skeleton";

export function PropertyCardSkeleton() {
  return (
    <div className="bg-white/90 dark:bg-[#1A1A1A] border border-purple-100 dark:border-gray-600/30 rounded-xl p-2 animate-pulse">
      <Skeleton className="w-full h-70 rounded-lg mb-4" />
      <Skeleton className="h-6 w-3/4 mb-2" />
      <Skeleton className="h-4 w-1/2 mb-4" />
      <div className="space-y-2 mb-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
      <div className="grid grid-cols-3 gap-2 mb-4">
        <Skeleton className="h-8 rounded-2xl" />
        <Skeleton className="h-8 rounded-2xl" />
        <Skeleton className="h-8 rounded-2xl" />
      </div>
      <div className="flex justify-between items-center">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-8 w-32 rounded-lg" />
      </div>
    </div>
  );
}

export function CommentCardSkeleton() {
  return (
    <div className="rounded-xl p-5 bg-white/90 dark:bg-[#1A1A1A] border border-purple-100 dark:border-gray-600/30 animate-pulse">
      <Skeleton className="h-6 w-24 mb-4" />
      <Skeleton className="h-6 w-3/4 mb-2" />
      <div className="space-y-2 mb-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
      <div className="flex items-center gap-3 mt-4">
        <Skeleton className="w-12 h-12 rounded-full" />
        <div className="flex-1">
          <Skeleton className="h-4 w-24 mb-2" />
          <Skeleton className="h-3 w-32" />
        </div>
      </div>
    </div>
  );
}

export function FAQCardSkeleton() {
  return (
    <div className="bg-white/90 dark:bg-[#1A1A1A] border border-purple-100 dark:border-gray-600/30 rounded-xl p-5 animate-pulse">
      <Skeleton className="h-6 w-3/4 mb-4" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
      <Skeleton className="h-8 w-24 rounded-md mt-4" />
    </div>
  );
}

export function PropertyDetailsSkeleton() {
    return (
      <div className="bg-gray-300 dark:bg-[#0F0F0F] min-h-screen animate-pulse">
        <div className="w-[95%] mx-auto py-8">
          <Skeleton className="h-10 w-1/2 mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Skeleton className="h-[400px] rounded-xl" />
            <div className="space-y-6">
              <Skeleton className="h-8 w-1/3" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <Skeleton className="h-20 rounded-xl" />
                <Skeleton className="h-20 rounded-xl" />
                <Skeleton className="h-20 rounded-xl" />
              </div>
              <Skeleton className="h-12 w-full rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }
