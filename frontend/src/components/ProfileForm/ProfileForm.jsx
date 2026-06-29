import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "sonner";
import InputField from "../InputField/InputField";
import "./ProfileForm.css";
import ProfilePreview from "../ProfilePreview/ProfilePreview";

const ProfileForm = ({ isEditMode, onToggleEdit }) => {
  const { user, updateUser } = useAuth();

  const isInstructor = user?.role === "instructor";

  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    phoneNumber: user?.phoneNumber || "",
    dateOfBirth: user?.dateOfBirth ? user.dateOfBirth.split("T")[0] : "",
    ...(isInstructor
      ? {
          headline: user?.headline || "",
          bio: user?.bio || "",
        }
      : {
          educationLevel: user?.educationLevel || "",
        }),
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        phoneNumber: user.phoneNumber || "",
        dateOfBirth: user.dateOfBirth ? user.dateOfBirth.split("T")[0] : "",
        ...(isInstructor
          ? {
              headline: user.headline || "",
              bio: user.bio || "",
            }
          : {
              educationLevel: user.educationLevel || "",
            }),
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error("No user found");
      return;
    }
    setLoading(true);
    try {
      await updateUser(formData);
      // eslint-disable-next-line no-unused-vars
    } catch (error) {
      toast.error("Failed to update profile. Please try again");
    } finally {
      setLoading(false);
    }
  };

  const handleDiscard = () => {
    setFormData({
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      phoneNumber: user.phoneNumber || "",
      dateOfBirth: user.dateOfBirth ? user.dateOfBirth.split("T")[0] : "",
      ...(isInstructor
        ? {
            headline: user.headline || "",
            bio: user.bio || "",
          }
        : {
            educationLevel: user.educationLevel || "",
          }),
    });
    onToggleEdit();
  };

  const educationLevelOptions = [
    { value: "high_school", label: "High School" },
    { value: "bachelor", label: "Bachelor's Degree" },
    { value: "master", label: "Master's Degree" },
    { value: "phd", label: "PhD" },
    { value: "other", label: "Other" },
  ];

  return (
    <div className="profile-form w-[90%] min-h-screen px-8 py-2 my-8  rounded-xl flex flex-col justify-between items-start">
      <h1 className="main-section-title">Personal Information</h1>
      <ProfilePreview />
      <form onSubmit={handleSubmit} className="w-full h-full p-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-8">
          <InputField
            label={"ID"}
            inputType={"text"}
            name="userId"
            value={user._id}
            onChange={handleChange}
            disabled={true}
          />
          <InputField
            label={"Email"}
            inputType={"email"}
            name="email"
            value={user.email}
            onChange={handleChange}
            disabled={true}
          />
          <InputField
            label={"First Name"}
            inputType={"text"}
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            disabled={!isEditMode}
          />
          <InputField
            label={"Last Name"}
            inputType={"text"}
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            disabled={!isEditMode}
          />
          <InputField
            label={"Phone Number"}
            inputType={"tel"}
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            disabled={!isEditMode}
          />
          <InputField
            label={"Date of Birth"}
            inputType={"date"}
            name="dateOfBirth"
            value={formData.dateOfBirth}
            onChange={handleChange}
            disabled={!isEditMode}
          />

          <div className="flex flex-col gap-2">
            <label className="font-semibold text-sm text-gray-700">
              Education Level
            </label>
            <select
              name="educationLevel"
              value={formData.educationLevel}
              onChange={handleChange}
              disabled={!isEditMode}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--electric)] focus:border-transparent transition-all duration-200 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500 disabled:border-gray-200 bg-white"
            >
              <option value="">Select education level</option>
              {educationLevelOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-4 mt-12">
          {isEditMode ? (
            <>
              <button
                type="button"
                onClick={handleDiscard}
                className="bg-gray-200 py-4 px-10 rounded-xl cursor-pointer text-gray-700 font-semibold text-lg w-fit border-1 border-gray-400 hover:bg-gray-400"
              >
                Discard
              </button>
              <button
                type="submit"
                disabled={loading}
                className="bg-[var(--electric)] py-4 px-10 rounded-xl cursor-pointer text-white font-semibold text-lg w-fit border-1 border-[var(--electric-dark)] hover:bg-[var(--electric-dark)] disabled:opacity-50"
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={onToggleEdit}
              className="bg-(--electric) shadow-sm py-3 px-10 rounded-lg cursor-pointer text-white font-semibold text-lg w-full border-1 border-teal-200 hover:bg-[var(--electric-dark)]"
            >
              Edit Profile
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default ProfileForm;
