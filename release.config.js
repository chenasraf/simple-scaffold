/** @type {import('semantic-release').Options} */
module.exports = {
  branches: ["master", { name: "pre", prerelease: true }],
  analyzeCommits: {
    path: "semantic-release-conventional-commits",
  },
  plugins: [
    "@semantic-release/commit-analyzer",
    "@semantic-release/release-notes-generator",
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
        assets: [
          {
            path: "*.tgz",
            name: "simple-scaffold.tgz",
          },
        ],
      },
    ],
  ],
}
