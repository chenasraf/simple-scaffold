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
        npmPublish: false,
      },
    ],
    // [
    //   '@semantic-release/npm',
    //   {
    //     // only update the pkg version on doc, don't publish
    //     npmPublish: false,
    //     pkgRoot: 'doc',
    //   },
    // ]
    [
      "@semantic-release/exec",
      {
        publishCmd: 'echo "Packing..."; cd ./dist && pnpm pack --pack-destination=../; echo "Done"',
      },
    ],
    [
      "@semantic-release/npm",
      {
        // publish from dist dir instead of root
        pkgRoot: "dist",
      },
    ],
    [
      "@semantic-release/github",
      {
        assets: ["*.tgz"],
      },
    ],
    branch === "master"
      ? [
        "@semantic-release/changelog",
        {
          changelogFile: "CHANGELOG.md",
          changelogTitle: "# Change Log",
        },
      ]
      : undefined,
    [
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
