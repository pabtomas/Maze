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
    this.walls = [];

    maze.setFloor(1);

    maze.clear();

    this.maxDist = [1, 2, 3, 4, 6, 10][getRandomInt(6)];

    // Init the maze with a random starting node
    let startingNode = new MazeNode(getRandomInt(maze.getWidth()),
      getRandomInt(maze.getHeight()), getRandomInt(maze.getFloor()));
    startingNode.root = [startingNode];
    let neighbours = this.computeNeighbours(maze, startingNode);
    maze.addNode(startingNode);
    this.walls = this.walls.concat(neighbours);
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

      if (iceNodes.length > 0)
      {
        // give parents and children for each icenode
        for (let i = 0; i < iceNodes.length; ++i)
        {
          if (i > 0)
          {
            iceNodes[i].parents = iceNodes[i - 1];
          } else {
            iceNodes[i].parents = currentNode.parents;
            iceNodes[i].parents.children.push(iceNodes[i]);
          }
          iceNodes[i].root = iceNodes[i].parents.root.concat([iceNodes[i]]);
          if (i < iceNodes.length - 1)
          {
            iceNodes[i].children.push(iceNodes[i + 1]);
          } else {
            iceNodes[i].children.push(currentNode);
            currentNode.parents = iceNodes[i];
          }

          maze.addIce(iceNodes[i]);
          if (this.walls.some(wall => wall.isEqual(iceNodes[i])))
          {
            this.walls.splice(this.walls.findIndex(
              element => element.isEqual(iceNodes[i])), 1);
          }
        }
      } else {
        currentNode.parents.children.push(currentNode);
      }

      let walls: Array<MazeNode> = this.computeNeighbours(maze, currentNode);

      maze.addNode(currentNode);
      this.walls = this.walls.concat(walls);

      currentNode.root = currentNode.parents.root.concat([currentNode]);
      if (currentNode.root.length > maze.getPlayer().root.length)
      {
        maze.setPlayer(currentNode);
      }

      for (let wall of this.wallsToReparents(currentNode, maze))
      {
        ensure(this.walls.find(w => w.isEqual(wall))).parents = currentNode;
      }

      this.walls.splice(this.walls.findIndex(
        element => element.isEqual(currentNode)), 1);

    // after the maze is built, player and princess are added
    } else {
      if (!maze.isBuilt())
      {
        // princess and player are placed at the extremities of the diameter
        // of the maze
        maze.setPrincess(maze.searchFarthestNode(maze.getPlayer()));

        maze.Built();
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
    neighbours = neighbours.filter(neighbour =>
      !this.walls.some(wall => wall.isEqual(neighbour)) &&
      !maze.isIce(neighbour) && !maze.isNode(neighbour));
    neighbours.forEach(neighbour => neighbour.parents = node);
    return neighbours;
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
      .map(wall => this.walls[this.walls.findIndex(w => w.isEqual(wall))]);

    // filter walls to reparents
    walls = walls.filter(w =>
      w.between(currentNode).length < w.between(w.parents).length);

    return walls;
  }
}
