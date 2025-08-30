import React, { useState, useEffect, useContext } from "react";
import Navbar from "../components/Navbar.jsx";
import axios from "axios";
import { AppContext } from "../context/AppContext.jsx";
import { toast } from "react-toastify";

const Profile = () => {
  const { backendUrl } = useContext(AppContext);
  const [user, setUser] = useState({
    name: "",
    email: "",
    role: "",
    avatar: "",
  });
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data } = await axios.get(`${backendUrl}/api/user/data`, { withCredentials: true });
        console.log("User data response:", data);
        if (data.success) {
          setUser(data.userData);
          setName(data.userData.name);
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch user data");
      }
    };
    fetchUser();
  }, [backendUrl]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("name", name);
      if (avatar) formData.append("avatar", avatar);

      const { data } = await axios.put(`${backendUrl}/api/user/update`, formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (data.success) {
        setUser({ ...user, name, avatar: data.user.avatar });
        toast.success("Profile updated successfully!");
      } else {
        toast.error(data.message || "Failed to update profile");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to update profile");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen p-6 md:p-8 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">👤 My Profile</h1>

        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-3xl shadow-xl space-y-6 border border-gray-200">
          {/* Avatar */}
          <div className="flex items-center gap-6">
            <img
              src={avatar ? URL.createObjectURL(avatar) : user.avatar}
              alt="Avatar"
              className="w-24 h-24 rounded-full object-cover border-2 border-indigo-200"
            />
            <input type="file" accept="image/*" onChange={(e) => setAvatar(e.target.files[0])} />
          </div>

          {/* Name */}
          <div>
            <label className="block mb-2 font-semibold text-gray-700">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              required
            />
          </div>

          {/* Email (readonly) */}
          <div>
            <label className="block mb-2 font-semibold text-gray-700">Email</label>
            <input
              type="email"
              value={user.email}
              disabled
              className="w-full border rounded-lg px-4 py-2 bg-gray-100"
            />
          </div>

          {/* Role (readonly) */}
          <div>
            <label className="block mb-2 font-semibold text-gray-700">Role</label>
            <input
              type="text"
              value={user.role}
              disabled
              className="w-full border rounded-lg px-4 py-2 bg-gray-100"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition"
          >
            {submitting ? "Updating..." : "Update Profile"}
          </button>
        </form>
      </main>
    </>
  );
};

export default Profile;
