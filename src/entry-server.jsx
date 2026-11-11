import { renderToString } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import App from "./App.jsx";

export function render(url) {
  return renderToString(
    <MemoryRouter initialEntries={[url]}>
      <App />
    </MemoryRouter>
  ).replace(/<link rel="preload"[^>]*\/>/g, "");
}
