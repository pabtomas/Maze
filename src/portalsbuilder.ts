import { ensure, getRandomInt, range, shuffle } from './util';
import { FloorSaver, Builder } from './builder';
import { MazeNode, bfs } from './mazenode';
import { Maze, NODESPERYEAR } from './maze';

export class PortalsBuilder extends FloorSaver implements Builder
{
  private walls: Array<MazeNode>;
  private portals: Array<Array<MazeNode>>;
  private newNodes: Array<MazeNode>;
  private nbNodesOlderMaze: number;
  private years: Array<number>;
  private lastYear: number;

  constructor()
  {
    super();
    this.walls = [];
    this.portals = [];
    this.newNodes = [];
    this.nbNodesOlderMaze = 0;
    this.years = [];
    this.lastYear = 0;
  }

  init(maze: Maze): void
  {
    this.visited = [];
    this.walls = [];
    this.portals = [];
    this.newNodes = [];
    this.nbNodesOlderMaze = 0;
    this.years = [];
    this.lastYear = 0;

    maze.setFloor(1);

    maze.clear();

    // Init the maze with a random starting node
    let startingNode = new MazeNode(getRandomInt(maze.getWidth()),
      getRandomInt(maze.getHeight()), getRandomInt(maze.getFloor()));
    startingNode.root = [startingNode];
    let neighbours = this.computeNeighbours(maze, startingNode);
    maze.addNode(startingNode);
    this.walls = this.walls.concat(neighbours);
    this.visited.push(startingNode);
    this.visited = this.visited.concat(neighbours);
  }

  update(maze: Maze): void
  {
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
    } else {
      if (!maze.isBuilt() && (this.portals.length === 0) &&
        (this.newNodes.length === 0))
      {
        let nodes: Array<MazeNode> = this.shuffleNodes(maze.getNodes());
        this.nbNodesOlderMaze = nodes.length;

        this.years = shuffle(range(0,
          Math.ceil(nodes.length / NODESPERYEAR) - 1))
            .slice(0, maze.getYearsPerLevel()).sort((a, b) => a - b);
        this.lastYear = Math.ceil(nodes.length / NODESPERYEAR) - 1;

        let currentYearPortals: Array<MazeNode> = [];
        let submaze: Array<MazeNode>;
        let removedNodes: number;
        for (let index: number = nodes.length - 1; index > 0; --index)
        {
          currentYearPortals =
            currentYearPortals.concat(nodes[index].getNeighbourhood());
          removedNodes = nodes.length - index;
          if ((Math.floor(removedNodes / NODESPERYEAR) * NODESPERYEAR ===
            removedNodes) && (Math.floor(removedNodes / NODESPERYEAR) ===
            this.lastYear - this.years[this.years.length - 1]))
          {
            submaze = nodes.slice(0, index);

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

            this.portals.push(currentYearPortals.slice());
            this.years.splice(0, 0, ensure(this.years.pop()));
          }
        }
        this.years.push(this.lastYear);

        // give the correct year for each node of last maze
        nodes.forEach((node, index) => nodes[index].t = this.portals.length);

        let playerBackup: MazeNode = maze.getPlayer();
        maze.clear();
        maze.setPlayer(playerBackup);
        nodes.forEach(node => maze.addNode(node));

        maze.setYears(this.years);

        this.portals.reverse();
      } else if (!maze.isBuilt() && ((this.portals.length > 0) ||
        (this.newNodes.length > 0))) {

          if (this.newNodes.length === 0)
          {
            this.years.splice(0, 0, ensure(this.years.pop()));
            let youngerPortals: Array<MazeNode> = ensure(this.portals.pop());

            // deep copy of portal
            let p: MazeNode;
            for (let portal of youngerPortals)
            {
              p = new MazeNode(portal.x, portal.y, portal.z);
              p.t = this.portals.length;
              p.parents = ensure(maze.getNodes().find(
                node => node.isEqual(p) && (node.t === p.t + 1)));
              p.root = p.parents.root.concat([p]);
              p.parents.children.push(p);
              this.newNodes.push(p);
            }
          } else {

            let currentNode: MazeNode = ensure(this.newNodes.pop());

            if (currentNode.root.length > maze.getPlayer().root.length)
            {
              maze.setPlayer(currentNode);
            }

            // get the same node for the next year
            let futureNode: MazeNode = ensure(maze.getNodes().find(node =>
              node.isEqual(currentNode) && (node.t === currentNode.t + 1)));

            // if parents' current node is a portal, each node around the
            // current node have to be added to the last year maze
            let neighbourhood: Array<MazeNode>;
            if (currentNode.parents.t === currentNode.t)
            {
              neighbourhood = futureNode.getNeighbourhood()
                .filter(node => !node.isEqual(currentNode.parents));
            } else {
              neighbourhood = futureNode.getNeighbourhood();
            }

            // current node's children are the same neighbourhood than the next
            // year less the node added the next year
            currentNode.children = neighbourhood
              .filter(neighbour => (neighbour.t === futureNode.t) &&
                maze.getNodes().slice(0, this.nbNodesOlderMaze -
                  (this.lastYear - this.years[this.years.length - 1])
                  * NODESPERYEAR)
                .some(olderNode => olderNode.isEqual(neighbour)) &&
                  !this.newNodes.some(node => node.isEqual(neighbour)))
              .map(node => {
                // deep copy
                let child = new MazeNode(node.x, node.y, node.z);
                child.parents = currentNode;
                child.root = currentNode.root.concat([child]);
                child.t = this.portals.length;
                return child;
              });

            this.newNodes = this.newNodes.concat(currentNode.children);
            maze.addNode(currentNode);
          }

          if ((this.portals.length === 0) && (this.newNodes.length === 0))
          {
            // princess and player are placed at the extremities of the diameter
            // of the maze
            maze.setPlayer(maze.getPlayer());
            maze.setPrincess(maze.searchFarthestNode(maze.getPlayer()));

            if (maze.getPlayer().t < maze.getPrincess().t)
            {
              let backup: MazeNode = maze.getPlayer();
              maze.setPlayer(maze.getPrincess());
              maze.setPrincess(backup);
            }

            maze.Built();
          }
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
    node.root = node.parents.root.concat([node]);
    node.parents.children.push(node);

    if (node.root.length > maze.getPlayer().root.length)
    {
      maze.setPlayer(node);
    }
  }

  isPathBetween(currentMaze: Array<MazeNode>, node1: MazeNode,
    node2: MazeNode): boolean
  {
    let sameMazeNodes: Array<MazeNode> = node1.root.filter(node =>
      node2.root.some(element => element.isEqual(node)));

    let node1Root: Array<MazeNode> = node1.root.filter(node =>
      !sameMazeNodes.some(element => element.isEqual(node)));
    let node2Root: Array<MazeNode> = node2.root.filter(node =>
      !sameMazeNodes.some(element => element.isEqual(node)));

    // add the last same node to link the 2 paths
    if (sameMazeNodes.length > 0)
    {
      node2Root.push(sameMazeNodes[sameMazeNodes.length - 1]);
    }

    let path: Array<MazeNode> = node2Root.concat(node1Root);
    return path.every(node => currentMaze.some(n => n.isEqual(node)));
  }

  shuffleNodes(nodes: Array<MazeNode>): Array<MazeNode>
  {
    let groupedNodes: Array<Array<MazeNode>> = [];

    let queue: Array<MazeNode> =
      [nodes.splice(getRandomInt(nodes.length), 1)[0]];
    let currentNode: MazeNode;
    let visited: Array<MazeNode> = [queue[0]];
    let flag: boolean;

    while (nodes.length > 0)
    {
      flag = true;

      if (queue.length === 0)
      {
        queue = [nodes.splice(getRandomInt(nodes.length), 1)[0]];
        visited.push(queue[0]);
      }

      currentNode = queue.splice(0, 1)[0];

      for (let neighbour of currentNode.getNeighbourhood()
        .filter(n => nodes.some(element => element.isEqual(n))))
      {
        if ((visited.length !== 12) && (flag))
        {
          if (!visited.some(element => neighbour.isEqual(element) &&
            (element.t === neighbour.t)))
          {
            visited.push(neighbour);
            queue.push(neighbour);
            nodes = nodes.filter(node => !node.isEqual(neighbour));
          }
        } else {
          groupedNodes.push(visited.slice());
          queue = [nodes.splice(getRandomInt(nodes.length), 1)[0]];
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

    return groupedNodes.flat();
  }
}
