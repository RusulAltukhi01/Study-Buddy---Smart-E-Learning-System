
import { School, User, Verified } from "lucide-react";
import "./ProfileNavigator.css";

const ProfileNavigator = () => {
  return (
    <div className="profile-navigator w-full bg-gray-100 ">
      <ul className="w-full flex justify-between items-center">

        <li><User /> personal</li>
        <li><School /> educational</li>
        <li><Verified /> verification</li>
        <li><Verified /> verification</li>

      </ul>
    </div>
  );
};

export default ProfileNavigator;
