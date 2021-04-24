import { getRandomInt, range } from './util';
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
    this.visited = [];

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
      this.roads.forEach((setOfRoads, index) =>
        this.roads[index] = setOfRoads.filter(
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
        maze.Built();

        // princess and player are placed at the extremities of the diameter
        // of the maze
        maze.setPlayer(bfs(maze.getNode(0)));
        maze.setPrincess(bfs(maze.getPlayer()));
      }
    }
  }

  // road1 and road2 are concurrent if some nodes are common (except the
  // first of the 2 roads) or if neighbours of last node of the road1
  // are in road2 or if neighbours of last node of road2 are in road1
  isConcurrentRoad(maze: Maze, road1: Array<MazeNode>,
    road2: Array<MazeNode>): boolean
  {
    return road1.some((r1, indexr1) => road2.some((r2, indexr2) =>
      r2.isEqual(r1) && !((indexr1 === 0) && (indexr2 === 0)))) ||
      road1[road1.length - 1].possible2DNeighbourhood()
        .filter(neighbour =>
          (neighbour.x > -1) && (neighbour.x < maze.getWidth()) &&
          (neighbour.y > -1) && (neighbour.y < maze.getHeight()) &&
          !road1.some(r => neighbour.isEqual(r)))
        .some(neighbour => road2.some(node => node.isEqual(neighbour))) ||
      road2[road2.length - 1].possible2DNeighbourhood()
        .filter(neighbour =>
          (neighbour.x > -1) && (neighbour.x < maze.getWidth()) &&
          (neighbour.y > -1) && (neighbour.y < maze.getHeight()) &&
          !road2.some(r => neighbour.isEqual(r)))
        .some(neighbour => road1.some(node => node.isEqual(neighbour)));
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

    let arrows: Array<MazeNode> = [];

    return roads.filter(road => {
      currentNode = road[road.length - 1];
      arrows = road.slice(1, road.length - 1);

      // neighbour of last node can be an arrow of the current road but not
      // the first node (except if the road length is 2)
      if (arrows.length === 0)
      {
        neighbourhood = currentNode.possible2DNeighbourhood().filter(
          neighbour => (neighbour.x > -1) && (neighbour.x < maze.getWidth())
            && (neighbour.y > -1) && (neighbour.y < maze.getHeight()) &&
            !neighbour.isEqual(road[0]));
      } else {
        neighbourhood = currentNode.possible2DNeighbourhood().filter(
          neighbour => (neighbour.x > -1) && (neighbour.x < maze.getWidth())
            && (neighbour.y > -1) && (neighbour.y < maze.getHeight()) &&
            !arrows.some(a => neighbour.isEqual(a)));
      }

      // if neighbours of last node of the road are not already in the maze,
      // keep the road
      if (neighbourhood.every(neighbour => !maze.isNode(neighbour) &&
        !maze.isArrow(neighbour)))
      {
        for (let arrow of arrows)
        {
          // neighbour of an arrow can be another arrow or a node of current
          // road but not a node of another road
          neighbourhood = arrow.possible2DNeighbourhood().filter(
            neighbour => (neighbour.x > -1) && (neighbour.x < maze.getWidth())
              && (neighbour.y > -1) && (neighbour.y < maze.getHeight()) &&
              !road.some(r => neighbour.isEqual(r)));

          // if each neighbour's arrows of the road are not nodes already in
          // the maze, keep the road
          if (neighbourhood.some(neighbour => maze.isNode(neighbour)))
          {
            return false;
          }
        }
        return true;
      } else {
        return false;
      }
    });
  }
}
