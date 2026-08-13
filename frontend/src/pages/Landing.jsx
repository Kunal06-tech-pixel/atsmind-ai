/*
THESIS: ATSmind turns a resume into inspectable evidence, refusing generic AI feature-card marketing.
OWN-WORLD: Near-black cinematic video, luminous mint type, liquid-glass document panes, desktop analysis chrome.
STORY: See the promise, inspect a sample analysis, understand evidence triage, choose Career or Recruit, act.
FIRST VIEWPORT: Centered two-line hero and primary action lead into the desktop strip and opening edge of the ATS workspace.
FORM: User-pinned Aura cinematic composition, translated section-for-section into resume intelligence.
*/
import { useState } from "react";
import { motion as Motion, useReducedMotion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Archive,
  Check,
  ChevronRight,
  CircleAlert,
  FileCheck2,
  FileSearch,
  FileText,
  Forward,
  History,
  LayoutDashboard,
  MessageSquareText,
  MoreHorizontal,
  Paperclip,
  Reply,
  Search,
  Sparkles,
  Star,
  Trash2,
} from "lucide-react";
import AppNav from "../components/AppNav";
import { useAuth } from "../context/useAuth";
import {
  getDashboardPathByRole,
  getUserRole,
  USER_ROLES,
} from "../utils/roles";

const VIDEO_URL =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260508_064122_c4750c0e-7476-4b44-94a2-a85a65c63bf2.mp4";

const analysisRows = [
  {
    name: "Product Manager",
    subject: "Strong role alignment",
    preview: "Roadmap ownership, SQL, and discovery are supported...",
    time: "82 match",
    unread: true,
    active: true,
  },
  {
    name: "Skill evidence",
    subject: "12 supported · 3 missing",
    preview: "Experiment ownership needs a more explicit project example...",
    time: "Review",
    unread: true,
  },
  {
    name: "Keyword coverage",
    subject: "Priority terms identified",
    preview: "Product strategy and stakeholder management appear naturally...",
    time: "84 score",
  },
  {
    name: "Experience",
    subject: "Impact is measurable",
    preview: "Three bullets include outcomes; two need clearer scope...",
    time: "86 score",
  },
  {
    name: "Formatting",
    subject: "ATS-readable structure",
    preview: "Headings and chronology parse cleanly in this sample...",
    time: "77 score",
  },
  {
    name: "Builder",
    subject: "Suggested revision ready",
    preview: "Open the guided builder to improve the selected project bullet...",
    time: "Next",
  },
];

const triageGroups = [
  {
    label: "Strong evidence",
    count: 4,
    color: "#ffffff",
    items: ["Roadmap ownership · explicit", "SQL analysis · explicit"],
  },
  {
    label: "Partial evidence",
    count: 3,
    color: "#e5e5e5",
    items: ["Experiment design · scope unclear", "Leadership · outcome missing"],
  },
  {
    label: "Missing evidence",
    count: 2,
    color: "#a3a3a3",
    items: ["Pricing research · not found", "Forecasting · not found"],
  },
  {
    label: "Ready to improve",
    count: 5,
    color: "#525252",
    items: ["Builder suggestions · grounded", "Export after review"],
  },
];

const capabilities = [
  "Resume analysis",
  "Job-fit scoring",
  "Evidence inspection",
  "Skill gaps",
  "Resume chat",
  "Resume builder",
  "Candidate ranking",
  "Comparison",
];

const trustPrinciples = [
  {
    statement:
      "The ATS score remains deterministic. AI-generated summaries explain evidence but never calculate, override, or modify the score.",
    title: "Score integrity",
    detail: "DETERMINISTIC LOGIC",
  },
  {
    statement:
      "Every strong, partial, or missing classification stays connected to a resume excerpt or to the absence of one.",
    title: "Inspectable reasoning",
    detail: "EVIDENCE LINKED",
  },
  {
    statement:
      "ATSmind supports candidates and recruiters. People remain responsible for resume claims and employment decisions.",
    title: "Human responsibility",
    detail: "DECISION SUPPORT",
  },
];

const workspaceCards = [
  {
    tier: "Career",
    title: "Analyze my resume",
    description:
      "For candidates strengthening a resume against a real target role.",
    features: [
      "Deterministic job-fit scoring",
      "Skills and keyword coverage",
      "Inspectable requirement evidence",
      "Grounded resume chat",
      "Guided builder and PDF export",
    ],
    intent: "career",
  },
  {
    tier: "Recruit",
    title: "Evaluate candidates",
    description:
      "For recruiters comparing consented resumes with explicit requirements.",
    features: [
      "Mandatory and preferred skills",
      "Requirement-level evidence",
      "Deterministic candidate ranking",
      "Candidate comparison and notes",
      "Shortlist workflow",
    ],
    intent: "recruit",
  },
  {
    tier: "Shared principle",
    title: "Evidence before instinct",
    description:
      "One transparent reasoning standard across both ATSmind workspaces.",
    features: [
      "Sample content clearly labeled",
      "AI assistance separated from scores",
      "Role-scoped application access",
      "Consent-aware candidate uploads",
      "Human decisions remain final",
    ],
    intent: "dashboard",
  },
];

function NoiseDefinitions() {
  return (
    <svg className="ats-noise-defs" aria-hidden="true">
      <defs>
        <filter id="ats-cinematic-noise">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.9"
            numOctaves="2"
            stitchTiles="stitch"
          />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.35 0"
          />
          <feComposite in2="SourceGraphic" operator="in" result="noise" />
          <feBlend in="SourceGraphic" in2="noise" mode="multiply" />
        </filter>
        <filter id="ats-pricing-noise">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.5"
            numOctaves="2"
            stitchTiles="stitch"
          />
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.075" />
          </feComponentTransfer>
          <feComposite in2="SourceGraphic" operator="in" result="noise" />
          <feBlend in="SourceGraphic" in2="noise" mode="overlay" />
        </filter>
      </defs>
    </svg>
  );
}

function PrimaryButton({ children, onClick, full = false }) {
  return (
    <button
      type="button"
      className={`ats-primary-button${full ? " is-full" : ""}`}
      onClick={onClick}
    >
      <FileSearch size={16} strokeWidth={2} aria-hidden="true" />
      <span>{children}</span>
      <ChevronRight className="ats-button-chevron" size={15} aria-hidden="true" />
    </button>
  );
}

function SectionEyebrow({ label, tag }) {
  return (
    <div className="ats-section-eyebrow">
      <span className="ats-eyebrow-dot" aria-hidden="true" />
      <span>{label}</span>
      {tag ? <span className="ats-eyebrow-tag">{tag}</span> : null}
    </div>
  );
}

function DesktopMenuBar({ reduceMotion }) {
  const entrance = reduceMotion
    ? { initial: false, animate: { opacity: 1 } }
    : {
        initial: { opacity: 0, transform: "translateY(0.625rem)" },
        animate: { opacity: 1, transform: "translateY(0)" },
      };

  return (
    <Motion.div
      className="ats-desktop-menu-bar"
      {...entrance}
      transition={{ duration: reduceMotion ? 0.18 : 0.6, delay: reduceMotion ? 0 : 0.9, ease: "easeOut" }}
    >
      <div className="ats-menu-inner">
        <div className="ats-menu-left">
          <FileText size={14} aria-hidden="true" />
          <strong>ATSmind</strong>
          {["File", "Edit", "View", "Compare", "Evidence", "Help"].map((item, index) => (
            <span
              key={item}
              className={`${index > 2 ? "ats-menu-hide-sm" : ""} ${index > 3 ? "ats-menu-hide-md" : ""}`}
            >
              {item}
            </span>
          ))}
        </div>
        <div className="ats-menu-right">
          <Search size={14} aria-hidden="true" />
          <span>Sample analysis · Ready</span>
        </div>
      </div>
    </Motion.div>
  );
}

function AnalysisWorkspace({ onBuilder, reduceMotion }) {
  const entrance = reduceMotion
    ? { initial: false, animate: { opacity: 1 } }
    : {
        initial: { opacity: 0, transform: "translateY(2.5rem)" },
        animate: { opacity: 1, transform: "translateY(0)" },
      };

  const sidebarItems = [
    [LayoutDashboard, "Overview", ""],
    [FileCheck2, "Evidence", "12"],
    [Star, "Strengths", "4"],
    [CircleAlert, "Skill gaps", "3"],
    [MessageSquareText, "Resume chat", ""],
    [History, "History", ""],
  ];

  return (
    <section className="ats-workspace-section" id="solutions" aria-label="ATSmind sample analysis workspace">
      <Motion.div
        className="ats-app-frame"
        {...entrance}
        transition={{ duration: reduceMotion ? 0.18 : 0.8, delay: reduceMotion ? 0 : 1.1, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="ats-title-bar">
          <div className="ats-traffic-lights" aria-hidden="true">
            <span className="is-red" />
            <span className="is-yellow" />
            <span className="is-green" />
          </div>
          <span>ATSmind · Resume Analysis</span>
          <span className="ats-sample-chip">Sample data</span>
        </div>

        <div className="ats-app-body">
          <aside className="ats-app-sidebar">
            <button type="button" className="ats-compose-button" onClick={onBuilder}>
              <Sparkles size={15} aria-hidden="true" />
              Improve with ATSmind
            </button>

            <div className="ats-sample-sidebar-nav" aria-hidden="true">
              {sidebarItems.map(([icon, label, count], index) => {
                const SidebarIcon = icon;
                return (
                  <div key={label} className={index === 0 ? "is-active" : ""}>
                    <SidebarIcon size={15} strokeWidth={1.8} aria-hidden="true" />
                    <span>{label}</span>
                    {count ? <small>{count}</small> : null}
                  </div>
                );
              })}
            </div>

            <div className="ats-labels">
              <p>Evidence states</p>
              {[
                ["#2ed7b5", "Strong"],
                ["#a4fdf0", "Partial"],
                ["#f59e0b", "Needs support"],
                ["#10b981", "Ready"],
              ].map(([color, label]) => (
                <span key={label}>
                  <i style={{ backgroundColor: color }} aria-hidden="true" />
                  {label}
                </span>
              ))}
            </div>
          </aside>

          <section className="ats-analysis-list" aria-label="Sample resume analysis categories">
            <div className="ats-search-row">
              <Search size={15} aria-hidden="true" />
              <span>Search analysis</span>
            </div>
            {analysisRows.map((row) => (
              <article key={row.name} className={`${row.active ? "is-active" : ""} ${row.unread ? "is-unread" : ""}`}>
                <div className="ats-analysis-row-top">
                  <strong>{row.name}</strong>
                  <time>{row.time}</time>
                </div>
                <h3>{row.subject}</h3>
                <p>{row.preview}</p>
              </article>
            ))}
          </section>

          <article className="ats-reader">
            <div className="ats-reader-toolbar" aria-hidden="true">
              <div>
                {[Reply, Forward, Archive, Trash2].map((Icon, index) => (
                  <span key={index}>
                    <Icon size={15} aria-hidden="true" />
                  </span>
                ))}
              </div>
              <span>
                <MoreHorizontal size={16} aria-hidden="true" />
              </span>
            </div>

            <div className="ats-reader-content">
              <header>
                <h2>Product Manager match</h2>
                <div className="ats-reader-meta">
                  <div className="ats-reader-avatar">82</div>
                  <div>
                    <strong>Deterministic match</strong>
                    <span>Product strategy resume · sample</span>
                  </div>
                  <span className="ats-work-pill">Career</span>
                </div>
              </header>

              <div className="ats-summary-card">
                <Sparkles size={18} aria-hidden="true" />
                <div>
                  <strong>Grounded summary by ATSmind</strong>
                  <p>
                    The sample resume supports roadmap ownership, SQL analysis, and stakeholder facilitation. Experiment ownership is partial. No direct pricing-research evidence was found.
                  </p>
                </div>
              </div>

              <p>Target role: Product Manager.</p>
              <p>
                The strongest match comes from explicit product strategy and analytics evidence. Those requirements can be inspected directly instead of inferred from a generated summary.
              </p>
              <p>
                Two requirements need stronger resume support. ATSmind can suggest truthful revisions, but the candidate remains responsible for every claim.
              </p>
              <p>Open the builder to improve the selected project bullet and export after review.</p>
              <p className="ats-signoff">ATSmind AI · Sample analysis</p>

              <button type="button" className="ats-attachment" onClick={onBuilder}>
                <Paperclip size={14} aria-hidden="true" />
                product-manager-resume.pdf
              </button>
            </div>
          </article>
        </div>
      </Motion.div>
    </section>
  );
}

function EvidenceTriage({ reduceMotion }) {
  const reveal = reduceMotion
    ? { initial: false, whileInView: { opacity: 1 } }
    : {
        initial: { opacity: 0, transform: "translateY(1.25rem)" },
        whileInView: { opacity: 1, transform: "translateY(0)" },
      };

  return (
    <section className="ats-triage ats-section-shell" id="evidence" aria-labelledby="triage-title">
      <Motion.div
        className="ats-triage-copy"
        {...reveal}
        viewport={{ once: true, amount: 0.25 }}
        transition={{ duration: reduceMotion ? 0.18 : 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        <SectionEyebrow label="Evidence triage" tag="AI-native" />
        <h2 id="triage-title">
          Read the resume
          <br />
          in a single pass.
        </h2>
        <p>
          ATSmind compares resume text with explicit requirements, separates signal from gaps, and keeps the supporting excerpts available for review. AI explains the result; deterministic logic owns the score.
        </p>
        <div className="ats-chip-row" aria-label="Evidence capabilities">
          {["Strong evidence", "Partial evidence", "Missing evidence", "Grounded suggestions"].map((label) => (
            <span key={label}>{label}</span>
          ))}
        </div>
      </Motion.div>

      <Motion.div
        className="liquid-glass ats-triage-card"
        {...reveal}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: reduceMotion ? 0.18 : 0.7, delay: reduceMotion ? 0 : 0.12, ease: [0.22, 1, 0.36, 1] }}
      >
        <p className="ats-triage-status">Sample resume · 14 requirements triaged</p>
        <div className="ats-triage-groups">
          {triageGroups.map((group) => (
            <div key={group.label} className="liquid-glass ats-triage-group">
              <div className="ats-triage-group-heading">
                <span style={{ backgroundColor: group.color }} aria-hidden="true" />
                <strong>{group.label}</strong>
                <small>{group.count}</small>
              </div>
              {group.items.map((item) => (
                <p key={item}>{item}</p>
              ))}
            </div>
          ))}
        </div>
      </Motion.div>
    </section>
  );
}

function CapabilityCloud({ reduceMotion }) {
  return (
    <section className="ats-capability-cloud ats-section-shell" aria-labelledby="capability-title">
      <p id="capability-title">One evidence system across the complete resume workflow</p>
      <div>
        {capabilities.map((name, index) => (
          <Motion.span
            key={name}
            initial={reduceMotion ? false : { opacity: 0, transform: "translateY(0.5rem)" }}
            whileInView={{ opacity: 1, transform: "translateY(0)" }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: reduceMotion ? 0.15 : 0.4, delay: reduceMotion ? 0 : index * 0.05, ease: [0.22, 1, 0.36, 1] }}
          >
            {name}
          </Motion.span>
        ))}
      </div>
    </section>
  );
}

function TrustPrinciples({ reduceMotion }) {
  return (
    <section className="ats-trust ats-section-shell" id="trust" aria-labelledby="trust-title">
      <header>
        <SectionEyebrow label="Trust" tag="Decision support" />
        <h2 id="trust-title">Clarity without hidden judgment.</h2>
      </header>
      <div className="ats-trust-grid">
        {trustPrinciples.map((principle, index) => (
          <Motion.figure
            key={principle.title}
            className="liquid-glass"
            initial={reduceMotion ? false : { opacity: 0, transform: "translateY(1rem)" }}
            whileInView={{ opacity: 1, transform: "translateY(0)" }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: reduceMotion ? 0.15 : 0.55, delay: reduceMotion ? 0 : index * 0.08, ease: [0.22, 1, 0.36, 1] }}
          >
            <blockquote>{principle.statement}</blockquote>
            <figcaption>
              <strong>{principle.title}</strong>
              <span>{principle.detail}</span>
            </figcaption>
          </Motion.figure>
        ))}
      </div>
    </section>
  );
}

function WorkspaceComparison({ onIntent, reduceMotion }) {
  const [workspaceMode, setWorkspaceMode] = useState("career");

  return (
    <section className="c3-pricing-section" id="workspaces" aria-labelledby="workspace-title">
      <div className="c3-watermark-container">
        <div className="c3-watermark-main" aria-hidden="true">
          <span className="c3-watermark-line-1">Your resume.</span>
          <span className="c3-watermark-line-2">Revitalized</span>
        </div>
        <h2 id="workspace-title" className="sr-only">Choose an ATSmind workspace</h2>
      </div>

      <div className="c3-grid">
        {workspaceCards.map((card, index) => {
          const selectable = card.intent === "career" || card.intent === "recruit";
          const selected = card.intent === workspaceMode;
          return (
            <Motion.article
              key={card.tier}
              id={`workspace-card-${card.intent}`}
              className={`c3-card${selected ? " is-selected" : ""}${selectable && !selected ? " is-alternative" : ""}${!selectable ? " is-shared" : ""}`}
              aria-label={`${card.tier} workspace${selected ? ", selected" : ""}`}
              initial={reduceMotion ? false : { opacity: 0, transform: "translateY(1.5rem)" }}
              whileInView={{ opacity: 1, transform: "translateY(0)" }}
              viewport={{ once: true, amount: 0.18 }}
              transition={{ duration: reduceMotion ? 0.15 : 0.65, delay: reduceMotion ? 0 : index * 0.08, ease: [0.22, 1, 0.36, 1] }}
            >
              <span className="c3-tier-small">{card.tier}</span>
              <h3 className="c3-tier-large">{card.title}</h3>
              <p className="c3-desc">{card.description}</p>
              <ul className="c3-list">
                {card.features.map((feature) => (
                  <li key={feature}>
                    <span className="c3-check" aria-hidden="true">
                      <Check size={14} strokeWidth={2.5} />
                    </span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <button type="button" className="c3-btn" onClick={() => onIntent(card.intent)}>
                {card.intent === "career" ? "Start Career" : card.intent === "recruit" ? "Open Recruit" : "Open ATSmind"}
              </button>
            </Motion.article>
          );
        })}
      </div>

      <div className={`c3-role-switch is-${workspaceMode}`} role="group" aria-label="Preview a workspace">
        <span className="c3-role-switch-indicator" aria-hidden="true" />
        <button
          type="button"
          className={workspaceMode === "career" ? "is-active" : ""}
          aria-pressed={workspaceMode === "career"}
          aria-controls="workspace-card-career"
          onClick={() => setWorkspaceMode("career")}
        >
          Career
        </button>
        <button
          type="button"
          className={workspaceMode === "recruit" ? "is-active" : ""}
          aria-pressed={workspaceMode === "recruit"}
          aria-controls="workspace-card-recruit"
          onClick={() => setWorkspaceMode("recruit")}
        >
          Recruit
        </button>
        <span className="sr-only" aria-live="polite">
          {workspaceMode === "career" ? "Career workspace selected" : "Recruit workspace selected"}
        </span>
      </div>
    </section>
  );
}

function FinalCta({ onCareer, onRecruit, reduceMotion }) {
  return (
    <section className="ats-final-cta ats-section-shell" aria-labelledby="final-cta-title">
      <Motion.div
        className="liquid-glass ats-final-card"
        initial={reduceMotion ? false : { opacity: 0, transform: "translateY(1.5rem)" }}
        whileInView={{ opacity: 1, transform: "translateY(0)" }}
        viewport={{ once: true, amount: 0.25 }}
        transition={{ duration: reduceMotion ? 0.15 : 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="ats-final-glow" aria-hidden="true" />
        <h2 id="final-cta-title">
          Close the guesswork.
          <br />
          Open the evidence.
        </h2>
        <p>
          Choose the workspace built for your next decision, whether you are strengthening one resume or evaluating a candidate set.
        </p>
        <div className="ats-final-actions">
          <PrimaryButton onClick={onCareer}>Analyze my resume</PrimaryButton>
          <button type="button" className="ats-secondary-button" onClick={onRecruit}>
            Evaluate candidates
            <ChevronRight size={15} aria-hidden="true" />
          </button>
        </div>
      </Motion.div>
    </section>
  );
}

export default function Landing() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const reduceMotion = useReducedMotion();

  const goToIntent = (intent) => {
    if (!user) {
      navigate("/login", { state: { mode: "signup" } });
      return;
    }

    const role = getUserRole(user);

    if (intent === "career" && role !== USER_ROLES.recruiter) {
      navigate("/analyzer");
      return;
    }

    if (intent === "recruit" && role === USER_ROLES.recruiter) {
      navigate("/recruiter/dashboard");
      return;
    }

    navigate(getDashboardPathByRole(user));
  };

  const goToBuilder = () => {
    if (!user) {
      navigate("/login", { state: { mode: "signup" } });
      return;
    }

    navigate(getUserRole(user) === USER_ROLES.recruiter ? "/recruiter/dashboard" : "/builder");
  };

  const heroTitleMotion = reduceMotion
    ? { initial: false, animate: { opacity: 1 } }
    : {
        initial: { opacity: 0, transform: "translateY(1.25rem)" },
        animate: { opacity: 1, transform: "translateY(0)" },
      };

  return (
    <div className="ats-cinematic-page" id="top">
      <NoiseDefinitions />

      <div className="ats-background-video" aria-hidden="true">
        <video autoPlay={!reduceMotion} loop={!reduceMotion} muted playsInline preload="metadata" src={VIDEO_URL} />
        <div className="ats-video-scrim" />
      </div>

      <div className="ats-guide ats-guide-left" aria-hidden="true" />
      <div className="ats-guide ats-guide-right" aria-hidden="true" />

      <AppNav />

      <main className="ats-page-content">
        <section className="ats-hero" aria-labelledby="landing-title">
          <Motion.h1
            id="landing-title"
            {...heroTitleMotion}
            transition={{ duration: reduceMotion ? 0.18 : 0.8, delay: reduceMotion ? 0 : 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <span>Your resume.</span>
            <span className="ats-shiny-text">Revitalized</span>
          </Motion.h1>

          <Motion.p
            initial={reduceMotion ? false : { opacity: 0, transform: "translateY(1rem)" }}
            animate={{ opacity: 1, transform: "translateY(0)" }}
            transition={{ duration: reduceMotion ? 0.18 : 0.7, delay: reduceMotion ? 0 : 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            ATSmind is the evidence-first resume intelligence platform for candidates and recruiters. It organizes requirements, surfaces proof, and turns every match into something you can inspect.
          </Motion.p>

          <Motion.div
            className="ats-hero-cta"
            initial={reduceMotion ? false : { opacity: 0, transform: "translateY(1rem)" }}
            animate={{ opacity: 1, transform: "translateY(0)" }}
            transition={{ duration: reduceMotion ? 0.18 : 0.7, delay: reduceMotion ? 0 : 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <PrimaryButton onClick={() => goToIntent("career")}>Analyze with ATSmind</PrimaryButton>
            <span>Career / Recruit workspaces</span>
          </Motion.div>
        </section>

        <DesktopMenuBar reduceMotion={reduceMotion} />
        <AnalysisWorkspace onBuilder={goToBuilder} reduceMotion={reduceMotion} />
        <EvidenceTriage reduceMotion={reduceMotion} />
        <CapabilityCloud reduceMotion={reduceMotion} />
        <TrustPrinciples reduceMotion={reduceMotion} />
        <WorkspaceComparison onIntent={goToIntent} reduceMotion={reduceMotion} />
        <FinalCta
          onCareer={() => goToIntent("career")}
          onRecruit={() => goToIntent("recruit")}
          reduceMotion={reduceMotion}
        />
      </main>
    </div>
  );
}
