import { GRADES, type Grade } from "../data/types";
import { useActiveGrade } from "../context/ProfileContext";
import { useAppStore } from "../store/appStore";

/** Selector de curso del menú izquierdo. */
export function CourseSelector() {
  const grade = useActiveGrade();
  const setGrade = useAppStore((state) => state.setGrade);

  return (
    <div className="course-select">
      <span className="course-select__label">Tu curso</span>
      <select
        className="course-select__input"
        aria-label="Curso de estudio"
        value={grade}
        onChange={(event) => setGrade(Number(event.target.value) as Grade)}
      >
        {GRADES.map((value) => (
          <option key={value} value={value}>
            {value}º de Primaria
          </option>
        ))}
      </select>
    </div>
  );
}
