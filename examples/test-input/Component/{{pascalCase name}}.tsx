import * as React from "react"
import * as css from "./{{pascalCase name}}.css"

class {{pascalCase name}} extends React.Component<any> {
  private {{ property }}

  constructor(props: any) {
    super(props)
    this.{{ property }} = {{ value }}
  }

  public render() {
    return <div className={ css.{{pascalCase name}} } />
  }
}

export default {{pascalCase name}}
