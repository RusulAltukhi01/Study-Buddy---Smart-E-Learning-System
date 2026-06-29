import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { CheckCircle, XCircle, Clock, FileText, ArrowLeft } from "lucide-react";
import assignmentService from "../../services/assignmentService";

const AssignmentGrade = () => {
  const { assignmentId } = useParams();
  const [grade, setGrade] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGrade();
  }, [assignmentId]);

  const fetchGrade = async () => {
    try {
      const response = await assignmentService.getMyGrade(assignmentId);
      setGrade(response);
    } catch (error) {
      console.error("Error fetching grade:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  if (!grade?.hasGrade) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <Clock size={48} className="mx-auto text-yellow-500 mb-3" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Not Graded Yet</h2>
          <p className="text-gray-600">Your submission is still being reviewed.</p>
        </div>
      </div>
    );
  }

  const percentage = grade.grade.percentage;
  const isPassing = percentage >= 60;
  const letterGrade = percentage >= 90 ? 'A' : percentage >= 80 ? 'B' : percentage >= 70 ? 'C' : percentage >= 60 ? 'D' : 'F';

  return (
    <div className="max-w-3xl mx-auto p-6">
      <button 
        onClick={() => window.history.back()}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6"
      >
        <ArrowLeft size={20} /> Back to Assignments
      </button>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        
        <div className="bg-gradient-to-r from-teal-600 to-teal-700 px-6 py-8 text-white">
          <h1 className="text-2xl font-bold mb-2">{grade.assignment.title}</h1>
          <p className="text-teal-100">Due: {new Date(grade.assignment.dueDate).toLocaleDateString()}</p>
        </div>

      
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Your Grade</h2>
            <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
              grade.grade.status === 'graded' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
            }`}>
              {grade.grade.status === 'graded' ? 'Graded' : 'Pending'}
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-5xl font-bold text-gray-900">{grade.grade.score}</div>
              <div className="text-gray-500">/ {grade.grade.maxScore} points</div>
            </div>
            
            <div className="flex-1">
              <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className={`absolute left-0 top-0 h-full rounded-full transition-all ${
                    isPassing ? 'bg-green-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <div className="flex justify-between mt-2">
                <span className="text-sm text-gray-600">{percentage.toFixed(1)}%</span>
                <span className={`text-sm font-semibold ${
                  isPassing ? 'text-green-600' : 'text-red-600'
                }`}>
                  Grade: {letterGrade}
                </span>
              </div>
            </div>
          </div>
        </div>

       
        {grade.grade.feedback && (
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Instructor Feedback</h2>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-700 whitespace-pre-wrap">{grade.grade.feedback}</p>
            </div>
          </div>
        )}

     
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Submission Details</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-500">Submitted on:</span>
              <span className="text-gray-700">{new Date(grade.grade.submittedAt).toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-500">Graded on:</span>
              <span className="text-gray-700">{new Date(grade.grade.gradedAt).toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignmentGrade;