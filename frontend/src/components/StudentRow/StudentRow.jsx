import { Delete, Edit } from "lucide-react";

export default function StudentRow({ student, isSelected, onSelect,onDelete, onEdit }) {
  return (
    <tr className={isSelected ? "selected-row" : ""}>
      <td>
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onSelect(student.id)}
        />
      </td>

      <td>{student.name}</td>
      <td>{student.roll}</td>
      <td>{student.address}</td>
      <td>{student.class}</td>
      <td>{student.dob}</td>
      <td>{student.phone}</td>

      <td className="actions">
        <button className="edit-btn" onClick={() => onEdit(student.id)}><Edit/></button>
        <button className="delete-btn" onClick={() => onDelete(student.id)}><Delete/></button>
      </td>
    </tr>
  );
}