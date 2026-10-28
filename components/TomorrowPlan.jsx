
import React, { useMemo } from 'react';

const MISTAKE_IDS = ['M1', 'M2', 'M3', 'M4', 'M5'];

function getStudentStatuses(student, fingerprints) {
  const id = student.id || student.authUid;
  const data = fingerprints[id] || fingerprints[student.authUid] || {};
  return data.fingerprints || data;
}

function getMistakeName(mistake) {
  if (!mistake) return '';
  return mistake.name?.en || mistake.name || mistake.title || mistake.id;
}

export default function TomorrowPlan({
  students = [],
  fingerprints = {},
  mistakes = [],
}) {
  const plan = useMemo(() => {
    if (!students.length) return null;

    const counts = MISTAKE_IDS.map((mistakeId) => {
      const studentIds = students
        .filter((student) => {
          const statuses = getStudentStatuses(student, fingerprints);
          return (
            statuses[mistakeId] === 'active' ||
            statuses[mistakeId] === 'reopened'
          );
        })
        .map((student) => student.id || student.authUid);

      return {
        mistakeId,
        count: studentIds.length,
        studentIds,
      };
    });

    const sorted = [...counts].sort((a, b) => {
      if (b.count !== a.count) return b.count - a.count;
      return (
        MISTAKE_IDS.indexOf(a.mistakeId) -
        MISTAKE_IDS.indexOf(b.mistakeId)
      );
    });

    if (!sorted.length || sorted[0].count === 0) {
      return { counts, recommendation: null };
    }

    return {
      counts,
      recommendation: sorted[0],
    };
  }, [students, fingerprints]);

  const selectedMistake = plan?.recommendation
    ? mistakes.find((mistake) => mistake.id === plan.recommendation.mistakeId)
    : null;

  return (
    <section className="teacher-card">
      <div className="teacher-section-heading">
        <div>
          <h2>Tomorrow's Plan</h2>
          <p className="teacher-muted">
            Prioritize the mistake that currently needs the most attention.
          </p>
        </div>
      </div>

      {!students.length ? (
        <div className="teacher-empty">
          <h3>Not enough student attempts yet</h3>
          <p>Add student attempts before creating a class recommendation.</p>
        </div>
      ) : !plan?.recommendation ? (
        <div className="teacher-empty">
          <h3>No priority identified yet</h3>
          <p>
            Not enough student attempts yet, or no students are currently
            marked as needing help.
          </p>
        </div>
      ) : (
        <>
          <div className="tomorrow-recommendation">
            <span className="tomorrow-eyebrow">Recommended focus</span>
            <h3>
              {plan.recommendation.mistakeId}: {getMistakeName(selectedMistake)}
            </h3>
            <p>
              {plan.recommendation.count}{' '}
              {plan.recommendation.count === 1 ? 'student needs' : 'students need'}{' '}
              attention for this mistake.
            </p>

            {selectedMistake?.hint && (
              <div className="tomorrow-teaching-tip">
                <strong>Teaching hint</strong>
                <p>
                  {selectedMistake.hint.en ||
                    selectedMistake.hint ||
                    'Review the concept and give students guided practice.'}
                </p>
              </div>
            )}

            {selectedMistake?.explanation && (
              <p className="teacher-muted">
                {selectedMistake.explanation.en ||
                  selectedMistake.explanation}
              </p>
            )}
          </div>

          <h3 className="tomorrow-subheading">Class attention by mistake</h3>

          <div className="tomorrow-count-list">
            {plan.counts.map((item) => {
              const name = getMistakeName(
                mistakes.find((mistake) => mistake.id === item.mistakeId)
              );
              const percentage = students.length
                ? (item.count / students.length) * 100
                : 0;

              return (
                <div className="tomorrow-count-row" key={item.mistakeId}>
                  <div className="tomorrow-count-label">
                    <span>
                      <strong>{item.mistakeId}</strong>
                      {name && <span className="teacher-muted"> — {name}</span>}
                    </span>
                    <span>{item.count}/{students.length}</span>
                  </div>
                  <div
                    className="tomorrow-progress-track"
                    role="progressbar"
                    aria-label={`${item.mistakeId}: ${item.count} students need attention`}
                    aria-valuemin={0}
                    aria-valuemax={students.length}
                    aria-valuenow={item.count}
                  >
                    <div
                      className="tomorrow-progress-fill"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      <p className="teacher-muted teacher-small">
        Counts include students with an active or reopened status. This is a
        teaching recommendation, not an automatic lesson assignment.
      </p>
    </section>
  );
}
