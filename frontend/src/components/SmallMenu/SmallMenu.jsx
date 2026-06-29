
import "./SmallMenu.css";

const SmallMenu = () => {
  return (
    <div className="small-menu flex justify-center items-center">
      <ul className="flex flex-col justify-between items-start gap-y-4 w-full h-full">

        <li>Sort By Heights Marks</li>
        <li>Sort by Lowest Marks</li>
        <li>Filter by Course</li>
        <li>Show All Students</li>
      </ul>
    </div>
  );
};

export default SmallMenu;
