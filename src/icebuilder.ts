import { ensure, getRandomInt, range } from './util';
import { FloorSaver, Builder } from './builder';
import { MazeNode, bfs } from './mazenode';
import { Maze } from './maze';

export class IceBuilder extends FloorSaver implements Builder
{
  private maxDist: number;
  private walls: Array<MazeNode>;

  constructor()
  {
    super();
    this.maxDist = 0;
    this.walls = [];
  }

  init(maze: Maze): void
  {
    this.visited = [];
    this.walls = [];

    maze.setFloor(1);

    maze.clear();

    this.maxDist = [1, 2, 3, 4, 6, 10][getRandomInt(6)];

    // Init the maze with a random starting node
    let startingNode = new MazeNode(getRandomInt(maze.getWidth()),
      getRandomInt(maze.getHeight()), getRandomInt(maze.getFloor()));
    let neighbours = this.computeNeighbours(maze, startingNode);
    maze.addNode(startingNode);
    this.walls = this.walls.concat(neighbours);
    this.visited.push(startingNode);
    this.visited = this.visited.concat(neighbours);
  }

  update(maze: Maze): void
  {
    // maze is built if each node is visited
    if (this.walls.length > 0)
    {
      let max: number = this.maxDist;
      let maxDistWalls: Array<MazeNode> = [];

      // filter possible nodes to maximal distance
      while (maxDistWalls.length === 0)
      {
        maxDistWalls = this.walls.filter(wall => {
          return wall.between(wall.parents).length <= max;
        });
        if (maxDistWalls.length === 0)
        {
          ++max;
        }
      }

      // randomized the Prim algorithm.
      let currentNode: MazeNode =
        maxDistWalls[getRandomInt(maxDistWalls.length)];
      let iceNodes: Array<MazeNode> = currentNode.between(currentNode.parents);

      let isCyclic: boolean = this.checkNode(currentNode, maze);

      if (!isCyclic)
      {
        isCyclic = this.checkIcePath(currentNode, iceNodes, maze);
      }

      if (!isCyclic)
      {
        for (let node of iceNodes)
        {
          maze.addIce(node);
          if (this.walls.some(wall => wall.isEqual(node)))
          {
            this.walls.splice(this.walls.indexOf(
              ensure(this.walls.find(element => element.isEqual(node)))), 1);
          }
        }

        let walls: Array<MazeNode> = this.computeNeighbours(maze, currentNode);

        maze.addNode(currentNode);
        this.walls = this.walls.concat(walls);
        currentNode.parents.children.push(currentNode);

        // it doesn't compute a path for a node if it was already computed
        this.visited = this.visited.concat(walls);

        for (let wall of this.wallsToReparents(currentNode, maze))
        {
          ensure(this.walls.find(w => w.isEqual(wall))).parents = currentNode;
        }
      }

      this.walls.splice(this.walls.indexOf(
        ensure(this.walls.find(element => element.isEqual(currentNode)))), 1);

    // after the maze is built, player and princess are added
    } else {
      if (!maze.isBuilt())
      {
        maze.Built();

        // princess and player are placed at the extremities of the diameter
        // of the maze
        maze.setPlayer(bfs(maze.getNode(0)));
        maze.setPrincess(bfs(maze.getPlayer()));
      }
    }
  }

  computeNeighbours(maze: Maze, node: MazeNode): Array<MazeNode>
  {
    let neighbours: Array<MazeNode> = [];
    if (maze.getNodes().length === 0)
    {
      neighbours = node.sameY(maze).concat(node.sameX(maze));
    } else {
      if (node.x === node.parents.x)
      {
        neighbours = node.sameY(maze);
      } else if (node.y === node.parents.y) {
        neighbours = node.sameX(maze);
      }
    }
    let visited = this.visited;
    neighbours = neighbours.filter(neighbour =>
      !this.walls.some(wall => wall.isEqual(neighbour)) &&
      !maze.isIce(neighbour) && !maze.isNode(neighbour) &&
      !visited.some(v => v.isEqual(neighbour)));
    neighbours.forEach(neighbour => neighbour.parents = node);
    return neighbours;
  }

  /*
    it checks if a new ice node doesn't build a path between two maze nodes
  */
  checkIcePath(currentNode: MazeNode, icePath: Array<MazeNode>,
    maze: Maze): boolean
  {
    for (let ice of icePath)
    {
      let nodesOnFirstSide: Array<MazeNode> = [];
      let nodesOnOtherSide: Array<MazeNode> = [];
      if (currentNode.x === currentNode.parents.x)
      {
        nodesOnFirstSide = maze.getNodes().filter(
          node => (node.y === ice.y) && (node.x < ice.x));
        nodesOnOtherSide = maze.getNodes().filter(
          node => (node.y === ice.y) && (node.x > ice.x));
      } else if (currentNode.y === currentNode.parents.y) {
        nodesOnFirstSide = maze.getNodes().filter(
          node => (node.x === ice.x) && (node.y < ice.y));
        nodesOnOtherSide = maze.getNodes().filter(
          node => (node.x === ice.x) && (node.y > ice.y));
      }
      if ((nodesOnFirstSide.length > 0) && (nodesOnOtherSide.length > 0))
      {
        let firstNode: MazeNode = nodesOnFirstSide[0];
        for (let node of nodesOnFirstSide)
        {
          if (ice.between(node).length < ice.between(firstNode).length)
          {
            firstNode = node;
          }
        }
        let secondNode: MazeNode = nodesOnOtherSide[0];
        for (let node of nodesOnOtherSide)
        {
          if (ice.between(node).length < ice.between(secondNode).length)
          {
            secondNode = node;
          }
        }
        let path: Array<MazeNode> = firstNode.between(secondNode);
        let isNotInMaze = !maze.isIce(ice) && !maze.isNode(ice);
        maze.addIce(ice);

        if (path.every(node => maze.isIce(node)) && isNotInMaze)
        {
          maze.popIce();
          return true;
        }
        maze.popIce();
      }
    }
    return false;
  }

  /*
    it checks if adding a new maze node doesn't build a path between with
    another maze node
  */
  checkNode(currentNode: MazeNode, maze: Maze): boolean
  {
    let nodesOnSide: Array<Array<MazeNode>> = [];
    if (currentNode.x > currentNode.parents.x)
    {
      nodesOnSide.push(maze.getNodes().filter(
        node => (node.y === currentNode.y) && (node.x > currentNode.x)));
      nodesOnSide.push(maze.getNodes().filter(
        node => (node.x === currentNode.x) && (node.y > currentNode.y)));
      nodesOnSide.push(maze.getNodes().filter(
        node => (node.x === currentNode.x) && (node.y < currentNode.y)));
    } else if (currentNode.x < currentNode.parents.x) {
      nodesOnSide.push(maze.getNodes().filter(
        node => (node.y === currentNode.y) && (node.x < currentNode.x)));
      nodesOnSide.push(maze.getNodes().filter(
        node => (node.x === currentNode.x) && (node.y > currentNode.y)));
      nodesOnSide.push(maze.getNodes().filter(
        node => (node.x === currentNode.x) && (node.y < currentNode.y)));
    } else if (currentNode.y > currentNode.parents.y) {
      nodesOnSide.push(maze.getNodes().filter(
        node => (node.x === currentNode.x) && (node.y > currentNode.y)));
      nodesOnSide.push(maze.getNodes().filter(
        node => (node.y === currentNode.y) && (node.x > currentNode.x)));
      nodesOnSide.push(maze.getNodes().filter(
        node => (node.y === currentNode.y) && (node.x < currentNode.x)));
    } else if (currentNode.y < currentNode.parents.y) {
      nodesOnSide.push(maze.getNodes().filter(
        node => (node.x === currentNode.x) && (node.y < currentNode.y)));
      nodesOnSide.push(maze.getNodes().filter(
        node => (node.y === currentNode.y) && (node.x > currentNode.x)));
      nodesOnSide.push(maze.getNodes().filter(
        node => (node.y === currentNode.y) && (node.x < currentNode.x)));
    }
    for (let side of nodesOnSide)
    {
      if (side.length > 0)
      {
        let nearestNode: MazeNode = side[0];
        for (let node of side)
        {
          if (currentNode.between(node).length <
            currentNode.between(nearestNode).length)
          {
            nearestNode = node;
          }
        }
        let path: Array<MazeNode> = currentNode.between(nearestNode);
        if (path.every(node => maze.isIce(node)) || (path.length === 0))
        {
          return true;
        }
      }
    }
    return false;
  }

  /*
    it returns a list of wall. A wall is in this list, if the current node is
    nearer than its parents
  */
  wallsToReparents(currentNode: MazeNode, maze: Maze): Array<MazeNode>
  {
    let walls: Array<MazeNode> =
      currentNode.sameX(maze).concat(currentNode.sameY(maze));

    // gives old parents for walls
    walls = walls.filter(node => this.walls.some(wall => wall.isEqual(node)))
      .map(wall => this.walls[this.walls.indexOf(
        ensure(this.walls.find(w => w.isEqual(wall))))]);

    // filter walls to reparents
    walls = walls.filter(w =>
      w.between(currentNode).length < w.between(w.parents).length);

    return walls;
  }
}
