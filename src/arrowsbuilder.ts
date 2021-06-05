import { ensure, getRandomInt, range } from './util';
import { FloorSaver, Builder } from './builder';
import { MazeNode, bfs } from './mazenode';
import { Maze } from './maze';

export class ArrowsBuilder extends FloorSaver implements Builder
{
  private maxDist: number;
  private roads: Array<Array<Array<MazeNode>>>;

  constructor()
  {
    super();
    this.maxDist = 0;
    this.roads = [];
  }

  init(maze: Maze): void
  {
    maze.setFloor(1);

    maze.clear();

    this.maxDist = [1, 2, 3, 5][getRandomInt(4)] + 2;
    this.roads = [];

    // roads are length sorted to allow more diversity
    for (let i of range(1, this.maxDist))
    {
      this.roads.push([]);
    }

    // Init the maze with a random starting node
    let startingNode = new MazeNode(getRandomInt(maze.getWidth()),
      getRandomInt(maze.getHeight()), getRandomInt(maze.getFloor()));
    startingNode.root = [startingNode];

    // order priority: adding node before building roads
    maze.addNode(startingNode);
    this.computeRoads(maze, startingNode).forEach(
      road => this.roads[road.length - 2].push(road));
  }

  update(maze: Maze): void
  {
    // maze is built if each node is visited
    if (this.roads.flat().length > 0)
    {
      // allows more diversity
      let notEmptySetOfRoads: Array<number> = this.roads.map(
        (setOfRoads, index) => (setOfRoads.length > 0) ? index : -1)
        .filter(index => index >= 0);
      let randomIndex: number =
        notEmptySetOfRoads[getRandomInt(notEmptySetOfRoads.length)];
      let sameLengthRoads: Array<Array<MazeNode>> = this.roads[randomIndex];
      let currentRoad: Array<MazeNode> =
        sameLengthRoads[getRandomInt(sameLengthRoads.length)];
      let currentNode: MazeNode = currentRoad[currentRoad.length - 1];

      // give parents and children for each node of the road
      for (let i = 0; i < currentRoad.length; ++i)
      {
        if (i > 0)
        {
          currentRoad[i].parents = currentRoad[i - 1];
          currentRoad[i].root =
            currentRoad[i].parents.root.concat([currentRoad[i]]);
          if (i === currentRoad.length - 1)
          {
            if (currentNode.root.length > maze.getPlayer().root.length)
            {
              maze.setPlayer(currentNode);
            }
          }
        }
        if (i < currentRoad.length - 1)
        {
          currentRoad[i].children.push(currentRoad[i + 1]);
        }
      }

      // order priority: adding node and arrows before building roads
      maze.addNode(currentNode);

      currentRoad.slice(1, currentRoad.length - 1)
        .forEach(arrow => maze.addArrow(arrow));

      // order priority: filter roads before adding new roads
      this.roads.forEach((setOfRoads, index, roads) =>
        roads[index] = setOfRoads.filter(
        road => !this.isConcurrentRoad(maze, road, currentRoad)));
      this.computeRoads(maze, currentNode).forEach(
        road => this.roads[road.length - 2].push(road));

      // remove the current road
      this.roads[randomIndex] = this.roads[randomIndex].filter(road => {
        for (let i = 0; i < road.length; ++i)
        {
          if (!road[i].isEqual(currentRoad[i]))
          {
            return true;
          }
        }
        return false;
      });

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

  // road1 and road2 are concurrent if some nodes are common (except the
  // first of the 2 roads)
  isConcurrentRoad(maze: Maze, road1: Array<MazeNode>,
    road2: Array<MazeNode>): boolean
  {
    return road1.some((r1, indexr1) => road2.some((r2, indexr2) =>
      r2.isEqual(r1) && !((indexr1 === 0) && (indexr2 === 0))));
  }

  computeRoads(maze: Maze, node: MazeNode): Array<Array<MazeNode>>
  {
    let roads: Array<Array<MazeNode>> = [];
    let currentGenRoads: Array<Array<MazeNode>> = [[node]];
    let nextGenRoads: Array<Array<MazeNode>> = [];
    let neighbourhood: Array<MazeNode>;
    let currentNode: MazeNode;

    do
    {
      for (let road of currentGenRoads)
      {
        currentNode = road[road.length - 1];
        neighbourhood = currentNode.possible2DNeighbourhood().filter(
          neighbour => (neighbour.x > -1) && (neighbour.x < maze.getWidth()) &&
            (neighbour.y > -1) && (neighbour.y < maze.getHeight()) &&
            !maze.isNode(neighbour) && !maze.isArrow(neighbour) &&
            !road.some(r => neighbour.isEqual(r)));
        neighbourhood.forEach(neighbour =>
          nextGenRoads.push(road.concat([neighbour])));
      }
      roads = roads.concat(nextGenRoads);
      currentGenRoads = nextGenRoads;
      nextGenRoads = [];
    } while (currentGenRoads.every(road => road.length < this.maxDist) &&
      (currentGenRoads.length > 0))

    return roads;
  }
}
