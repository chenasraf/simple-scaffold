const ref = process.env.GITHUB_REF || ""
const branch = ref.split("/").pop()

/**
 * @type {import('semantic-release').GlobalConfig}
 */
module.exports = {
  branches: ["master", { name: "pre", prerelease: true }],
  plugins: [
    "@semantic-release/commit-analyzer",
    "@semantic-release/release-notes-generator",
    [
      "@semantic-release/npm",
      {
        // only update the pkg version on root, don't publish
        // this is to keep package.json version in sync with the release
        npmPublish: false,
      },
    ],
    [
      "@semantic-release/exec",
      {
        // pack the dist folder, during publish step (after version was bumped)
        publishCmd: 'echo "Packing..."; cd ./dist && pnpm pack --pack-destination=../; echo "Done"',
      },
    ],
    [
      "@semantic-release/npm",
      {
        // publish from dist dir instead of root
        // this is the actual uild output
        pkgRoot: "dist",
      },
    ],
    [
      // Release to GitHub
      "@semantic-release/github",
      {
        assets: ["*.tgz"],
      },
    ],
    branch === "master"
      ? [
        // Update CHANGELOG.md only on master
        "@semantic-release/changelog",
        {
          changelogFile: "CHANGELOG.md",
          changelogTitle: "# Change Log",
        },
      ]
      : undefined,
    [
      // Commit the package.json and CHANGELOG.md files to git (if modified)
      "@semantic-release/git",
      {
        assets: ["package.json", "CHANGELOG.md"].filter(Boolean),
      },
    ],
    //
    // [
    //   '@semantic-release/exec',
    //   {
    //     verifyReleaseCmd: 'echo ${nextRelease.version} > .VERSION',
    //   },
    // ],
  ].filter(Boolean),
}
