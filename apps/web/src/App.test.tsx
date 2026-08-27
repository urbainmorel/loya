import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { App } from "./App";

describe("App", () => {
  it("rend une structure accessible avant la réponse réseau", () => {
    const html = renderToStaticMarkup(<App />);

    expect(html).toContain("<main");
    expect(html).toContain('<h1 id="title">Loya</h1>');
    expect(html).toContain('role="status"');
    expect(html).toContain("Vérification de l’API");
  });
});
