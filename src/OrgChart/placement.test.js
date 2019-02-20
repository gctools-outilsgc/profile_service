const svgPathParse = require("parse-svg-path");

const { calculateTree, getNode } = require("./nrc_orgchart_placement");
const NRCOrgChart = require("./fixtures/sample.json");

describe("calculateTree", () => {
  let rows = [];
  const collisionTest = (box) => {
    const addr = `${box.y}-${box.x}`;
    expect(rows.includes(addr)).toBe(false);
    rows.push(addr);
  };
  const testNodes = (nodeA, nodeB) => {
    test("has to expected number of boxes and lines", () => {
      const { boxes, lines } = calculateTree({
        nodeA,
        nodeB,
        root: NRCOrgChart,
        cardHeight: 75,
        cardWidth: 350,
      });
      expect(boxes.length).toBeGreaterThan(0);
      expect(lines.length).toBe(boxes.length - 1);
    });
    test("has no box collisions", () => {
      const { boxes } = calculateTree({
        nodeA,
        nodeB,
        root: NRCOrgChart,
        cardHeight: 75,
        cardWidth: 350,
      });
      boxes.forEach(collisionTest);
    });
    test("has no line collisions", () => {
      const { lines } = calculateTree({
        nodeA,
        nodeB,
        root: NRCOrgChart,
        cardHeight: 75,
        cardWidth: 350,
      });
      const segments = [];
      const addSegment = ({
        x1,
        x2,
        y1,
        y2,
        parent,
      }) => {
        segments.push({
          x1,
          x2,
          y1,
          y2,
          parent,
        });
      };
      const linesIntersect = (p1, p2, p3, p4) => {
        const CCW = (v1, v2, v3) =>
          (v3.y - v1.y) * (v2.x - v1.x) > (v2.y - v1.y) * (v3.x - v1.x);
        return (
          CCW(p1, p3, p4) !== CCW(p2, p3, p4)
        ) && (
          CCW(p1, p2, p3) !== CCW(p1, p2, p4)
        );
      };
      lines.forEach((line) => {
        const commands = svgPathParse(line.d);
        let point = { y: 0, x: 0 };
        commands.forEach((cmd) => {
          switch (cmd[0]) {
            case "M": {
              [, point.x, point.y] = cmd;
              break;
            }
            case "v": {
              const V = point.y + cmd[1];
              const start = Math.min(V, point.y);
              const end = Math.max(V, point.y);
              addSegment({
                x1: point.x,
                x2: point.x,
                y1: start,
                y2: end,
                parent: line.parent.uuid,
              });
              point = { x: point.x, y: V };
              break;
            }
            case "V": {
              const V = cmd[1];
              const start = Math.min(V, point.y);
              const end = Math.max(V, point.y);
              addSegment({
                x1: point.x,
                x2: point.x,
                y1: start,
                y2: end,
                parent: line.parent.uuid,
              });
              point = { x: point.x, y: V };
              break;
            }
            case "h": {
              const H = point.x + cmd[1];
              const start = Math.min(H, point.x);
              const end = Math.max(H, point.x);
              addSegment({
                x1: start,
                x2: end,
                y1: point.y,
                y2: point.y,
                parent: line.parent.uuid,
              });
              point = { x: H, y: point.y };
              break;
            }
            case "H": {
              const H = cmd[1];
              const start = Math.min(H, point.x);
              const end = Math.max(H, point.x);
              addSegment({
                x1: start,
                x2: end,
                y1: point.y,
                y2: point.y,
                parent: line.parent.uuid,
              });
              point = { x: H, y: point.y };
              break;
            }
            default: {
              expect(false).toBe(true);
            }
          }
        });
      });
      segments.forEach((seg1) => {
        expect(segments
          .filter(s2 => linesIntersect(
            { x: seg1.x1, y: seg1.y1 },
            { x: seg1.x2, y: seg1.y2 },
            { x: s2.x1, y: s2.y1 },
            { x: s2.x2, y: s2.y2 },
          ) && seg1.parent !== s2.parent)
          .length).toBe(0);
      });
    });
  };

  beforeEach(() => {
    rows = [];
  });

  describe("Test case #1 (1 -> 2)", () => {
    const nodeA = getNode(NRCOrgChart, "1");
    const nodeB = getNode(NRCOrgChart, "2");
    testNodes(nodeA, nodeB);
  });

  describe("Test case #2 (2 -> 1)", () => {
    const nodeA = getNode(NRCOrgChart, "2");
    const nodeB = getNode(NRCOrgChart, "1");
    testNodes(nodeA, nodeB);
  });

  describe("Test case #3 (6 -> 3)", () => {
    const nodeA = getNode(NRCOrgChart, "6");
    const nodeB = getNode(NRCOrgChart, "3");
    testNodes(nodeA, nodeB);
  });

  describe("Test case #4 (9 -> 1)", () => {
    const nodeA = getNode(NRCOrgChart, "9");
    const nodeB = getNode(NRCOrgChart, "1");
    testNodes(nodeA, nodeB);
  });

  describe("Test case #5 (1 -> 9)", () => {
    const nodeA = getNode(NRCOrgChart, "1");
    const nodeB = getNode(NRCOrgChart, "9");
    testNodes(nodeA, nodeB);
  });
});
