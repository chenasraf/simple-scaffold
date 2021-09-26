import Scaffold from "./scaffold"
import massarg from "massarg"
import { ScaffoldCmdConfig } from "./types"

massarg<ScaffoldCmdConfig & { help: boolean; extras: string[] }>()
  .main(Scaffold)
  .option({
    name: "name",
    aliases: ["n"],
    isDefault: true,
    description:
      "Name to be passed to the generated files. {{name}} and {{Name}} inside contents and file names will be replaced accordingly.",
  })
  .option({
    name: "output",
    aliases: ["o"],
    description:
      "Path to output to. If --create-sub-folder is enabled, the subfolder will be created inside this path.",
  })
  .option({
    name: "templates",
    aliases: ["t"],
    description:
      "Template files to use as input. You may provide multiple files, each of which can be a relative or absolute path, " +
      "or a glob pattern for multiple file matching easily.",
    defaultValue: [],
    array: true,
  })
  .option({
    aliases: ["w"],
    name: "overwrite",
    description: "Enable to override output files, even if they already exist.",
    defaultValue: false,
    boolean: true,
  })
  .option({
    aliases: ["d"],
    name: "data",
    description: "Add custom data to the templates. By default, only your app name is included.",
    parse: (v) => JSON.parse(v),
  })
  .option({
    aliases: ["s"],
    name: "create-sub-folder",
    description: "Create subfolder with the input name",
    defaultValue: false,
    boolean: true,
  })
  .option({ aliases: ["q"], name: "quiet", description: "Supress output logs", defaultValue: false, boolean: true })
  .option({
    aliases: ["dr"],
    name: "dry-run",
    description:
      "Don't emit actual files. This is good for testing your scaffolds and making sure they " +
      "don't fail, without having to write actual files.",
    defaultValue: false,
    boolean: true,
  })
  // .example(
  //   `yarn cmd -t examples/test-input/Component -o examples/test-output -d '{"property":"myProp","value":"10"}'`,
  //   "Usage"
  // )
  .help({
    binName: "simple-scaffold",
    useGlobalColumns: true,
    usageExample: "[options]",
  })
  .parse()
// .parse(process.argv, {
//   value: "name",
//   mri: {},
//   mainColor: "yellow",
//   subColor: ["dim"],
//   name: "simple-scaffold",
//   usageFilter: (usage: string) => {
//     usage = usage.replace("[options] [command] ", "").replace("name", "[options] name")
//     const lines = usage.split("\n")
//     usage = [
//       ...lines.slice(
//         0,
//         lines.findIndex((l) => l.startsWith("  Commands:"))
//       ),
//       ...lines.slice(lines.findIndex((l) => l.startsWith("  Options:"))),
//     ].join("\n")
//     return usage
//   },
// }
// ) as ScaffoldCmdConfig
