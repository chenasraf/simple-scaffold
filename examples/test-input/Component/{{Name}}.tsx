import * as React from "react"
import * as css from "./{{Name}}.css"

class {{Name}} extends React.Component<any> {
  private {{ property }}

  constructor(props: any) {
    super(props)
    this.{{ property }} = {{ value }}
  }

  public render() {
    return <div className={ css.{{Name}} } />
  }
}

export default {{Name}}
