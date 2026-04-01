import Navbar from "../../../shared/components/Layout/Navbar";
import { useEffect } from "react";
import { usePropertyStore } from "../store/usePropertyStore";
import type { Property } from "../../../types";
import PropertyCard from "../components/PropertyCard";
import Footer from "../../../shared/components/Layout/Footer";
import { FiArrowLeft, FiArrowRight, FiSearch } from "react-icons/fi";

function AllProperties() {
  const { filteredProperties, loading, fetchProperties, apiPage, totalProperties, searchQuery, setSearchQuery } = usePropertyStore();

  useEffect(() => {
    fetchProperties(apiPage);
  }, [fetchProperties,apiPage]);

  const totalApiPages = Math.ceil(totalProperties / 30);

  const handleNextPage = () => {
    if (apiPage < totalApiPages) {
      fetchProperties(apiPage + 1);
      window.scrollTo(0, 0);
    }
  };

  const handlePrevPage = () => {
    if (apiPage > 1) {
      fetchProperties(apiPage - 1);
      window.scrollTo(0, 0);
    }
  };

  if (loading) return <p className="text-center text-white py-10">Loading properties...</p>;

  return (
    <div className="bg-gray-300 dark:bg-black/30 min-h-screen">
      <Navbar />
      <div className="w-[98%] mx-auto px-2 py-8 ">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">All Properties</h1>
          
          <div className="relative w-full md:w-80">
            <input
              type="text"
              placeholder="Search properties..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-500 dark:border-gray-700 rounded-xl focus:outline-none bg-gray-100 dark:bg-neutral-800 text-gray-900 dark:text-white transition-all shadow-sm"
            />
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          </div>
        </div>
        
        {filteredProperties.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-neutral-900 rounded-2xl border border-gray-200 dark:border-gray-800">
             <FiSearch size={48} className="mx-auto text-gray-300 mb-4" />
             <p className="text-xl font-medium text-gray-900 dark:text-white">No properties found</p>
             <p className="text-gray-500 mt-1">Try adjusting your search query</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {filteredProperties.map((item: Property) => (
                <PropertyCard key={item.id} property={item} />
              ))}
            </div>

            <hr className="my-4 border-gray-600" />

            {/* Pagination Controls */}
            <div className="mt-10 flex justify-between items-center bg-white dark:bg-neutral-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800 w-fit mx-auto">
              <div className="flex gap-4 justify-center items-center">
                <button
                  onClick={handlePrevPage}
                  disabled={apiPage === 1}
                  className="p-2 border border-gray-300 dark:border-gray-600 rounded-full disabled:opacity-30 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                >
                  <FiArrowLeft size={20} />
                </button>
                 <p className="text-sm text-gray-600 dark:text-gray-400">
                    Page <span className="font-semibold text-gray-900 dark:text-white">{apiPage}</span> of <span className="font-semibold text-gray-900 dark:text-white">{totalApiPages || 1}</span>
                  </p>
                <button
                  onClick={handleNextPage}
                  disabled={apiPage >= totalApiPages}
                  className="p-2 border border-gray-300 dark:border-gray-600 rounded-full disabled:opacity-30 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                >
                  <FiArrowRight size={20} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
      <Footer />
    </div>
  );
}

export default AllProperties;
