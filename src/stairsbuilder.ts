import { ensure, getRandomInt } from './util';
import { FloorSaver, Builder } from './builder';
import { KeysGenerator } from './keysgenerator';
import { MazeNode, bfs } from './mazenode';
import { Maze } from './maze';

export class StairsBuilder extends FloorSaver implements Builder
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
        maze.Built();

        // princess and player are placed at the extremities of the diameter
        // of the maze
        maze.setPlayer(bfs(maze.getNode(0)));
        maze.setPrincess(bfs(maze.getPlayer()));

        let keysGenerator: KeysGenerator = new KeysGenerator();
        let fullSolution: Array<MazeNode> =
          maze.searchSolution(maze.getPrincess());

        let doorStep: number = 3;
        /*let doorStep: number;
        if (maze.getLevel() < 10)
        {
          doorStep = 30;
        } else {
          doorStep = 30 + maze.getLevel();
        }*/

        // a new door can be placed every 'doorStep' nodes of the solution
        for (let node of fullSolution)
        {
          if ((Math.floor((node.weight + 1) / doorStep) * doorStep ===
            node.weight) && (node.weight != 0))
          {
            // if between the last added door and the possibly next door there
            // aren't new intersection, the possibly next door isn't added
            if (!keysGenerator.subtreeIsPath(node, fullSolution,
              maze.getDoors()))
            {
              maze.addDoor(node);
            }
          }
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
      }
    }
  }

  neighboursInMaze(maze: Maze, node: MazeNode): number
  {
    return node.possible3DNeighbourhood().filter(
      neighbour => maze.isNode(neighbour)).length;
  }

  computeNeighbours(maze: Maze, node: MazeNode): Array<MazeNode>
  {
    let visited = this.visited;
    let neighbours: Array<MazeNode> = node.possible3DNeighbourhood().filter(
      neighbour => (neighbour.x > -1) && (neighbour.x < maze.getWidth()) &&
        (neighbour.y > -1) && (neighbour.y < maze.getHeight()) &&
        (neighbour.z > -1) && (neighbour.z < maze.getFloor()) &&
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
}
