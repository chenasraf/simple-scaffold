import clsx from "clsx"
import Heading from "@theme/Heading"
import styles from "./styles.module.css"

type FeatureItem = {
  title: string
  Svg: React.ComponentType<React.ComponentProps<"svg">>
  description: JSX.Element
}

const FeatureList: FeatureItem[] = [
  {
    title: "Easy to Use",
    Svg: require("@site/static/img/undraw_docusaurus_mountain.svg").default,
    description: (
      <>
        Generate anything from a simple component to an entire app boilerplate - you decide! Put dynamic data in your
        templates to quickly generate skeletons, formatted data dumps, or repetitive code - and immediately get to
        coding!
      </>
    ),
  },
  {
    title: "Use It Anywhere, For Anything",
    Svg: require("@site/static/img/undraw_docusaurus_tree.svg").default,
    description: (
      <>
        Whether you need files specific to your project or commonly used templates - you can use them both locally or
        use Git to share them with your team. Spackle on some one-time-use data, and run one command.
      </>
    ),
  },
  {
    title: "Handlebars Support",
    Svg: require("@site/static/img/undraw_docusaurus_react.svg").default,
    description: (
      <>
        Did you think you stop at some static data? Generate entire mapped lists of items, pre-parse information, fake
        data, and more - you can attach any function or any data to your templates. Handlebars will parse it all and
        generate the files you need.
      </>
    ),
  },
]

function Feature({ title, Svg, description }: FeatureItem) {
  return (
    <div className={clsx("col col--4")}>
      <div className="text--center">
        <Svg className={styles.featureSvg} role="img" />
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  )
}

export default function HomepageFeatures(): JSX.Element {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  )
}
