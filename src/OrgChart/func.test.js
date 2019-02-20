
const { getSortingNumber, getSize, getBounds } = require("./func");

describe("getSize", () => {
  test("Throws error if provided undefined values", () => {
    expect(() => {
      getSize();
    }).toThrow();
    expect(() => {
      getSize(Array(5));
    }).toThrow();
  });

  test("Correctly sizes boxes based on number of direct reports", () => {
    for (let x = 0; x < 50; x += 1) {
      for (let y = -5; y < 60; y += 1) {
        if (y <= 0) {
          expect(() => {
            getSize(Array(x), y);
          }).toThrow();
        } else {
          const size = getSize(Array(x), y);
          expect(size.x * size.y).toBeGreaterThanOrEqual(x);
          expect(x - (size.x * size.y)).toBeLessThanOrEqual(y);
        }
      }
    }
  });
});

describe("getSortingNumber", () => {
  describe("Test case #1", () => {
    const testCase = {
      row: -4,
      col: -1,
      direct_reports: Array(7).fill(null)
        .reduce((u, i, r) => u.concat(Array(5).fill(null)
          .map((u2, c) => ({ row: r - 3, col: c - 3 }))), []),
    };

    test("Balanced to the LEFT", () => {
      const expected = [
        [17, 23, 7, 29, 35],
        [16, 22, 6, 28, 34],
        [15, 21, 5, 27, 33],
        [14, 20, 4, 26, 32],
        [13, 19, 3, 25, 31],
        [12, 18, 2, 24, 30],
        [8, 9, 1, 10, 11],
      ];
      for (let y = 0; y < testCase.direct_reports.length; y += 1) {
        const node = testCase.direct_reports[y];
        expect(getSortingNumber(node, testCase))
          .toBe(expected[node.row + 3][node.col + 3]);
      }
    });
    test("Balanced to the RIGHT", () => {
      const expected = [
        [35, 29, 7, 23, 17],
        [34, 28, 6, 22, 16],
        [33, 27, 5, 21, 15],
        [32, 26, 4, 20, 14],
        [31, 25, 3, 19, 13],
        [30, 24, 2, 18, 12],
        [11, 10, 1, 9, 8],
      ];
      for (let y = 0; y < testCase.direct_reports.length; y += 1) {
        const node = testCase.direct_reports[y];
        expect(getSortingNumber(node, testCase, true))
          .toBe(expected[node.row + 3][node.col + 3]);
      }
    });
  });
  describe("Test case #2", () => {
    const testCase = {
      row: 4,
      col: 6,
      direct_reports: Array(3).fill(null)
        .reduce((u, i, r) => u.concat(Array(3).fill(null)
          .map((u2, c) => ({ row: r + 5, col: c + 4 }))), []),
    };

    test("Balanced to the LEFT", () => {
      const expected = [
        [7, 9, 3],
        [6, 8, 2],
        [4, 5, 1],
      ];
      for (let y = 0; y < testCase.direct_reports.length; y += 1) {
        const node = testCase.direct_reports[y];
        expect(getSortingNumber(node, testCase))
          .toBe(expected[node.row - 5][node.col - 4]);
      }
    });
    test("Balanced to the RIGHT", () => {
      const expected = [
        [9, 7, 3],
        [8, 6, 2],
        [5, 4, 1],
      ];
      for (let y = 0; y < testCase.direct_reports.length; y += 1) {
        const node = testCase.direct_reports[y];
        expect(getSortingNumber(node, testCase, true))
          .toBe(expected[node.row - 5][node.col - 4]);
      }
    });
  });
  describe("Test case #3", () => {
    const testCase = {
      row: -8,
      col: -6,
      direct_reports: Array(4).fill(null)
        .reduce((u, i, r) => u.concat(Array(4).fill(null)
          .map((u2, c) => ({ row: r - 7, col: c - 6 }))), []),
    };

    test("Balanced to the LEFT", () => {
      const expected = [
        [4, 10, 13, 16],
        [3, 9, 12, 15],
        [2, 8, 11, 14],
        [1, 5, 6, 7],
      ];
      for (let y = 0; y < testCase.direct_reports.length; y += 1) {
        const node = testCase.direct_reports[y];
        expect(getSortingNumber(node, testCase))
          .toBe(expected[node.row + 7][node.col + 6]);
      }
    });
    test("Balanced to the RIGHT", () => {
      const expected = [
        [4, 16, 13, 10],
        [3, 15, 12, 9],
        [2, 14, 11, 8],
        [1, 7, 6, 5],
      ];
      for (let y = 0; y < testCase.direct_reports.length; y += 1) {
        const node = testCase.direct_reports[y];
        expect(getSortingNumber(node, testCase, true))
          .toBe(expected[node.row + 7][node.col + 6]);
      }
    });
  });
});

describe("getBounds", () => {
  test("able to determine positive bounds", () => {
    const ar = [{ row: 5, col: 3 }, { row: 10, col: 2 }, { row: 1, col: 2 }];
    const bounds = getBounds(ar);
    expect(bounds.row).toBe(1);
    expect(bounds.col).toBe(2);
  });
  test("able to determine negative bounds", () => {
    const ar = [{ row: 5, col: -3 }, { row: -10, col: 2 }, { row: 1, col: 2 }];
    const bounds = getBounds(ar);
    expect(bounds.row).toBe(-10);
    expect(bounds.col).toBe(-3);
  });
});
