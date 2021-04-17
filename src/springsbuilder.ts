import { ensure, getRandomInt } from './util';
import { FloorSaver, Builder } from './builder';
import { KeysGenerator } from './keysgenerator';
import { MazeNode, bfs } from './mazenode';
import { Maze } from './maze';

const SPRING_SPAWN: number = 0.1;

export class SpringsBuilder extends FloorSaver implements Builder
{
  constructor()
  {
    super();
  }

  init(maze: Maze): void
  {
    this.visited = [];

    maze.setFloor(1);

    maze.clear();

    // Init the maze with a random starting node
    let startingNode = new MazeNode(getRandomInt(maze.getWidth()),
      getRandomInt(maze.getHeight()), getRandomInt(maze.getFloor()));
    let neighbours = this.computeNeighbours(maze, startingNode);
    maze.add(startingNode, neighbours);
    this.visited.push(startingNode);
    this.visited = this.visited.concat(neighbours);
  }

  update(maze: Maze): void
  {
    // maze is built if each node is visited
    if (maze.getWalls().length > 0)
    {
      let nodeIndex: number;

      // a spring can only have one destination so if the last node added to
      // the maze is a spring, it can't be chosen
      if (!maze.isSpring(maze.getNode(maze.getNodes().length - 1)) &&
        (Math.random() < SPRING_SPAWN))
      {
        // spring levels have only one floor
        let newSpring: MazeNode = new MazeNode(getRandomInt(maze.getWidth()),
          getRandomInt(maze.getHeight()), 0);
        if (!maze.isWall(newSpring) && !maze.isNode(newSpring))
        {
          maze.addWall(newSpring);
          nodeIndex = maze.getWalls().length - 1;
          this.visited.push(newSpring);
        } else {
          return;
        }
      } else {
        // randomized the Prim algorithm.
        nodeIndex = getRandomInt(maze.getWalls().length);
      }

      let currentNode: MazeNode = maze.getWall(nodeIndex);

      // if a node is not already in the maze and if it has 1 neighbour, it
      // is added to the maze.
      if (!maze.isNode(currentNode) &&
        (this.neighboursInMaze(maze, currentNode) < 2))
      {
        this.determineParents(maze, currentNode);
        let neighbours = this.computeNeighbours(maze, currentNode);
        maze.add(currentNode, neighbours);
        this.visited = this.visited.concat(neighbours);
      }
      maze.removeWall(nodeIndex);

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

        let doorStep: number = 30;

        // a new door can be placed every 'doorStep' nodes of the solution
        for (let node of fullSolution)
        {
          if ((Math.floor((node.weight + 1) / doorStep) * doorStep ===
            node.weight) && (node.weight != 0))
          {
            // if between the last added door and the possibly next door there
            // aren't new intersection, the possibly next door isn't added
            if (!keysGenerator.subtreeIsPath(node, fullSolution, maze.getDoors()))
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
          maze.setKeys(keysGenerator.generateKeys(maze, fullSolution));
        }
      }
    }
  }

  neighboursInMaze(maze: Maze, node: MazeNode): number
  {
    return maze.getNodes().filter(
      element => element.possibleNeighbourhood().some(
        neighbour => neighbour.isEqual(node))).length;
  }

  computeNeighbours(maze: Maze, node: MazeNode): Array<MazeNode>
  {
    let visited = this.visited;
    let neighbours: Array<MazeNode> = node.possibleNeighbourhood().filter(
      neighbour => (neighbour.x > -1) && (neighbour.x < maze.getWidth()) &&
        (neighbour.y > -1) && (neighbour.y < maze.getHeight()) &&
        (neighbour.z > -1) && (neighbour.z < maze.getFloor()) &&
        !maze.isNode(neighbour) && !visited.some(v => v.isEqual(neighbour)));
    return neighbours;
  }

  determineParents(maze: Maze, node: MazeNode): void
  {
    if (this.neighboursInMaze(maze, node) === 1)
    {
      let neighbours: Array<MazeNode> = node.possibleNeighbourhood();
      let parents: MazeNode = ensure(maze.getNodes().find(
        element => neighbours.some(neighbour => element.isEqual(neighbour))));
      node.parents = parents;
    } else {
      node.parents = maze.getNodes()[maze.getNodes().length - 1];
      maze.addSpring(node, node.parents);
    }
    node.parents.children.push(node);
  }
}
