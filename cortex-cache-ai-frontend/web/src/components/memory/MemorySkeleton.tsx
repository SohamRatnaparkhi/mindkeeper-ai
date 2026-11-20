export const MemorySkeleton = () => (
    <div className="bg-white bg-opacity-10 backdrop-blur-sm p-6 rounded-lg animate-pulse">
        <div className="h-6 bg-purple-300 bg-opacity-30 rounded w-3/4 mb-4"></div>
        <div className="space-y-2">
            <div className="h-4 bg-gray-300 bg-opacity-30 rounded w-full"></div>
            <div className="h-4 bg-gray-300 bg-opacity-30 rounded w-5/6"></div>
            <div className="h-4 bg-gray-300 bg-opacity-30 rounded w-4/6"></div>
        </div>
        <div className="flex justify-end mt-4">
            <div className="h-5 w-5 bg-purple-300 bg-opacity-30 rounded"></div>
        </div>
    </div>
)