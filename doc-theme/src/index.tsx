import { Application, DefaultTheme, PageEvent, JSX, DefaultThemeRenderContext } from "typedoc"

class MyThemeContext extends DefaultThemeRenderContext {
  // Important: If you use `this`, this function MUST be bound! Template functions are free
  // to destructure the context object to only grab what they care about.
  override analytics = () => {
    // Reusing existing option rather than declaring our own for brevity
    if (!this.options.isSet("gaID")) return

    const gaID = this.options.getValue("gaID")

    const scr = `
      (function (w, d, s, l, i) {
        w[l] = w[l] || [];
        w[l].push({ "gtm.start": new Date().getTime(), event: "gtm.js" });
        var f = d.getElementsByTagName(s)[0],
          j = d.createElement(s),
          dl = l != "dataLayer" ? "&l=" + l : "";
        j.async = true;
        j.src = "https://www.googletagmanager.com/gtm.js?id=" + i + dl;
        f.parentNode.insertBefore(j, f);
      })(window, document, "script", "dataLayer", "${gaID}");
    `

    return (
      <script>
        <JSX.Raw html={scr} />
      </script>
    )
  }
}

class MyTheme extends DefaultTheme {
  private _contextCache?: MyThemeContext
  override getRenderContext(): DefaultThemeRenderContext {
    return (this._contextCache ||= new MyThemeContext(this, this.application.options))
  }
}

export function load(app: Application) {
  app.renderer.defineTheme("doc-theme", MyTheme)
}
