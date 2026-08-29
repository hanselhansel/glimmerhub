const GLIMMER_RUBRIC = {
  version: 1,
  name: "glimmer-score",
  description: "A weighted, transparent score that explains why a project is rising and how credible the momentum is.",
  scale: 100,
  components: [
    { id: "velocity", label: "Star velocity", weight: 0.25, max: 100, source: "starsGainedWeek" },
    { id: "activity", label: "Activity", weight: 0.20, max: 100, source: "briefing.signals.activity" },
    { id: "releases", label: "Release cadence", weight: 0.15, max: 100, source: "briefing.signals.releaseCadence" },
    { id: "contributors", label: "Contributor growth", weight: 0.15, max: 100, source: "briefing.signals.contributorGrowth" },
    { id: "issues", label: "Issue resolution", weight: 0.15, max: 100, source: "briefing.signals.issueResolution" },
    { id: "crossSource", label: "Cross-source buzz", weight: 0.10, max: 100, source: "mentions.length" }
  ]
};
