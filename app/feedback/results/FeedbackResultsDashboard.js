"use client";

import { useState } from "react";

const QUESTIONS = {
  organisation: {
    title:
      "Overall, how well was the event organised?",
    positive: [
      "Excellent",
      "Very good",
    ],
    category: "Organisation",
  },

  communication: {
    title:
      "How clear was communication before the event?",
    positive: [
      "Very clear",
      "Clear",
    ],
    category: "Communication",
  },

  coordination: {
    title:
      "How well did the artists and management coordinate?",
    positive: [
      "Excellent",
      "Very good",
    ],
    category:
      "Artist-management coordination",
  },

  rehearsal: {
    title:
      "How effective was the rehearsal process?",
    positive: [
      "Very effective",
      "Effective",
    ],
    category: "Rehearsal",
  },

  soundcheck: {
    title:
      "How would you rate the soundcheck?",
    positive: [
      "Excellent",
      "Very good",
    ],
    category: "Soundcheck",
  },

  soundQuality: {
    title:
      "How was the sound quality during the event?",
    positive: [
      "Excellent",
      "Very good",
    ],
    category: "Sound quality",
  },

  schedule: {
    title:
      "How smoothly did the event follow the planned schedule?",
    positive: [
      "Completely according to plan",
      "Mostly according to plan",
    ],
    category: "Schedule",
  },

  transitions: {
    title:
      "How smooth were transitions between performances?",
    positive: [
      "Excellent",
      "Very good",
    ],
    category: "Transitions",
  },

  responsibilityClarity: {
    title:
      "Were your responsibilities clear before the event?",
    positive: [
      "Completely clear",
      "Mostly clear",
    ],
    category: "Role clarity",
  },

  preparedness: {
    title:
      "How prepared did you personally feel?",
    positive: [
      "Fully prepared",
      "Well prepared",
    ],
    category: "Preparedness",
  },

  biggestImprovement: {
    title:
      "Which area MOST needs improvement?",
    special: true,
  },

  strongestArea: {
    title:
      "What was the strongest part of the event?",
    special: true,
  },

  managementFocus: {
    title:
      "What should management focus on most next time?",
    special: true,
  },

  artistFocus: {
    title:
      "What should artists collectively improve most?",
    special: true,
  },

  workAgain: {
    title:
      "Would you be comfortable working with the same team again?",
    positive: [
      "Definitely",
      "Probably",
    ],
    category: "Team confidence",
  },
};

const BAR_COLOURS = [
  "#d8a03a",
  "#a84d28",
  "#7e2620",
  "#e2bb64",
  "#b96835",
  "#8f3326",
  "#c48a42",
  "#6b1f1d",
  "#e0a954",
  "#aa5a32",
  "#873024",
];

const STRENGTH_COLOURS = [
  "#e8ad3a",
  "#c97832",
  "#8e2f1c",
];

const IMPROVEMENT_COLOURS = [
  "#6f1d1b",
  "#aa4130",
  "#d78362",
];

function percentage(count, total) {
  if (!total) return 0;

  return Math.round(
    (count / total) * 100,
  );
}

function scoreLabel(score) {
  if (score >= 80) {
    return "Strong";
  }

  if (score >= 60) {
    return "Good";
  }

  if (score >= 40) {
    return "Needs attention";
  }

  return "Priority issue";
}

function getScore(
  rows,
  positiveOptions,
  total,
) {
  if (
    !rows?.length ||
    !positiveOptions ||
    !total
  ) {
    return 0;
  }

  const positiveCount = rows
    .filter((row) =>
      positiveOptions.includes(
        row.option_value,
      ),
    )
    .reduce(
      (sum, row) =>
        sum + row.response_count,
      0,
    );

  return Math.round(
    (positiveCount / total) * 100,
  );
}

function getTopOption(rows = []) {
  if (!rows.length) {
    return null;
  }

  return [...rows].sort(
    (a, b) =>
      b.response_count -
      a.response_count,
  )[0];
}

function polarToCartesian(
  cx,
  cy,
  radius,
  angleDegrees,
) {
  const angleRadians =
    ((angleDegrees - 90) *
      Math.PI) /
    180;

  return {
    x:
      cx +
      radius *
        Math.cos(angleRadians),

    y:
      cy +
      radius *
        Math.sin(angleRadians),
  };
}

function describeDonutSegment(
  cx,
  cy,
  outerRadius,
  innerRadius,
  startAngle,
  endAngle,
) {
  const outerStart =
    polarToCartesian(
      cx,
      cy,
      outerRadius,
      endAngle,
    );

  const outerEnd =
    polarToCartesian(
      cx,
      cy,
      outerRadius,
      startAngle,
    );

  const innerStart =
    polarToCartesian(
      cx,
      cy,
      innerRadius,
      startAngle,
    );

  const innerEnd =
    polarToCartesian(
      cx,
      cy,
      innerRadius,
      endAngle,
    );

  const largeArcFlag =
    endAngle - startAngle <= 180
      ? 0
      : 1;

  return [
    "M",
    outerStart.x,
    outerStart.y,

    "A",
    outerRadius,
    outerRadius,
    0,
    largeArcFlag,
    0,
    outerEnd.x,
    outerEnd.y,

    "L",
    innerStart.x,
    innerStart.y,

    "A",
    innerRadius,
    innerRadius,
    0,
    largeArcFlag,
    1,
    innerEnd.x,
    innerEnd.y,

    "Z",
  ].join(" ");
}

function DonutChart({
  title,
  centreLabel,
  items,
  valueKey,
  colours,
  onSelect,
}) {
  const total = items.reduce(
    (sum, item) =>
      sum + item[valueKey],
    0,
  );

  let angle = 0;

  return (
    <div
      style={{
        background: "#fffaf2",
        borderRadius: "24px",
        padding: "30px",
        border:
          "1px solid rgba(232,173,58,0.22)",
        boxShadow:
          "0 18px 50px rgba(0,0,0,0.18)",
      }}
    >
      <h2
        style={{
          fontFamily:
            'Georgia, "Times New Roman", serif',
          color: "#401513",
          margin:
            "0 0 24px",
        }}
      >
        {title}
      </h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "minmax(180px, 240px) 1fr",
          gap: "26px",
          alignItems: "center",
        }}
      >
        <svg
          viewBox="0 0 240 240"
          style={{
            width: "100%",
            maxWidth: "240px",
          }}
        >
          {total > 0 ? (
            items.map(
              (item, index) => {
                const share =
                  item[valueKey] /
                  total;

                const startAngle =
                  angle;

                const endAngle =
                  angle +
                  share * 360;

                angle = endAngle;

                const path =
                  describeDonutSegment(
                    120,
                    120,
                    105,
                    58,
                    startAngle,
                    endAngle,
                  );

                return (
                  <path
                    key={
                      item.id ||
                      item.category
                    }
                    d={path}
                    fill={
                      colours[
                        index %
                          colours.length
                      ]
                    }
                    stroke="#fffaf2"
                    strokeWidth="4"
                    style={{
                      cursor:
                        "pointer",
                      transition:
                        "opacity 0.2s ease",
                    }}
                    onMouseEnter={(
                      event,
                    ) => {
                      event.currentTarget.style.opacity =
                        "0.78";
                    }}
                    onMouseLeave={(
                      event,
                    ) => {
                      event.currentTarget.style.opacity =
                        "1";
                    }}
                    onClick={() =>
                      onSelect({
                        title:
                          item.category,
                        value:
                          `${
                            item[
                              valueKey
                            ]
                          }%`,
                        subtitle:
                          valueKey ===
                          "score"
                            ? scoreLabel(
                                item.score,
                              )
                            : "Improvement need",
                      })
                    }
                  />
                );
              },
            )
          ) : (
            <circle
              cx="120"
              cy="120"
              r="80"
              fill="#eadfce"
            />
          )}

          <circle
            cx="120"
            cy="120"
            r="51"
            fill="#fffaf2"
          />

          <text
            x="120"
            y="116"
            textAnchor="middle"
            fill="#401513"
            fontSize="14"
            fontWeight="700"
          >
            {centreLabel}
          </text>

          <text
            x="120"
            y="137"
            textAnchor="middle"
            fill="#8e2f1c"
            fontSize="11"
          >
            Tap a section
          </text>
        </svg>

        <div
          style={{
            display: "grid",
            gap: "15px",
          }}
        >
          {items.map(
            (item, index) => (
              <button
                key={
                  item.id ||
                  item.category
                }
                type="button"
                onClick={() =>
                  onSelect({
                    title:
                      item.category,
                    value:
                      `${
                        item[
                          valueKey
                        ]
                      }%`,
                    subtitle:
                      valueKey ===
                      "score"
                        ? scoreLabel(
                            item.score,
                          )
                        : "Improvement need",
                  })
                }
                style={{
                  background:
                    "transparent",
                  border: 0,
                  padding: 0,
                  cursor:
                    "pointer",
                  display:
                    "grid",
                  gridTemplateColumns:
                    "14px 1fr auto",
                  gap: "10px",
                  textAlign:
                    "left",
                  alignItems:
                    "center",
                }}
              >
                <span
                  style={{
                    width: "13px",
                    height: "13px",
                    borderRadius:
                      "3px",
                    background:
                      colours[
                        index %
                          colours.length
                      ],
                  }}
                />

                <span
                  style={{
                    color:
                      "#55443a",
                  }}
                >
                  {item.category}
                </span>

                <strong
                  style={{
                    color:
                      "#8e2f1c",
                  }}
                >
                  {
                    item[
                      valueKey
                    ]
                  }
                  %
                </strong>
              </button>
            ),
          )}
        </div>
      </div>
    </div>
  );
}

export default function FeedbackResultsDashboard({
  totalSubmissions,
  counts,
}) {
  const [
    popup,
    setPopup,
  ] = useState(null);

  const grouped = {};

  for (const row of counts) {
    if (!grouped[row.question_id]) {
      grouped[row.question_id] =
        [];
    }

    grouped[
      row.question_id
    ].push(row);
  }

  const scores = Object.entries(
    QUESTIONS,
  )
    .filter(
      ([, config]) =>
        !config.special &&
        config.positive,
    )
    .map(([id, config]) => {
      const score = getScore(
        grouped[id] || [],
        config.positive,
        totalSubmissions,
      );

      return {
        id,
        category:
          config.category,
        score,
        label:
          scoreLabel(score),
      };
    });

  const scoredWithResponses =
    scores.filter(
      (item) =>
        (grouped[item.id] || [])
          .length > 0,
    );

  const overallScore =
    scoredWithResponses.length
      ? Math.round(
          scoredWithResponses.reduce(
            (sum, item) =>
              sum + item.score,
            0,
          ) /
            scoredWithResponses.length,
        )
      : 0;

  const strongestScores = [
    ...scoredWithResponses,
  ]
    .sort(
      (a, b) =>
        b.score - a.score,
    )
    .slice(0, 3);

  const improvementScores = [
    ...scoredWithResponses,
  ]
    .map((item) => ({
      ...item,

      improvementNeed:
        100 - item.score,
    }))
    .sort(
      (a, b) =>
        b.improvementNeed -
        a.improvementNeed,
    )
    .slice(0, 3);

  const strongestTop =
    getTopOption(
      grouped.strongestArea,
    );

  const improvementTop =
    getTopOption(
      grouped.biggestImprovement,
    );

  const managementTop =
    getTopOption(
      grouped.managementFocus,
    );

  const artistTop =
    getTopOption(
      grouped.artistFocus,
    );

  return (
    <main
      style={{
        minHeight: "100vh",

        background:
          "radial-gradient(circle at 8% 5%, rgba(232,173,58,0.14), transparent 23%), linear-gradient(135deg, #240a09, #4b1712 55%, #210807)",

        padding:
          "42px 16px 80px",
      }}
    >
      <div
        style={{
          width:
            "min(100%, 1120px)",
          margin: "0 auto",
        }}
      >
        <header
          style={{
            color: "#ffffff",
            marginBottom: "30px",
          }}
        >
          <p
            style={{
              color: "#f5cf78",
              fontSize: "12px",
              fontWeight: 800,
              letterSpacing:
                "0.18em",
              textTransform:
                "uppercase",
              margin: 0,
            }}
          >
            Sat-Chit-Ānanda
          </p>

          <h1
            style={{
              fontFamily:
                'Georgia, "Times New Roman", serif',
              fontSize:
                "clamp(42px, 8vw, 68px)",
              fontWeight: 500,
              lineHeight: 1,
              margin:
                "12px 0 18px",
            }}
          >
            Event Feedback Dashboard
          </h1>

          <p
            style={{
              color:
                "rgba(255,255,255,0.70)",
              fontSize: "17px",
              lineHeight: 1.7,
              maxWidth: "720px",
              margin: 0,
            }}
          >
            Anonymous artist and
            management feedback presented
            as combined event statistics.
          </p>
        </header>

        <section
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(230px, 1fr))",
            gap: "16px",
            marginBottom: "18px",
          }}
        >
          <div
            style={{
              background: "#fffaf2",
              borderRadius: "24px",
              padding: "28px",
            }}
          >
            <p
              style={{
                color: "#77695f",
                margin: 0,
                fontWeight: 800,
                textTransform:
                  "uppercase",
                fontSize: "12px",
              }}
            >
              Total responses
            </p>

            <div
              style={{
                fontFamily:
                  'Georgia, "Times New Roman", serif',
                fontSize: "58px",
                color: "#401513",
                fontWeight: 700,
              }}
            >
              {totalSubmissions}
            </div>
          </div>

          <div
            style={{
              background: "#fffaf2",
              borderRadius: "24px",
              padding: "28px",
            }}
          >
            <p
              style={{
                color: "#77695f",
                margin: 0,
                fontWeight: 800,
                textTransform:
                  "uppercase",
                fontSize: "12px",
              }}
            >
              Overall event score
            </p>

            <div
              style={{
                fontFamily:
                  'Georgia, "Times New Roman", serif',
                fontSize: "58px",
                color: "#8e2f1c",
                fontWeight: 700,
              }}
            >
              {overallScore}%
            </div>

            <strong
              style={{
                color: "#a6532a",
              }}
            >
              {scoreLabel(
                overallScore,
              )}
            </strong>
          </div>
        </section>

        {totalSubmissions > 0 && (
          <>
            {/* REAL VERTICAL BAR GRAPH */}

            <section
              style={{
                background: "#fffaf2",
                borderRadius: "24px",
                padding:
                  "clamp(24px, 5vw, 38px)",
                marginBottom: "18px",
              }}
            >
              <p
                style={{
                  color: "#b7791f",
                  fontSize: "12px",
                  fontWeight: 800,
                  textTransform:
                    "uppercase",
                  letterSpacing:
                    "0.1em",
                }}
              >
                Final Event Summary
              </p>

              <h2
                style={{
                  fontFamily:
                    'Georgia, "Times New Roman", serif',
                  fontSize: "32px",
                  color: "#401513",
                  margin:
                    "8px 0 10px",
                }}
              >
                Rating Graph
              </h2>

              <p
                style={{
                  color: "#77695f",
                  margin:
                    "0 0 26px",
                }}
              >
                Tap any bar to see its
                exact rating.
              </p>

              <div
                style={{
                  overflowX: "auto",
                  paddingBottom:
                    "10px",
                }}
              >
                <div
                  style={{
                    minWidth: "850px",
                    height: "430px",
                    display: "grid",
                    gridTemplateColumns:
                      "55px 1fr",
                    gridTemplateRows:
                      "1fr 70px",
                  }}
                >
                  {/* Y AXIS */}

                  <div
                    style={{
                      gridColumn: "1",
                      gridRow: "1",
                      display: "flex",
                      flexDirection:
                        "column",
                      justifyContent:
                        "space-between",
                      alignItems:
                        "flex-end",
                      paddingRight:
                        "10px",
                      color: "#77695f",
                      fontSize:
                        "12px",
                    }}
                  >
                    <span>100%</span>
                    <span>80%</span>
                    <span>60%</span>
                    <span>40%</span>
                    <span>20%</span>
                    <span>0%</span>
                  </div>

                  {/* CHART */}

                  <div
                    style={{
                      gridColumn: "2",
                      gridRow: "1",
                      position:
                        "relative",
                      display: "flex",
                      alignItems:
                        "flex-end",
                      justifyContent:
                        "space-around",
                      gap: "16px",
                      padding:
                        "0 18px",
                      borderLeft:
                        "3px solid #401513",
                      borderBottom:
                        "3px solid #401513",

                      backgroundImage:
                        "repeating-linear-gradient(to bottom, rgba(64,21,19,0.12) 0, rgba(64,21,19,0.12) 1px, transparent 1px, transparent 20%)",
                    }}
                  >
                    {scoredWithResponses.map(
                      (
                        item,
                        index,
                      ) => (
                        <button
                          key={
                            item.id
                          }
                          type="button"
                          title={`${item.category}: ${item.score}%`}
                          onClick={() =>
                            setPopup({
                              title:
                                item.category,
                              value:
                                `${item.score}%`,
                              subtitle:
                                item.label,
                            })
                          }
                          style={{
                            width:
                              "54px",
                            height:
                              `${Math.max(
                                item.score,
                                2,
                              )}%`,
                            minHeight:
                              item.score
                                ? "10px"
                                : "0",
                            border: 0,
                            borderRadius:
                              "4px 4px 0 0",
                            background:
                              BAR_COLOURS[
                                index %
                                  BAR_COLOURS.length
                              ],
                            cursor:
                              "pointer",
                            boxShadow:
                              "0 3px 12px rgba(0,0,0,0.12)",
                            transition:
                              "transform 0.18s ease, opacity 0.18s ease",
                          }}
                          onMouseEnter={(
                            event,
                          ) => {
                            event.currentTarget.style.transform =
                              "scaleX(1.08)";

                            event.currentTarget.style.opacity =
                              "0.82";
                          }}
                          onMouseLeave={(
                            event,
                          ) => {
                            event.currentTarget.style.transform =
                              "scaleX(1)";

                            event.currentTarget.style.opacity =
                              "1";
                          }}
                        />
                      ),
                    )}
                  </div>

                  {/* LABELS */}

                  <div
                    style={{
                      gridColumn: "2",
                      gridRow: "2",
                      display: "flex",
                      justifyContent:
                        "space-around",
                      gap: "16px",
                      padding:
                        "10px 18px 0",
                    }}
                  >
                    {scoredWithResponses.map(
                      (item) => (
                        <div
                          key={
                            item.id
                          }
                          style={{
                            width:
                              "70px",
                            textAlign:
                              "center",
                            color:
                              "#55443a",
                            fontSize:
                              "11px",
                            lineHeight:
                              1.2,
                          }}
                        >
                          {
                            item.category
                          }
                        </div>
                      ),
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* PIE / DONUT CHARTS */}

            <section
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(340px, 1fr))",
                gap: "18px",
                marginBottom: "18px",
              }}
            >
              <DonutChart
                title="Top Strengths"
                centreLabel="Strengths"
                items={
                  strongestScores
                }
                valueKey="score"
                colours={
                  STRENGTH_COLOURS
                }
                onSelect={
                  setPopup
                }
              />

              <DonutChart
                title="Areas to Improve"
                centreLabel="Improve"
                items={
                  improvementScores
                }
                valueKey="improvementNeed"
                colours={
                  IMPROVEMENT_COLOURS
                }
                onSelect={
                  setPopup
                }
              />
            </section>

            <section
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(260px, 1fr))",
                gap: "16px",
                marginBottom: "20px",
              }}
            >
              <div
                style={{
                  background:
                    "#fffaf2",
                  borderRadius:
                    "22px",
                  padding: "26px",
                }}
              >
                <small
                  style={{
                    color:
                      "#b7791f",
                    fontWeight: 800,
                    textTransform:
                      "uppercase",
                  }}
                >
                  Management priority
                </small>

                <h2
                  style={{
                    color:
                      "#401513",
                    fontFamily:
                      'Georgia, "Times New Roman", serif',
                  }}
                >
                  {managementTop
                    ?.option_value ||
                    "Not enough data"}
                </h2>
              </div>

              <div
                style={{
                  background:
                    "#fffaf2",
                  borderRadius:
                    "22px",
                  padding: "26px",
                }}
              >
                <small
                  style={{
                    color:
                      "#b7791f",
                    fontWeight: 800,
                    textTransform:
                      "uppercase",
                  }}
                >
                  Artists&apos; priority
                </small>

                <h2
                  style={{
                    color:
                      "#401513",
                    fontFamily:
                      'Georgia, "Times New Roman", serif',
                  }}
                >
                  {artistTop
                    ?.option_value ||
                    "Not enough data"}
                </h2>
              </div>
            </section>

            {strongestTop && (
              <section
                style={{
                  background:
                    "rgba(255,255,255,0.08)",
                  borderRadius:
                    "18px",
                  padding:
                    "18px",
                  color:
                    "rgba(255,255,255,0.78)",
                  marginBottom:
                    "20px",
                }}
              >
                Most selected strongest
                area:{" "}
                <strong
                  style={{
                    color:
                      "#f5cf78",
                  }}
                >
                  {
                    strongestTop.option_value
                  }
                </strong>

                {improvementTop && (
                  <>
                    {" "}
                    · Most selected
                    improvement area:{" "}
                    <strong
                      style={{
                        color:
                          "#f5cf78",
                      }}
                    >
                      {
                        improvementTop.option_value
                      }
                    </strong>
                  </>
                )}
              </section>
            )}
          </>
        )}

        {/* DETAILED RESULTS */}

        <section
          style={{
            margin:
              "40px 0 20px",
            color: "#fff",
          }}
        >
          <p
            style={{
              color: "#f5cf78",
              fontWeight: 800,
              fontSize: "12px",
              textTransform:
                "uppercase",
            }}
          >
            Full results
          </p>

          <h2
            style={{
              fontFamily:
                'Georgia, "Times New Roman", serif',
              fontSize: "40px",
              fontWeight: 500,
              margin:
                "6px 0",
            }}
          >
            Detailed Feedback
          </h2>
        </section>

        <div
          style={{
            display: "grid",
            gap: "16px",
          }}
        >
          {Object.entries(
            QUESTIONS,
          ).map(
            ([
              questionId,
              config,
            ], index) => {
              const rows =
                grouped[
                  questionId
                ] || [];

              return (
                <section
                  key={questionId}
                  style={{
                    background:
                      "#fffaf2",
                    borderRadius:
                      "22px",
                    padding:
                      "clamp(22px, 5vw, 34px)",
                  }}
                >
                  <p
                    style={{
                      color:
                        "#b7791f",
                      fontSize:
                        "12px",
                      fontWeight:
                        800,
                      textTransform:
                        "uppercase",
                    }}
                  >
                    Question{" "}
                    {index + 1}
                  </p>

                  <h2
                    style={{
                      color:
                        "#401513",
                      fontFamily:
                        'Georgia, "Times New Roman", serif',
                    }}
                  >
                    {
                      config.title
                    }
                  </h2>

                  {rows.map(
                    (row) => {
                      const pct =
                        percentage(
                          row.response_count,
                          totalSubmissions,
                        );

                      return (
                        <div
                          key={
                            row.option_value
                          }
                          style={{
                            marginTop:
                              "16px",
                          }}
                        >
                          <div
                            style={{
                              display:
                                "flex",
                              justifyContent:
                                "space-between",
                              gap:
                                "12px",
                              marginBottom:
                                "7px",
                            }}
                          >
                            <strong>
                              {
                                row.option_value
                              }
                            </strong>

                            <strong
                              style={{
                                color:
                                  "#8e2f1c",
                              }}
                            >
                              {
                                row.response_count
                              }{" "}
                              (
                              {
                                pct
                              }
                              %)
                            </strong>
                          </div>

                          <div
                            style={{
                              height:
                                "10px",
                              borderRadius:
                                "999px",
                              background:
                                "#eadfce",
                              overflow:
                                "hidden",
                            }}
                          >
                            <div
                              style={{
                                width:
                                  `${pct}%`,
                                height:
                                  "100%",
                                background:
                                  "linear-gradient(90deg, #a84d28, #e8ad3a)",
                              }}
                            />
                          </div>
                        </div>
                      );
                    },
                  )}
                </section>
              );
            },
          )}
        </div>

        {/* POPUP */}

        {popup && (
          <div
            onClick={() =>
              setPopup(null)
            }
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 99999,
              display: "flex",
              alignItems:
                "center",
              justifyContent:
                "center",
              padding: "20px",
              background:
                "rgba(20,6,5,0.72)",
              backdropFilter:
                "blur(4px)",
            }}
          >
            <div
              onClick={(event) =>
                event.stopPropagation()
              }
              style={{
                width:
                  "min(92vw, 420px)",
                background:
                  "#fffaf2",
                borderRadius:
                  "24px",
                padding:
                  "32px",
                textAlign:
                  "center",
                boxShadow:
                  "0 30px 100px rgba(0,0,0,0.5)",
                border:
                  "2px solid #e8ad3a",
              }}
            >
              <p
                style={{
                  color:
                    "#b7791f",
                  fontSize:
                    "12px",
                  fontWeight:
                    800,
                  textTransform:
                    "uppercase",
                  letterSpacing:
                    "0.1em",
                  marginTop: 0,
                }}
              >
                Feedback detail
              </p>

              <h2
                style={{
                  color:
                    "#401513",
                  fontFamily:
                    'Georgia, "Times New Roman", serif',
                  fontSize:
                    "30px",
                }}
              >
                {popup.title}
              </h2>

              <div
                style={{
                  fontSize:
                    "54px",
                  fontWeight:
                    800,
                  color:
                    "#8e2f1c",
                  margin:
                    "12px 0",
                }}
              >
                {popup.value}
              </div>

              <p
                style={{
                  color:
                    "#77695f",
                  fontSize:
                    "17px",
                }}
              >
                {popup.subtitle}
              </p>

              <button
                type="button"
                onClick={() =>
                  setPopup(null)
                }
                style={{
                  marginTop:
                    "16px",
                  border: 0,
                  borderRadius:
                    "999px",
                  padding:
                    "13px 28px",
                  background:
                    "#e8ad3a",
                  color:
                    "#401513",
                  fontWeight:
                    800,
                  cursor:
                    "pointer",
                }}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}