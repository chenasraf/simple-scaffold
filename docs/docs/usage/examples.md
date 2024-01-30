---
title: Examples
---

## Example files

### Input

- Input file path:

  ```text
  project → scaffold → {{Name}}.js → src → components
  ```

- Input file contents:

  ```typescript
  /**
   * Author: {{ author }}
   * Date: {{ now "yyyy-MM-dd" }}
   */
  import React from 'react'

  export default {{camelCase name}}: React.FC = (props) => {
    return (
      <div className="{{className}}">{{camelCase name}} Component</div>
    )
  }
  ```

### Output

- Output file path:

  - With `subdir = false` (default):

    ```text
    project → src → components → MyComponent.js
    ```

  - With `subdir = true`:

    ```text
    project → src → components → MyComponent → MyComponent.js
    ```

  - With `subdir = true` and `subdirHelper = 'upperCase'`:

    ```text
    project → src → components → MYCOMPONENT → MyComponent.js
    ```

- Output file contents:

  ```typescript
  /**
   * Author: My Name
   * Date: 2077-01-01
   */
  import React from 'react'

  export default MyComponent: React.FC = (props) => {
    return (
      <div className="myClassName">MyComponent Component</div>
    )
  }
  ```

## Example run commands

### Command Example

```bash
simple-scaffold \
    -t project/scaffold/**/* \
    -o src/components \
    -d '{"className": "myClassName","author": "My Name"}'
    MyComponent
```

### Equivalent Node Module Example

```typescript
import Scaffold from "simple-scaffold"

async function main() {
  await Scaffold({
    name: "MyComponent",
    templates: ["project/scaffold/**/*"],
    output: ["src/components"],
    data: {
      className: "myClassName",
      author: "My Name",
    },
  })
  console.log("Done.")
}
```

### Re-usable config

#### Shell

```bash
# cjs
simple-scaffold -c scaffold.cjs MyComponent \
    -d '{"className": "myClassName","author": "My Name"}'
# mjs
simple-scaffold -c scaffold.mjs MyComponent \
    -d '{"className": "myClassName","author": "My Name"}'
```

#### scaffold.cjs

```js
module.exports = (config) => ({
  default: {
    templates: ["project/scaffold/**/*"],
    output: ["src/components"],
    data: {
      className: "myClassName",
      author: "My Name",
    },
  },
})
```

#### scaffold.mjs

```js
export default (config) => ({
  default: {
    templates: ["project/scaffold/**/*"],
    output: ["src/components"],
    data: {
      className: "myClassName",
      author: "My Name",
    },
  },
})
```
