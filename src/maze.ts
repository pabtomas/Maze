import { ensure, shuffle, getRandomInt } from './util';
import { MazeNode, distBetween } from './mazenode';

export class Maze
{
  private level: number;
  private width: number;
  private height: number;
  private floor: number;

  private floorStep: number;
  private newFloorLevel: number;

  private viewer: number;

  private nodes: Array<MazeNode>;
  private doors: Array<MazeNode>;
  private keys: Array<MazeNode>;
  private springs: Map<MazeNode, MazeNode>;
  private ice: Array<MazeNode>;
  private arrows: Array<MazeNode>;
  private solution: Array<MazeNode>;

  private player: MazeNode;
  private princess: MazeNode;

  private lastPlayerPos: MazeNode;
  private timeLastPlayerMove: number;

  private built: boolean;
  private solved: boolean;

  private interuptor: boolean;

  private year: number;

  constructor()
  {
    this.level = 1;
    this.width = 50;
    this.height = 50;
    this.floor = 1;

    this.floorStep = 10;
    this.newFloorLevel = 10;

    this.viewer = 0;

    this.nodes = [];
    this.doors = [];
    this.keys = [];
    this.springs = new Map();
    this.ice = [];
    this.arrows = [];
    this.solution = [];

    this.player = new MazeNode(-1, -1, -1);
    this.princess = new MazeNode(-1, -1, -1);

    this.lastPlayerPos = new MazeNode(-1, -1, -1);
    this.timeLastPlayerMove = Date.now();

    this.built = false;
    this.solved = false;

    this.interuptor = false;

    this.year = 0;
  }

  clear(): void
  {
    this.nodes = [];
    this.doors = [];
    this.keys = [];
    this.springs = new Map();
    this.ice = [];
    this.arrows = [];
    this.solution = [];

    this.viewer = 0;

    this.player = new MazeNode(-1, -1, -1);
    this.princess = new MazeNode(-1, -1, -1);

    this.lastPlayerPos = new MazeNode(-1, -1, -1);
    this.timeLastPlayerMove = Date.now();

    this.built = false;
    this.solved = false;

    this.interuptor = false;

    this.year = 0;
  }

  addNode(node: MazeNode): void
  {
    this.nodes.push(node);
  }

  getNodes(): Array<MazeNode>
  {
    return this.nodes;
  }

  shuffleNodes(): void
  {
    let groupedNodes: Array<Array<MazeNode>> = [];

    let queue: Array<MazeNode> =
      [this.nodes.splice(getRandomInt(this.nodes.length), 1)[0]];
    let currentNode: MazeNode;
    let visited: Array<MazeNode> = [queue[0]];
    let flag: boolean;

    while (this.nodes.length > 0)
    {
      flag = true;

      if (queue.length === 0)
      {
        queue = [this.nodes.splice(getRandomInt(this.nodes.length), 1)[0]];
        visited.push(queue[0]);
      }

      currentNode = queue.splice(0, 1)[0];

      for (let neighbour of currentNode.getNeighbourhood()
        .filter(n => this.isNode(n)))
      {
        if ((visited.length !== 12) && (flag))
        {
          if (!visited.some(element => neighbour.isEqual(element) &&
            (element.t === neighbour.t)))
          {
            visited.push(neighbour);
            queue.push(neighbour);
            this.nodes = this.nodes.filter(node => !node.isEqual(neighbour));
          }
        } else {
          groupedNodes.push(visited.slice());
          queue = [this.nodes.splice(getRandomInt(this.nodes.length), 1)[0]];
          visited = [queue[0]];
          flag = false;
        }
      }
    }

    shuffle(groupedNodes);

    if (visited.length > 0)
    {
      groupedNodes.splice(0, 0, visited.slice());
    }

    this.nodes = groupedNodes.flat();
  }

  getNode(index: number): MazeNode
  {
    return this.nodes[index];
  }

  isNode(n: MazeNode): boolean
  {
    return this.nodes.some(node => node.isEqual(n));
  }

  isBuilt(): boolean
  {
    return this.built;
  }

  Built(): void
  {
    this.built = true;
  }

  getWidth(): number
  {
    return this.width;
  }

  incWidth(): void
  {
    this.width += 2;
  }

  getHeight(): number
  {
    return this.height;
  }

  incHeight(): void
  {
    this.height += 1;
  }

  getFloor(): number
  {
    return this.floor;
  }

  setFloor(floor: number): void
  {
    this.floor = floor;
  }

  getPlayer(): MazeNode
  {
    return this.player;
  }

  setPlayer(node: MazeNode): void
  {
    this.player = node;

    // viewer follows the player after a move if they aren't on the same floor
    this.viewer = this.player.z;

    // fix a display bug when the maze isn't built and the player position
    // isn't determined yet
    if (this.viewer < 0)
    {
      this.viewer = 0;
    }

    this.year = this.player.t;
  }

  getPrincess(): MazeNode
  {
    return this.princess;
  }

  setPrincess(node: MazeNode): void
  {
    this.princess = node;
  }

  addDoor(door: MazeNode): void
  {
    this.doors.push(door);
  }

  getDoor(index: number): MazeNode
  {
    return this.doors[index];
  }

  getDoors(): Array<MazeNode>
  {
    return this.doors;
  }

  isDoor(node: MazeNode): boolean
  {
    return this.doors.some(door => door.isEqual(node));
  }

  canPlayerUnlockDoors(): boolean
  {
    return this.doors.length > this.keys.length;
  }

  getKey(): MazeNode
  {
    return this.keys[0];
  }

  getKeys(): Array<MazeNode>
  {
    return this.keys;
  }

  setKeys(keys: Array<MazeNode>): void
  {
    this.keys = keys;
  }

  getViewer(): number
  {
    return this.viewer;
  }

  incViewer(): void
  {
    this.viewer += 1;
    if (this.viewer === this.floor)
    {
      this.viewer = 0;
    }
  }

  decViewer(): void
  {
    this.viewer -= 1;
    if (this.viewer < 0)
    {
      this.viewer = this.floor - 1;
    }
  }

  isFinished(): boolean
  {
    return this.player.isEqual(this.princess) &&
      (this.player.t === this.princess.t);
  }

  getLevel(): number
  {
    return this.level;
  }

  incLevel(): boolean
  {
    this.level += 1;
    if (this.level === this.newFloorLevel)
    {
      this.floorStep += 10;
      this.newFloorLevel += this.floorStep;
      return true;
    }
    return false;
  }

  isSolved(): boolean
  {
    return this.solved;
  }

  Solved(goal: MazeNode): void
  {
    this.solution = this.searchSolution(goal);
    this.solved = true;
  }

  getSolution(): Array<MazeNode>
  {
    return this.solution;
  }

  addSpring(node1: MazeNode, node2: MazeNode): void
  {
    this.springs.set(node1, node2);
  }

  isSpring(node: MazeNode): boolean
  {
    for (let [key, value] of this.springs.entries())
    {
      if (key.isEqual(node) || value.isEqual(node))
      {
        return true;
      }
    }
    return false;
  }

  getLinkedSpring(node: MazeNode): MazeNode
  {
    for (let [key, value] of this.springs.entries())
    {
      if (key.isEqual(node))
      {
        return value;
      } else if (value.isEqual(node)) {
        return key;
      }
    }
    throw new Error('Node is not a spring.');
  }

  addIce(node: MazeNode): void
  {
    this.ice.push(node);
  }

  popIce(): void
  {
    this.ice.pop();
  }

  getIce(): Array<MazeNode>
  {
    return this.ice;
  }

  isIce(node: MazeNode): boolean
  {
    return this.ice.some(ice => ice.isEqual(node));
  }

  isPlayerOnIce(): boolean
  {
    return this.ice.some(ice => ice.isEqual(this.player));
  }

  addArrow(node: MazeNode): void
  {
    this.arrows.push(node);
  }

  getArrows(): Array<MazeNode>
  {
    return this.arrows;
  }

  isArrow(node: MazeNode): boolean
  {
    return this.arrows.some(arrow => arrow.isEqual(node));
  }

  isPlayerOnArrow(): boolean
  {
    return this.arrows.some(arrow => arrow.isEqual(this.player));
  }

  getInteruptor(): boolean
  {
    return this.interuptor;
  }

  useInteruptor(): void
  {
    this.interuptor = !this.interuptor;
  }

  getYear(): number
  {
    return this.year;
  }

  incYear(): void
  {
    this.year += 1;
    if (this.year === this.nodes[0].t + 1)
    {
      this.year = 0;
    }
  }

  decYear(): void
  {
    this.year -= 1;
    if (this.year < 0)
    {
      this.year = this.nodes[0].t;
    }
  }

  getLastPlayerPos(): MazeNode
  {
    return this.lastPlayerPos;
  }

  setLastPlayerPos(node: MazeNode): void
  {
    this.lastPlayerPos = node;
  }

  getTimeLastPlayerMove(): number
  {
    return this.timeLastPlayerMove;
  }

  movePlayer(neighbour: MazeNode): void
  {
    this.timeLastPlayerMove = Date.now();
    this.lastPlayerPos = this.player;
    this.setPlayer(ensure(this.nodes.concat(this.ice).concat(this.arrows)
      .find(element => element.isEqual(neighbour) &&
        (element.t === neighbour.t))));

    if (this.doors.length > 0)
    {
      // delete door if player has a key and is on a door
      if (this.doors[0].isEqual(this.player) && this.canPlayerUnlockDoors())
      {
        this.doors.splice(0, 1);
      }
    }

    if (this.keys.length > 0)
    {
      // if player is on a key, player can unlock 1 door and the key is removed
      if (this.player.isEqual(this.keys[0]) && !this.canPlayerUnlockDoors()) {
        this.keys.splice(0, 1);
      }
    }

    // update solution automatically after a player move
    if (this.solved)
    {
      if (this.ice.length === 0)
      {
        let goal: MazeNode;
        if (this.doors.length === 0)
        {
          goal = this.princess;
        } else {
          if (this.canPlayerUnlockDoors())
          {
            goal = this.doors[0];
          } else {
            goal = this.keys[0];
          }
        }
        this.solution = this.searchSolution(goal);
      } else {
        if (this.solution[0].isEqual(this.player))
        {
          this.solution.splice(0, 1);
        } else {
          this.solution = [this.lastPlayerPos].concat(this.solution);
        }
      }
    }
  }

  /*
    Return ordered path between player and goal
  */
  searchSolution(goal: MazeNode): Array<MazeNode>
  {
    let goalRoot: Array<MazeNode> = [];
    let playerRoot: Array<MazeNode> = [];

    // path between goal and root maze
    let tmp: MazeNode = goal;
    goalRoot.push(tmp);
    while (!(tmp.isEqual(tmp.parents) && (tmp.t === tmp.parents.t)))
    {
      tmp = tmp.parents;
      goalRoot.push(tmp);
    }

    // path between player and root maze
    tmp = this.player;
    playerRoot.push(tmp);
    while (!(tmp.isEqual(tmp.parents) && (tmp.t === tmp.parents.t)))
    {
      tmp = tmp.parents;
      playerRoot.push(tmp);
    }

    // filter same nodes between 2 paths
    let sameMazeNodes: Array<MazeNode> = goalRoot.filter(node =>
      playerRoot.some(element => element.isEqual(node) && (element.t === node.t)));
    goalRoot = goalRoot.filter(node => !sameMazeNodes.some(element =>
      element.isEqual(node) && (element.t === node.t)));
    playerRoot = playerRoot.filter(node => !sameMazeNodes.some(element =>
      element.isEqual(node) && (element.t === node.t)));

    // add the last same node to link the 2 paths
    if (sameMazeNodes.length > 0)
    {
      playerRoot.push(sameMazeNodes[0]);
    }

    // ordered solution
    let solution: Array<MazeNode> = playerRoot.concat(goalRoot.reverse());

    // add ice nodes between nodes
    if ((solution.length > 1) && (this.ice.length > 0))
    {
      for (let i: number = solution.length - 1; i > 0; --i)
      {
        for (let node of solution[i - 1].between(solution[i]))
        {
          if (this.ice.some(ice => ice.isEqual(node) && (ice.t === node.t)))
          {
            solution.splice(i, 0, node);
          }
        }
      }
    }

    solution = solution.filter(node => !(node.isEqual(this.player) &&
      (this.player.t === node.t)));
    return solution;
  }

  computeNewTree(portals: Array<Array<MazeNode>>, nodesPerYear: number): void
  {
    // give the correct year for each node of last maze
    this.nodes.forEach((node, index) =>
      this.nodes[index].t = portals.length);

    let numberNodes: number = this.nodes.length;

    let newNodes: Array<MazeNode>;

    // deep copy of portal
    let p: MazeNode;
    for (let year: number = portals.length - 1; year > -1; --year)
    {
      newNodes = [];

      // add same year portals to the maze
      for (let portal of portals[year])
      {
        p = new MazeNode(portal.x, portal.y, portal.z);
        p.t = year;
        p.parents = ensure(this.nodes.find(
          node => node.isEqual(p) && (node.t === year + 1)));
        p.parents.children.push(p);
        newNodes.push(p);
      }

      this.nodes = this.nodes.concat(newNodes);

      // allow to get neighbours of node but for the next year
      let node: MazeNode;
      let futureNode: MazeNode;
      let neighbourhood: Array<MazeNode>;

      // add last year maze
      while (newNodes.length > 0)
      {
        node = ensure(newNodes.pop());

        // get the same node for the next year
        futureNode = ensure(this.nodes.find(n => n.isEqual(node) &&
          (n.t === node.t + 1)));

        // if parents' current node is a portal, each node around the
        // current node have to be added to the last year maze
        if (node.parents.t === node.t)
        {
          neighbourhood = futureNode.getNeighbourhood()
            .filter(n => !n.isEqual(node.parents));
        } else {
          neighbourhood = futureNode.getNeighbourhood();
        }

        // current node's children are the same neighbourhood than the next
        // year less the node added the next year
        node.children = neighbourhood
          .filter(neighbour => (neighbour.t === futureNode.t) &&
            this.nodes.slice(0, numberNodes - (portals.length - year) *
              nodesPerYear)
            .some(olderNode => olderNode.isEqual(neighbour)) &&
              !newNodes.some(n => n.isEqual(neighbour)))
          .map(n => {
            // deep copy
            let child = new MazeNode(n.x, n.y, n.z);
            child.parents = node;
            child.t = year;
            return child;
          });

        newNodes = newNodes.concat(node.children);
        this.nodes = this.nodes.concat(node.children);
      }
    }
  }
}
