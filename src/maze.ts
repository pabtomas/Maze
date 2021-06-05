import { ensure, getRandomInt } from './util';
import { MazeNode } from './mazenode';

export const NODESPERYEAR: number = 12;

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

  private years: Array<number>;
  private year: number;

  private yearStep: number;
  private newYearLevel: number;

  constructor()
  {
    this.level = 1;
    this.width = 16;
    this.height = 8;
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

    this.interuptor = true;

    this.years = [];
    this.year = 0;

    this.yearStep = 2;
    this.newYearLevel = 3;
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

    this.interuptor = true;

    this.years = [];
    this.year = 0;
  }

  addNode(node: MazeNode): void
  {
    this.nodes.push(node);
    this.year = node.t;
  }

  getNodes(): Array<MazeNode>
  {
    return this.nodes;
  }

  getNode(index: number): MazeNode
  {
    return this.nodes[index];
  }

  isNode(n: MazeNode): boolean
  {
    return this.getNodes().some(node => node.isEqual(n));
  }

  isBuilt(): boolean
  {
    return this.built;
  }

  Built(): void
  {
    this.timeLastPlayerMove = Date.now();
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
    if (this.level === this.newYearLevel)
    {
      this.yearStep += 1;
      this.newYearLevel += this.yearStep;
    }
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
    this.timeLastPlayerMove = Date.now();
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
    this.timeLastPlayerMove = Date.now();
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

  setYears(years: Array<number>): void
  {
    this.years = years.slice();
  }

  getYearToDisplay(): number
  {
    if (this.years.length > 0)
    {
      return this.years[this.year];
    } else {
      return this.year;
    }
  }

  getYearsPerLevel(): number
  {
    return this.yearStep;
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
    this.setPlayer(neighbour);

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
    }
  }

  searchSolution(goal: MazeNode): Array<MazeNode>
  {
    let player: MazeNode = this.player;
    let goalRoot: Array<MazeNode> = [];
    let playerRoot: Array<MazeNode> = [];

    // filter same nodes between 2 paths
    let sameMazeNodes: Array<MazeNode> = goal.root.filter(node =>
      player.root.some(element => element.isEqual(node) &&
        (element.t === node.t) && element.parents.isEqual(node.parents)
        && (element.parents.t === node.parents.t)));
    goalRoot = goal.root.filter(node => !(sameMazeNodes.some(element =>
      element.isEqual(node) && (element.t === node.t) &&
        element.parents.isEqual(node.parents) &&
        (element.parents.t === node.parents.t))));
    playerRoot = player.root.filter(node => !(sameMazeNodes.some(element =>
      element.isEqual(node) && (element.t === node.t) &&
        element.parents.isEqual(node.parents) &&
        (element.parents.t === node.parents.t)))).reverse();

    // add the last same node to link the 2 paths
    if (sameMazeNodes.length > 0)
    {
      playerRoot.push(sameMazeNodes[sameMazeNodes.length - 1]);
    }

    // ordered solution
    let solution: Array<MazeNode> = playerRoot.concat(goalRoot);

    solution = solution.filter(node => !(node.isEqual(this.player) &&
      (this.player.t === node.t)));
    return solution;
  }

  searchFarthestNode(node: MazeNode): MazeNode
  {
    node.weight = 0;
    let index: number = 0;
    let maxWeight: number = 0;

    let queue: Array<MazeNode> = [node];
    let currentNode: MazeNode;
    let visited: Array<MazeNode> = [node];
    while (queue.length > 0)
    {
      currentNode = queue.splice(0, 1)[0];
      for (let neighbour of currentNode.getNearestIntersections())
      {
        if (!visited.some(element => neighbour.isEqual(element) &&
          (element.t === neighbour.t)))
        {
          visited.push(neighbour);
          queue.push(neighbour);

          if (neighbour.weight > maxWeight)
          {
            maxWeight = neighbour.weight;
            index = visited.length - 1;
          }
        }
      }
    }
    return visited[index];
  }
}
