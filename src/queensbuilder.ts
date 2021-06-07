import { getRandomInt } from './util';
import { FloorSaver, Builder } from './builder';
import { KeysGenerator } from './keysgenerator';
import { MazeNode, bfs } from './mazenode';
import { Maze } from './maze';

export class QueensBuilder extends FloorSaver implements Builder
{
  private walls: Array<MazeNode>;

  constructor()
  {
    super();
    this.walls = [];
  }

  init(maze: Maze): void
  {
    this.walls = [];

    maze.setFloor(1);

    maze.clear();

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
      // randomized the Prim algorithm.
      let nodeIndex: number = getRandomInt(this.walls.length);
      let currentNode: MazeNode = this.walls[nodeIndex];

      // if a node is not already visited, it is added to the maze.
      if (!maze.isNode(currentNode))
      {
        this.determineNeighbours(maze, currentNode);
        let neighbours = this.computeNeighbours(maze, currentNode);
        maze.addNode(currentNode);
        this.walls = this.walls.concat(neighbours);

        if (currentNode.root.length > maze.getPlayer().root.length)
        {
          maze.setPlayer(currentNode);
        }
      }
      this.walls.splice(nodeIndex, 1);

    // after the maze is built, player, princess, doors and key are added
    } else {
      if (!maze.isBuilt())
      {
        // princess and player are placed at the extremities of the diameter
        // of the maze
        maze.setPrincess(maze.searchFarthestNode(maze.getPlayer()));

        let keysGenerator: KeysGenerator = new KeysGenerator();
        let fullSolution: Array<MazeNode> =
          maze.searchSolution(maze.getPrincess());

        let doorStep: number = 30;

        // a new door can be placed every 'doorStep' nodes of the solution
        let weight: number = 1;
        for (let node of fullSolution)
        {
          if (Math.floor(weight / doorStep) * doorStep === weight)
          {
            // if between the last added door and the possibly next door there
            // aren't new intersection, the possibly next door isn't added
            if (!keysGenerator.subtreeIsPath(node, fullSolution,
              maze.getDoors()))
            {
              maze.addDoor(node);
            }
          }
          ++weight;
        }

        // adding starting position of the maze will be useful for key
        // generation
        fullSolution = [maze.getPlayer()].concat(fullSolution);

        if (maze.getDoors().length > 0)
        {
          let keys: Array<MazeNode> =
            keysGenerator.generateKeys(maze, fullSolution);
          maze.setKeys(keys);
        }

        maze.Built();
      }
    }
  }

  computeNeighbours(maze: Maze, node: MazeNode): Array<MazeNode>
  {
    let neighbours: Array<MazeNode> = node.possibleDiagNeighbourhood().filter(
      neighbour => (neighbour.x > -1) && (neighbour.x < maze.getWidth()) &&
        (neighbour.y > -1) && (neighbour.y < maze.getHeight()) &&
        !maze.isNode(neighbour));
    return neighbours;
  }

  determineNeighbours(maze: Maze, node: MazeNode): void
  {
    let neighbours: Array<MazeNode> = node.possibleDiagNeighbourhood();
    let potentialParents: Array<MazeNode> = maze.getNodes().filter(
      element => neighbours.some(neighbour => element.isEqual(neighbour)));
    node.parents = potentialParents[getRandomInt(potentialParents.length)];
    node.root = node.parents.root.concat([node]);
    node.parents.children.push(node);
  }
}
