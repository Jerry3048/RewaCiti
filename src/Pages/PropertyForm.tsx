import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router";
import { usePropertyStore } from "../Store/usePropertyStore";
import type { Property } from "../types";

interface LocationState {
  property?: Property;
}

const initialFormState: Partial<Property> = {
  id: 0,
  name: "",
  description: "",
  bedrooms: 0,
  bathrooms: 0,
  type: "",
  price: 0,
  location: {
    area: "",
    city: "",
    state: "",
  },
  img: "",
  images: [""],
  keyFeatures: [""],
  videoUrl: "",
};

function PropertyForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const { properties, fetchProperties } = usePropertyStore();

  const [editingId, setEditingId] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [formData, setFormData] = useState<Partial<Property>>(initialFormState);

  useEffect(() => {
    // require login
    const user = localStorage.getItem("user");
    if (!user) {
      navigate("/login");
      return;
    }

    fetchProperties();

    // if we navigated here with a property to edit
    const locState = location.state as LocationState;
    if (locState && locState.property) {
      const p = locState.property;
      setFormData(p);
      setEditingId(p.id);
    }
  }, [fetchProperties, navigate, location.state]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    if (name.startsWith("location.")) {
      const field = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        location: {
          ...prev.location!,
          [field]: value,
        },
      }));
    } else if (name === "bedrooms" || name === "bathrooms" || name === "price") {
      setFormData((prev) => ({
        ...prev,
        [name]: Number(value),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleArrayChange = (
    index: number,
    field: "images" | "keyFeatures",
    value: string
  ) => {
    setFormData((prev) => {
      const newArray = [...(prev[field] as string[])];
      newArray[index] = value;
      return {
        ...prev,
        [field]: newArray,
      };
    });
  };

  const addArrayField = (field: "images" | "keyFeatures") => {
    setFormData((prev) => ({
      ...prev,
      [field]: [...(prev[field] as string[]), ""],
    }));
  };

  const removeArrayField = (field: "images" | "keyFeatures", index: number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: (prev[field] as string[]).filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.description ||
      !formData.type ||
      !formData.location?.area
    ) {
      setMessage("Please fill in all required fields");
      return;
    }

    try {
      // in this mock app we update the locally stored json
      const response = await fetch("/data/Properties.json");
      let propertiesData = await response.json();

      if (editingId) {
        propertiesData = propertiesData.map((p: Property) =>
          p.id === editingId ? { ...p, ...formData } : p
        );
        setMessage("Property updated successfully!");
        setEditingId(null);
      } else {
        const newId =
          Math.max(...propertiesData.map((p: Property) => p.id)) + 1;
        propertiesData.push({
          ...formData,
          id: newId,
        });
        setMessage("Property added successfully!");
      }

      const updatedProperties = editingId
        ? properties.map((p) =>
            p.id === editingId ? { ...p, ...formData } : p
          )
        : [...properties, { ...formData, id: Math.max(...properties.map(p => p.id)) + 1 } as Property];

      localStorage.setItem("properties", JSON.stringify(updatedProperties));

      // clear and go back
      setFormData(initialFormState);
      setTimeout(() => setMessage(""), 3000);
      navigate("/Admindashboard");
    } catch (error) {
      setMessage("Error saving property");
      console.error(error);
    }
  };

  const handleCancel = () => {
    navigate("/Admindashboard");
  };

  return (
    <div className="">
      <Navbar />
      <div className="bg-gray-300 dark:bg-black/30 p-5 md:p-8">
        {/* Header */}
        <div className=" bg-black/30 rounded-lg shadow-md p-6 mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <h1 className="text-3xl font-bold">
            {editingId ? "Edit Property" : "Add New Property"}
          </h1>
          <button
            onClick={() => navigate("/Admindashboard")}
            className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white font-semibold rounded-lg transition"
          >
            Back to Dashboard
          </button>
        </div>

        {message && (
          <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 text-green-700 rounded">
            {message}
          </div>
        )}

        <div className="w-full mx-auto">
          <div className=" bg-black/30 rounded-lg shadow-md p-8 mb-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-semibold  mb-4">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Property Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name || ""}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 bg-gray-500/50 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Property Type
                    </label>
                    <input
                      type="text"
                      name="type"
                      value={formData.type || ""}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 bg-gray-500/50 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description || ""}
                    onChange={handleInputChange}
                    rows={4}
                    required
                    className="w-full px-4 py-2 border border-gray-300 bg-gray-500/50 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Bedrooms
                    </label>
                    <input
                      type="number"
                      name="bedrooms"
                      value={formData.bedrooms || 0}
                      onChange={handleInputChange}
                      min="0"
                      required
                      className="w-full px-4 py-2 border border-gray-300 bg-gray-500/50 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Bathrooms
                    </label>
                    <input
                      type="number"
                      name="bathrooms"
                      value={formData.bathrooms || 0}
                      onChange={handleInputChange}
                      min="0"
                      required
                      className="w-full px-4 py-2 border border-gray-300 bg-gray-500/50 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Price
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price || 0}
                      onChange={handleInputChange}
                      min="0"
                      required
                      className="w-full px-4 py-2 border border-gray-300 bg-gray-500/50 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                    />
                  </div>
                </div>
              </div>

              {/* Location */}
              <div>
                <h3 className="text-lg font-semibold  mb-4">Location</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Area
                    </label>
                    <input
                      type="text"
                      name="location.area"
                      value={formData.location?.area || ""}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 bg-gray-500/50 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      City
                    </label>
                    <input
                      type="text"
                      name="location.city"
                      value={formData.location?.city || ""}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 bg-gray-500/50 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      State
                    </label>
                    <input
                      type="text"
                      name="location.state"
                      value={formData.location?.state || ""}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 bg-gray-500/50 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                    />
                  </div>
                </div>
              </div>

              {/* Media */}
              <div>
                <h3 className="text-lg font-semibold  mb-4">Media</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Main Image URL
                    </label>
                    <input
                      type="text"
                      name="img"
                      value={formData.img || ""}
                      onChange={handleInputChange}
                      placeholder="/images/property.jpg"
                      className="w-full px-4 py-2 border border-gray-300 bg-gray-500/50 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Videos URL
                    </label>
                    <input
                      type="text"
                      name="videoUrl"
                      value={formData.videoUrl || ""}
                      onChange={handleInputChange}
                      placeholder="/videos/property-tour.mp4"
                      className="w-full px-4 py-2 border border-gray-300 bg-gray-500/50 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Additional Images
                    </label>
                    <div className="space-y-3">
                      {formData.images?.map((img, index) => (
                        <div key={index} className="flex gap-3">
                          <input
                            type="text"
                            value={img}
                            onChange={(e) =>
                              handleArrayChange(index, "images", e.target.value)
                            }
                            placeholder={`Image URL ${index + 1}`}
                            className="flex-1 px-4 py-2 border border-gray-300 bg-gray-500/50 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                          />
                          {formData.images!.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeArrayField("images", index)}
                              className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition text-sm"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => addArrayField("images")}
                        className="text-sm px-4 py-2 bg-[#703BF7] hover:bg-[#5c2fe0] text-white font-semibold rounded-lg transition"
                      >
                        + Add Image
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Features */}
              <div>
                <h3 className="text-lg font-semibold  mb-4">Key Features</h3>
                <div className="space-y-3">
                  {formData.keyFeatures?.map((feature, index) => (
                    <div key={index} className="flex gap-3">
                      <input
                        type="text"
                        value={feature}
                        onChange={(e) =>
                          handleArrayChange(index, "keyFeatures", e.target.value)
                        }
                        placeholder={`Feature ${index + 1}`}
                        className="flex-1 px-4 py-2 border border-gray-300 bg-gray-500/50 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                      />
                      {formData.keyFeatures!.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeArrayField("keyFeatures", index)}
                          className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition text-sm"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addArrayField("keyFeatures")}
                    className="text-sm px-4 py-2 bg-[#703BF7] hover:bg-[#5c2fe0] text-white font-semibold rounded-lg transition"
                  >
                    + Add Feature
                  </button>
                </div>
              </div>

              {/* Form Buttons */}
              <div className="flex gap-3 justify-end pt-4 border-t">
                <button
                  type="submit"
                  className="px-6 py-2 bg-linear-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold rounded-lg transition transform hover:-translate-y-0.5 hover:shadow-lg"
                >
                  {editingId ? "Update Property" : "Add Property"}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-6 py-2 bg-gray-400 hover:bg-gray-500 text-white font-semibold rounded-lg transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <section className="bg-gray-300 dark:bg-black/30">
        <Footer />
      </section>
    </div>
  );
}

export default PropertyForm;
