import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { FileText, CheckCircle, Clock, XCircle } from "lucide-react";
import assignmentService from "../../services/assignmentService";

const MyGrades = () => {
  const { classroomId } = useParams();
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGrades();
  }, [classroomId]);

  const fetchGrades = async () => {
    try {
      const response = await assignmentService.getMyGrades(classroomId);
      setGrades(response.grades);
    } catch (error) {
      console.error("Error fetching grades:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'graded':
        return <CheckCircle size={18} className="text-green-500" />;
      case 'submitted':
        return <Clock size={18} className="text-yellow-500" />;
      default:
        return <XCircle size={18} className="text-red-400" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'graded': return 'Graded';
      case 'submitted': return 'Pending Review';
      default: return 'Not Submitted';
    }
  };

  const calculateGrade = (score, maxScore) => {
    if (!score) return null;
    const percentage = (score / maxScore) * 100;
    return {
      percentage: percentage.toFixed(1),
      letter: percentage >= 90 ? 'A' : percentage >= 80 ? 'B' : percentage >= 70 ? 'C' : percentage >= 60 ? 'D' : 'F'
    };
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading grades...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Grades</h1>
      
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Assignment</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Status</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Score</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Grade</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {grades.map((assignment) => {
              const gradeInfo = assignment.score ? calculateGrade(assignment.score, assignment.maxScore) : null;
              
              return (
                <tr key={assignment.assignmentId} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <FileText size={18} className="text-gray-400" />
                      <span className="font-medium text-gray-800">{assignment.title}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(assignment.status)}
                      <span className="text-sm text-gray-600">{getStatusText(assignment.status)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {assignment.score ? (
                      <span className="font-semibold text-gray-800">
                        {assignment.score} / {assignment.maxScore}
                      </span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {gradeInfo ? (
                      <span className={`font-semibold ${
                        gradeInfo.letter === 'F' ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {gradeInfo.letter} ({gradeInfo.percentage}%)
                      </span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <Link
                      to={`/student/assignments/${assignment.assignmentId}/grade`}
                      className="text-teal-600 hover:text-teal-700 text-sm font-medium"
                    >
                      View Details →
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        
        {grades.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            No assignments found
          </div>
        )}
      </div>
    </div>
  );
};

export default MyGrades;