import { Icon } from "../components/Icon";
import { PageHeader } from "../components/PageHeader";
import { SubjectCard } from "../components/SubjectCard";
import { useActiveGrade, useProfileContext } from "../context/ProfileContext";
import { useLearningStats } from "../db/hooks";
import { studyableSubjects } from "../data/lookup";
import type { Subject } from "../data/types";

function subjectMastery(subject: Subject, unitMastery: Record<string, number>) {
  const ready = subject.units.filter((unit) => unit.status === "ready");
  if (ready.length === 0) return 0;
  return Math.round(
    ready.reduce((sum, unit) => sum + (unitMastery[unit.id] ?? 0), 0) /
      ready.length,
  );
}

export function Subjects() {
  const profile = useProfileContext();
  const grade = useActiveGrade();
  const stats = useLearningStats(profile.id, grade);
  const ready = studyableSubjects(grade).filter(
    (subject) => subject.status === "ready",
  );
  const soon = studyableSubjects(grade).filter(
    (subject) => subject.status === "soon",
  );
  const empty = ready.length === 0 && soon.length === 0;

  return (
    <div className="page">
      <PageHeader
        eyebrow={`${grade}º de Primaria`}
        title="Materias"
        description="Todo lo que hay en el cuaderno, ordenado como en el colegio. Lo que todavía no está listo se irá abriendo poco a poco."
      />

      {empty ? (
        <div className="notice">
          <Icon name="spark" size={18} />
          <p>El contenido de {grade}º todavía se está preparando.</p>
        </div>
      ) : null}

      <section className="section">
        <div className="section__head">
          <h2>Listas para practicar</h2>
          <span className="chip chip--soft">{ready.length} materia</span>
        </div>
        <div className="subject-grid subject-grid--wide">
          {ready.map((subject) => (
            <SubjectCard
              key={subject.id}
              subject={subject}
              mastery={subjectMastery(subject, stats.unitMastery)}
            />
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section__head">
          <h2>En camino</h2>
          <span className="chip chip--soft">{soon.length} materias</span>
        </div>
        <div className="subject-grid subject-grid--wide">
          {soon.map((subject) => (
            <SubjectCard
              key={subject.id}
              subject={subject}
              mastery={subjectMastery(subject, stats.unitMastery)}
            />
          ))}
        </div>
      </section>

      <p className="footnote">
        {grade === 3
          ? "El mapa sigue la programación anual de 3º que compartiste. Si el libro de este curso cambia de orden, se ajusta sin rehacer la aplicación."
          : `El mapa de ${grade}º se irá llenando a medida que llegue contenido.`}
      </p>
    </div>
  );
}
