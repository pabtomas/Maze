// ------------------------------------
// Useful variables & constants
// ------------------------------------

let canvas;
let levelText;
let context;

let level = 1;
let width = 6;
let height = 3;
let floor = 1;
let floorStep = 10;
let newFloorLevel = 10;

let currentApp = null;
let viewer = 0;
let nodeSize = 20;

const doorStep = 30;
const minFrameTime = 1;

const playerColor = 'red';
const princessColor = 'fuchsia';
const mazeColor = 'white';
const solutionColor = 'blueviolet';
const upStairsColor = 'gold';
const downStairsColor = 'dodgerblue';
const upAndDownStairsColor = 'limegreen';
const doorColor = 'black';
const keyColor = 'gold';

// ------------------------------------
// Node class
// ------------------------------------

class Node
{
  constructor(x, y, z)
  {
    this.x = x;
    this.y = y;
    this.z = z;
    this.parents = this;
    this.children = [];
    this.isSolution = false;
    this.weight = 0;
  }

  isEqual(node)
  {
    return (this.x === node.x) && (this.y === node.y) && (this.z === node.z);
  }

  getNeighbourhood()
  {
    if (this.isEqual(this.parents))
    {
      return this.children;
    } else {
      return this.children.concat([this.parents]);
    }
  }
}

// ------------------------------------
// Game class
// ------------------------------------

class Game
{
  constructor()
  {
    this.init();
  }

  init()
  {
    this.walls = [];
    this.doors = [];

    // Init the maze with a random starting node
    this.maze = [new Node(getRandomInt(width), getRandomInt(height),
      getRandomInt(floor))];
    this.maze[0].parents = this.maze[0];
    this.addNeighbours(this.maze[0]);
    this.princess = new Node(-1, -1, -1);
    this.player = new Node(-1, -1, -1);
    this.built = false;
    this.solved = false;
    this.key = new Node(-1, -1, -1);
    this.keysPos = [];
    this.canUnlockDoor = false;
  }

  /*
    Returns the number of neighbours of node. This function is used instead of
    node.getNeighbourhood().length because the node's neighbourhood is
    determined only after a node is added to the maze and maze's building needs
    to know the neighbourhood of a node before adding it.
  */
  neighboursInMaze(node)
  {
    let res = 0;
    if (this.maze.some(element =>
      element.isEqual(new Node(node.x - 1, node.y, node.z))))
    {
      res += 1;
    }
    if (this.maze.some(element =>
      element.isEqual(new Node(node.x + 1, node.y, node.z))))
    {
      res += 1;
    }
    if (this.maze.some(element =>
      element.isEqual(new Node(node.x, node.y - 1, node.z))))
    {
      res += 1;
    }
    if (this.maze.some(element =>
      element.isEqual(new Node(node.x, node.y + 1, node.z))))
    {
      res += 1;
    }
    if (this.maze.some(element =>
      element.isEqual(new Node(node.x, node.y, node.z - 1))))
    {
      res += 1;
    }
    if (this.maze.some(element =>
      element.isEqual(new Node(node.x, node.y, node.z + 1))))
    {
      res += 1;
    }
    return res;
  }

  addNeighbours(node)
  {
    let neighbour;
    if (node.x > 0)
    {
      neighbour = new Node(node.x - 1, node.y, node.z);
      if (!this.maze.some(element => element.isEqual(neighbour)))
      {
        this.walls.push(neighbour);
      }
    }
    if (node.x < width - 1)
    {
      neighbour = new Node(node.x + 1, node.y, node.z);
      if (!this.maze.some(element => element.isEqual(neighbour)))
      {
        this.walls.push(neighbour);
      }
    }
    if (node.y > 0)
    {
      neighbour = new Node(node.x, node.y - 1, node.z);
      if (!this.maze.some(element => element.isEqual(neighbour)))
      {
        this.walls.push(neighbour);
      }
    }
    if (node.y < height - 1)
    {
      neighbour = new Node(node.x, node.y + 1, node.z);
      if (!this.maze.some(element => element.isEqual(neighbour)))
      {
        this.walls.push(neighbour);
      }
    }
    if (node.z > 0)
    {
      neighbour = new Node(node.x, node.y, node.z - 1);
      if (!this.maze.some(element => element.isEqual(neighbour)))
      {
        this.walls.push(neighbour);
      }
    }
    if (node.z < floor - 1)
    {
      neighbour = new Node(node.x, node.y, node.z + 1);
      if (!this.maze.some(element => element.isEqual(neighbour)))
      {
        this.walls.push(neighbour);
      }
    }
  }

  determineParents(node)
  {
    if (this.maze.some(element =>
      element.isEqual(new Node(node.x - 1, node.y, node.z))))
    {
      node.parents = this.maze.find(element =>
        element.isEqual(new Node(node.x - 1, node.y, node.z)));
    } else if (this.maze.some(element =>
      element.isEqual(new Node(node.x + 1, node.y, node.z)))) {
        node.parents = this.maze.find(element =>
          element.isEqual(new Node(node.x + 1, node.y, node.z)));
    } else if (this.maze.some(element =>
      element.isEqual(new Node(node.x, node.y - 1, node.z)))) {
        node.parents = this.maze.find(element =>
          element.isEqual(new Node(node.x, node.y - 1, node.z)));
    } else if (this.maze.some(element =>
      element.isEqual(new Node(node.x, node.y + 1, node.z)))) {
        node.parents = this.maze.find(element =>
          element.isEqual(new Node(node.x, node.y + 1, node.z)));
    } else if (this.maze.some(element =>
      element.isEqual(new Node(node.x, node.y, node.z - 1)))) {
        node.parents = this.maze.find(element =>
          element.isEqual(new Node(node.x, node.y, node.z - 1)));
    } else if (this.maze.some(element =>
      element.isEqual(new Node(node.x, node.y, node.z + 1)))) {
        node.parents = this.maze.find(element =>
          element.isEqual(new Node(node.x, node.y, node.z + 1)));
    }
    node.parents.children.push(node);
  }

  /*
    Returns true if the graph between the last added door and the possibly
    next door is a path.
  */
  subtreeIsPath(door, solution)
  {
    let index = 0;
    if (this.doors.length > 0)
    {
      index = solution.indexOf(
        solution.find(node => node.isEqual(this.doors[this.doors.length - 1])));
    }
    let res = false;
    let currentNode = solution[index];
    let neighbourhood = currentNode.getNeighbourhood();
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
    Build progressively the maze after each call. It is a Randomized Prim
    algorithm.
  */
  update()
  {
    // maze is built if each node is visited
    if (this.walls.length > 0)
    {
      // randomized the Prim algorithm.
      let nodeIndex = getRandomInt(this.walls.length);

      // if a node is not already in the maze and if it has 1 neighbour, it
      // it added to the maze.
      if (!this.maze.some(element => element.isEqual(this.walls[nodeIndex]))
        && (this.neighboursInMaze(this.walls[nodeIndex]) === 1))
      {
        this.determineParents(this.walls[nodeIndex]);
        this.maze.push(this.walls[nodeIndex]);
        this.addNeighbours(this.walls[nodeIndex]);
      }
      this.walls.splice(nodeIndex, 1);

    // after the maze is built, player, princess, doors and key are added
    } else {
      if (!this.built)
      {
        this.built = true;

        // princess and player are placed at the extremities of the diameter
        // of the maze
        this.player = bfs(this.maze[0]);
        this.princess = bfs(this.player);

        // player doesn't have to come back to the start of the maze to search
        // a key
        this.keysPos.push(this.player);

        viewer = this.player.z;
        levelText.innerHTML = 'LEVEL '.concat(level.toString())
          .concat(' | FLOOR ').concat((viewer + 1).toString()).concat('/')
          .concat(floor.toString()).concat(' | KEYS = ')
          .concat((this.canUnlockDoor ? 1 : 0).toString()).concat('/1');

        let solution = this.searchSolution(this.princess);

        // a new door can be placed every 'doorStep' nodes of the solution
        for (let node of solution)
        {
          if ((Math.floor((node.weight + 1) / doorStep) * doorStep ===
            node.weight) && (node.weight != 0))
          {
            // if between the last added door and the possibly next door there
            // aren't new intersection, the possibly next door isn't added
            if (!this.subtreeIsPath(node, solution))
            {
              this.doors.push(node);
            }
          }
        }
        if (this.doors.length > 0)
        {
          this.key = this.generateKey(this.player);

          // player doesn't have to come back to a previous key position
          this.keysPos.push(this.key);
        }
      }
    }
  }

  /*
    Use a BFS to generate a key farthest from the root node
  */
  generateKey(root)
  {
    root.weight = 0;
    let queue = [root];
    let currentNode;
    let visited = [root];
    while (queue.length > 0)
    {
      currentNode = queue.splice(0, 1)[0];
      for (neighbour of currentNode.getNeighbourhood())
      {
        if (!visited.some(element => neighbour.isEqual(element)) &&
          !this.doors.some(door => neighbour.isEqual(door)))
        {
          visited.push(neighbour);
          queue.push(neighbour);
        }
      }
    }
    let solution = this.searchSolution(this.princess);

    // a key can't be on a solution node, a node with more than 1 neighbour
    // and a previous key position
    while ((visited[visited.length - 1].getNeighbourhood().length > 1) ||
      solution.some(element => element.isEqual(visited[visited.length - 1])) ||
      this.keysPos.some(key => key.isEqual(visited[visited.length - 1])))
    {
      visited.pop();
    }
    return visited[visited.length - 1];
  }

  drawMaze()
  {
    this.maze.forEach(function(node) {
      if (node.z === viewer)
      {
        let down = false;
        let up = false;
        let neighbourhood = node.getNeighbourhood();

        if (neighbourhood.some(element =>
          element.isEqual(new Node(node.x, node.y, node.z - 1))))
        {
          down = true;
        }

        if (neighbourhood.some(element =>
          element.isEqual(new Node(node.x, node.y, node.z + 1))))
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

        context.fillRect(node.x * nodeSize, node.y * nodeSize,
          nodeSize, nodeSize);

        // draw solution
        if (node.isSolution)
        {
          context.lineWidth = nodeSize / 5;
          context.strokeStyle = solutionColor;
          context.strokeRect(node.x * nodeSize + nodeSize / 10,
            node.y * nodeSize + nodeSize / 10,
            nodeSize - nodeSize / 5, nodeSize - nodeSize / 5);
        }
      }
    });
  }

  drawPrincess()
  {
    if (!this.princess.isEqual(new Node(-1, -1, -1)) &&
      (this.princess.z === viewer))
    {
      context.fillStyle = princessColor;
      context.fillRect(this.princess.x * nodeSize, this.princess.y * nodeSize,
        nodeSize, nodeSize);
    }
  }

  drawDoors()
  {
    this.doors.forEach(function(node) {
      if (node.z === viewer)
      {
        context.fillStyle = doorColor;
        context.beginPath();
        context.arc(node.x * nodeSize + nodeSize / 2,
          node.y * nodeSize + nodeSize / 3, nodeSize / 4, 0,
          2 * Math.PI, false);
        context.fill();
        context.beginPath();
        context.moveTo(node.x * nodeSize + nodeSize / 2,
          node.y * nodeSize + nodeSize / 6);
        context.lineTo(node.x * nodeSize + nodeSize / 4,
          node.y * nodeSize + nodeSize * 11 / 12);
        context.lineTo(node.x * nodeSize + nodeSize * 3 / 4,
          node.y * nodeSize + nodeSize * 11 / 12);
        context.closePath();
        context.fill();
      }
    });
  }

  drawKey()
  {
    if (!this.key.isEqual(new Node(-1, -1, -1)) && (this.key.z === viewer))
    {
      context.fillStyle = keyColor;
      context.beginPath();
      context.moveTo(this.key.x * nodeSize + nodeSize / 2,
        this.key.y * nodeSize + nodeSize / 6);
      context.lineTo(this.key.x * nodeSize + nodeSize / 6,
        this.key.y * nodeSize + nodeSize / 2);
      context.lineTo(this.key.x * nodeSize + nodeSize / 2,
        this.key.y * nodeSize + nodeSize * 5 / 6);
      context.lineTo(this.key.x * nodeSize + nodeSize * 5 / 6,
        this.key.y * nodeSize + nodeSize / 2);
      context.closePath();
      context.fill();
      context.lineWidth = nodeSize / 5;
      context.strokeStyle = 'black';
      context.stroke();
    }
  }

  drawPlayer()
  {
    if (!this.player.isEqual(new Node(-1, -1, -1)) &&
      (this.player.z === viewer))
    {
      context.fillStyle = playerColor;
      context.beginPath();
      context.arc(this.player.x * nodeSize + nodeSize / 2,
        this.player.y * nodeSize + nodeSize / 2, nodeSize / 2, 0,
        2 * Math.PI, false);
      context.fill();
    }
  }

  draw()
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
  movePlayer(neighbour)
  {
    let lastPlayerPos = this.player;
    this.player = this.maze.find(element => element.isEqual(neighbour));

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
          this.key = this.generateKey(this.player);
          this.keysPos.push(this.key);
        }

      // if player is on a key, player can unlock 1 door and the key is removed
      } else if (this.player.isEqual(this.key)) {
        this.canUnlockDoor = true;
        this.key = new Node(-1, -1, -1);
      }
    }

    // Did the player finish the maze ?
    this.checkMaze();

    // update solution automatically after a player move
    if (this.solved)
    {
      // if player follows the solution, delete node from the solution
      if (this.player.isSolution)
      {
        this.player.isSolution = false;

        // if the previous step of the solution is reached, update the solution
        // with a new goal
        if (!this.maze.some(node => node.isSolution))
        {
          let goal;
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
          let solution = this.searchSolution(goal);

          // update maze
          for (node of solution)
          {
            if (this.maze.some(element => element.isEqual(node)))
            {
              this.maze.find(element =>
                element.isEqual(node)).isSolution = true;
            }
          }
        }
      // if player doesn't follow the solution, add a new node to the solution
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
  searchSolution(goal)
  {
    let goalRoot = [];
    let playerRoot = [];

    // path between goal and root maze
    let tmp = goal;
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

    // filter same nodes between 2 paths
    let sameNodes = goalRoot.filter(node => playerRoot.some(element =>
      element.isEqual(node)));
    goalRoot = goalRoot.filter(node => !sameNodes.some(element =>
      element.isEqual(node)));
    playerRoot = playerRoot.filter(node => !sameNodes.some(element =>
      element.isEqual(node)));

    // add the last same node to link the 2 paths
    if (sameNodes.length > 0)
    {
      playerRoot.push(sameNodes[0]);
    }

    // ordered solution and filter player pos
    let solution = playerRoot.concat(goalRoot.reverse())
      .filter(node => !node.isEqual(this.player));
    return solution;
  }

  /*
    Check if player rescued the princess and generate a new level if it was.
  */
  checkMaze()
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
        floor += 1;
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

function getRandomInt(max)
{
  return Math.floor(Math.random() * max);
}

function bfs(root)
{
  root.weight = 0;
  let queue = [root];
  let currentNode;
  let visited = [root];
  while (queue.length > 0)
  {
    currentNode = queue.splice(0, 1)[0];
    for (neighbour of currentNode.getNeighbourhood())
    {
      if (!visited.some(element => neighbour.isEqual(element)))
      {
        neighbour.weight = currentNode.weight + 1;
        visited.push(neighbour);
        queue.push(neighbour);
      }
    }
  }
  return visited[visited.length - 1];
}

// ------------------------------------
// Animation handling
// ------------------------------------
// https://codepen.io/gamealchemist/pen/VeawyL
// https://codepen.io/gamealchemist/post/animationcanvas1
// https://stackoverflow.com/questions/37476437/how-to-render-html5-canvas-within-a-loop
// ------------------------------------

function animate(now)
{
  requestAnimationFrame(animate);

  let dt = now - animate._lastTime;
  if (dt < minFrameTime) return;
  animate._lastTime = now;

  context.fillStyle = 'black';
  context.fillRect(0, 0, canvas.width, canvas.height);
  if (currentApp)
  {
    currentApp.update();
    currentApp.draw();
  }
}

function launchAnimation() {
  if (launchAnimation.launched) return;
  launchAnimation.launched = true;
  requestAnimationFrame(_launchAnimation);

  function _launchAnimation(now) {
    animate._lastTime = now;
    requestAnimationFrame(animate);
  }
}

function launchApp(app) {
  currentApp = app;
  launchAnimation();
}

// ------------------------------------
// Setup
// ------------------------------------

function setup()
{
  levelText = document.createElement('H3');
  levelText.innerHTML = 'LEVEL '.concat(level.toString()).concat(' | FLOOR ')
    .concat((viewer + 1).toString()).concat('/').concat(floor.toString())
    .concat(' | KEYS = ').concat((this.canUnlockDoor ? 1 : 0).toString())
    .concat('/1');
  document.body.appendChild(levelText);

  canvas = document.createElement('canvas');
  canvas.width = width * nodeSize;
  canvas.height = height * nodeSize;
  canvas.style.border = '2px solid black';
  canvas.color = 'black';
  document.body.appendChild(canvas);

  context = canvas.getContext('2d', {
    alpha: false
  });
}

window.addEventListener('load', function(event) {
  setup();

  let app = new Game();
  launchApp(app);
}, false);

window.addEventListener('keydown', function(event) {
  let neighbour;
  switch (event.key)
  {
    case 'ArrowLeft':
      neighbour = new Node(currentApp.player.x - 1, currentApp.player.y,
        currentApp.player.z);

      // check if player doesn't move on a wall, a locked door or outside the
      // maze
      if (currentApp.maze.some(element => element.isEqual(neighbour))
        && (!currentApp.doors.some(door => door.isEqual(neighbour)) ||
        currentApp.canUnlockDoor) && (currentApp.player.x > 0))
      {
        currentApp.movePlayer(neighbour);
      }
      break;
    case 'ArrowUp':
      neighbour = new Node(currentApp.player.x, currentApp.player.y - 1,
        currentApp.player.z);

      // check if player doesn't move on a wall, a locked door or outside the
      // maze
      if (currentApp.maze.some(element => element.isEqual(neighbour))
        && (!currentApp.doors.some(door => door.isEqual(neighbour)) ||
        currentApp.canUnlockDoor) && (currentApp.player.y > 0))
      {
        currentApp.movePlayer(neighbour);
      }
      break;
    case 'PageDown':
      neighbour = new Node(currentApp.player.x, currentApp.player.y,
        currentApp.player.z - 1);

      // check if player doesn't move on a wall, a locked door or outside the
      // maze
      if (currentApp.maze.some(element => element.isEqual(neighbour))
        && (!currentApp.doors.some(door => door.isEqual(neighbour)) ||
        currentApp.canUnlockDoor) && (currentApp.player.z > 0))
      {
        currentApp.movePlayer(neighbour);
      }
      break;
    case 'ArrowRight':
      neighbour = new Node(currentApp.player.x + 1, currentApp.player.y,
        currentApp.player.z);

      // check if player doesn't move on a wall, a locked door or outside the
      // maze
      if (currentApp.maze.some(element => element.isEqual(neighbour))
        && (!currentApp.doors.some(door => door.isEqual(neighbour)) ||
        currentApp.canUnlockDoor) && (currentApp.player.x < width - 1))
      {
        currentApp.movePlayer(neighbour);
      }
      break;
    case 'ArrowDown':
      neighbour = new Node(currentApp.player.x, currentApp.player.y + 1,
        currentApp.player.z);

      // check if player doesn't move on a wall, a locked door or outside the
      // maze
      if (currentApp.maze.some(element => element.isEqual(neighbour))
        && (!currentApp.doors.some(door => door.isEqual(neighbour)) ||
        currentApp.canUnlockDoor) && (currentApp.player.y < height - 1))
      {
        currentApp.movePlayer(neighbour);
      }
      break;
    case 'PageUp':
      neighbour = new Node(currentApp.player.x, currentApp.player.y,
        currentApp.player.z + 1);

      // check if player doesn't move on a wall, a locked door or outside the
      // maze
      if (currentApp.maze.some(element => element.isEqual(neighbour))
        && (!currentApp.doors.some(door => door.isEqual(neighbour)) ||
        currentApp.canUnlockDoor) && (currentApp.player.z < floor - 1))
      {
        currentApp.movePlayer(neighbour);
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
        .concat((currentApp.canUnlockDoor ? 1 : 0).toString()).concat('/1');
      break;
    case ' ':
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
        .concat((currentApp.canUnlockDoor ? 1 : 0).toString()).concat('/1');
      break;
    case '+':
      if (nodeSize < 50)
      {
        nodeSize += 5;
        canvas.width = width * nodeSize;
        canvas.height = height * nodeSize;
      }
      break;
    case '-':
      if (nodeSize > 10)
      {
        nodeSize -= 5;
        canvas.width = width * nodeSize;
        canvas.height = height * nodeSize;
      }
      break;
    case 's':
    case 'S':
      if (currentApp.built)
      {
        if (!currentApp.solved)
        {
          // if the previous step of the solution is reached, update the
          // solution with a new goal
          let goal;
          if (currentApp.doors.length === 0)
          {
            goal = currentApp.princess;
          } else {
            if (currentApp.canUnlockDoor)
            {
              goal = currentApp.doors[0];
            } else {
              goal = currentApp.key;
            }
          }
          let solution = currentApp.searchSolution(goal);
          currentApp.solved = true;

          // update the maze
          for (node of solution)
          {
            if (currentApp.maze.some(element => element.isEqual(node)))
            {
              currentApp.maze.find(element =>
                element.isEqual(node)).isSolution = true;
            }
          }
        }
      }
      break;
    default:
      return;
  }
});
