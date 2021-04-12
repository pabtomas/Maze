import { ensure } from './util';
import { MazeNode, bfs } from './mazenode';
import { Maze } from './maze';

export const DOOR_STEP: number = 30;

export class KeysGenerator
{
  constructor() {}

  subtreeIsPath(door: MazeNode, solution: Array<MazeNode>,
    doors: Array<MazeNode>): boolean
  {
    let index: number = 0;
    if (doors.length > 0)
    {
      index = solution.indexOf(ensure(solution.find(node =>
        node.isEqual(doors[doors.length - 1]))));
    }
    let res: boolean = false;
    let currentNode: MazeNode = solution[index];
    let neighbourhood: Array<MazeNode> = currentNode.getNeighbourhood();
    while (neighbourhood.length < 3)
    {
      index += 1;
      currentNode = solution[index];
      if (door.isEqual(currentNode))
      {
        res = true;
        break;
      }
      neighbourhood = currentNode.getNeighbourhood();
    }
    return res;
  }

  /*
    Use a BFS to generate keys farthest from the solution path
  */
  generateKeys(maze: Maze, fullSolution: Array<MazeNode>): Array<MazeNode>
  {
    let keys: Array<MazeNode> = [];
    let doors: Array<MazeNode> = maze.getDoors().slice();
    let queue: Array<MazeNode>;
    let currentNode: MazeNode;
    let visited: Array<MazeNode>;

    while (keys.length < maze.getDoors().length)
    {
      queue = fullSolution.slice();
      while (!queue[queue.length - 1].isEqual(doors[0]))
      {
        queue.pop();
      }
      queue.pop();
      visited = queue.slice();
      while (queue.length > 0)
      {
        currentNode = queue.splice(0, 1)[0];
        for (let neighbour of currentNode.getNeighbourhood())
        {
          if (!visited.some(node => neighbour.isEqual(node)) &&
            !doors.some(door => neighbour.isEqual(door)))
          {
            visited.push(neighbour);
            queue.push(neighbour);
          }
        }
      }

      // a key can't be generated on a node with more than 1 neighbour or on the
      // same node than a previous generated key
      while ((visited[visited.length - 1].getNeighbourhood().length > 1) ||
        keys.some(key => key.isEqual(visited[visited.length - 1])))
      {
        visited.pop();
      }

      keys.push(visited[visited.length - 1]);
      doors.splice(0, 1);
    }

    return keys;
  }
}

