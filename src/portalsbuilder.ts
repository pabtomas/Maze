import { ensure, getRandomInt } from './util';
import { FloorSaver, Builder } from './builder';
import { MazeNode, bfs } from './mazenode';
import { Maze } from './maze';

const nodesPerYear: number = 12;

export class PortalsBuilder extends FloorSaver implements Builder
{
  private walls: Array<MazeNode>;

  constructor()
  {
    super();
    this.walls = [];
  }

  init(maze: Maze): void
  {
    this.visited = [];
    this.walls = [];

    maze.setFloor(this.floorBackup);

    maze.clear();

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
      // randomized the Prim algorithm.
      let nodeIndex: number = getRandomInt(this.walls.length);
      let currentNode: MazeNode = this.walls[nodeIndex];

      // if a node is not already in the maze and if it has 1 neighbour, it
      // is added to the maze.
      if (!maze.isNode(currentNode) &&
        (this.neighboursInMaze(maze, currentNode) === 1))
      {
        this.determineParents(maze, currentNode);
        let neighbours = this.computeNeighbours(maze, currentNode);
        maze.addNode(currentNode);
        this.walls = this.walls.concat(neighbours);
        this.visited = this.visited.concat(neighbours);
      }
      this.walls.splice(nodeIndex, 1);

    // after the maze is built, player, princess, doors and key are added
    } else {
      if (!maze.isBuilt())
      {
        maze.Built();

        maze.shuffleNodes();

        let currentYearPortals: Array<MazeNode> = [];
        let portals: Array<Array<MazeNode>> = [];
        let submaze: Array<MazeNode>;
        let removedNodes: number;
        for (let index = maze.getNodes().length - 1; index > 0; --index)
        {
          currentYearPortals =
            currentYearPortals.concat(maze.getNode(index).getNeighbourhood());
          removedNodes = maze.getNodes().length - index;
          if (Math.floor(removedNodes / nodesPerYear) * nodesPerYear ===
            removedNodes)
          {
            submaze = maze.getNodes().slice(0, index);

            // removed duplicates
            currentYearPortals = currentYearPortals.filter((portal, i) =>
              currentYearPortals.findIndex(p => p.isEqual(portal)) === i);

            // removed portals not in the maze
            currentYearPortals = currentYearPortals.filter(portal =>
              submaze.some(node => node.isEqual(portal)));

            // removed portal if there is a path to another one
            currentYearPortals = currentYearPortals.filter((portal, i) =>
              currentYearPortals.slice(i, currentYearPortals.length).every(p => {
                if (p.isEqual(portal))
                {
                  return true;
                } else {
                  return !this.isPathBetween(submaze, p, portal);
                }
              })
            );
            portals.push(currentYearPortals.slice());
          }
        }

        portals.reverse();
        maze.computeNewTree(portals, nodesPerYear);

        // princess and player are placed at the extremities of the diameter
        // of the maze
        maze.setPlayer(bfs(maze.getNode(0)));
        maze.setPrincess(bfs(maze.getPlayer()));
      }
    }
  }

  neighboursInMaze(maze: Maze, node: MazeNode): number
  {
    return node.possible2DNeighbourhood().filter(
      neighbour => maze.isNode(neighbour)).length;
  }

  computeNeighbours(maze: Maze, node: MazeNode): Array<MazeNode>
  {
    let visited = this.visited;
    let neighbours: Array<MazeNode> = node.possible2DNeighbourhood().filter(
      neighbour => (neighbour.x > -1) && (neighbour.x < maze.getWidth()) &&
        (neighbour.y > -1) && (neighbour.y < maze.getHeight()) &&
        !maze.isNode(neighbour) && !visited.some(v => v.isEqual(neighbour)));
    return neighbours;
  }

  determineParents(maze: Maze, node: MazeNode): void
  {
    let neighbours: Array<MazeNode> = node.possible2DNeighbourhood();
    let parents: MazeNode = ensure(maze.getNodes().find(
      element => neighbours.some(neighbour => element.isEqual(neighbour))));
    node.parents = parents;
    node.parents.children.push(node);
  }

  isPathBetween(currentMaze: Array<MazeNode>, node1: MazeNode,
    node2: MazeNode): boolean
  {
    let stack: Array<MazeNode> = [node1];
    let currentNode: MazeNode;
    let visited: Array<MazeNode> = [];
    while (stack.length > 0)
    {
      currentNode = ensure(stack.pop());
      if (!visited.some(element => element.isEqual(currentNode)))
      {
        visited.push(currentNode);
        for (let neighbour of currentNode.getNeighbourhood()
          .filter(n => currentMaze.some(node => node.isEqual(n))))
        {
          if (neighbour.isEqual(node2))
          {
            return true;
          }
          stack.push(neighbour);
        }
      }
    }
    return false;
  }
}
