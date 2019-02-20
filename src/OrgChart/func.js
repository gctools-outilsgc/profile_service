
const getSize = (directReports, childrenMaxColumns) => {
  if (!childrenMaxColumns || childrenMaxColumns <= 0) {
    throw new Error("childrenMaxColumns must be greater than 0.");
  }
  return {
    y: Math.ceil(directReports.length / childrenMaxColumns),
    x: Math.min(directReports.length, childrenMaxColumns),
  };
};

const getSortingNumber =
  (node, parent, balanceRight) => {
    const colArr = parent.direct_reports.map((n) => n.col);
    const bottom = Math.max(...parent.direct_reports.map((n) => n.row));
    const left = Math.min(...colArr);
    const right = Math.max(...colArr);

    // Alignment with parent takes priority
    let sorted = parent.direct_reports
      .filter((n) => n.col === parent.col)
      .sort((a, b) => b.row - a.row);

    // Next bottom row takes priority
    sorted = sorted.concat(parent.direct_reports
      .filter((n) => n.col !== parent.col && n.row === bottom)
      .sort((a, b) => {
        const value = (balanceRight) ? b.col - a.col : a.col - b.col;
        return value;
      }));

    // Remaning columns are sorted to balance the tree
    const start = (balanceRight) ? right : left;
    const operator = (balanceRight) ? -1 : 1;
    const isDone = (balanceRight) ? (a) => a >= left : (a) => a <= right;
    for (let x = start; isDone(x); x += operator) {
      if (x !== parent.col) {
        sorted = sorted.concat(parent.direct_reports
          .filter((n) => n.col === x && n.row !== bottom)
          .sort((a, b) => b.row - a.row));
      }
    }
    // console.log(sorted);
    return sorted.indexOf(node) + 1;
  };

const getBounds = (directReports) => ({
  row: Math.min(...directReports.map((n) => n.row)),
  col: Math.min(...directReports.map((n) => n.col)),
});

module.exports = {
  getSize,
  getBounds,
  getSortingNumber,
};
