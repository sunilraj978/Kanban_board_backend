function calculatePosition(prev, next) {

 if (!prev && !next) return 1;

 if (!prev) return next / 2;

 if (!next) return prev + 1;

 return (prev + next) / 2;
}

describe("Fractional Ordering", () => {

 test("insert first task", () => {

   const pos = calculatePosition(null, null);

   expect(pos).toBe(1);

 });

 test("insert at start", () => {

   const pos = calculatePosition(null, 2);

   expect(pos).toBe(1);

 });

 test("insert at end", () => {

   const pos = calculatePosition(3, null);

   expect(pos).toBe(4);

 });

 test("insert between tasks", () => {

   const pos = calculatePosition(1, 2);

   expect(pos).toBe(1.5);

 });

});