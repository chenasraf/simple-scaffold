import Scaffold from "./scaffold"
import args from "args"
import { ScaffoldCmdConfig } from "./types"

const options = args
  .command("", "")
  .option(
    ["n", "name"],
    "Name to be passed to the generated files. {{name}} and {{Name}} inside contents and file names will be replaced accordingly."
  )
  .option(
    ["o", "output"],
    "Path to output to. If --create-sub-folder is enabled, the subfolder will be created inside this path."
  )
  .option(
    ["t", "templates"],
    "Template files to use as input. You may provide multiple files, each of which can be a relative or absolute path, " +
      "or a glob pattern for multiple file matching easily.",
    []
  )
  .option(["w", "overwrite"], "Enable to override output files, even if they already exist.", false)
  .option(
    ["d", "data"],
    "Add custom data to the templates. By default, only your app name is included.",
    undefined,
    JSON.parse
  )
  .option(["s", "create-sub-folder"], "Create subfolder with the input name", false)
  .option(["q", "silent"], "Supress output logs", false)
  .example(
    `yarn cmd -t examples/test-input/Component -o examples/test-output -d '{"property":"myProp","value":"10"}'`,
    "Usage"
  )
  .parse(process.argv, {
    value: "name",
    mri: {},
    mainColor: "yellow",
    subColor: ["dim"],
    name: "simple-scaffold",
    usageFilter: (usage: string) => {
      usage = usage.replace("[options] [command] ", "").replace("name", "[options] name")
      const lines = usage.split("\n")
      usage = [
        ...lines.slice(
          0,
          lines.findIndex((l) => l.startsWith("  Commands:"))
        ),
        ...lines.slice(lines.findIndex((l) => l.startsWith("  Options:"))),
      ].join("\n")
      return usage
    },
  }) as ScaffoldCmdConfig

Scaffold(options)
