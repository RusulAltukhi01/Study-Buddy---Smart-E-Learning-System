import { useState, useRef, useEffect } from "react";
import {
  User,
  FileText,
  BookOpen,
  Award,
  Calendar,
  Settings,
  Camera,
  X,
  Plus,
  GraduationCap,
  Mail,
  Phone,
  MapPin,
  Clock,
  CheckCircle,
  TrendingUp,
  Target,
  Save,
  ChevronDown,
  Heart,
  Star,
  Users,
  ChevronsDown,
  ChevronRight,
  Eye,
} from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { useAuth } from "../../contexts/AuthContext";
import defaultAvatar from "../../assets/default-avatar.png";
import { getImageUrl } from "../../utils/getImageUrl";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const NAV_ITEMS = [
  { id: "personal", label: "Personal Details", icon: User },
  { id: "academic", label: "Academic Info", icon: GraduationCap },
  { id: "progress", label: "Learning Progress", icon: TrendingUp },
  { id: "achievements", label: "Achievements", icon: Award },
  // { id: "preferences", label: "Preferences", icon: Settings },
];

const EDUCATION_LEVELS = [
  { value: "high_school", label: "High School" },
  { value: "bachelor", label: "Bachelor's Degree" },
  { value: "master", label: "Master's Degree" },
  { value: "phd", label: "PhD" },
  { value: "other", label: "Other" },
];

// const INTERESTS = [
//   "Web Development",
//   "Mobile Development",
//   "Data Science",
//   "AI/ML",
//   "Cloud Computing",
//   "DevOps",
//   "Cybersecurity",
//   "Game Development",
//   "UI/UX Design",
//   "Digital Marketing",
//   "Business",
//   "Languages",
// ];

// eslint-disable-next-line no-unused-vars
const SectionHeader = ({ icon: Icon, title, subtitle, color = "teal" }) => {
  const colors = {
    teal: "bg-teal-50 text-teal-600",
    violet: "bg-violet-50 text-violet-600",
    amber: "bg-amber-50 text-amber-600",
    blue: "bg-blue-50 text-blue-600",
    emerald: "bg-emerald-50 text-emerald-600",
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
      placeholder:text-slate-300 disabled:bg-gray-100 disabled:text-gray-500 ${className}`}
    {...props}
  />
);

const Textarea = ({ className = "", ...props }) => (
  <textarea
    className={`w-full px-3.5 py-2.5 text-sm text-slate-700 bg-slate-50 border border-slate-200
      rounded-xl focus:outline-none focus:border-teal-400 focus:bg-white transition-all
      placeholder:text-slate-300 resize-none disabled:bg-gray-100 disabled:text-gray-500 ${className}`}
    {...props}
  />
);

const Tag = ({ label, onRemove, color = "teal" }) => {
  const colors = {
    teal: "bg-teal-100 text-teal-700",
    violet: "bg-violet-100 text-violet-700",
    emerald: "bg-emerald-100 text-emerald-700",
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

const AddTagInput = ({ placeholder, onAdd, suggestions = [] }) => {
  const [val, setVal] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const submit = () => {
    if (!val.trim()) return;
    onAdd(val.trim());
    setVal("");
    setShowSuggestions(false);
  };

  return (
    <div className="relative">
      <span
        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold
        border-2 border-dashed border-slate-300 text-slate-400 cursor-pointer hover:border-teal-400
        hover:text-teal-500 transition-all"
      >
        <input
          value={val}
          onChange={(e) => setVal(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          placeholder={placeholder}
          className="bg-transparent outline-none w-24 placeholder:text-slate-300 text-xs"
        />
        <button onClick={submit}>
          <Plus size={11} strokeWidth={2.5} />
        </button>
      </span>

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-slate-200 rounded-lg shadow-lg z-10">
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => {
                onAdd(s);
                setVal("");
                setShowSuggestions(false);
              }}
              className="w-full text-left px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50 transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// eslint-disable-next-line no-unused-vars
const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm">
    <div className="flex items-center gap-3">
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}
      >
        <Icon size={18} />
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-800">{value}</p>
        <p className="text-xs text-slate-500">{label}</p>
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
          <Field label="Email Address">
            <Input
              type="email"
              value={form.email}
              onChange={(e) =>
                setForm((p) => ({ ...p, email: e.target.value }))
              }
              placeholder="your@email.com"
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
          <div className="col-span-2">
            <Field label="Bio / About Me">
              <Textarea
                value={form.bio}
                onChange={(e) =>
                  setForm((p) => ({ ...p, bio: e.target.value }))
                }
                placeholder="Tell us about yourself, your interests, and learning goals..."
                rows={3}
              />
            </Field>
          </div>
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

const AcademicSection = ({ form, setForm }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-7 shadow-sm">
      <SectionHeader
        icon={GraduationCap}
        title="Academic Information"
        color="violet"
      />

      <div className="grid grid-cols-2 gap-4">
        <Field label="Education Level">
          <div className="relative">
            <select
              value={form.educationLevel}
              onChange={(e) =>
                setForm((p) => ({ ...p, educationLevel: e.target.value }))
              }
              className="w-full px-3.5 py-2.5 text-sm text-slate-700 bg-slate-50 border border-slate-200
                rounded-xl focus:outline-none focus:border-teal-400 appearance-none cursor-pointer"
            >
              <option value="">Select education level</option>
              {EDUCATION_LEVELS.map((level) => (
                <option key={level.value} value={level.value}>
                  {level.label}
                </option>
              ))}
            </select>
            <ChevronsDown
              size={14}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
          </div>
        </Field>

        <Field label="Institution / School">
          <Input
            value={form.institution}
            onChange={(e) =>
              setForm((p) => ({ ...p, institution: e.target.value }))
            }
            placeholder="Your school or university"
          />
        </Field>

        <Field label="Field of Study">
          <Input
            value={form.fieldOfStudy}
            onChange={(e) =>
              setForm((p) => ({ ...p, fieldOfStudy: e.target.value }))
            }
            placeholder="e.g., Computer Science, Business"
          />
        </Field>

        <Field label="Expected Graduation Year">
          <Input
            type="number"
            value={form.graduationYear}
            onChange={(e) =>
              setForm((p) => ({ ...p, graduationYear: e.target.value }))
            }
            placeholder="2025"
          />
        </Field>
      </div>

      <div className="mt-6">
        <Field label="Areas of Interest">
          <div className="flex flex-wrap gap-2 items-center">
            {(form.interests || []).map((interest, i) => (
              <Tag
                key={i}
                label={interest}
                color="violet"
                onRemove={() =>
                  setForm((p) => ({
                    ...p,
                    interests: p.interests.filter((_, j) => j !== i),
                  }))
                }
              />
            ))}
            <AddTagInput
              placeholder="+ Add Interest"
              // suggestions={INTERESTS}
              onAdd={(tag) =>
                setForm((p) => ({
                  ...p,
                  interests: [...(p.interests || []), tag],
                }))
              }
            />
          </div>
        </Field>
      </div>
    </div>
  );
};

const ProgressSection = ({ form, stats }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-7 shadow-sm">
      <SectionHeader
        icon={TrendingUp}
        title="Learning Progress"
        subtitle="Your learning journey at a glance"
        color="emerald"
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={BookOpen}
          label="Courses Enrolled"
          value={stats?.totalCourses || 0}
          color="bg-blue-50 text-blue-600"
        />
        <StatCard
          icon={CheckCircle}
          label="Courses Completed"
          value={stats?.completedCourses || 0}
          color="bg-green-50 text-green-600"
        />
        <StatCard
          icon={Clock}
          label="Study Hours"
          value={stats?.totalStudyHours || 0}
          color="bg-amber-50 text-amber-600"
        />
        <StatCard
          icon={Star}
          label="Average Score"
          value={`${stats?.averageScore || 0}%`}
          color="bg-purple-50 text-purple-600"
        />
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-slate-700">
            Learning Goals
          </h3>
          <button className="text-xs text-teal-600 hover:text-teal-700 font-semibold">
            + Add Goal
          </button>
        </div>
        <div className="space-y-3">
          {(form.learningGoals || []).map((goal, i) => (
            <div key={i} className="bg-slate-50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-800">
                  {goal.goal}
                </span>
                <span className="text-xs text-slate-500">{goal.progress}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-1.5">
                <div
                  className="bg-teal-500 rounded-full h-1.5 transition-all"
                  style={{ width: `${goal.progress}%` }}
                />
              </div>
            </div>
          ))}
          {(form.learningGoals || []).length === 0 && (
            <p className="text-sm text-slate-400 text-center py-4">
              No learning goals set yet. Click "Add Goal" to create one!
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

const AchievementsSection = ({ form }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-7 shadow-sm">
      <SectionHeader
        icon={Award}
        title="Achievements & Badges"
        subtitle="Your earned accomplishments"
        color="amber"
      />

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {(form.badges || []).length > 0 ? (
          form.badges.map((badge, i) => (
            <div
              key={i}
              className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl p-4 text-center border border-amber-100"
            >
              <div className="w-12 h-12 rounded-full bg-amber-200 flex items-center justify-center mx-auto mb-3">
                <Award size={20} className="text-amber-700" />
              </div>
              <h4 className="text-sm font-semibold text-slate-800">
                {badge.name}
              </h4>
              <p className="text-xs text-slate-500 mt-1">{badge.description}</p>
              <p className="text-[10px] text-amber-600 mt-2">
                {badge.earnedDate}
              </p>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-8">
            <Award size={40} className="text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-500">
              No achievements yet. Keep learning to earn badges!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};



const StudentProfilePage = () => {
  const [activeSection, setActiveSection] = useState("personal");
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState({
    totalCourses: 0,
    completedCourses: 0,
    totalStudyHours: 0,
    averageScore: 0,
  });
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    profilePicture: "",
    bio: "",
    educationLevel: "",
    institution: "",
    fieldOfStudy: "",
    graduationYear: "",
    interests: [],
    learningGoals: [],
    badges: [],
    emailNotifications: {
      courseUpdates: true,
      deadlines: true,
      achievements: true,
    },
    isPublic: false,
    showOnLeaderboard: true,
  });

  const { updateUser } = useAuth();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");

       
        const profileRes = await axios.get(`${API_URL}/api/student/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (profileRes.data.success) {
          const d = profileRes.data.data;
          setForm({
            firstName: d.firstName || "",
            lastName: d.lastName || "",
            email: d.email || "",
            phoneNumber: d.phoneNumber || "",
            profilePicture: d.profilePicture || "",
            bio: d.bio || "",
            educationLevel: d.educationLevel || "",
            institution: d.institution || "",
            fieldOfStudy: d.fieldOfStudy || "",
            graduationYear: d.graduationYear || "",
            interests: d.interests || [],
            learningGoals: d.learningGoals || [],
            badges: d.badges || [],
            emailNotifications: d.emailNotifications || {
              courseUpdates: true,
              deadlines: true,
              achievements: true,
            },
            isPublic: d.isPublic || false,
            showOnLeaderboard: d.showOnLeaderboard !== false,
          });
        }

        
        const statsRes = await axios.get(`${API_URL}/api/student/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (statsRes.data.success) {
          setStats(statsRes.data.data);
        }
      } catch (err) {
        console.error("Failed to fetch profile:", err.message);
        toast.error("Failed to load profile data");
      }
    };

    fetchProfile();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.put(`${API_URL}/api/student/profile`, form, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (data.success) {
        toast.success("Profile saved successfully!");
       
        if (updateUser) updateUser(data.data);

       
        const statsRes = await axios.get(`${API_URL}/api/student/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (statsRes.data.success) {
          setStats(statsRes.data.data);
        }
      } else {
        toast.error(data.error || "Failed to save");
      }
    } catch (err) {
      console.error("Save error:", err);
      toast.error(err.response?.data?.error || "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  const renderSection = () => {
    switch (activeSection) {
      case "personal":
        return <PersonalSection form={form} setForm={setForm} />;
      case "academic":
        return <AcademicSection form={form} setForm={setForm} />;
      case "progress":
        return <ProgressSection form={form} stats={stats} setForm={setForm} />;
      case "achievements":
        return <AchievementsSection form={form} />;
      // case "preferences":
      //   return <PreferencesSection form={form} setForm={setForm} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-slate-100 px-8 pt-6 pb-0  relative overflow-hidden">
          {/* Decorative circles */}
          <div className="absolute -top-16 -right-20 w-64 h-64 rounded-full bg-teal-500/5 pointer-events-none" />
          <div className="absolute top-5 right-10 w-28 h-28 rounded-full bg-teal-500/[0.04] pointer-events-none" />

          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mb-3 relative z-10">
            <span className="text-gray-500 ">Dashboard</span>
            <ChevronRight size={11} />
            <span className="text-gray-700 font-semibold">Profile settings</span>
          </div>

          
          <div className="flex items-start justify-between gap-6 relative z-10 my-5">
            <div className="flex items-center gap-3.5">
           
              <div className="relative flex-shrink-0">
                <div className="w-14 h-14 rounded-full bg-teal-50 border-[2.5px] border-teal-400 flex items-center justify-center overflow-hidden">
                  {form.profilePicture ? (
                    <img
                      src={getImageUrl(form.profilePicture) || getImageUrl()}
                      alt="Profile"
                      className="w-full h-full object-cover"
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
                <div className="flex items-center gap-2">
                  {(form.fieldOfStudy || form.institution) && (
                    <span className="text-[12px] text-slate-400">
                      {[form.fieldOfStudy, form.institution]
                        .filter(Boolean)
                        .join(" · ")}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                    <Star size={10} />
                    Pro learner
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
            {/* eslint-disable-next-line no-unused-vars */}
            {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveSection(id)}
                className={`font-semibold flex items-center gap-3 px-3 py-2.5 text-sm transition-all cursor-pointer text-left border-b-2 ${
                  activeSection === id
                    ? "border-teal-500 text-teal-700"
                    : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                <Icon
                  size={15}
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
          <div className="max-w-4xl mx-auto">{renderSection()}</div>
        </div>
      </main>
    </div>
  );
};

export default StudentProfilePage;
