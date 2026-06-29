
import "./StatsCard.css";

const StatsCard = ({ icon: Icon, label, value, sub, accent = "var(--electric)", loading }) => {
  return (
    <div className="bg-white rounded-2xl p-6 flex flex-col gap-3 shadow-sm border border-gray-100 hover:shadow-md transition-all hover:-translate-y-0.5 duration-200">
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center"
        style={{ background: `${accent}22` }}
      >
        <Icon size={20} style={{ color: accent }} />
      </div>
      {loading ? (
        <div className="space-y-2 animate-pulse">
          <div className="h-8 w-16 bg-gray-100 rounded" />
          <div className="h-3 w-24 bg-gray-100 rounded" />
        </div>
      ) : (
        <>
          <span className="text-[2.2rem] font-black text-(--dark-navy) leading-none tracking-tight">
            {value ?? "—"}
          </span>
          <div>
            <p className="text-sm font-semibold text-gray-700">{label}</p>
            {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
          </div>
        </>
      )}
    </div>
  );
};

export default StatsCard;
