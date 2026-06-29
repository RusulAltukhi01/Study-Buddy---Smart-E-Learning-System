// import { useEffect, useState } from "react";
// import { useLocation } from "react-router-dom";

// export const useNavigationState = (key) => {
//   const location = useLocation();
//   const [state, setState] = useState(null);

//   useEffect(() => {
//     console.log(`🔍 Checking navigation state for "${key}":`, location.state);
    
//     if (location.state && location.state[key]) {
//       setState(location.state[key]);
      
//       // Clear after 3 seconds
//       const timer = setTimeout(() => {
//         setState(null);
//       }, 3000);
      
//       return () => clearTimeout(timer);
//     } else {
//       setState(null);
//     }
//   }, [location.key, location.state, key]);

//   return state;
// };