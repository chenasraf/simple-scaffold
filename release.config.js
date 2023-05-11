const releaseRules = [
  { type: "feat", section: "Features", release: "minor" },
  { type: "revert", section: "Features", release: "minor" },
  { type: "fix", section: "Bug Fixes", release: "patch" },
  { type: "chore", section: "Misc", release: "patch" },
  { type: "refactor", section: "Misc", release: "patch" },
  { type: "perf", section: "Misc", release: "patch" },
  { type: "build", section: "Build", release: "patch" },
  { type: "docs", section: "Build", release: false },
  { type: "test", section: "Tests", release: "patch" },
]

/** @type {import('semantic-release').Options} */
module.exports = {
  branches: [
    "+([0-9])?(.{+([0-9]),x}).x",
    "master",
    "next",
    "next-major",
    { name: "develop", prerelease: true },
    { name: "beta", prerelease: true },
    { name: "alpha", prerelease: true },
  ],
  analyzeCommits: {
    path: "semantic-release-conventional-commits",
    majorTypes: releaseRules.filter((x) => x.release === "major").map((x) => x.type),
    minorTypes: releaseRules.filter((x) => x.release === "minor").map((x) => x.type),
    patchTypes: releaseRules.filter((x) => x.release === "patch").map((x) => x.type),
  },
  plugins: [
    [
      "@semantic-release/commit-analyzer",
      {
        preset: "conventionalcommits",
        parserOpts: {
          noteKeywords: ["breaking:", "breaking-fix:", "breaking-feat:"],
        },
        releaseRules: releaseRules,
      },
    ],
    [
      "@semantic-release/release-notes-generator",
      {
        preset: "conventionalcommits",
        parserOpts: {
          noteKeywords: ["breaking", "major"],
          types: releaseRules,
        },
      },
    ],
    [
      "@semantic-release/changelog",
      {
        changelogFile: "CHANGELOG.md",
        changelogTitle: "# Change Log",
      },
    ],
    [
      "@semantic-release/npm",
      {
        npmPublish: false,
      },
    ],
    [
      "@semantic-release/npm",
      {
        npmPublish: true,
        pkgRoot: "dist",
      },
    ],
    [
      "@semantic-release/git",
      {
        assets: ["CHANGELOG.md", "package.json"],
      },
    ],
    [
      "@semantic-release/github",
      {
        assets: ["package.tgz"],
      },
    ],
  ],
}
