
import React, { useMemo, useState } from 'react';

function studentName(student) {
  return (
    student.nickname ||
    student.name ||
    student.displayName ||
    student.id ||
    'Student'
  );
}

function getStatuses(student, fingerprints) {
  const id = student.id || student.authUid;
  const data = fingerprints[id] || fingerprints[student.authUid] || {};
  return data.fingerprints || data;
}

export default function FixPartners({
  students = [],
  fingerprints = {},
  onAccept,
  onIgnore,
  onChangePartner,
}) {
  const [decisions, setDecisions] = useState({});
  const [selectedPartners, setSelectedPartners] = useState({});

  const suggestions = useMemo(() => {
    const result = [];

    students.forEach((helper) => {
      const helperStatuses = getStatuses(helper, fingerprints);

      Object.entries(helperStatuses).forEach(([mistakeId, status]) => {
        if (status !== 'provisionally_fixed') return;

        students.forEach((learner) => {
          if (
            (learner.id || learner.authUid) ===
            (helper.id || helper.authUid)
          ) {
            return;
          }

          const learnerStatuses = getStatuses(learner, fingerprints);

          if (
            learnerStatuses[mistakeId] === 'active' ||
            learnerStatuses[mistakeId] === 'reopened'
          ) {
            const key = `${mistakeId}:${helper.id || helper.authUid}:${
              learner.id || learner.authUid
            }`;

            result.push({
              key,
              mistakeId,
              helper,
              learner,
            });
          }
        });
      });
    });

    return result;
  }, [students, fingerprints]);

  const updateDecision = (suggestion, decision) => {
    setDecisions((previous) => ({
      ...previous,
      [suggestion.key]: decision,
    }));

    if (decision === 'accepted') onAccept?.(suggestion);
    if (decision === 'ignored') onIgnore?.(suggestion);
  };

  const changePartner = (suggestion, newHelperId) => {
    const newHelper = students.find(
      (student) =>
        (student.id || student.authUid) === newHelperId
    );

    if (!newHelper) return;

    const changedSuggestion = {
      ...suggestion,
      helper: newHelper,
    };

    setSelectedPartners((previous) => ({
      ...previous,
      [suggestion.key]: newHelperId,
    }));

    onChangePartner?.(changedSuggestion);
  };

  return (
    <section className="teacher-card">
      <div className="teacher-section-heading">
        <div>
          <h2>Fix Partners</h2>
          <p className="teacher-muted">
            Pair students who can help each other with a specific mistake.
          </p>
        </div>
        <span className="teacher-count">{suggestions.length} suggestions</span>
      </div>

      {suggestions.length === 0 ? (
        <div className="teacher-empty">
          <h3>No partner suggestions yet</h3>
          <p>
            Suggestions appear when one student provisionally fixes a mistake
            and another student needs help with that same mistake.
          </p>
        </div>
      ) : (
        <div className="partner-list">
          {suggestions.map((suggestion) => {
            const decision = decisions[suggestion.key];
            const currentHelperId =
              selectedPartners[suggestion.key] ||
              suggestion.helper.id ||
              suggestion.helper.authUid;

            return (
              <article className="partner-item" key={suggestion.key}>
                <div className="partner-info">
                  <span className="partner-mistake">
                    {suggestion.mistakeId}
                  </span>
                  <div>
                    <h3>
                      {studentName(suggestion.learner)}
                      <span className="teacher-muted"> needs help from </span>
                      {studentName(
                        students.find(
                          (student) =>
                            (student.id || student.authUid) === currentHelperId
                        ) || suggestion.helper
                      )}
                    </h3>
                    <p className="teacher-muted">
                      Matching mistake: {suggestion.mistakeId}
                    </p>
                  </div>
                </div>

                <div className="partner-actions">
                  <label className="teacher-label">
                    Helper
                    <select
                      className="teacher-select"
                      value={currentHelperId}
                      onChange={(event) =>
                        changePartner(suggestion, event.target.value)
                      }
                      disabled={decision === 'accepted'}
                    >
                      {students
                        .filter((student) => {
                          const id = student.id || student.authUid;
                          const status = getStatuses(
                            student,
                            fingerprints
                          )[suggestion.mistakeId];

                          return (
                            id !==
                              (suggestion.learner.id ||
                                suggestion.learner.authUid) &&
                            status === 'provisionally_fixed'
                          );
                        })
                        .map((student) => (
                          <option
                            key={student.id || student.authUid}
                            value={student.id || student.authUid}
                          >
                            {studentName(student)}
                          </option>
                        ))}
                    </select>
                  </label>

                  {decision === 'accepted' ? (
                    <span className="decision-label decision-accepted">
                      Accepted
                    </span>
                  ) : decision === 'ignored' ? (
                    <span className="decision-label">Ignored</span>
                  ) : (
                    <>
                      <button
                        type="button"
                        className="teacher-button teacher-button-primary"
                        onClick={() =>
                          updateDecision(suggestion, 'accepted')
                        }
                      >
                        Accept
                      </button>
                      <button
                        type="button"
                        className="teacher-button teacher-button-secondary"
                        onClick={() =>
                          updateDecision(suggestion, 'ignored')
                        }
                      >
                        Ignore
                      </button>
                    </>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}

      <p className="teacher-muted teacher-small">
        These are suggestions, not confirmed assignments. Decisions remain
        in this component's current session unless your dashboard saves them.
      </p>
    </section>
  );
}
