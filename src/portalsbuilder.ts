import { ensure, getRandomInt } from './util';
import { FloorSaver, Builder } from './builder';
import { MazeNode, bfs } from './mazenode';
import { Maze, NODESPERYEAR } from './maze';

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
        this.determineNeighbours(maze, currentNode);
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
        let start = Date.now();
        maze.Built();

        maze.shuffleNodes();

        console.log('shuffle time', Date.now() - start);
        start = Date.now();

        let currentYearPortals: Array<MazeNode> = [];
        let portals: Array<Array<MazeNode>> = [];
        let submaze: Array<MazeNode>;
        let removedNodes: number;
        for (let index = maze.getNodes().length - 1; index > 0; --index)
        {
          currentYearPortals =
            currentYearPortals.concat(maze.getNode(index).getNeighbourhood());
          removedNodes = maze.getNodes().length - index;
          if (Math.floor(removedNodes / NODESPERYEAR) * NODESPERYEAR ===
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

        console.log('portals gen time', Date.now() - start);
        start = Date.now();

        maze.computeNewTree(portals);

        console.log('new tree time', Date.now() - start);
        start = Date.now();

        // princess and player are placed at the extremities of the diameter
        // of the maze
        maze.setPlayer(bfs(maze.getNode(0)));
        maze.setPrincess(bfs(maze.getPlayer()));

        console.log('princess & player placement time', Date.now() - start);
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

  determineNeighbours(maze: Maze, node: MazeNode): void
  {
    let neighbours: Array<MazeNode> = node.possible3DNeighbourhood();
    let parents: MazeNode = ensure(maze.getNodes().find(
      element => neighbours.some(neighbour => element.isEqual(neighbour))));
    node.parents = parents;
    node.parents.children.push(node);
  }

  isPathBetween(currentMaze: Array<MazeNode>, node1: MazeNode,
    node2: MazeNode): boolean
  {
    let node1Root: Array<MazeNode> = [];
    let node2Root: Array<MazeNode> = [];

    // path between node1 and root node
    let tmp: MazeNode = node1;
    node1Root.push(tmp);
    while (!tmp.isEqual(tmp.parents))
    {
      tmp = tmp.parents;
      node1Root.push(tmp);
    }

    // path between node2 and root node
    tmp = node2;
    node2Root.push(tmp);
    while (!tmp.isEqual(tmp.parents))
    {
      tmp = tmp.parents;
      node2Root.push(tmp);
    }

    // filter same nodes between 2 paths
    let sameMazeNodes: Array<MazeNode> = node1Root.filter(node =>
      node2Root.some(element => element.isEqual(node)));
    node1Root = node1Root.filter(node => !sameMazeNodes.some(element =>
      element.isEqual(node)));
    node2Root = node2Root.filter(node => !sameMazeNodes.some(element =>
      element.isEqual(node)));

    // add the last same node to link the 2 paths
    if (sameMazeNodes.length > 0)
    {
      node2Root.push(sameMazeNodes[0]);
    }

    let path: Array<MazeNode> = node2Root.concat(node1Root);
    return path.every(node => currentMaze.some(n => n.isEqual(node)));
  }
}
