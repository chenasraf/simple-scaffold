import * as React from 'react'
import * as css from './Scaffold.css'

class Scaffold extends React.Component<any> {
  private myProp

  constructor(props: any) {
    super(props)
    this.myProp = "value"
  }

  public render() {
    return (
      <div className={ css.Scaffold } />
    )
  }
}

export default Scaffold
