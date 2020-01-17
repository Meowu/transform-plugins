function sum(a, b) {
  console.time("sum");
  const random = Math.random();

  if (random > 0.5) {
    a *= b;
  } else {
    b *= a;
  }

  console.timeEnd("sum");
  return a + b;
}