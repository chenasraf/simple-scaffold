import * as React from "react"
import * as css from "./{{Name}}.css"

class {{Name}} extends React.Component<any> {
  private {{ snakeCase property }}

  constructor(props: any) {
    super(props)
    this.{{ snakeCase property }} = {{ value }}
  }

  public render() {
    return <div className={ css.{{Name}} } />
  }
}

export default {{Name}}
