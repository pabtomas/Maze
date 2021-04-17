import { ensure } from './util';
import { MazeNode } from './mazenode';

export class Maze
{
  private level: number;
  private width: number;
  private height: number;
  private floor: number;

  private floorStep: number;
  private newFloorLevel: number;

  private viewer: number;
  private nodeSize: number;

  private nodes: Array<MazeNode>;
  private walls: Array<MazeNode>;
  private doors: Array<MazeNode>;
  private keys: Array<MazeNode>;
  private springs: Map<MazeNode, MazeNode>;
  private ice: Array<MazeNode>;
  private solution: Array<MazeNode>;

  private player: MazeNode;
  private princess: MazeNode;

  private lastPlayerPos: MazeNode;
  private timeLastPlayerMove: number;

  private built: boolean;
  private solved: boolean;

  constructor()
  {
    this.level = 1;
    this.width = 6;
    this.height = 3;
    this.floor = 1;

    this.floorStep = 10;
    this.newFloorLevel = 10;

    this.viewer = 0;
    this.nodeSize = 20;

    this.nodes = [];
    this.walls = [];
    this.doors = [];
    this.keys = [];
    this.springs = new Map();
    this.ice = [];
    this.solution = [];

    this.player = new MazeNode(-1, -1, -1);
    this.princess = new MazeNode(-1, -1, -1);

    this.lastPlayerPos = new MazeNode(-1, -1, -1);
    this.timeLastPlayerMove = Date.now();

    this.built = false;
    this.solved = false;
  }

  clear(): void
  {
    this.nodes = [];
    this.walls = [];
    this.doors = [];
    this.keys = [];
    this.springs = new Map();
    this.ice = [];
    this.solution = [];

    this.viewer = 0;

    this.player = new MazeNode(-1, -1, -1);
    this.princess = new MazeNode(-1, -1, -1);

    this.lastPlayerPos = new MazeNode(-1, -1, -1);
    this.timeLastPlayerMove = Date.now();

    this.built = false;
    this.solved = false;
  }

  add(node: MazeNode, walls: Array<MazeNode>): void
  {
    this.nodes.push(node);
    this.walls = this.walls.concat(walls);
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
    return this.nodes.some(node => node.isEqual(n));
  }

  getWalls(): Array<MazeNode>
  {
    return this.walls;
  }

  getWall(index: number): MazeNode
  {
    return this.walls[index];
  }

  isWall(node: MazeNode): boolean
  {
    return this.walls.some(wall => wall.isEqual(node));
  }

  addWall(node: MazeNode): void
  {
    this.walls.push(node);
  }

  removeWall(index: number): void
  {
    this.walls.splice(index, 1);
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

  getNodeSize(): number
  {
    return this.nodeSize;
  }

  incNodeSize(): void
  {
    this.nodeSize += 5;
  }

  decNodeSize(): void
  {
    this.nodeSize -= 5;
  }

  getViewer(): number
  {
    return this.viewer;
  }

  setViewer(floor: number): void
  {
    this.viewer = floor;
  }

  isFinished(): boolean
  {
    return this.player.isEqual(this.princess);
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
    this.setPlayer(ensure(this.nodes.concat(this.ice)
      .find(element => element.isEqual(neighbour))));

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
      // if player follows the solution, delete node from the solution
      if (this.solution[0].isEqual(this.player))
      {
        this.solution.splice(0, 1);

        // if the previous step of the solution is reached, update the solution
        // with a new goal
        if (this.solution.length === 0)
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
      // if player doesn't follow the solution, add a new node to the solution
      } else {
        this.solution = [this.lastPlayerPos].concat(this.solution);
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
    while (!tmp.isEqual(tmp.parents))
    {
      tmp = tmp.parents;
      goalRoot.push(tmp);
    }

    // path between player and root maze
    tmp = this.player;
    playerRoot.push(tmp);
    while (!tmp.isEqual(tmp.parents))
    {
      tmp = tmp.parents;
      playerRoot.push(tmp);
    }

    // filter same nodes between 2 paths
    let sameMazeNodes: Array<MazeNode> = goalRoot.filter(
      node => playerRoot.some(element => element.isEqual(node)));
    goalRoot = goalRoot.filter(node => !sameMazeNodes.some(element =>
      element.isEqual(node)));
    playerRoot = playerRoot.filter(node => !sameMazeNodes.some(element =>
      element.isEqual(node)));

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
          if (this.ice.some(ice => ice.isEqual(node)))
          {
            solution.splice(i, 0, node);
          }
        }
      }
    }
    solution = solution.filter(node => !node.isEqual(this.player));
    return solution;
  }

  reparentsWalls(newParents: MazeNode, walls: Array<MazeNode>): void
  {
    for (let wall of walls)
    {
      ensure(this.walls.find(w => w.isEqual(wall))).parents = newParents;
    }
  }
}
