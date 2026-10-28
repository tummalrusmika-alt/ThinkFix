
import React from 'react';

const MISTAKE_IDS = ['M1', 'M2', 'M3', 'M4', 'M5'];

const STATUS_LABELS = {
  active: 'Needs help',
  improving: 'Improving',
  provisionally_fixed: 'Almost fixed',
  reopened: 'Needs review',
  none: 'No data',
};

function normalizeStatus(status) {
  return STATUS_LABELS[status] ? status : 'none';
}

export default function MistakeHeatmap({
  students = [],
  fingerprints = {},
  mistakes = [],
}) {
  const mistakeName = (id) => {
    const mistake = mistakes.find((item) => item.id === id);
    return mistake?.name?.en || mistake?.name || mistake?.title || id;
  };

  const getStudentName = (student) =>
    student.nickname || student.name || student.displayName || student.id;

  const getStatus = (student, mistakeId) => {
    const studentId = student.id || student.authUid;
    const studentData =
      fingerprints[studentId] ||
      fingerprints[student.authUid] ||
      {};

    // Supports either { studentId: { M1: 'active' } }
    // or { studentId: { fingerprints: { M1: 'active' } } }.
    const statuses = studentData.fingerprints || studentData;
    return normalizeStatus(statuses[mistakeId]);
  };

  if (!students.length) {
    return (
      <section className="teacher-card">
        <h2>Mistake Heatmap</h2>
        <p className="teacher-muted">
          No students or student attempts are available yet.
        </p>
      </section>
    );
  }

  return (
    <section className="teacher-card">
      <div className="teacher-section-heading">
        <div>
          <h2>Mistake Heatmap</h2>
          <p className="teacher-muted">
            See which mistakes need attention across your class.
          </p>
        </div>
      </div>

      <div className="teacher-table-scroll">
        <table className="teacher-table heatmap-table">
          <thead>
            <tr>
              <th scope="col">Student</th>
              {MISTAKE_IDS.map((id) => (
                <th scope="col" key={id} title={mistakeName(id)}>
                  {id}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {students.map((student) => (
              <tr key={student.id || student.authUid}>
                <th scope="row" className="heatmap-student">
                  {getStudentName(student)}
                </th>

                {MISTAKE_IDS.map((mistakeId) => {
                  const status = getStatus(student, mistakeId);

                  return (
                    <td key={mistakeId}>
                      <span
                        className={`heatmap-cell heatmap-${status}`}
                        title={`${mistakeName(mistakeId)}: ${STATUS_LABELS[status]}`}
                        aria-label={`${mistakeId}: ${STATUS_LABELS[status]}`}
                      >
                        {STATUS_LABELS[status]}
                      </span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="heatmap-legend" aria-label="Heatmap legend">
        {Object.entries(STATUS_LABELS).map(([status, label]) => (
          <span className="legend-item" key={status}>
            <span className={`legend-dot heatmap-${status}`} />
            {label}
          </span>
        ))}
      </div>

      <p className="teacher-muted teacher-small">
        M1–M5 represent the five configured mistake categories. “No data”
        means a status has not been supplied; it does not mean the student
        has mastered the concept.
      </p>
    </section>
  );
}
