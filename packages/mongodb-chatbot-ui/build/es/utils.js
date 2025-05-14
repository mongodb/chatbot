function s(n, e) {
  if (!(e >= 0 && e < n.length))
    throw new Error(
      `Index ${e} is out of bounds for array of length ${n.length}`
    );
}
function u(n, e) {
  return s(n, e), [...n.slice(0, e), ...n.slice(e + 1)];
}
function a(n, e) {
  const t = new RegExp(
    // Use the given regex pattern
    n.source,
    // We need the global flag ("g") to count all occurences in the test string
    n.flags.match(/g/) === null ? n.flags + "g" : n.flags
  );
  return (e.match(t) ?? []).length;
}
const c = () => typeof EventSource < "u";
function f(n, e) {
  const t = new URL(n);
  for (const [r, o] of Object.entries(e))
    o && t.searchParams.append(r, o);
  return t.toString();
}
function i() {
  if (!(typeof window > "u"))
    return new URL(window.location.href);
}
export {
  a,
  f as b,
  c,
  i as g,
  u as r
};
