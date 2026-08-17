"use client";

import Link from "next/link";
import { useState } from "react";

const questions = [
  {
    id: "organisation",
    question: "Overall, how well was the event organised?",
    options: ["Excellent", "Very good", "Good", "Fair", "Poor"],
  },
  {
    id: "communication",
    question: "How clear was communication before the event?",
    options: [
      "Very clear",
      "Clear",
      "Acceptable",
      "Unclear",
      "Very unclear",
    ],
  },
  {
    id: "coordination",
    question: "How well did the artists and management coordinate?",
    options: ["Excellent", "Very good", "Good", "Fair", "Poor"],
  },
  {
    id: "rehearsal",
    question: "How effective was the rehearsal process?",
    options: [
      "Very effective",
      "Effective",
      "Acceptable",
      "Ineffective",
      "Very ineffective",
    ],
  },
  {
    id: "soundcheck",
    question: "How would you rate the soundcheck?",
    options: ["Excellent", "Very good", "Good", "Fair", "Poor"],
  },
  {
    id: "soundQuality",
    question: "How was the sound quality during the event?",
    options: ["Excellent", "Very good", "Good", "Fair", "Poor"],
  },
  {
    id: "schedule",
    question: "How smoothly did the event follow the planned schedule?",
    options: [
      "Completely according to plan",
      "Mostly according to plan",
      "Some delays",
      "Significant delays",
      "Very poorly managed",
    ],
  },
  {
    id: "transitions",
    question: "How smooth were transitions between performances?",
    options: ["Excellent", "Very good", "Good", "Fair", "Poor"],
  },
  {
    id: "responsibilityClarity",
    question: "Were your responsibilities clear before the event?",
    options: [
      "Completely clear",
      "Mostly clear",
      "Somewhat clear",
      "Mostly unclear",
      "Completely unclear",
    ],
  },
  {
    id: "preparedness",
    question: "How prepared did you personally feel?",
    options: [
      "Fully prepared",
      "Well prepared",
      "Moderately prepared",
      "Slightly unprepared",
      "Not prepared",
    ],
  },
  {
    id: "biggestImprovement",
    question: "Which area MOST needs improvement?",
    options: [
      "Communication",
      "Planning and scheduling",
      "Rehearsals",
      "Sound / technical setup",
      "Stage coordination",
      "Artist coordination",
      "Volunteer coordination",
      "Audience management",
    ],
  },
  {
    id: "strongestArea",
    question: "What was the strongest part of the event?",
    options: [
      "Performances",
      "Teamwork",
      "Audience atmosphere",
      "Sound",
      "Organisation",
      "Venue",
      "Registration / entry",
      "Overall concept",
    ],
  },
  {
    id: "managementFocus",
    question: "What should management focus on most next time?",
    options: [
      "Earlier planning",
      "Clearer communication",
      "Better scheduling",
      "Clearer responsibilities",
      "Better rehearsal coordination",
      "Better technical preparation",
      "Current management worked well",
    ],
  },
  {
    id: "artistFocus",
    question: "What should artists collectively improve most?",
    options: [
      "Preparation",
      "Rehearsal attendance",
      "Punctuality",
      "Communication",
      "Stage transitions",
      "Coordination with other musicians",
      "Nothing significant",
    ],
  },
  {
    id: "workAgain",
    question: "Would you be comfortable working with the same team again?",
    options: [
      "Definitely",
      "Probably",
      "Not sure",
      "Probably not",
      "Definitely not",
    ],
  },
];

export default function FeedbackForm() {
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function chooseAnswer(questionId, option) {
    setAnswers((current) => ({
      ...current,
      [questionId]: option,
    }));
  }

  async function handleSubmit() {
    setError("");

    if (Object.keys(answers).length !== questions.length) {
      setError("Please answer all 15 questions before submitting.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(answers),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(
          result.error ||
            "Your feedback could not be submitted. Please try again.",
        );
        return;
      }

      setSubmitted(true);
    } catch {
      setError(
        "Your feedback could not be submitted. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <main
        style={{
          minHeight: "100vh",
          background:
            "linear-gradient(135deg, #240a09, #4b1712 55%, #210807)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
        }}
      >
        <section
          style={{
            width: "min(100%, 620px)",
            background: "#fffaf2",
            borderRadius: "28px",
            padding: "50px 30px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: "54px",
              marginBottom: "12px",
            }}
          >
            ✓
          </div>

          <h1
            style={{
              fontFamily: 'Georgia, "Times New Roman", serif',
              fontSize: "48px",
              margin: "0 0 18px",
            }}
          >
            Thank you
          </h1>

          <p
            style={{
              color: "#77695f",
              fontSize: "18px",
              lineHeight: 1.6,
            }}
          >
            Your anonymous feedback has been recorded and added to the
            combined event review.
          </p>

          <Link
            href="/"
            style={{
              display: "inline-block",
              marginTop: "22px",
              background: "#e8ad3a",
              color: "#401513",
              padding: "14px 24px",
              borderRadius: "999px",
              fontWeight: 800,
            }}
          >
            Return to website
          </Link>
        </section>
      </main>
    );
  }

  const answeredCount = Object.keys(answers).length;
  const complete = answeredCount === questions.length;

  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #240a09, #4b1712 55%, #210807)",
        padding: "40px 16px 80px",
      }}
    >
      <div
        style={{
          width: "min(100%, 820px)",
          margin: "0 auto",
        }}
      >
        <Link
          href="/"
          style={{
            color: "rgba(255,255,255,0.68)",
            display: "inline-block",
            marginBottom: "32px",
          }}
        >
          ← Return to event website
        </Link>

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
              letterSpacing: "0.18em",
              textTransform: "uppercase",
            }}
          >
            Sat-Chit-Ānanda
          </p>

          <h1
            style={{
              fontFamily: 'Georgia, "Times New Roman", serif',
              fontSize: "clamp(42px, 8vw, 68px)",
              fontWeight: 500,
              margin: "10px 0 18px",
              lineHeight: 1,
            }}
          >
            Internal Event Review
          </h1>

          <p
            style={{
              color: "rgba(255,255,255,0.72)",
              fontSize: "17px",
              lineHeight: 1.7,
            }}
          >
            A quick anonymous review for artists and management.
            Please answer honestly so we can improve the next event.
          </p>

          <div
            style={{
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.13)",
              borderRadius: "16px",
              padding: "16px 18px",
              marginTop: "22px",
              color: "rgba(255,255,255,0.78)",
              lineHeight: 1.6,
            }}
          >
            <strong>Anonymous by design.</strong> No name, email, phone
            number or role is requested.
          </div>
        </header>

        <div
          style={{
            display: "grid",
            gap: "18px",
          }}
        >
          {questions.map((item, index) => (
            <section
              key={item.id}
              style={{
                background: "#fffaf2",
                borderRadius: "22px",
                padding: "clamp(22px, 5vw, 34px)",
                boxShadow: "0 15px 45px rgba(0,0,0,0.16)",
              }}
            >
              <p
                style={{
                  color: "#8e2f1c",
                  fontSize: "12px",
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: "0.12em",
                  margin: "0 0 10px",
                }}
              >
                Question {index + 1} of {questions.length}
              </p>

              <h2
                style={{
                  fontFamily: 'Georgia, "Times New Roman", serif',
                  fontSize: "23px",
                  lineHeight: 1.35,
                  margin: "0 0 20px",
                }}
              >
                {item.question}
              </h2>

              <div
                style={{
                  display: "grid",
                  gap: "9px",
                }}
              >
                {item.options.map((option) => {
                  const selected = answers[item.id] === option;

                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() =>
                        chooseAnswer(item.id, option)
                      }
                      style={{
                        width: "100%",
                        textAlign: "left",
                        padding: "14px 16px",
                        borderRadius: "12px",
                        border: selected
                          ? "2px solid #8e2f1c"
                          : "1px solid rgba(43,26,17,0.14)",
                        background: selected ? "#f5eadc" : "#ffffff",
                        color: "#17100c",
                        fontWeight: selected ? 800 : 500,
                        cursor: "pointer",
                      }}
                    >
                      <span
                        style={{
                          display: "inline-flex",
                          width: "22px",
                          height: "22px",
                          borderRadius: "50%",
                          border: selected
                            ? "6px solid #8e2f1c"
                            : "2px solid #b7a99e",
                          marginRight: "11px",
                          verticalAlign: "middle",
                        }}
                      />

                      {option}
                    </button>
                  );
                })}
              </div>
            </section>
          ))}
        </div>

        {error && (
          <div
            style={{
              marginTop: "20px",
              padding: "15px",
              background: "#ffe5e1",
              color: "#7f1d14",
              borderRadius: "12px",
              fontWeight: 700,
            }}
          >
            {error}
          </div>
        )}

        <section
          style={{
            background: "#fffaf2",
            borderRadius: "22px",
            marginTop: "18px",
            padding: "26px",
            textAlign: "center",
          }}
        >
          <p
            style={{
              color: "#77695f",
              margin: "0 0 18px",
            }}
          >
            You have answered{" "}
            <strong>{answeredCount}</strong> of{" "}
            <strong>{questions.length}</strong> questions.
          </p>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={!complete || submitting}
            style={{
              width: "min(100%, 340px)",
              minHeight: "52px",
              border: 0,
              borderRadius: "999px",
              background: complete
                ? "#e8ad3a"
                : "#d8cbb8",
              color: "#401513",
              fontWeight: 800,
              cursor: complete
                ? "pointer"
                : "not-allowed",
              opacity: complete ? 1 : 0.65,
            }}
          >
            {submitting
              ? "Submitting..."
              : "Submit Anonymous Feedback"}
          </button>
        </section>
      </div>
    </main>
  );
}