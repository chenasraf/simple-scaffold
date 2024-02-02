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
      "@semantic-release/npm",
      {
        // publish from dist dir instead of root
        pkgRoot: "dist",
      },
    ],
    [
      "@semantic-release/exec",
      {
        publish: "cd ./dist && pnpm pack --pack-destination=../",
      },
    ],
    [
      "@semantic-release/github",
      {
        assets: ["*.tgz"],
      },
    ],
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
  ],
}

if (branch === "master") {
  const gitIdx = module.exports.plugins.findIndex((plugin) => plugin[0] === "@semantic-release/git")
  module.exports.plugins.splice(gitIdx, 0, [
    "@semantic-release/changelog",
    {
      changelogFile: "CHANGELOG.md",
      changelogTitle: "# Change Log",
    },
  ])
}
