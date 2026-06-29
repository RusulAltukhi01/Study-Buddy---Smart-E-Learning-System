import { useMemo } from "react";
import { useLocation } from "react-router-dom";

export const useBreadcrumbs = (customItems = null, dynamicData = {}) => {
  const location = useLocation();

  const breadcrumbs = useMemo(() => {

    if (customItems && customItems.length > 0) {
      return customItems;
    }

    if (location.pathname === "/") {
      return [{ label: "Home", path: "/" }];
    }


    const paths = location.pathname.split("/").filter(Boolean);
    
    const breadcrumbItems = paths.map((path, index) => {
      const url = `/${paths.slice(0, index + 1).join("/")}`;
      

      let label = path;
      
     
      if (/^[0-9a-fA-F]{24}$/.test(path) && dynamicData.classroomName) {
        label = dynamicData.classroomName;
      } else {

        label = path
          .replace(/-/g, " ")
          .replace(/_/g, " ")
          .split(" ")
          .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(" ");
      }
      
      return { label, path: url };
    });

    return [
      { label: "Home", path: "/" },
      ...breadcrumbItems
    ];
  }, [location.pathname, customItems, dynamicData.classroomName]);

  return breadcrumbs;
};