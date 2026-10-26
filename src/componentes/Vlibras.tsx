import { useEffect } from "react";
import { useAccessibility } from "./AcessibilidadeContext";

declare global {
  interface Window {
    VLibras?: {
      Widget: new (applicationUrl: string) => unknown;
    };
  }
}

export default function Vlibras() {
  const { preferences } = useAccessibility();
  const accessibilityClasses = [
    "accessibility-widget",
    preferences.colorFilter !== "none" ? `accessibility-${preferences.colorFilter}` : "",
    preferences.wideLetters ? "accessibility-wide-letters" : "",
    preferences.wideLines ? "accessibility-wide-lines" : "",
    preferences.underlinedLinks ? "accessibility-underlined-links" : "",
    preferences.highContrast ? "accessibility-high-contrast" : "",
    preferences.dyslexiaFriendly ? "accessibility-dyslexia-friendly" : "",
    preferences.reducedMotion ? "accessibility-reduced-motion" : "",
  ].filter(Boolean);
  const accessibilityClassNames = accessibilityClasses.join(" ");

  useEffect(() => {
    if (!preferences.vlibras) return;

    const widgetRoot = document.createElement("div");
    widgetRoot.setAttribute("vw", "");
    widgetRoot.className = "enabled accessibility-widget";

    const accessButton = document.createElement("div");
    accessButton.setAttribute("vw-access-button", "");
    accessButton.className = "active";

    const pluginWrapper = document.createElement("div");
    pluginWrapper.setAttribute("vw-plugin-wrapper", "");
    const topWrapper = document.createElement("div");
    topWrapper.className = "vw-plugin-top-wrapper";
    pluginWrapper.append(topWrapper);
    widgetRoot.append(accessButton, pluginWrapper);
    document.body.append(widgetRoot);

    const initialize = () => {
      try {
        if (window.VLibras?.Widget) new window.VLibras.Widget("https://vlibras.gov.br/app");
      } catch {
        widgetRoot.remove();
      }
    };

    let script = document.getElementById("vlibras-plugin") as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement("script");
      script.id = "vlibras-plugin";
      script.src = "https://vlibras.gov.br/app/vlibras-plugin.js";
      script.async = true;
      script.addEventListener("load", initialize, { once: true });
      document.body.append(script);
    } else if (window.VLibras?.Widget) {
      initialize();
    } else {
      script.addEventListener("load", initialize, { once: true });
    }

    return () => {
      script?.removeEventListener("load", initialize);
      widgetRoot.remove();
      document.getElementById("vlibras-access-wrapper")?.remove();
    };
  }, [preferences.vlibras]);

  useEffect(() => {
    const widgetRoot = document.querySelector("[vw]");
    if (!widgetRoot) return;

    widgetRoot.classList.remove(
      "accessibility-protanopia",
      "accessibility-deuteranopia",
      "accessibility-tritanopia",
      "accessibility-monochromacy",
      "accessibility-wide-letters",
      "accessibility-wide-lines",
      "accessibility-underlined-links",
      "accessibility-high-contrast",
      "accessibility-dyslexia-friendly",
      "accessibility-reduced-motion",
    );
    widgetRoot.classList.add(...accessibilityClassNames.split(" ").filter((className) => className && className !== "accessibility-widget"));
  }, [accessibilityClassNames]);

  return null;
}