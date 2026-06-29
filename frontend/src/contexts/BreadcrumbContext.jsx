// import { createContext, useCallback, useContext, useState } from "react";

// const BreadcrumbContext = createContext();

// export const useBreadcrum = () => {
//   const context = useContext(BreadcrumbContext);
//   if (!context) {
//     throw new Error("useBreadcrumb must be used within BreadcrumbProvider");
//   }
//   return context;
// };

// export const BreadcrumbProvider = ({ children }) => {
//   const [breadcrumbs, setBreadcrumbs] = useState([]);

//   const updateBreadcrumbs = useCallback((newBreadcrumbs) => {
//     setBreadcrumbs(newBreadcrumbs);
//   }, []);

//   const addBreadcrumb = useCallback((crumb) => {
//     setBreadcrumbs((prev) => [...prev, crumb]);
//   }, []);

//   const clearBreadcrumbs = useCallback(() => {
//     setBreadcrumbs([]);
//   }, []);

//   return (
//     <BreadcrumbContext.Provider
//       value={{
//         breadcrumbs,
//         updateBreadcrumbs,
//         addBreadcrumb,
//         clearBreadcrumbs,
//       }}
//     >
//       {children}
//     </BreadcrumbContext.Provider>
//   );
// };