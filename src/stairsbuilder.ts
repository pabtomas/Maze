import { ensure, getRandomInt } from './util';
import { FloorSaver, Builder } from './builder';
import { KeysGenerator, DOOR_STEP } from './keysgenerator';
import { MazeNode, bfs } from './mazenode';
import { Maze } from './maze';

export class StairsBuilder extends FloorSaver implements Builder
{
  constructor()
  {
    super();
  }

  init(maze: Maze): void
  {
    maze.setFloor(this.floorBackup);

    maze.clear();

    // Init the maze with a random starting node
    let startingNode = new MazeNode(getRandomInt(maze.getWidth()),
      getRandomInt(maze.getHeight()), getRandomInt(maze.getFloor()));
    let neighbours = this.computeNeighbours(maze, startingNode);
    maze.add(startingNode, neighbours);
  }

  update(maze: Maze): void
  {
    // maze is built if each node is visited
    if (maze.getWalls().length > 0)
    {
      // randomized the Prim algorithm.
      let nodeIndex: number = getRandomInt(maze.getWalls().length);
      let currentNode: MazeNode = maze.getWall(nodeIndex);

      // if a node is not already in the maze and if it has 1 neighbour, it
      // is added to the maze.
      if (!maze.getNodes().some(node => node.isEqual(currentNode))
        && (this.neighboursInMaze(maze, currentNode) === 1))
      {
        this.determineParents(maze, currentNode);
        let neighbours = this.computeNeighbours(maze, currentNode);
        maze.add(currentNode, neighbours);
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

        // a new door can be placed every 'DOOR_STEP' nodes of the solution
        for (let node of fullSolution)
        {
          if ((Math.floor((node.weight + 1) / DOOR_STEP) * DOOR_STEP ===
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
    let neighbours: Array<MazeNode> = node.possibleNeighbourhood().filter(
      neighbour => (neighbour.x > -1) && (neighbour.x < maze.getWidth()) &&
        (neighbour.y > -1) && (neighbour.y < maze.getHeight()) &&
        (neighbour.z > -1) && (neighbour.z < maze.getFloor()) &&
        !maze.getNodes().some(element => element.isEqual(neighbour)));
    return neighbours;
  }

  determineParents(maze: Maze, node: MazeNode): void
  {
    let neighbours: Array<MazeNode> = node.possibleNeighbourhood();
    let parents: MazeNode = ensure(maze.getNodes().find(
      element => neighbours.some(neighbour => element.isEqual(neighbour))));
    node.parents = parents;
    node.parents.children.push(node);
  }
}
