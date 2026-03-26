---
title: Examples
---

# Examples

## React Component

### Template

**File:** `templates/component/{{pascalCase name}}.tsx`

```tsx
/**
 * Author: {{ author }}
 * Date: {{ now "yyyy-MM-dd" }}
 */
import React from "react"

export default {{ pascalCase name }}: React.FC = (props) => {
  return (
    <div className="{{ camelCase name }}">{{ pascalCase name }} Component</div>
  )
}
```

### Config

```js
// scaffold.config.js
module.exports = {
  component: {
    templates: ["templates/component"],
    output: "src/components",
    data: {
      author: "My Name",
    },
  },
}
```

### Running

```sh
npx simple-scaffold -k component MyComponent
```

### Output

**File:** `src/components/MyComponent.tsx`

```tsx
/**
 * Author: My Name
 * Date: 2077-01-01
 */
import React from "react"

export default MyComponent: React.FC = (props) => {
  return (
    <div className="myComponent">MyComponent Component</div>
  )
}
```

## Subdir Variations

Given the template and config above, the output path changes based on `subdir` settings:

| Setting                                     | Output path                                  |
| ------------------------------------------- | -------------------------------------------- |
| `subdir: false` (default)                   | `src/components/MyComponent.tsx`             |
| `subdir: true`                              | `src/components/MyComponent/MyComponent.tsx` |
| `subdir: true`, `subdirHelper: "upperCase"` | `src/components/MYCOMPONENT/MyComponent.tsx` |

## CLI One-liner (No Config)

```sh
npx simple-scaffold \
  -t templates/component/**/* \
  -o src/components \
  -d '{"author": "My Name"}' \
  MyComponent
```

## Node.js Equivalent

```typescript
import Scaffold from "simple-scaffold"

await new Scaffold({
  name: "MyComponent",
  templates: ["templates/component"],
  output: "src/components",
  data: {
    author: "My Name",
  },
}).run()
```

## Reusable Config Files

### CommonJS (`scaffold.config.js`)

```js
module.exports = {
  default: {
    templates: ["templates/component"],
    output: "src/components",
  },
}
```

### ESM (`scaffold.config.mjs`)

```js
export default {
  default: {
    templates: ["templates/component"],
    output: "src/components",
  },
}
```

### Dynamic Config (with function)

```js
module.exports = (config) => ({
  default: {
    templates: ["templates/component"],
    output: "src/components",
    data: {
      generatedAt: new Date().toISOString(),
    },
  },
})
```

## With Inputs

```js
// scaffold.config.js
module.exports = {
  package: {
    templates: ["templates/package"],
    output: "packages",
    subdir: true,
    inputs: {
      description: { message: "Package description", required: true },
      author: { message: "Author", default: "Team" },
      license: {
        type: "select",
        message: "License",
        options: ["MIT", "Apache-2.0", "ISC"],
      },
      private: { type: "confirm", message: "Private package?", default: true },
    },
  },
}
```

```sh
# Interactive — prompts for each input
npx simple-scaffold -k package my-lib

# Non-interactive — provide all values upfront
npx simple-scaffold -k package -D description="A utility library" -D author=John my-lib
```

## With Hooks

```js
module.exports = {
  app: {
    templates: ["templates/app"],
    output: ".",
    subdir: true,
    afterScaffold: "cd {{name}} && npm install && git init",
  },
}
```

```sh
npx simple-scaffold -k app my-app
# Files are generated, then npm install and git init run automatically
```
