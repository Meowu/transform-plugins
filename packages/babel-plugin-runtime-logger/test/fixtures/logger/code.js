function sum(a, b) {
  const random = Math.random();
  if (random > 0.5) {
    a *= b;
  } else {
    b *= a;
  }
  return a + b;
}