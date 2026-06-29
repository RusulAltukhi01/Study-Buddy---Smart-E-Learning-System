import { Link } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";
import { useBreadcrumbs } from "../../hooks/useBreadcrumbs";
import "./Breadcrumb.css";

const Breadcrumb = ({ items = [], homeIcon = true, dynamicData = {} }) => {
  const breadcrumbs = useBreadcrumbs(items, dynamicData);

  if (breadcrumbs.length <= 1) return null;

  return (
    <nav
      aria-label="breadcrumb"
      className="breadcrumb-nav py-3 px-4  w-full flex justify-start bg-transparent"
    >
      <ol className="breadcrumb-list flex items-center flex-wrap gap-1">
        {breadcrumbs.map((crumb, index) => {
          const isLast = index === breadcrumbs.length - 1;

          return (
            <li key={index} className="flex items-center">
              {homeIcon && index === 0 ? (
                <Link
                  to={crumb.path}
                  className="text-gray-500 hover:text-(--bright-violet) transition-colors flex items-center gap-1"
                  aria-label="Home"
                >
                  <Home size={18} />
                  <span className="sr-only">Home</span>
                </Link>
              ) : isLast ? (
                <span className="current-page font-semibold text-(--bright-violet)">
                  {crumb.label}
                </span>
              ) : (
                <Link
                  to={crumb.path}
                  className="text-gray-500 hover:text-(--bright-violet) transition-colors"
                >
                  {crumb.label}
                </Link>
              )}

              {!isLast && (
                <ChevronRight size={14} className="mx-2 text-gray-400" />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumb;