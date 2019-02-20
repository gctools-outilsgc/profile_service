/**
 * NRC Tree placement algorithm
 *
 * @author Luc Belliveau
 *
 * @copyright
 * Her Majesty the Queen inRight of Canada, as represented by the
 * Minister of National Research Council, 2018.
 */

const { getSize, getSortingNumber, getBounds } = require("./func");

/**
 *
 * @param {*} obj
 * @param {*} root
 * @param {*} c
 */
const countNodes = (obj, root, c = 0) => {
  const u = (c === 0) ? root : obj;
  return u.direct_reports.reduce((s, a) => (
    countNodes(a, root, s + 1)
  ), c);
};

/**
 * Return an array of nodes that are found between `a` and `b`, up to a common
 * ancestor.  If no common ancestor is found, an empty array is returned.
 *
 * @param {*} a
 * @param {*} b
 * @param {*} root
 */
const getNodesAlongPath = (a, b, root) => {
  if (a === b) {
    return [a, a.parent];
  }
  const totalNodes = countNodes(a, root);
  const pathA = [a];
  const pathB = [b];
  let cA = a;
  let cB = b;
  let overrun = 0;
  let common = false;
  while (!common) {
    if (cA.parent !== cA) {
      pathA.push(cA.parent);
      if (pathB.includes(cA.parent)) {
        common = cA.parent;
        break;
      }
      cA = cA.parent;
    }
    if (cB.parent !== cB) {
      pathB.push(cB.parent);
      if (pathA.includes(cB.parent)) {
        common = cB.parent;
        break;
      }
      cB = cB.parent;
    }
    overrun += 1;
    if (overrun >= totalNodes) {
      break;
    }
  }
  pathB.reverse();
  if (common) {
    const newPath = [].concat(
      pathA.slice(0, pathA.indexOf(common) + 1),
      pathB.slice(pathB.indexOf(common) + 1),
    );
    return newPath;
  }
  return [];
};

/**
 * Asign a priority to each node based on the distance (number of hops) to
 * nodeA and nodeB.  (Highest priority wins)
 *
 * @param {*} nodeA
 * @param {*} nodeB
 * @param {*} root
 */
const prioritizeNodes = (nodeA, nodeB, root) => {
  /**
   * Return an array of nodes that are `n` hops from `obj`.
   *
   * @param {*} obj
   * @param {*} n
   */
  const nHopNodes = (obj, n) => {
    let children = [obj];
    const pathToRoot = getNodesAlongPath(nodeA, root, root);
    for (let x = 0; x < n; x += 1) {
      const ocl = children.length;
      for (let m = 0; m < children.length; m += 1) {
        const c = children[m];
        for (let z = 0; z < c.direct_reports.length; z += 1) {
          const d = c.direct_reports[z];
          if (!pathToRoot.includes(d)) {
            children.push(d);
          }
        }
      }
      children = children.slice(ocl);
      let { parent } = obj;
      let skip = parent === obj;
      for (let y = 0; y < x; y += 1) {
        if (parent === parent.parent) {
          skip = true;
          break;
        }
        ({ parent } = parent);
      }
      if (!skip) {
        children.push(parent);
      }
    }
    return children;
  };

  /**
   * Add a `prio` property to each node with the appropriate value.
   *
   * @param {} obj
   */
  const prioritize = (obj) => {
    let hops = 1;
    let results;
    while (results !== 0) {
      const nodes = nHopNodes(obj, hops);
      for (let m = 0; m < nodes.length; m += 1) {
        const node = nodes[m];
        node.prio = Math.min(node.prio || hops * 3, hops * 3);
      }
      hops += 1;
      results = nodes.length;
    }
  };
  prioritize(nodeA);
  if (nodeB !== root) {
    prioritize(nodeB);
  }
};

/**
 * Perform the computation of positions and lines on the tree.
 *
 * @param {} options // Full options from the API
 */
const computePositions = ({
  nodeA,
  nodeB,
  root,
  childrenMaxColumns,
  cardWidth,
  cardHeight,
  cardPadding,
  leftGutter,
}) => {
  const getCoord = (row, col) => ({
    x: cardPadding + (col * (cardWidth + cardPadding)),
    y: cardPadding + (row * (cardHeight + cardPadding)),
  });

  const lines = [];
  const positionsMatrix = [];
  const rows = [];

  /**
   * Determine all line segments required to connect the parent and child nodes
   * and add them to the global `lines` array.
   *
   * @param {*} parent
   * @param {*} child
   * @param {*} opt
   */
  const computeLine = (parent, child, opt, buf) => {
    const getMiddle = (obj) => {
      const middle = Math.floor((
        Math.max(...obj.direct_reports.map(n => n.col)) +
        Math.min(...obj.direct_reports.map(n => n.col))
      ) / 2) - obj.col;
      const cardSpace = (((cardWidth / 2) + (cardPadding / 2)));
      return ((middle) * (cardWidth + cardPadding)) - cardSpace;
    };

    const lineArray = buf || lines;

    // Starting position
    let d = `M ${parent.x + (cardWidth / 2)} ${parent.y + cardHeight}`;

    // go down to mid/padding from parent
    d += ` v ${cardPadding / 2}`;

    if (Math.abs(parent.y - child.y) === cardHeight + cardPadding) { // samerow
      // Move towards child
      d += ` H ${child.x + (cardWidth / 2)}`;
    } else if (child.x !== parent.x) { // different row, different column
      // drop down in middle of group
      d += ` h ${getMiddle(opt.parent)}`;
      // Move down to child's row
      d += ` V ${child.y - (cardPadding / 1.5)}`;
      // Go to child
      d += ` H ${child.x + (cardWidth / 2)}`;
    } else { // down
      let straightDown = true;
      for (let o = opt.parent.row + 1; o < opt.child.row; o += 1) {
        if (rows[o].includes(opt.child.col)) {
          straightDown = false;
          break;
        }
      }
      if (straightDown) {
        d += ` V ${child.y - (cardPadding / 1.5)}`;
      } else {
        d += ` h ${getMiddle(opt.parent)}`;
        d += ` V ${child.y - (cardPadding / 1.5)}`;
        // Move towards child
        d += ` H ${child.x + (cardWidth / 2)}`;
      }
    }
    // Attach to child
    d += ` V ${child.y}`;

    lineArray.push({
      id: `${opt.parent.uuid}->${opt.child.uuid}`,
      node: opt.child,
      parent: opt.parent,
      d,
      ...opt,
    });
  };

  /**
   * Locate the starting row/col pair that can accomodate a group of boxes
   * while satisfying the provided criteria.
   *
   * @param {} row Row to begin the search
   * @param {} col Column to begin the search
   * @param {} size Size of group, object with y, x
   * @param {} a Must be above this row
   * @param {} b Must be below this row
   * @param {} l Must be to the left of this col
   * @param {} r Must be to the right of this col
   * @param {} anc Must be anchored within the existing nodes provided.
   * @param {} items How many items will be drawn in the box
   *
   * If the `anc` parameter is passed, having the anchored node with the group
   * will be allowed - furthermore it must be the case.
   *
   */
  const findNearestFreePosition = ({
    row, col, size, a, b, l, r, anc, items,
  }) => {
    const isXYOk = (y, x) => {
      if (typeof a !== 'undefined' && y >= a) return false;
      if (typeof b !== 'undefined' && y <= b) return false;
      if (typeof l !== 'undefined' && x >= l) return false;
      if (typeof r !== 'undefined' && x <= r) return false;

      if (anc) {
        for (let z = 0; z < anc.length; z += 1) {
          const anchor = anc[z];
          if ((anchor.row === y) && (anchor.col === x)) {
            return true;
          }
        }
      }
      if (rows[y] && rows[y].includes(x)) {
        return false; // x,y already occupied
      }
      return true;
    };
    let yPermutation = 0;
    let xPermutation = 0;
    const maxPermutations = (size.y * size.x) * 2;
    while (yPermutation <= maxPermutations) {
      let ok = true;
      let anchored = false;
      for (let yy = 0; yy < size.y; yy += 1) {
        for (let xx = 0; xx < size.x; xx += 1) {
          if ((yy * size.x) + xx >= items) {
            break;
          }
          ok = isXYOk(row + yPermutation + yy, col + xPermutation + xx);
          if (anc && !anchored) {
            for (let z = 0; z < anc.length; z += 1) {
              const anchor = anc[z];
              if (
                (row + yPermutation + yy === anchor.row) &&
                (col + xPermutation + xx === anchor.col)) {
                anchored = true;
                break;
              }
            }
          }
          if (!ok) break;
        }
        if (!ok) break;
      }
      if (ok && (!anc || anchored)) {
        return {
          row: row + yPermutation,
          col: col + xPermutation,
        };
      }

      if (xPermutation > childrenMaxColumns) {
        xPermutation = 0;
        if (yPermutation === 0) {
          yPermutation -= 1;
        } else if (yPermutation < 0) {
          yPermutation *= -1;
        } else {
          yPermutation += 1;
          yPermutation *= -1;
        }
      } else if (xPermutation === 0) {
        xPermutation -= 1;
      } else if (xPermutation < 0) {
        xPermutation *= -1;
      } else {
        xPermutation += 1;
        xPermutation *= -1;
      }
    }
    return false;
  };

  /**
   * A a node to the list of positionned nodes.
   * @param {*} row         The row to add the node.
   * @param {*} col         The col to add the node.
   * @param {*} node        The node to add.
   * @param {} constraints  Accepts the same constraints
   *                        as `findNearestFreePosition`
   * @param {} override     You can specify a special `override` directive to
   *                        place the node without checking the constraints.
   */
  const addNode = (row, col, node, {
    a, b, l, r, override,
  }) => {
    let position = { row, col };
    if (!override) {
      position = findNearestFreePosition({
        row,
        col,
        size: { y: 1, x: 1 },
        a,
        b,
        l,
        r,
        items: 1,
      });
      if (!position) {
        throw new Error('Unable to fit node.direct_reports');
      }
    }
    const geometry = {
      top: position.row,
      bottom: position.row + 1,
      left: position.col - 1,
      right: position.col + 1,
    };
    geometry.mid_col = geometry.right -
      Math.ceil((geometry.right - geometry.left) / 2);
    geometry.mid_row = geometry.bottom -
      Math.ceil((geometry.bottom - geometry.top) / 2);

    if (!rows[position.row]) rows[position.row] = [];
    rows[position.row].push(position.col);

    positionsMatrix.push({ row: position.row, col: position.col, node });
    Object.assign(node, {
      placed: true,
      row: position.row,
      col: position.col,
      width: cardWidth,
      height: cardHeight,
    }, getCoord(position.row, position.col));

    return geometry;
  };

  /**
   * Add all children of the specified node while respecting the provided
   * constraints.
   *
   * @param {*} row The row to begin placing boxes.  (Boxes are added top-down)
   * @param {*} col The column to begin.  (Boxes are added left-right);
   * @param {*} node The parent of the child nodes being placed
   * @param {*} constraints
   */
  const addChildNodes = (row, col, node, {
    a, b, l, r, anc,
  }) => {
    if (!node.direct_reports) {
      return {
        top: row,
        bottom: row,
        left: col - 1,
        right: col + 1,
        mid_col: col,
        mid_row: row,
      };
    }
    const size = getSize(node.direct_reports, childrenMaxColumns);
    const boxPosition = findNearestFreePosition({
      row,
      col,
      size,
      a,
      b,
      l,
      r,
      anc,
      items: node.direct_reports.length,
    });
    if (!boxPosition) {
      throw new Error('Unable to fit node.direct_reports');
    }

    const mod = {
      y: 0,
      x: 0,
    };
    const geometry = {
      top: boxPosition.row,
      bottom: boxPosition.row + size.y,
      left: boxPosition.col,
      right: boxPosition.col + size.x,
    };
    geometry.mid_col = geometry.right -
      Math.ceil((geometry.right - geometry.left) / 2);
    geometry.mid_row = geometry.bottom -
      Math.ceil((geometry.bottom - geometry.top) / 2);
    const nextBox = (m) => {
      const mutator = m;
      mutator.x += 1;
      if (mutator.x >= childrenMaxColumns) {
        mutator.x = 0;
        mutator.y += 1;
      }
    };
    node.direct_reports.forEach((bNode) => {
      if (anc) {
        for (let n = 0; n < anc.length; n += 1) {
          if (
            (anc[n].row === boxPosition.row + mod.y) &&
            (anc[n].col === boxPosition.col + mod.x)
          ) {
            nextBox(mod);
            break;
          }
        }
      }
      if (!bNode.placed) {
        addNode(
          boxPosition.row + mod.y,
          boxPosition.col + mod.x,
          bNode,
          { override: true },
        );
        nextBox(mod);
      }
    });
    return geometry;
  };

  /**
   * Using the provided path, calculate the positions of the boxes for every
   * node along this path, as well as their immediate children.
   *
   * @param {*} criticalP  The critical path
   */
  const computePath = (criticalP) => {
    /**
     * Estimate the starting col of the next group based on how many children
     * the node has.  This encourages a "centered" layout between the
     * children and their parents.
     *
     * @param {} geometry
     * @param {*} node
     */
    const estimateStartColumn = (geometry, node) => {
      const mc = geometry.mid_col;
      const width = Math.min(childrenMaxColumns, node.direct_reports.length);
      return Math.ceil(mc - (width / 2));
    };

    const moveNode = (node, newRow, newCol) => {
      if (node.col !== newCol || node.row !== newRow) {
        const tNode = node;
        rows[tNode.row]
          .splice(rows[tNode.row].indexOf(tNode.col), 1);

        positionsMatrix.splice(
          positionsMatrix.reduce((p, v, i) => {
            if (v.node === tNode) {
              return i;
            }
            return p;
          }, -1),
          1,
        );

        addNode(newRow, newCol, tNode, { override: true });
      }
    };

    const occupiedBySibling = (node, row, col) => {
      const sNode = node.parent.direct_reports
        .filter(n => n.col === col && n.row === row);
      return sNode.length === 1;
    };

    const canMove = (row, col) => positionsMatrix
      .filter(n => n.row === row && n.col === col)
      .reduce((p, c) => p && !criticalP.includes(c.node), true);

    const occupied = (row, col) => rows[row].includes(col);

    const canNodeBeSwaped = (node, row, col) =>
      (occupiedBySibling(node, row, col) || !occupied(row, col))
      && canMove(row, col);

    const swapChildren = (node, newRow, newCol) => {
      if (node.col !== newCol || node.row !== newRow) {
        const tNode = node;
        const sNode = node.parent.direct_reports
          .filter(n => n.col === newCol && n.row === newRow)[0];
        if (sNode) {
          moveNode(sNode, tNode.row, tNode.col);
        }
        moveNode(tNode, newRow, newCol);
      }
    };

    if (criticalP.length > 0) {
      const path = criticalP.slice(0);
      for (let x = 0; x < path.length; x += 1) {
        const node = path[x];
        if (!path.includes(node.parent)) {
          path.splice(x + 1, 0, node.parent);
          x += 1;
        }
      }

      const firstNode = path[0];
      let geometry = addNode(0, 0, firstNode, {});
      const inter = firstNode.direct_reports.filter(n => path.includes(n))[0];
      if (inter) {
        const newPos = Math.min(
          firstNode.direct_reports.length,
          Math.ceil(childrenMaxColumns / 2),
        );
        firstNode.direct_reports.splice(
          firstNode.direct_reports.indexOf(inter),
          1,
        );
        firstNode.direct_reports.splice(newPos - 1, 0, inter);
      }

      if (firstNode.direct_reports.length > 0) {
        geometry = addChildNodes(
          geometry.bottom,
          estimateStartColumn(geometry, firstNode),
          firstNode,
          { b: geometry.bottom - 1 },
        );
      }
      let anc = [firstNode];
      path.slice(1).forEach((node) => {
        if (!node.parent.placed) {
          if (node.direct_reports.length > 0) {
            geometry = addChildNodes(
              geometry.top - 1,
              estimateStartColumn(geometry, node),
              node,
              { a: geometry.top + 1, anc },
            );
          }
          geometry = addNode(
            geometry.top - 1,
            geometry.mid_col,
            node,
            { a: geometry.top },
          );
        } else if (node.direct_reports.length > 0) {
          const balanceL = rows
            .reduce((t, v) => t + v.filter(c => c < 0).length, 0);
          const balanceR = rows
            .reduce((t, v) => t + v.filter(c => c > 0).length, 0);

          // Pick the best position

          // loop over children with at least 1 free box around, try and fit
          // no fit, go to left/right
          // sort boxes based on global balance
          const size = getSize(node.direct_reports, childrenMaxColumns);
          let tries = 1;
          const filterPotentials = (n) => {
            const box =
              findNearestFreePosition({ row: n.row + 1, col: n.col, size });
            return (
              !(rows[n.row + 1] && rows[n.row + 1].includes(n.col)) ||
              !rows[n.row].includes(n.col - 1) ||
              !rows[n.row].includes(n.col + 1)
            ) && (!criticalP.includes(n) || n === node) && box &&
            Math.abs(((box.col < n.col)
              ? (box.col + size.x) : box.col) - n.col) <= tries &&
            Math.abs(box.row <= n.row) <= tries;
          };
          const bounds = getBounds(node.parent.direct_reports);
          const sortPotentials = (a, b) => {
            const A = getSortingNumber(
              a,
              node.parent,
              bounds,
              childrenMaxColumns,
              (balanceL > balanceR),
            );
            const B = getSortingNumber(
              b,
              node.parent,
              bounds,
              childrenMaxColumns,
              (balanceL > balanceR),
            );
            return A - B;
          };

          while (tries < 20) {
            const potentialSwaps = node.parent.direct_reports
              .filter(filterPotentials)
              .sort(sortPotentials);
            if (potentialSwaps.length > 0) {
              const swap = potentialSwaps.shift();
              if (swap !== node) swapChildren(node, swap.row, swap.col);
              const box = findNearestFreePosition({
                row: node.row + 1,
                col: node.col,
                size,
              });
              // If the children are offset and there is a node directly below
              // the parent, move the parent over the children.
              // This keeps the lines separate.
              // @TODO Use a line collision test instead, above.
              if ((node.col !== box.col) && occupied(node.row + 1, node.col)) {
                moveNode(
                  node,
                  node.row,
                  (box.col < node.col) ? ((box.col + size.x) - 1) : box.col,
                );
              }
              break;
            }
            tries += 1;
          }
          if (tries === 20) {
            throw new Error('Unable to go down');
          }
          geometry = addChildNodes(
            node.row,
            estimateStartColumn({ mid_col: node.col }, node),
            node,
            { b: node.row },
          );
        } else if (
          node.col !== node.parent.col &&
          canNodeBeSwaped(node, node.row, node.parent.col)
        ) {
          swapChildren(node, node.row, node.parent.col);
        } else if (
          (node.col !== node.parent.col) &&
          node.parent.direct_reports.length > 1
        ) {
          const nearest = node.parent.direct_reports.slice(0).sort((a, b) =>
            Math.abs((b.col * b.row) - (node.parent.col * node.parent.row)) -
            Math.abs((a.col * a.row) - (node.parent.col * node.parent.row)))
            .pop();
          swapChildren(node, nearest.row, nearest.col);
        }
        anc = [node];
      });
    }
  };

  let positions = [];

  const criticalPath = getNodesAlongPath(nodeA, nodeB, root);
  computePath(criticalPath);

  const flattenTree = (node, parent, arr, yModifier, xModifier) => {
    let tree = arr;
    if (!tree) {
      tree = [];
    }
    if (typeof node.x !== 'undefined') {
      const n = node;
      n.x += xModifier;
      n.y += yModifier;
      tree = tree.concat([{
        id: node.uuid,
        priority: node.prio,
        x: node.x,
        y: node.y,
        width: node.width,
        height: node.height,
        node,
        on_path: (criticalPath.includes(node)),
      }]);
      if (parent && typeof parent.x !== 'undefined') {
        computeLine(
          { y: parent.y, x: parent.x },
          { y: node.y, x: node.x },
          {
            on_path: (
              criticalPath.includes(node) && criticalPath.includes(parent)
            ),
            child: node,
            parent,
          },
        );
      }
    }

    if (node.direct_reports) {
      node.direct_reports.forEach((child) => {
        tree = flattenTree(child, node, tree, yModifier, xModifier);
      });
    }
    return tree;
  };

  const xModifier = Math.abs(Math.min(...positionsMatrix.map(p => p.node.x)))
    + leftGutter;
  const yModifier = Math.abs(Math.min(...positionsMatrix.map(p => p.node.y)));

  positions = flattenTree(root, undefined, undefined, yModifier, xModifier);

  lines.sort((a, b) => {
    const av = (a.on_path) ? 1 : 0;
    const bv = (b.on_path) ? 1 : 0;
    return av - bv;
  });

  return {
    boxes: positions,
    lines,
  };
};

/**
 * Add a link to each node's parent in a `parent` property.
 * @param {} child
 * @param {*} a
 */
const addLinkToParent = (child, a) => {
  const obj = child;
  const parent = a || child;
  obj.parent = parent;
  obj.direct_reports.forEach(node => addLinkToParent(node, obj));
};

/**
 * Remove any properties that were likely added by the algorithm, in order to
 * re-compute values.
 *
 * @param {*} child
 * @param {*} a
 */
const resetTree = (node) => {
  const obj = node;
  delete obj.x;
  delete obj.y;
  delete obj.col;
  delete obj.row;
  delete obj.parent;
  delete obj.placed;
  obj.direct_reports.forEach(edge => resetTree(edge));
};

/**
 * Calculate the positions of boxes and lines needed to generate a tree
 * @param {*} nodeA  First, or nodeA node
 * @param {*} nodeB  Node to draw path to, defaults to "root"
 * @param {*} root   Root of the tree
 */
const calculateTree = (options) => {
  const opt = Object.assign({
    nodeA: undefined,
    nodeB: undefined,
    root: undefined,
    childrenMaxColumns: 5,
    cardWidth: 150,
    cardHeight: 50,
    cardPadding: 60,
    leftGutter: 0,
  }, options);
  if (opt.root) opt.root = copyNode(opt.root);
  if (opt.nodeA) opt.nodeA = getNode(opt.root, opt.nodeA.uuid);
  if (opt.nodeB) opt.nodeB = getNode(opt.root, opt.nodeB.uuid);
  opt.nodeB = opt.nodeB || opt.root;
  resetTree(opt.root);
  addLinkToParent(opt.root);
  prioritizeNodes(opt.nodeA, opt.nodeB, opt.root);
  return computePositions(opt);
};

const copyNode = (node) => {
  const newNode = Object.assign(
    {},
    node,
    { direct_reports: [], parent: null },
  );
  node.direct_reports
    .forEach(child => newNode.direct_reports.push(copyNode(child)));
  return newNode;
};

const getNode = (node, uuid) => {
  if (node.uuid === uuid) return node;
  for (let x = 0; x < node.direct_reports.length; x += 1) {
    const n = getNode(node.direct_reports[x], uuid);
    if (n) return n;
  }
  return false;
};

const profileToNode = (profile, team) => {
  return {
    uuid: profile.gcID,
    gcID: profile.gcID,
    name: profile.name,
    avatar: profile.avatar,
    titleEn: profile.titleEn,
    titleFt: profile.titleFr,
    department: {
      "en_CA": team.nameEn,
      "fr_CA": team.nameFr,
      id: team.id,
    },
    "direct_reports": [],
    root: false,
  };
};

const buildNodesFromTeams = (teams, a, b) => {
  if (!teams || teams.length === 0) {
    throw new Error("No teams found.");
  }
  const profiles = {};
  const children = [];
  teams.forEach((t) => {
    if (!profiles[`gcID-${t.owner.gcID}`]) {
      profiles[`gcID-${t.owner.gcID}`] = profileToNode(t.owner, t);
    }
    t.members.forEach((m) => {
      if (!profiles[`gcID-${m.gcID}`]) {
        profiles[`gcID-${m.gcID}`] = profileToNode(m, t);
      }
      profiles[`gcID-${t.owner.gcID}`]
        .direct_reports.push(profiles[`gcID-${m.gcID}`]);
      children.push(`gcID-${m.gcID}`);
    });
  });
  const nodeA = profiles[`gcID-${a}`];
  const keys = Object.keys(profiles);
  const roots = [];
  keys.forEach((k) => {
    if (!children.includes(k)) {
      roots.push(profiles[k]);
    }
  });
  const [root] = roots;
  const nodeB = (b) ? profiles[`gcID-${b}`] : root;
  if (roots.length > 1) {
    throw new Error("Organizational structure has diverged - found orphans.");
  }
  if (!root) {
    throw new Error("Cannot determine root node");
  }
  if (!nodeA) {
    throw new Error(`Cannot locate node matching gcIDa: "${a}"`);
  }
  if (!nodeB) {
    throw new Error(`Cannot locate node matching gcIDb: "${b}"`);
  }
  root.root = true;
  return { root, nodeA, nodeB };
};

const defaultCardHeight = 75;
const defaultCardWidth = 350;
const defaultCardPadding = 60;
const defaultMiniCardHeight = 10;
const defaultLeftGutter = 0;
const getMiniWidth = (miniCardWidth, miniCardHeight, cardWidth, cardHeight) =>
  (miniCardWidth) ?
    miniCardWidth :
    miniCardHeight *
    (cardWidth || defaultCardWidth) /
    (cardHeight || defaultCardHeight);

const calculateOrgChart = ({
  root, nodeA, nodeB,
  cardHeight, cardWidth, cardPadding, leftGutter,
  miniCardWidth, miniCardHeight, miniCardPadding,
}) => {
  const miniHeight = miniCardHeight || defaultMiniCardHeight;
  const miniWidth =
    getMiniWidth(miniCardWidth, miniHeight, cardWidth, cardHeight);

  const { boxes, lines } = calculateTree({
    root, nodeA, nodeB,
    cardHeight: cardHeight || defaultCardHeight,
    cardWidth: cardWidth || defaultCardWidth,
    cardPadding: cardPadding || defaultCardPadding,
    leftGutter: leftGutter || defaultLeftGutter,
  });
  const { boxes: miniboxes, lines: minilines } = calculateTree({
    root, nodeA, nodeB,
    cardHeight: miniCardHeight || defaultMiniCardHeight,
    cardWidth: miniWidth,
    cardPadding: miniCardPadding || defaultMiniCardHeight,
    leftGutter:
      (miniWidth / (cardWidth || defaultCardWidth)) *
      (leftGutter || defaultLeftGutter),
  });
  return { boxes, lines, miniboxes, minilines };
};

const teamQuery = `{
  owner {
    gcID
    name
    titleEn
    titleFr
    avatar
  }
  nameEn
  nameFr
  id
  members {
    gcID
    name
    titleEn
    titleFr
    avatar
  }
}`;


module.exports = {
  getNode,
  copyNode,
  computePositions,
  addLinkToParent,
  calculateTree,
  resetTree,
  buildNodesFromTeams,
  calculateOrgChart,
  teamQuery,
};
