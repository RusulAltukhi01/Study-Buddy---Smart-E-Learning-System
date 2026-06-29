import { useState, useRef, useEffect } from "react";
import {
  User,
  FileText,
  Briefcase,
  Share2,
  Lock,
  Eye,
  HelpCircle,
  LogOut,
  Camera,
  X,
  Plus,
  GraduationCap,
  Building2,
  Link,
  Twitter,
  Github,
  Globe,
  Youtube,
  Facebook,
  Save,
  ChevronDown,
  ChevronRight,
  Users,
  BookOpen,
  Star,
} from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { useAuth } from "../../contexts/AuthContext";
import defaultAvatar from "../../assets/default-avatar.png";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const NAV_ITEMS = [
  { id: "personal", label: "Personal Details", icon: User },
  { id: "bio", label: "Professional Bio", icon: FileText },
  { id: "experience", label: "Experience", icon: Briefcase },
  { id: "social", label: "Social Links", icon: Share2 },
  { id: "security", label: "Security", icon: Lock },
];

const AVAILABILITY_OPTIONS = ["available", "busy", "away"];
const RESPONSE_TIME_OPTIONS = [
  { label: "Within 24 hours", value: 24 },
  { label: "Within 48 hours", value: 48 },
  { label: "Within a week", value: 168 },
];

{
  /* eslint-disable-next-line no-unused-vars */
}
const SectionHeader = ({ icon: Icon, title, subtitle, color = "teal" }) => {
  const colors = {
    teal: "bg-teal-50 text-teal-600",
    violet: "bg-violet-50 text-violet-600",
    amber: "bg-amber-50 text-amber-600",
    blue: "bg-blue-50 text-blue-600",
  };
  return (
    <div className="flex items-center gap-3 mb-6">
      <div
        className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${colors[color]}`}
      >
        <Icon size={17} />
      </div>
      <div>
        <h2 className="text-base font-semibold text-slate-800 leading-tight">
          {title}
        </h2>
        {subtitle && (
          <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
        )}
      </div>
    </div>
  );
};

const Field = ({ label, children }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
      {label}
    </label>
    {children}
  </div>
);

const Input = ({ className = "", ...props }) => (
  <input
    className={`w-full px-3.5 py-2.5 text-sm text-slate-700 bg-slate-50 border border-slate-200
      rounded-xl focus:outline-none focus:border-teal-400 focus:bg-white transition-all
      placeholder:text-slate-300 ${className}`}
    {...props}
  />
);

const Textarea = ({ className = "", ...props }) => (
  <textarea
    className={`w-full px-3.5 py-2.5 text-sm text-slate-700 bg-slate-50 border border-slate-200
      rounded-xl focus:outline-none focus:border-teal-400 focus:bg-white transition-all
      placeholder:text-slate-300 resize-none ${className}`}
    {...props}
  />
);

const Tag = ({ label, onRemove, color = "teal" }) => {
  const colors = {
    teal: "bg-teal-600 text-white",
    violet: "bg-violet-100 text-violet-700 border border-violet-200",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${colors[color]}`}
    >
      {label}
      {onRemove && (
        <button
          onClick={onRemove}
          className="opacity-70 hover:opacity-100 transition-opacity cursor-pointer"
        >
          <X size={11} strokeWidth={2.5} />
        </button>
      )}
    </span>
  );
};

const AddTagInput = ({ placeholder, onAdd }) => {
  const [val, setVal] = useState("");
  const submit = () => {
    if (!val.trim()) return;
    onAdd(val.trim());
    setVal("");
  };
  return (
    <span
      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold
      border-2 border-dashed border-slate-300 text-slate-400 cursor-pointer hover:border-teal-400
      hover:text-teal-500 transition-all"
    >
      <input
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && submit()}
        placeholder={placeholder}
        className="bg-transparent outline-none w-24 placeholder:text-slate-300 text-xs"
      />
      <button onClick={submit}>
        <Plus size={11} strokeWidth={2.5} />
      </button>
    </span>
  );
};

{
  /* eslint-disable-next-line no-unused-vars */
}
const SocialInput = ({ icon: Icon, placeholder, value, onChange }) => (
  <div
    className="flex items-center gap-3 px-3.5 py-2.5 bg-slate-50 border border-slate-200
    rounded-xl focus-within:border-teal-400 focus-within:bg-white transition-all"
  >
    <Icon size={15} className="text-slate-400 flex-shrink-0" />
    <input
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="flex-1 text-sm text-slate-700 bg-transparent outline-none placeholder:text-slate-300"
    />
  </div>
);

const ExperienceCard = ({ item, type, onRemove }) => (
  <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
    <div
      className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0
      ${type === "qualification" ? "bg-teal-50 text-teal-600" : "bg-violet-50 text-violet-600"}`}
    >
      {type === "qualification" ? (
        <GraduationCap size={18} />
      ) : (
        <Building2 size={18} />
      )}
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-slate-800">
            {type === "qualification" ? item.degree : item.title}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">
            {type === "qualification"
              ? `${item.institution}${item.description ? ` • ${item.description}` : ""}`
              : `${item.company}${item.location ? ` • ${item.location}` : ""}`}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-xs text-slate-400">
            {type === "qualification"
              ? item.year
              : `${item.startDate ? new Date(item.startDate).getFullYear() : "?"} — ${item.current ? "Present" : item.endDate ? new Date(item.endDate).getFullYear() : "?"}`}
          </span>
          <button
            onClick={onRemove}
            className="w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center
              text-slate-400 hover:text-red-500 hover:border-red-200 transition-colors cursor-pointer"
          >
            <X size={11} />
          </button>
        </div>
      </div>
    </div>
  </div>
);

const PersonalSection = ({ form, setForm }) => {
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const { updateUser } = useAuth();

  const getImageUrl = () => {
    if (!form.profilePicture || form.profilePicture === "") {
      return defaultAvatar;
    }
    const baseUrl = API_URL.endsWith("/") ? API_URL.slice(0, -1) : API_URL;
    let imagePath = form.profilePicture;
    if (!imagePath.startsWith("/")) {
      imagePath = "/" + imagePath;
    }
    return `${baseUrl}${imagePath}`;
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    e.target.value = "";

    const validTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    if (!validTypes.includes(file.type)) {
      toast.error("Please select a valid image file (JPEG, PNG, GIF, WebP)");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size should be less than 5MB");
      return;
    }

    await uploadProfilePicture(file);
  };

  const uploadProfilePicture = async (file) => {
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("profilePicture", file);

      const token = localStorage.getItem("token");

      const res = await axios.post(`${API_URL}/api/uploads/`, formData, {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      if (res.data.success) {
        setForm((prev) => ({
          ...prev,
          profilePicture: res.data.profilePicture,
        }));

        if (updateUser) {
          const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
          updateUser({
            ...currentUser,
            profilePicture: res.data.profilePicture,
          });
        }

        toast.success("Profile picture updated successfully!");
      } else {
        toast.error(res.data.error || "Upload failed");
      }
    } catch (err) {
      console.error("Upload error:", err);
      toast.error(err.response?.data?.error || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleRemovePicture = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.delete(`${API_URL}/api/uploads/`, {
        withCredentials: true,
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setForm((prev) => ({ ...prev, profilePicture: "" }));
        toast.success("Profile picture removed");
      }
    } catch (error) {
      console.error("Remove error:", error);
      toast.error("Failed to remove profile picture");
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-7 shadow-sm">
      <SectionHeader icon={User} title="Basic Information" color="teal" />
      <div className="flex gap-8">
        <div className="flex-1 grid grid-cols-2 gap-4">
          <Field label="First Name">
            <Input
              value={form.firstName}
              onChange={(e) =>
                setForm((p) => ({ ...p, firstName: e.target.value }))
              }
              placeholder="First name"
            />
          </Field>
          <Field label="Last Name">
            <Input
              value={form.lastName}
              onChange={(e) =>
                setForm((p) => ({ ...p, lastName: e.target.value }))
              }
              placeholder="Last name"
            />
          </Field>
          <div className="col-span-2">
            <Field label="Professional Headline">
              <Input
                value={form.headline}
                onChange={(e) =>
                  setForm((p) => ({ ...p, headline: e.target.value }))
                }
                placeholder="e.g. Senior Lecturer in Digital Curatorship & AI Ethics"
              />
            </Field>
          </div>
          <Field label="Email Address">
            <Input
              type="email"
              value={form.email}
              onChange={(e) =>
                setForm((p) => ({ ...p, email: e.target.value }))
              }
              placeholder="you@university.edu"
              disabled
            />
          </Field>
          <Field label="Phone Number">
            <Input
              value={form.phoneNumber}
              onChange={(e) =>
                setForm((p) => ({ ...p, phoneNumber: e.target.value }))
              }
              placeholder="+1 (555) 000-0000"
            />
          </Field>
        </div>

        <div className="flex flex-col items-center gap-3 flex-shrink-0">
          <div className="relative w-28 h-28 group">
            {uploading ? (
              <div className="w-28 h-28 rounded-full bg-slate-200 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
              </div>
            ) : (
              <>
                <img
                  src={getImageUrl()}
                  alt="Profile"
                  className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-md cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                  onError={(e) => {
                    e.target.src = defaultAvatar;
                  }}
                />
                <div
                  className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Camera size={20} className="text-white" />
                </div>
              </>
            )}
            {form.profilePicture && !uploading && (
              <button
                onClick={handleRemovePicture}
                className="absolute -bottom-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors text-xs"
              >
                ×
              </button>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileSelect}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="text-xs font-semibold text-teal-600 hover:text-teal-700 border border-teal-200
              hover:border-teal-400 px-4 py-1.5 rounded-lg transition-all cursor-pointer bg-teal-50 hover:bg-teal-100"
          >
            Upload Photo
          </button>
          <p className="text-[10px] text-slate-400 text-center max-w-[120px]">
            Recommended: 800×800px JPG or PNG
          </p>
        </div>
      </div>
    </div>
  );
};

const BioSection = ({ form, setForm }) => (
  <div className="bg-white rounded-2xl border border-slate-100 p-7 shadow-sm">
    <SectionHeader
      icon={FileText}
      title="Professional Bio & Expertise"
      subtitle="Use AI-assisted descriptors for better discoverability"
      color="violet"
    />
    <div className="flex flex-col gap-5">
      <Field label="Bio">
        <Textarea
          value={form.bio}
          onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))}
          placeholder="Describe your background, expertise, and teaching philosophy..."
          rows={5}
        />
      </Field>
      <Field label="Expertise Tags">
        <div className="flex flex-wrap gap-2 items-center">
          {(form.expertise || []).map((tag, i) => (
            <Tag
              key={i}
              label={tag}
              color="teal"
              onRemove={() =>
                setForm((p) => ({
                  ...p,
                  expertise: p.expertise.filter((_, j) => j !== i),
                }))
              }
            />
          ))}
          <AddTagInput
            placeholder="+ Add Expertise"
            onAdd={(tag) =>
              setForm((p) => ({
                ...p,
                expertise: [...(p.expertise || []), tag],
              }))
            }
          />
        </div>
      </Field>
    </div>
  </div>
);

const SocialSection = ({ form, setForm }) => (
  <div className="bg-white rounded-2xl border border-slate-100 p-7 shadow-sm">
    <div className="grid grid-cols-2 gap-8">
      <div>
        <h3 className="text-base font-semibold text-slate-800 mb-4">
          Social Connections
        </h3>
        <div className="flex flex-col gap-3">
          <SocialInput
            icon={Link}
            placeholder="linkedin.com/in/yourname"
            value={form.socialLinks?.linkedin || ""}
            onChange={(e) =>
              setForm((p) => ({
                ...p,
                socialLinks: { ...p.socialLinks, linkedin: e.target.value },
              }))
            }
          />
          <SocialInput
            icon={Twitter}
            placeholder="@yourhandle"
            value={form.socialLinks?.twitter || ""}
            onChange={(e) =>
              setForm((p) => ({
                ...p,
                socialLinks: { ...p.socialLinks, twitter: e.target.value },
              }))
            }
          />
          <SocialInput
            icon={Github}
            placeholder="github.com/yourname"
            value={form.socialLinks?.github || ""}
            onChange={(e) =>
              setForm((p) => ({
                ...p,
                socialLinks: { ...p.socialLinks, github: e.target.value },
              }))
            }
          />
          <SocialInput
            icon={Globe}
            placeholder="www.yourwebsite.com"
            value={form.socialLinks?.website || ""}
            onChange={(e) =>
              setForm((p) => ({
                ...p,
                socialLinks: { ...p.socialLinks, website: e.target.value },
              }))
            }
          />
          <SocialInput
            icon={Youtube}
            placeholder="youtube.com/@yourchannel"
            value={form.socialLinks?.youtube || ""}
            onChange={(e) =>
              setForm((p) => ({
                ...p,
                socialLinks: { ...p.socialLinks, youtube: e.target.value },
              }))
            }
          />
          <SocialInput
            icon={Facebook}
            placeholder="facebook.com/yourpage"
            value={form.socialLinks?.facebook || ""}
            onChange={(e) =>
              setForm((p) => ({
                ...p,
                socialLinks: { ...p.socialLinks, facebook: e.target.value },
              }))
            }
          />
        </div>
      </div>

      <div>
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-7 h-7 rounded-lg bg-teal-50 flex items-center justify-center">
            <GraduationCap size={14} className="text-teal-600" />
          </div>
          <h3 className="text-base font-semibold text-slate-800">
            Teaching Preferences
          </h3>
        </div>
        <div className="flex flex-col gap-4">
          <Field label="Availability Status">
            <div className="relative">
              <select
                value={form.availability}
                onChange={(e) =>
                  setForm((p) => ({ ...p, availability: e.target.value }))
                }
                className="w-full px-3.5 py-2.5 text-sm text-slate-700 bg-slate-50 border border-slate-200
                  rounded-xl focus:outline-none focus:border-teal-400 appearance-none cursor-pointer capitalize"
              >
                {AVAILABILITY_OPTIONS.map((o) => (
                  <option key={o} value={o} className="capitalize">
                    {o.charAt(0).toUpperCase() + o.slice(1)}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={14}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
            </div>
          </Field>
          <Field label="Typical Response Time">
            <div className="relative">
              <select
                value={form.responseTime}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    responseTime: Number(e.target.value),
                  }))
                }
                className="w-full px-3.5 py-2.5 text-sm text-slate-700 bg-slate-50 border border-slate-200
                  rounded-xl focus:outline-none focus:border-teal-400 appearance-none cursor-pointer"
              >
                {RESPONSE_TIME_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={14}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
            </div>
          </Field>
          <Field label="Teaching Style Tags">
            <div className="flex flex-wrap gap-2 items-center">
              {(form.teachingStyle || []).map((tag, i) => (
                <Tag
                  key={i}
                  label={tag}
                  color="violet"
                  onRemove={() =>
                    setForm((p) => ({
                      ...p,
                      teachingStyle: p.teachingStyle.filter((_, j) => j !== i),
                    }))
                  }
                />
              ))}
              <AddTagInput
                placeholder="+ Add Style"
                onAdd={(tag) =>
                  setForm((p) => ({
                    ...p,
                    teachingStyle: [...(p.teachingStyle || []), tag],
                  }))
                }
              />
            </div>
          </Field>
        </div>
      </div>
    </div>
  </div>
);

const ExperienceSection = ({ form, setForm }) => {
  const [showQualForm, setShowQualForm] = useState(false);
  const [showRoleForm, setShowRoleForm] = useState(false);
  const [newQual, setNewQual] = useState({
    degree: "",
    institution: "",
    year: "",
    description: "",
  });
  const [newRole, setNewRole] = useState({
    title: "",
    company: "",
    location: "",
    startDate: "",
    endDate: "",
    current: false,
    description: "",
  });

  const addQualification = () => {
    if (!newQual.degree || !newQual.institution) return;
    setForm((p) => ({
      ...p,
      qualifications: [
        ...(p.qualifications || []),
        { ...newQual, year: Number(newQual.year) },
      ],
    }));
    setNewQual({ degree: "", institution: "", year: "", description: "" });
    setShowQualForm(false);
  };

  const addRole = () => {
    if (!newRole.title || !newRole.company) return;
    setForm((p) => ({
      ...p,
      previousRoles: [...(p.previousRoles || []), newRole],
    }));
    setNewRole({
      title: "",
      company: "",
      location: "",
      startDate: "",
      endDate: "",
      current: false,
      description: "",
    });
    setShowRoleForm(false);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-7 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <SectionHeader
          icon={Briefcase}
          title="Experience & Qualifications"
          color="amber"
        />
        <button
          onClick={() => setShowQualForm(true)}
          className="flex items-center gap-1.5 text-xs font-semibold text-teal-600 hover:text-teal-700
            border border-teal-200 hover:border-teal-400 px-3 py-1.5 rounded-lg transition-all cursor-pointer bg-teal-50"
        >
          <Plus size={12} /> Add Entry
        </button>
      </div>

      <div className="flex flex-col gap-3">
        {(form.qualifications || []).map((q, i) => (
          <ExperienceCard
            key={i}
            item={q}
            type="qualification"
            onRemove={() =>
              setForm((p) => ({
                ...p,
                qualifications: p.qualifications.filter((_, j) => j !== i),
              }))
            }
          />
        ))}
        {(form.previousRoles || []).map((r, i) => (
          <ExperienceCard
            key={i}
            item={r}
            type="role"
            onRemove={() =>
              setForm((p) => ({
                ...p,
                previousRoles: p.previousRoles.filter((_, j) => j !== i),
              }))
            }
          />
        ))}

        {showQualForm && (
          <div className="p-4 bg-teal-50 rounded-2xl border border-teal-100 flex flex-col gap-3">
            <p className="text-xs font-bold text-teal-700 uppercase tracking-wider">
              New Qualification
            </p>
            <div className="grid grid-cols-2 gap-3">
              <Input
                value={newQual.degree}
                onChange={(e) =>
                  setNewQual((p) => ({ ...p, degree: e.target.value }))
                }
                placeholder="Degree / Certificate"
              />
              <Input
                value={newQual.institution}
                onChange={(e) =>
                  setNewQual((p) => ({ ...p, institution: e.target.value }))
                }
                placeholder="Institution"
              />
              <Input
                value={newQual.year}
                onChange={(e) =>
                  setNewQual((p) => ({ ...p, year: e.target.value }))
                }
                placeholder="Year"
                type="number"
              />
              <Input
                value={newQual.description}
                onChange={(e) =>
                  setNewQual((p) => ({ ...p, description: e.target.value }))
                }
                placeholder="e.g. Academic Distinction"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowQualForm(false)}
                className="text-xs font-semibold text-slate-500 px-3 py-1.5 rounded-lg hover:bg-slate-100 cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={addQualification}
                className="text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 px-3 py-1.5 rounded-lg cursor-pointer transition-colors"
              >
                Add
              </button>
            </div>
          </div>
        )}

        {showRoleForm && (
          <div className="p-4 bg-violet-50 rounded-2xl border border-violet-100 flex flex-col gap-3">
            <p className="text-xs font-bold text-violet-700 uppercase tracking-wider">
              Previous Role
            </p>
            <div className="grid grid-cols-2 gap-3">
              <Input
                value={newRole.title}
                onChange={(e) =>
                  setNewRole((p) => ({ ...p, title: e.target.value }))
                }
                placeholder="Job Title"
              />
              <Input
                value={newRole.company}
                onChange={(e) =>
                  setNewRole((p) => ({ ...p, company: e.target.value }))
                }
                placeholder="Company / Organization"
              />
              <Input
                value={newRole.location}
                onChange={(e) =>
                  setNewRole((p) => ({ ...p, location: e.target.value }))
                }
                placeholder="Location"
              />
              <Input
                value={newRole.startDate}
                onChange={(e) =>
                  setNewRole((p) => ({ ...p, startDate: e.target.value }))
                }
                placeholder="Start Date"
                type="date"
              />
              {!newRole.current && (
                <Input
                  value={newRole.endDate}
                  onChange={(e) =>
                    setNewRole((p) => ({ ...p, endDate: e.target.value }))
                  }
                  placeholder="End Date"
                  type="date"
                />
              )}
              <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newRole.current}
                  onChange={(e) =>
                    setNewRole((p) => ({ ...p, current: e.target.checked }))
                  }
                  className="accent-violet-600"
                />
                Currently working here
              </label>
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowRoleForm(false)}
                className="text-xs font-semibold text-slate-500 px-3 py-1.5 rounded-lg hover:bg-slate-100 cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={addRole}
                className="text-xs font-semibold text-white bg-violet-600 hover:bg-violet-700 px-3 py-1.5 rounded-lg cursor-pointer transition-colors"
              >
                Add
              </button>
            </div>
          </div>
        )}

        {!showQualForm && !showRoleForm && (
          <button
            onClick={() => setShowRoleForm(true)}
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border-2 border-dashed
              border-slate-200 text-xs font-semibold text-slate-400 hover:border-violet-300 hover:text-violet-500
              transition-all cursor-pointer"
          >
            <Plus size={13} /> Add Previous Role
          </button>
        )}
      </div>
    </div>
  );
};

const SecuritySection = () => {
  const [passwords, setPasswords] = useState({
    current: "",
    newPass: "",
    confirm: "",
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-7 shadow-sm">
      <SectionHeader icon={Lock} title="Security" color="blue" />
      <div className="flex flex-col gap-4 max-w-md">
        <Field label="Current Password">
          <Input
            type="password"
            value={passwords.current}
            onChange={(e) =>
              setPasswords((p) => ({ ...p, current: e.target.value }))
            }
            placeholder="Enter current password"
          />
        </Field>
        <Field label="New Password">
          <Input
            type="password"
            value={passwords.newPass}
            onChange={(e) =>
              setPasswords((p) => ({ ...p, newPass: e.target.value }))
            }
            placeholder="Enter new password"
          />
        </Field>
        <Field label="Confirm New Password">
          <Input
            type="password"
            value={passwords.confirm}
            onChange={(e) =>
              setPasswords((p) => ({ ...p, confirm: e.target.value }))
            }
            placeholder="Confirm new password"
          />
        </Field>
        <button
          className="mt-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold
          rounded-xl transition-colors cursor-pointer w-fit"
        >
          Update Password
        </button>
      </div>
    </div>
  );
};

const InstructorProfilePage = () => {
  const [activeSection, setActiveSection] = useState("personal");
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    headline: "",
    phoneNumber: "",
    profilePicture: "",
    bio: "",
    expertise: [],
    teachingStyle: [],
    qualifications: [],
    previousRoles: [],
    availability: "available",
    responseTime: 24,
    socialLinks: {
      linkedin: "",
      twitter: "",
      github: "",
      website: "",
      youtube: "",
      facebook: "",
    },
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const { data } = await axios.get(`${API_URL}/api/instructor/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (data.success) {
          const d = data.data;
          setForm({
            firstName: d.firstName || "",
            lastName: d.lastName || "",
            email: d.email || "",
            headline: d.headline || "",
            phoneNumber: d.phoneNumber || "",
            profilePicture: d.profilePicture || "",
            bio: d.bio || "",
            expertise: d.expertise || [],
            teachingStyle: d.teachingStyle || [],
            qualifications: d.qualifications || [],
            previousRoles: d.previousRoles || [],
            availability: d.availability || "available",
            responseTime: d.responseTime || 24,
            socialLinks: {
              linkedin: d.socialLinks?.linkedin || "",
              twitter: d.socialLinks?.twitter || "",
              github: d.socialLinks?.github || "",
              website: d.socialLinks?.website || "",
              youtube: d.socialLinks?.youtube || "",
              facebook: d.socialLinks?.facebook || "",
            },
          });
        }
      } catch (err) {
        console.error("Failed to fetch profile:", err.message);
      }
    };
    fetchProfile();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.put(
        `${API_URL}/api/instructor/profile`,
        form,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );
      if (data.success) {
        toast.success("Profile saved successfully!");
      } else {
        toast.error(data.error || "Failed to save");
      }
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  const renderSection = () => {
    switch (activeSection) {
      case "personal":
        return <PersonalSection form={form} setForm={setForm} />;
      case "bio":
        return <BioSection form={form} setForm={setForm} />;
      case "experience":
        return <ExperienceSection form={form} setForm={setForm} />;
      case "social":
        return <SocialSection form={form} setForm={setForm} />;
      case "security":
        return <SecuritySection />;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <main className="flex-1 flex flex-col overflow-hidden">
    
        <header className="bg-white border-b border-slate-100 px-8 pt-6 pb-0 relative overflow-hidden">
          {/* Decorative circles */}
          <div className="absolute -top-16 -right-20 w-64 h-64 rounded-full bg-teal-500/5 pointer-events-none" />
          <div className="absolute top-5 right-10 w-28 h-28 rounded-full bg-teal-500/[0.04] pointer-events-none" />

          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mb-3 relative z-10">
            <span className="text-gray-500">Dashboard</span>
            <ChevronRight size={11} />
            <span className="text-gray-700 font-semibold">
              Profile settings
            </span>
          </div>

      
          <div className="flex items-start justify-between gap-6 relative z-10 my-5">
            <div className="flex items-center gap-3.5">
       
              <div className="relative flex-shrink-0">
                <div className="w-14 h-14 rounded-full bg-teal-50 border-[2.5px] border-teal-400 flex items-center justify-center overflow-hidden">
                  {form.profilePicture ? (
                    <img
                      src={(() => {
                        const baseUrl = API_URL.endsWith("/")
                          ? API_URL.slice(0, -1)
                          : API_URL;
                        let p = form.profilePicture;
                        if (!p.startsWith("/")) p = "/" + p;
                        return `${baseUrl}${p}`;
                      })()}
                      alt="Profile"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  ) : (
                    <span className="text-lg font-medium text-teal-700">
                      {form.firstName?.[0]}
                      {form.lastName?.[0]}
                    </span>
                  )}
                </div>
                <span className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 bg-teal-500 rounded-full border-2 border-white" />
              </div>

       
              <div className="flex flex-col gap-1">
                <h1 className="text-[17px] font-bold text-gray-700 leading-tight">
                  {form.firstName || form.lastName
                    ? `${form.firstName} ${form.lastName}`.trim()
                    : "Your Profile"}
                </h1>
                <div className="flex items-center gap-2 flex-wrap">
                  {form.headline && (
                    <span className="text-[12px] text-slate-400 max-w-xs truncate">
                      {form.headline}
                    </span>
                  )}
                  <span
                    className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full border ${
                      form.availability === "available"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : form.availability === "busy"
                          ? "bg-amber-50 text-amber-700 border-amber-200"
                          : "bg-slate-50 text-slate-500 border-slate-200"
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        form.availability === "available"
                          ? "bg-emerald-500"
                          : form.availability === "busy"
                            ? "bg-amber-500"
                            : "bg-slate-400"
                      }`}
                    />
                    {form.availability
                      ? form.availability.charAt(0).toUpperCase() +
                        form.availability.slice(1)
                      : "Available"}
                  </span>
                </div>
              </div>
            </div>

        
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-1.5 px-3.5 py-2 text-[13px] font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                <Eye size={14} />
                Preview
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-1.5 px-4 py-2 text-[13px] font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors disabled:opacity-60"
              >
                {saving ? (
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Save size={14} />
                )}
                {saving ? "Saving…" : "Save changes"}
              </button>
            </div>
          </div>


        </header>

       
        <div className="w-full flex-shrink-0 border-r border-slate-100 flex py-6 px-4"> 
          <nav className="w-full flex justify-center items-center gap-8 flex-1">
            {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveSection(id)}
                className={`flex items-center gap-1.5 px-4 py-3 text-[13px] font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeSection === id
                    ? "text-teal-700 border-teal-500"
                    : "text-slate-500 border-transparent hover:text-slate-700"
                }`}
              >
                <Icon
                  size={14}
                  className={
                    activeSection === id ? "text-teal-600" : "text-slate-400"
                  }
                />
                {label}
              </button>
            ))}
          </nav>

        </div>

      
        <div className="flex-1 overflow-y-auto px-8 py-6">
          <div className="max-w-3xl mx-auto flex flex-col gap-5">
            {renderSection()}
          </div>
        </div>
      </main>
    </div>
  );
};

export default InstructorProfilePage;
