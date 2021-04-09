// ------------------------------------
// Useful variables & constants
// ------------------------------------

let canvas: HTMLCanvasElement;
let levelText: HTMLHeadingElement;
let context: CanvasRenderingContext2D;

let level: number = 1;
let width: number = 6;
let height: number = 3;
let floor: number = 1;
let floorBackup: number = floor;
let floorStep: number = 10;
let newFloorLevel: number = 10;

let currentApp: Game | undefined = undefined;
let AnimationLaunched: boolean = false;

let viewer: number = 0;
let vertexSize: number = 20;

const doorStep: number = 30;
const springSpawn: number = 0.1;

const nbLevels: number = 2;
enum Level { Stairs = 1, Springs = 2 };

const playerColor: string = 'red';
const princessColor: string = 'fuchsia';
const mazeColor: string = 'white';
const solutionColor: string = 'blueviolet';
const upStairsColor: string = 'gold';
const downStairsColor: string = 'dodgerblue';
const upAndDownStairsColor: string = 'limegreen';
const doorColor: string = 'black';
const keyColor: string = 'gold';
const springColor: string = 'orange';
const linkedSpringColor: string = 'crimson';

// ------------------------------------
// Vertex class
// ------------------------------------

class Vertex
{
  public x: number;
  public y: number;
  public z: number;
  public parents: Vertex;
  public children: Array<Vertex>;
  public isSolution: boolean;
  public weight: number;

  constructor(x: number, y: number, z: number)
  {
    this.x = x;
    this.y = y;
    this.z = z;
    this.parents = this;
    this.children = [];
    this.isSolution = false;
    this.weight = 0;
  }

  isEqual(vertex: Vertex): boolean
  {
    return (this.x === vertex.x) && (this.y === vertex.y) &&
      (this.z === vertex.z);
  }

  getNeighbourhood(): Array<Vertex>
  {
    if (this.isEqual(this.parents))
    {
      return this.children;
    } else {
      return this.children.concat([this.parents]);
    }
  }

  possibleNeighbourhood(): Array<Vertex>
  {
    return [
      new Vertex(this.x - 1, this.y, this.z),
      new Vertex(this.x + 1, this.y, this.z),
      new Vertex(this.x, this.y - 1, this.z),
      new Vertex(this.x, this.y + 1, this.z),
      new Vertex(this.x, this.y, this.z - 1),
      new Vertex(this.x, this.y, this.z + 1),
    ];
  }

  isSpring(): boolean
  {
    return !this.getNeighbourhood().every(
      neighbour => this.possibleNeighbourhood().some(
        element => element.isEqual(neighbour)));
  }

  getLinkedSpring(): Vertex
  {
    if (this.isSpring())
    {
      return ensure(this.getNeighbourhood().find(
        neighbour => !this.possibleNeighbourhood().some(
          element => element.isEqual(neighbour))));
    } else {
      throw this;
      throw new Error(
        'use GetLinkedSpring() Vertex method but this vertex isn\'t a spring');
    }
  }
}

// ------------------------------------
// Game class
// ------------------------------------

class Game
{
  public maze!: Array<Vertex>;
  public walls!: Array<Vertex>;
  public doors!: Array<Vertex>;
  public previousKeys!: Array<Vertex>;
  public fullSolution!: Array<Vertex>;

  public player!: Vertex;
  public princess!: Vertex;
  public key!: Vertex;

  public built!: boolean;
  public solved!: boolean;
  public canUnlockDoor!: boolean;

  public levelType!: Level;

  constructor()
  {
    this.init()
  }

  init(): void
  {
    this.walls = [];
    this.doors = [];
    this.previousKeys = [];
    this.fullSolution = [];

    // Init the maze with a random starting vertex
    this.maze = [new Vertex(getRandomInt(width), getRandomInt(height),
      getRandomInt(floor))];
    this.maze[0].parents = this.maze[0];
    this.addNeighbours(this.maze[0]);

    this.player = new Vertex(-1, -1, -1);
    this.princess = new Vertex(-1, -1, -1);
    this.key = new Vertex(-1, -1, -1);

    this.built = false;
    this.solved = false;
    this.canUnlockDoor = false;

    if (floorBackup > 1)
    {
      this.levelType = getRandomInt(nbLevels);

      // spring levels have only one floor
      if (this.levelType === Level.Springs)
      {
        floor = 1;
      } else {
        floor = floorBackup;
      }
    }
  }

  /*
    Returns the number of neighbours of vertex. This function is used instead of
    vertex.getNeighbourhood().length because the vertex's neighbourhood is
    determined only after a vertex is added to the maze and maze's building needs
    to know the neighbourhood of a vertex before adding it.
  */
  neighboursInMaze(vertex: Vertex): number
  {
    return this.maze.filter(
      element => element.possibleNeighbourhood().some(
        child => child.isEqual(vertex))).length;
  }

  addNeighbours(vertex: Vertex): void
  {
    let neighbours: Array<Vertex> = vertex.possibleNeighbourhood().filter(
      neighbour => (neighbour.x > -1) && (neighbour.x < width) &&
        (neighbour.y > -1) && (neighbour.y < height) && (neighbour.z > -1)
        && (neighbour.z < floor) &&
        !this.maze.some(element => element.isEqual(neighbour)));
    this.walls = this.walls.concat(neighbours);
  }

  determineParents(vertex: Vertex): void
  {
    if (this.neighboursInMaze(vertex) === 1)
    {
      let neighbours: Array<Vertex> = vertex.possibleNeighbourhood();
      let parents: Vertex = ensure(this.maze.find(
        element => neighbours.some(neighbour => element.isEqual(neighbour))));
      vertex.parents = parents;
    } else {
      vertex.parents = this.maze[this.maze.length - 1];
    }
    vertex.parents.children.push(vertex);
  }

  /*
    Returns true if the graph between the last added door and the possibly
    next door is a path.
  */
  subtreeIsPath(door: Vertex, solution: Array<Vertex>): boolean
  {
    let index: number = 0;
    if (this.doors.length > 0)
    {
      index = solution.indexOf(ensure(solution.find(vertex =>
        vertex.isEqual(this.doors[this.doors.length - 1]))));
    }
    let res: boolean = false;
    let currentVertex: Vertex = solution[index];
    let neighbourhood: Array<Vertex> = currentVertex.getNeighbourhood();
    while (neighbourhood.length < 3)
    {
      index += 1;
      currentVertex = solution[index];
      if (door.isEqual(currentVertex))
      {
        res = true;
        break;
      }
      neighbourhood = currentVertex.getNeighbourhood();
    }
    return res;
  }

  /*
    Build progressively the maze after each call. It is a Randomized Prim
    algorithm.
  */
  update(): void
  {
    // maze is built if each vertex is visited
    if (this.walls.length > 0)
    {
      let vertexIndex: number;

      if (this.levelType === Level.Springs)
      {
        // a spring can only have one destination so if the last vertex added to
        // the maze is a spring, it can't be chosen
        if (!this.maze[this.maze.length - 1].isSpring() &&
          (Math.random() < springSpawn))
        {
          vertexIndex = 0;
          let newSpring: Vertex;
          do {
            // spring levels have only one floor
            newSpring = new Vertex(getRandomInt(width), getRandomInt(height), 0);
          } while (this.maze.some(element => element.isEqual(newSpring)))
          this.walls = [newSpring].concat(this.walls);
        } else {
          // randomized the Prim algorithm.
          vertexIndex = getRandomInt(this.walls.length);
        }
      } else {
        // randomized the Prim algorithm.
        vertexIndex = getRandomInt(this.walls.length);
      }

      // if a vertex is not already in the maze and if it has 1 neighbour, it
      // it added to the maze.
      if (!this.maze.some(element => element.isEqual(this.walls[vertexIndex]))
        && (this.neighboursInMaze(this.walls[vertexIndex]) < 2))
      {
        this.determineParents(this.walls[vertexIndex]);
        this.maze.push(this.walls[vertexIndex]);
        this.addNeighbours(this.walls[vertexIndex]);
      }
      this.walls.splice(vertexIndex, 1);

    // after the maze is built, player, princess, doors and key are added
    } else {
      if (!this.built)
      {
        this.built = true;

        // princess and player are placed at the extremities of the diameter
        // of the maze
        this.player = bfs(this.maze[0]);
        this.princess = bfs(this.player);

        viewer = this.player.z;
        levelText.innerHTML = 'LEVEL '.concat(level.toString())
          .concat(' | FLOOR ').concat((viewer + 1).toString()).concat('/')
          .concat(floor.toString()).concat(' | KEYS = ')
          .concat((this.canUnlockDoor ? 1 : 0).toString()).concat('/1');

        this.fullSolution = this.searchSolution(this.princess);

        // a new door can be placed every 'doorStep' vertexs of the solution
        for (let vertex of this.fullSolution)
        {
          if ((Math.floor((vertex.weight + 1) / doorStep) * doorStep ===
            vertex.weight) && (vertex.weight != 0))
          {
            // if between the last added door and the possibly next door there
            // aren't new intersection, the possibly next door isn't added
            if (!this.subtreeIsPath(vertex, this.fullSolution))
            {
              this.doors.push(vertex);
            }
          }
        }

        // adding starting position of the maze will be useful for key
        // generation
        this.fullSolution = [this.player].concat(this.fullSolution);

        if (this.doors.length > 0)
        {
          this.key = this.generateKey();

          // player doesn't have to come back to a previous key position
          this.previousKeys.push(this.key);
        }
      }
    }
  }

  /*
    Use a BFS to generate a key farthest from the solution path
  */
  generateKey(): Vertex
  {
    let queue: Array<Vertex> = this.fullSolution.slice();
    while (!queue[queue.length - 1].isEqual(this.doors[0]))
    {
      queue.pop();
    }
    queue.pop();

    let currentVertex: Vertex;
    let visited: Array<Vertex> = queue.slice();
    while (queue.length > 0)
    {
      currentVertex = queue.splice(0, 1)[0];
      for (let neighbour of currentVertex.getNeighbourhood())
      {
        if (!visited.some(element => neighbour.isEqual(element)) &&
          !this.doors.some(door => neighbour.isEqual(door)))
        {
          visited.push(neighbour);
          queue.push(neighbour);
        }
      }
    }

    // a key can't be generated on a vertex with more than 1 neighbour or on the
    // same vertex than a previous key
    while ((visited[visited.length - 1].getNeighbourhood().length > 1) ||
      this.previousKeys.some(key => key.isEqual(visited[visited.length - 1])))
    {
      visited.pop();
    }
    return visited[visited.length - 1];
  }

  drawMaze(): void
  {
    this.maze.forEach(function(vertex) {
      if (vertex.z === viewer)
      {
        if (vertex.isSpring())
        {
          context.fillStyle = springColor;
        } else {
          let down: boolean = false;
          let up: boolean = false;
          let neighbourhood: Array<Vertex> = vertex.getNeighbourhood();

          if (neighbourhood.some(element =>
            element.isEqual(new Vertex(vertex.x, vertex.y, vertex.z - 1))))
          {
            down = true;
          }

          if (neighbourhood.some(element =>
            element.isEqual(new Vertex(vertex.x, vertex.y, vertex.z + 1))))
          {
            up = true;
          }

          if (down && up)
          {
            context.fillStyle = upAndDownStairsColor;
          } else if (down) {
            context.fillStyle = downStairsColor;
          } else if (up) {
            context.fillStyle = upStairsColor;
          } else {
            context.fillStyle = mazeColor;
          }
        }

        context.fillRect(vertex.x * vertexSize, vertex.y * vertexSize,
          vertexSize, vertexSize);

        // draw solution
        if (vertex.isSolution)
        {
          context.lineWidth = vertexSize / 5;
          context.strokeStyle = solutionColor;
          context.strokeRect(vertex.x * vertexSize + vertexSize / 10,
            vertex.y * vertexSize + vertexSize / 10,
            vertexSize - vertexSize / 5, vertexSize - vertexSize / 5);
        }
      }
    });
  }

  drawPrincess(): void
  {
    if (!this.princess.isEqual(new Vertex(-1, -1, -1)) &&
      (this.princess.z === viewer))
    {
      context.fillStyle = princessColor;
      context.fillRect(this.princess.x * vertexSize, this.princess.y * vertexSize,
        vertexSize, vertexSize);
    }
  }

  drawDoors(): void
  {
    this.doors.forEach(function(vertex) {
      if (vertex.z === viewer)
      {
        context.fillStyle = doorColor;
        context.beginPath();
        context.arc(vertex.x * vertexSize + vertexSize / 2,
          vertex.y * vertexSize + vertexSize / 3, vertexSize / 4, 0,
          2 * Math.PI, false);
        context.fill();
        context.beginPath();
        context.moveTo(vertex.x * vertexSize + vertexSize / 2,
          vertex.y * vertexSize + vertexSize / 6);
        context.lineTo(vertex.x * vertexSize + vertexSize / 4,
          vertex.y * vertexSize + vertexSize * 11 / 12);
        context.lineTo(vertex.x * vertexSize + vertexSize * 3 / 4,
          vertex.y * vertexSize + vertexSize * 11 / 12);
        context.closePath();
        context.fill();
      }
    });
  }

  drawKey(): void
  {
    if (!this.key.isEqual(new Vertex(-1, -1, -1)) && (this.key.z === viewer))
    {
      context.fillStyle = keyColor;
      context.beginPath();
      context.moveTo(this.key.x * vertexSize + vertexSize / 2,
        this.key.y * vertexSize + vertexSize / 6);
      context.lineTo(this.key.x * vertexSize + vertexSize / 6,
        this.key.y * vertexSize + vertexSize / 2);
      context.lineTo(this.key.x * vertexSize + vertexSize / 2,
        this.key.y * vertexSize + vertexSize * 5 / 6);
      context.lineTo(this.key.x * vertexSize + vertexSize * 5 / 6,
        this.key.y * vertexSize + vertexSize / 2);
      context.closePath();
      context.fill();
      context.lineWidth = vertexSize / 5;
      context.strokeStyle = 'black';
      context.stroke();
    }
  }

  drawPlayer(): void
  {
    if (!this.player.isEqual(new Vertex(-1, -1, -1)) &&
      (this.player.z === viewer))
    {
      context.fillStyle = playerColor;
      context.beginPath();
      context.arc(this.player.x * vertexSize + vertexSize / 2,
        this.player.y * vertexSize + vertexSize / 2, vertexSize / 2, 0,
        2 * Math.PI, false);
      context.fill();
      if (this.player.isSpring())
      {
        let linkedSpring: Vertex = this.player.getLinkedSpring();

        // linked spring doesn't hide a part of a solution
        if (!linkedSpring.isSolution)
        {
          context.lineWidth = vertexSize / 5;
          context.strokeStyle = linkedSpringColor;
          context.strokeRect(linkedSpring.x * vertexSize + vertexSize / 10,
            linkedSpring.y * vertexSize + vertexSize / 10,
            vertexSize - vertexSize / 5, vertexSize - vertexSize / 5);
        }
      }
    }
  }

  draw(): void
  {
    this.drawMaze();
    this.drawPrincess();
    this.drawDoors();
    this.drawKey();
    this.drawPlayer();
  }

  /*
    Move player and update the maze
  */
  movePlayer(neighbour: Vertex): void
  {
    let lastPlayerPos: Vertex = this.player;
    this.player =
      ensure(this.maze.find(element => element.isEqual(neighbour)));

    if (this.doors.length > 0)
    {
      // delete door if player has a key and is on a door
      if (this.doors[0].isEqual(this.player) && this.canUnlockDoor)
      {
        this.doors.splice(0, 1);
        this.canUnlockDoor = false;

        // generate a new key if there are doors after the unlock
        if (this.doors.length > 0)
        {
          this.key = this.generateKey();
          this.previousKeys.push(this.key);
        }

      // if player is on a key, player can unlock 1 door and the key is removed
      } else if (this.player.isEqual(this.key)) {
        this.canUnlockDoor = true;
        this.key = new Vertex(-1, -1, -1);
      }
    }

    // Did the player finish the maze ?
    this.checkMaze();

    // update solution automatically after a player move
    if (this.solved)
    {
      // if player follows the solution, delete vertex from the solution
      if (this.player.isSolution)
      {
        this.player.isSolution = false;

        // if the previous step of the solution is reached, update the solution
        // with a new goal
        if (!this.maze.some(vertex => vertex.isSolution))
        {
          let goal: Vertex;
          if (this.doors.length === 0)
          {
            goal = this.princess;
          } else {
            if (this.canUnlockDoor)
            {
              goal = this.doors[0];
            } else {
              goal = this.key;
            }
          }
          let solution: Array<Vertex> = this.searchSolution(goal);

          // update maze
          for (let vertex of solution)
          {
            if (this.maze.some(element => element.isEqual(vertex)))
            {
              ensure(this.maze.find(
                element => element.isEqual(vertex))).isSolution = true;
            }
          }
        }
      // if player doesn't follow the solution, add a new vertex to the solution
      } else {
        lastPlayerPos.isSolution = true;
      }
    }

    // viewer follow the player after a move if they aren't on the same floor
    viewer = this.player.z;

    // fix a display bug when the maze isn't built and the player position
    // isn't determined yet
    if (viewer < 0)
    {
      viewer = 0;
    }
    levelText.innerHTML = 'LEVEL '.concat(level.toString()).concat(' | FLOOR ')
      .concat((viewer + 1).toString()).concat('/').concat(floor.toString())
      .concat(' | KEYS = ').concat((this.canUnlockDoor ? 1 : 0).toString())
      .concat('/1');
  }

  /*
    Return ordered path between player and goal
  */
  searchSolution(goal: Vertex): Array<Vertex>
  {
    let goalRoot: Array<Vertex> = [];
    let playerRoot: Array<Vertex> = [];

    // path between goal and root maze
    let tmp: Vertex = goal;
    goalRoot.push(tmp);
    while (!tmp.isEqual(tmp.parents))
    {
      tmp = tmp.parents;
      goalRoot.push(tmp);
    }

    // path between player and root maze
    tmp = this.player;
    playerRoot.push(tmp);
    while (!tmp.isEqual(tmp.parents))
    {
      tmp = tmp.parents;
      playerRoot.push(tmp);
    }

    // filter same vertexs between 2 paths
    let sameVertexs: Array<Vertex> = goalRoot.filter(
      vertex => playerRoot.some(element => element.isEqual(vertex)));
    goalRoot = goalRoot.filter(vertex => !sameVertexs.some(element =>
      element.isEqual(vertex)));
    playerRoot = playerRoot.filter(vertex => !sameVertexs.some(element =>
      element.isEqual(vertex)));

    // add the last same vertex to link the 2 paths
    if (sameVertexs.length > 0)
    {
      playerRoot.push(sameVertexs[0]);
    }

    // ordered solution and filter player pos
    let solution: Array<Vertex> = playerRoot.concat(goalRoot.reverse())
      .filter(vertex => !vertex.isEqual(this.player));
    return solution;
  }

  /*
    Check if player rescued the princess and generate a new level if it was.
  */
  checkMaze(): void
  {
    if (this.player.isEqual(this.princess))
    {
      canvas.remove();
      levelText.remove();
      level += 1;
      width += 2;
      height += 1;
      if (level === newFloorLevel)
      {
        floorBackup += 1;
        floor = floorBackup;
        floorStep += 10;
        newFloorLevel += floorStep;
      }
      setup();
      this.init();
    }
  }
}

// ------------------------------------
// Utils
// ------------------------------------

function getRandomInt(max: number): number
{
  return Math.floor(Math.random() * max);
}

function bfs(root: Vertex): Vertex
{
  root.weight = 0;
  let queue: Array<Vertex> = [root];
  let currentVertex: Vertex;
  let visited: Array<Vertex> = [root];
  while (queue.length > 0)
  {
    currentVertex = queue.splice(0, 1)[0];
    for (let neighbour of currentVertex.getNeighbourhood())
    {
      if (!visited.some(element => neighbour.isEqual(element)))
      {
        neighbour.weight = currentVertex.weight + 1;
        visited.push(neighbour);
        queue.push(neighbour);
      }
    }
  }
  return visited[visited.length - 1];
}

/*
  https://stackoverflow.com/questions/54738221/typescript-array-find-possibly-undefind
*/
function ensure<T>(argument: T | undefined | null,
  message: string = 'This value was promised to be there.'): T
{
  if (argument === undefined || argument === null) {
    throw new TypeError(message);
  }
  return argument;
}

// ------------------------------------
// Animation handling
// ------------------------------------
// https://codepen.io/gamealchemist/pen/VeawyL
// https://codepen.io/gamealchemist/post/animationcanvas1
// https://stackoverflow.com/questions/37476437/how-to-render-html5-canvas-within-a-loop
// ------------------------------------

function animate()
{
  requestAnimationFrame(animate);

  context.fillStyle = 'black';
  context.fillRect(0, 0, canvas.width, canvas.height);

  ensure(currentApp).update();
  ensure(currentApp).draw();
}

function launchAnimation(): void {
  if (AnimationLaunched) return;
  AnimationLaunched = true;
  requestAnimationFrame(animate);
}

// ------------------------------------
// Setup
// ------------------------------------

function setup(): void
{
  levelText = document.createElement('H3') as HTMLHeadingElement;
  levelText.innerHTML = 'LEVEL '.concat(level.toString()).concat(' | FLOOR ')
    .concat((viewer + 1).toString()).concat('/').concat(floor.toString())
    .concat(' | KEYS = ')
    .concat((ensure(currentApp).canUnlockDoor ? 1 : 0).toString())
    .concat('/1');
  document.body.appendChild(levelText);

  canvas = document.createElement('canvas') as HTMLCanvasElement;
  canvas.width = width * vertexSize;
  canvas.height = height * vertexSize;
  canvas.style.border = '2px solid black';
  canvas.style.color = 'black';
  document.body.appendChild(canvas);

  context = canvas.getContext('2d', {
    alpha: false
  }) as CanvasRenderingContext2D;
}

window.addEventListener('load', function(event) {
  currentApp = new Game();
  setup();
  launchAnimation();
}, false);

window.addEventListener('keydown', function(event) {
  let neighbour: Vertex;
  switch (event.key)
  {
    case 'ArrowLeft':
      neighbour = new Vertex(ensure(currentApp).player.x - 1,
        ensure(currentApp).player.y, ensure(currentApp).player.z);

      // check if player doesn't move on a wall, a locked door or outside the
      // maze
      if (ensure(currentApp).maze.some(element => element.isEqual(neighbour))
        && (!ensure(currentApp).doors.some(door => door.isEqual(neighbour)) ||
        ensure(currentApp).canUnlockDoor) && (ensure(currentApp).player.x > 0))
      {
        ensure(currentApp).movePlayer(neighbour);
      }
      break;
    case 'ArrowUp':
      neighbour = new Vertex(ensure(currentApp).player.x,
        ensure(currentApp).player.y - 1, ensure(currentApp).player.z);

      // check if player doesn't move on a wall, a locked door or outside the
      // maze
      if (ensure(currentApp).maze.some(element => element.isEqual(neighbour))
        && (!ensure(currentApp).doors.some(door => door.isEqual(neighbour)) ||
        ensure(currentApp).canUnlockDoor) && (ensure(currentApp).player.y > 0))
      {
        ensure(currentApp).movePlayer(neighbour);
      }
      break;
    case 'PageDown':
      neighbour = new Vertex(ensure(currentApp).player.x,
        ensure(currentApp).player.y, ensure(currentApp).player.z - 1);

      // check if player doesn't move on a wall, a locked door or outside the
      // maze
      if (ensure(currentApp).maze.some(element => element.isEqual(neighbour))
        && (!ensure(currentApp).doors.some(door => door.isEqual(neighbour)) ||
        ensure(currentApp).canUnlockDoor) && (ensure(currentApp).player.z > 0))
      {
        ensure(currentApp).movePlayer(neighbour);
      }
      break;
    case 'ArrowRight':
      neighbour = new Vertex(ensure(currentApp).player.x + 1,
        ensure(currentApp).player.y, ensure(currentApp).player.z);

      // check if player doesn't move on a wall, a locked door or outside the
      // maze
      if (ensure(currentApp).maze.some(element => element.isEqual(neighbour))
        && (!ensure(currentApp).doors.some(door => door.isEqual(neighbour)) ||
        ensure(currentApp).canUnlockDoor) &&
        (ensure(currentApp).player.x < width - 1))
      {
        ensure(currentApp).movePlayer(neighbour);
      }
      break;
    case 'ArrowDown':
      neighbour = new Vertex(ensure(currentApp).player.x,
        ensure(currentApp).player.y + 1, ensure(currentApp).player.z);

      // check if player doesn't move on a wall, a locked door or outside the
      // maze
      if (ensure(currentApp).maze.some(element => element.isEqual(neighbour))
        && (!ensure(currentApp).doors.some(door => door.isEqual(neighbour)) ||
        ensure(currentApp).canUnlockDoor) &&
        (ensure(currentApp).player.y < height - 1))
      {
        ensure(currentApp).movePlayer(neighbour);
      }
      break;
    case 'PageUp':
      neighbour = new Vertex(ensure(currentApp).player.x,
        ensure(currentApp).player.y, ensure(currentApp).player.z + 1);

      // check if player doesn't move on a wall, a locked door or outside the
      // maze
      if (ensure(currentApp).maze.some(element => element.isEqual(neighbour))
        && (!ensure(currentApp).doors.some(door => door.isEqual(neighbour)) ||
        ensure(currentApp).canUnlockDoor) &&
        (ensure(currentApp).player.z < floor - 1))
      {
        ensure(currentApp).movePlayer(neighbour);
      }
      break;
    case ' ':
      if (ensure(currentApp).player.isSpring())
      {
        neighbour = ensure(currentApp).player.getLinkedSpring();
        if (!ensure(currentApp).doors.some(door => door.isEqual(neighbour)) ||
          ensure(currentApp).canUnlockDoor)
        {
          ensure(currentApp).movePlayer(neighbour);
        }
      }
      break;
    case 'Shift':
      viewer += 1;

      // fix a display bug when the maze isn't built and the player position
      // isn't determined yet
      if (viewer === floor)
      {
        viewer = 0;
      }
      levelText.innerHTML = 'LEVEL '.concat(level.toString())
        .concat(' | FLOOR ').concat((viewer + 1).toString()).concat('/')
        .concat(floor.toString()).concat(' | KEYS = ')
        .concat((ensure(currentApp).canUnlockDoor ? 1 : 0).toString())
        .concat('/1');
      break;
    case 'Control':
      viewer -= 1;

      // fix a display bug when the maze isn't built and the player position
      // isn't determined yet
      if (viewer < 0)
      {
        viewer = floor - 1;
      }
      levelText.innerHTML = 'LEVEL '.concat(level.toString())
        .concat(' | FLOOR ').concat((viewer + 1).toString()).concat('/')
        .concat(floor.toString()).concat(' | KEYS = ')
        .concat((ensure(currentApp).canUnlockDoor ? 1 : 0).toString())
        .concat('/1');
      break;
    case '+':
      if (vertexSize < 50)
      {
        vertexSize += 5;
        canvas.width = width * vertexSize;
        canvas.height = height * vertexSize;
      }
      break;
    case '-':
      if (vertexSize > 10)
      {
        vertexSize -= 5;
        canvas.width = width * vertexSize;
        canvas.height = height * vertexSize;
      }
      break;
    case 's':
    case 'S':
      if (ensure(currentApp).built)
      {
        if (!ensure(currentApp).solved)
        {
          // if the previous step of the solution is reached, update the
          // solution with a new goal
          let goal: Vertex;
          if (ensure(currentApp).doors.length === 0)
          {
            goal = ensure(currentApp).princess;
          } else {
            if (ensure(currentApp).canUnlockDoor)
            {
              goal = ensure(currentApp).doors[0];
            } else {
              goal = ensure(currentApp).key;
            }
          }
          let solution: Array<Vertex> =
            ensure(currentApp).searchSolution(goal);
          ensure(currentApp).solved = true;

          // update the maze
          for (let vertex of solution)
          {
            if (ensure(currentApp).maze
              .some(element => element.isEqual(vertex)))
            {
              ensure(ensure(currentApp).maze.find(
                element => element.isEqual(vertex))).isSolution = true;
            }
          }
        }
      }
      break;
    default:
      return;
  }
});
