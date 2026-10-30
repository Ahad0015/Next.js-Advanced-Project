// Test double for next/headers: a cookie jar the tests control.
export const jar = { request: null, lastSet: undefined };
export async function cookies() {
  return {
    get: (name) => (jar.request ? { name, value: jar.request } : undefined),
    set: (name, value) => { jar.lastSet = value; },
    delete: () => { jar.lastSet = null; },
  };
}
