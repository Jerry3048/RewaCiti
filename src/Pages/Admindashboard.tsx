import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { usePropertyStore } from "../Store/usePropertyStore";
import type { Property } from "../types";

function Admindashboard() {
  const navigate = useNavigate();
  const { properties, fetchProperties } = usePropertyStore();

  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (!user) {
      navigate("/login");
      return;
    }

    fetchProperties();
  }, [fetchProperties, navigate]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  const handleEdit = (property: Property) => {
    navigate("/property-form", { state: { property } });
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this property?")) {
      try {
        const updatedProperties = properties.filter((p) => p.id !== id);
        localStorage.setItem("properties", JSON.stringify(updatedProperties));

        setMessage("Property deleted successfully!");
        fetchProperties();
        setTimeout(() => setMessage(""), 3000);
      } catch (error) {
        setMessage("Error deleting property");
        console.error(error);
      }
    }
  };

  const filteredProperties = properties.filter((property) =>
    property.name.toLowerCase().includes(search.toLowerCase()) ||
    property.type.toLowerCase().includes(search.toLowerCase()) ||
    property.location.city.toLowerCase().includes(search.toLowerCase()) ||
    property.location.area.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <Navbar />

      <div className="bg-gray-300 dark:bg-black/30 p-5 md:p-8">

        {/* Header */}
        <div className="bg-black/30 rounded-lg shadow-md p-6 mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>

          <button
            onClick={handleLogout}
            className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition"
          >
            Logout
          </button>
        </div>

        {/* Message */}
        {message && (
          <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 text-green-700 rounded">
            {message}
          </div>
        )}

        <div className="w-full mx-auto">

          {/* Add Property Button */}
          <div className="md:flex justify-between items-center mb-6">
            <div className="mb-6">
              <button
                onClick={() => navigate("/property-form")}
                className="px-6 py-2 bg-linear-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold rounded-lg transition transform hover:-translate-y-0.5 hover:shadow-lg"
              >
                + Add New Property
              </button>
            </div>
  
            {/* Search Bar */}
            <div className="mb-6 flex flex-row gap-3">
              <input
                type="text"
                placeholder="Search by name, type, city or area..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="p-3 flex justify-center items-center dark:placeholder-gray-400 placeholder-gray-900/70 rounded-lg dark:bg-black/70 bg-gray-200 text-gray-900 dark:text-white focus:outline-none border border-gray-600/70 w-full"
              />
  
              <button
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg "
              >
                Search
              </button>
            </div>
          </div>

          {/* Properties Table */}
          <div className="rounded-lg shadow-md p-8 bg-black/30">
            <h2 className="text-2xl font-bold border-b-2 border-purple-600 pb-4 mb-6">
              Properties ({filteredProperties.length})
            </h2>

            {filteredProperties.length === 0 ? (
              <p className="text-gray-600 text-center py-8">
                No properties found
              </p>
            ) : (
              <div className="overflow-x-auto">

                <table className="w-full">

                  <thead>
                    <tr className="border-b">
                      <th className="px-6 py-3 text-left text-sm font-semibold">ID</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Name</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Type</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Location</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Price</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Bedrooms</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredProperties.map((property) => (
                      <tr
                        key={property.id}
                        className="border-b hover:bg-gray-700 transition"
                      >
                        <td className="px-6 py-4">{property.id}</td>
                        <td className="px-6 py-4">{property.name}</td>
                        <td className="px-6 py-4">{property.type}</td>

                        <td className="px-6 py-4">
                          {property.location.area}, {property.location.city}
                        </td>

                        <td className="px-6 py-4">
                          ${property.price.toLocaleString()}
                        </td>

                        <td className="px-6 py-4">{property.bedrooms}</td>

                        <td className="px-6 py-4 flex gap-2">

                          <button
                            onClick={() => handleEdit(property)}
                            className="px-3 py-1 bg-[#703BF7] hover:bg-[#5c2fe0] text-white text-sm font-semibold rounded transition"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() => handleDelete(property.id)}
                            className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded transition"
                          >
                            Delete
                          </button>

                        </td>
                      </tr>
                    ))}
                  </tbody>

                </table>

              </div>
            )}
          </div>
        </div>
      </div>

      <section className="bg-gray-300 dark:bg-black/30">
        <Footer />
      </section>
    </div>
  );
}

export default Admindashboard;