import { CircleChevronRight } from "lucide-react";
import "./Table.css";
import { useNavigate } from "react-router-dom";

const Table = ({ tableTitle, data = [] }) => {
  const navigate = useNavigate();

  function handleNavigateToStudents() {
    navigate("/instructor/all-students", { replace: true });
  }

  return (
    <div className="table flex flex-col w-full min-h-fit max-h-screen">
      <header className="table-header w-full p-6 flex justify-between items-center">
        <h1 className="font-bold text-[2em] text-(--dark-navy)">{tableTitle}</h1>

        <span
          title="show more"
          onClick={handleNavigateToStudents}
          className="cursor-pointer"
        >
          <CircleChevronRight size={30} />
        </span>
      </header>

      <table>
        <thead>
          <tr>
            {data.length > 0 &&
              Object.keys(data[0]).map((key, index) => (
                <th key={index}>{key}</th>
              ))}
          </tr>
        </thead>

        <tbody>
          {data.length > 0 ? (
            data.map((row, index) => (
              <tr key={index}>
                {Object.values(row).map((value, i) => (
                  <td key={i}>{value}</td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="100%" style={{ textAlign: "center", fontWeight: '700', fontSize:"32px", color: "var(--color-gray-400)" }}>
                No data available
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
