import { ensure, getRandomInt, range } from './util';
import { FloorSaver, Builder } from './builder';
import { MazeNode, bfs } from './mazenode';
import { Maze } from './maze';

export class IceBuilder extends FloorSaver implements Builder
{
  constructor()
  {
    super();
  }

  init(maze: Maze): void
  {
    maze.setFloor(1);

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
      let walls: Array<MazeNode> = []

      this.determineParents(maze, currentNode);
      let iceNodes: Array<MazeNode> = currentNode.between(currentNode.parents);
      for (let wall of iceNodes)
      {
        maze.addIce(wall);
        if (maze.getWalls().some(element => element.isEqual(wall)))
        {
          maze.removeWall(maze.getWalls().indexOf(
            ensure(maze.getWalls().find(element => element.isEqual(wall)))));
        }
      }

      let potentialWalls: Array<MazeNode> = [];
      if (currentNode.x === currentNode.parents.x)
      {
        potentialWalls = currentNode.sameX(maze);
      } else if (currentNode.y === currentNode.parents.y) {
        potentialWalls = currentNode.sameY(maze);
      }

      for (let node of potentialWalls)
      {
        if (maze.getWalls().some(wall => wall.isEqual(node)))
        {
          maze.removeWall(maze.getWalls().indexOf(
            ensure(maze.getWalls().find(element => element.isEqual(node)))));
        } else {
          if (!maze.getIce().some(ice => ice.isEqual(node)))
          {
            walls.push(node);
          }
        }
      }

      maze.add(currentNode, walls);
      maze.removeWall(maze.getWalls().indexOf(
        ensure(maze.getWalls().find(element => element.isEqual(currentNode)))));

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

  neighboursInMaze(maze: Maze, node: MazeNode): number
  {
    return 0;
  }

  computeNeighbours(maze: Maze, node: MazeNode): Array<MazeNode>
  {
    let neighbours: Array<MazeNode> = [];
    if (maze.getNodes().length === 0)
    {
      neighbours = node.sameY(maze).concat(node.sameX(maze));
    } else {
      if (maze.getNodes().some(element => node.x === element.x))
      {
        neighbours = node.sameX(maze);
      } else if (maze.getNodes().some(element => node.y === element.y)) {
        neighbours = node.sameY(maze);
      }
    }
    return neighbours;
  }

  determineParents(maze: Maze, node: MazeNode): void
  {
    let parents: MazeNode = node;
    let firstFilter: Array<MazeNode>;
    if (maze.getNodes().some(element => node.x === element.x))
    {
      firstFilter = maze.getNodes().filter(element => node.x === element.x);
      parents = firstFilter[0];
      firstFilter.forEach(element => {
        if (Math.abs(element.y - node.y) <= Math.abs(parents.y - node.y)) {
          parents = element;
        }
      });
    } else if (maze.getNodes().some(element => node.y === element.y)) {
      firstFilter = maze.getNodes().filter(element => node.y === element.y);
      parents = firstFilter[0];
      firstFilter.forEach(element => {
        if (Math.abs(element.x - node.x) <= Math.abs(parents.x - node.x)) {
          parents = element;
        }
      });
    }
    node.parents = parents;
    node.parents.children.push(node);
  }

}
