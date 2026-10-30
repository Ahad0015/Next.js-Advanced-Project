// Regression test: the cart provider in a real React renderer (jsdom).
// Run with:  npm run test:cart
//
// It guards against a bug that only happens in the browser: an effect that calls clear() after an order
// was placed must run ONCE. When clear() changed identity on every render, the cart cleared itself forever
// and the page crashed with "Something went wrong".
import { JSDOM } from "jsdom";
const dom = new JSDOM("<!doctype html><div id='root'></div>", { url: "http://localhost/", pretendToBeVisual: true });
globalThis.window = dom.window; globalThis.document = dom.window.document; globalThis.sessionStorage = dom.window.sessionStorage;
Object.defineProperty(globalThis, "navigator", { value: dom.window.navigator, configurable: true });
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const React = await import("react");
const { createRoot } = await import("react-dom/client");
const { act } = React;
const { default: Providers, useCart } = await import("@/app/providers");

let renders = 0, clears = 0;
function Probe({ done }) {
  const { items, clear, add } = useCart();
  renders++;
  // This is exactly what OrderForm does after a successful order: clear the cart once.
  React.useEffect(() => { if (done) { clears++; clear(); } }, [done, clear]);
  return <button id="add" onClick={() => add({ id: "1", name: "Doro Wat", price: 350 })}>{items.length}</button>;
}
const errors = [];
const origError = console.error; console.error = (...a) => { errors.push(String(a[0]).slice(0, 80)); };
const root = createRoot(document.getElementById("root"));
await act(async () => root.render(<Providers><Probe done={false} /></Providers>));
await act(async () => document.getElementById("add").click());
await act(async () => root.render(<Providers><Probe done={true} /></Providers>));
await new Promise((r) => setTimeout(r, 200));
console.error = origError;
console.log(`renders=${renders}  clear() calls=${clears}  console errors=${errors.length}`, errors[0] ?? "");
if (!(clears === 1 && renders < 50)) { console.error("FAIL: the cart clears itself in a loop"); process.exit(1); }
console.log("  ok  clearing the cart once does not loop\n\n1 check passed");
