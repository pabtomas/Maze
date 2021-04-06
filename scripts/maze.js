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

const minFrameTime = 1;
const squareSize = 20;

// ------------------------------------
// Cell class
// ------------------------------------

class Cell
{
  constructor(x, y, z)
  {
    this.x = x;
    this.y = y;
    this.z = z;
    this.children = [];
    this.isSolution = false;
  }

  isEqual(cell)
  {
    return (this.x === cell.x) && (this.y === cell.y) && (this.z === cell.z);
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
    this.maze = [new Cell(getRandomInt(width), getRandomInt(height),
      getRandomInt(floor))];
    this.maze[0].parents = this.maze[0];
    this.addNeighbours(this.maze[0]);
    this.goal = new Cell(-1, -1, -1);
    this.player = new Cell(-1, -1, -1);
    this.built = false;
    this.solved = false;
  }

  neighboursInMaze(cell)
  {
    let res = 0;
    if (this.maze.some(element =>
      element.isEqual(new Cell(cell.x - 1, cell.y, cell.z))))
    {
      res = res + 1;
    }
    if (this.maze.some(element =>
      element.isEqual(new Cell(cell.x + 1, cell.y, cell.z))))
    {
      res = res + 1;
    }
    if (this.maze.some(element =>
      element.isEqual(new Cell(cell.x, cell.y - 1, cell.z))))
    {
      res = res + 1;
    }
    if (this.maze.some(element =>
      element.isEqual(new Cell(cell.x, cell.y + 1, cell.z))))
    {
      res = res + 1;
    }
    if (this.maze.some(element =>
      element.isEqual(new Cell(cell.x, cell.y, cell.z - 1))))
    {
      res = res + 1;
    }
    if (this.maze.some(element =>
      element.isEqual(new Cell(cell.x, cell.y, cell.z + 1))))
    {
      res = res + 1;
    }
    return res;
  }

  addNeighbours(cell)
  {
    let neighbour;
    if (cell.x > 0)
    {
      neighbour = new Cell(cell.x - 1, cell.y, cell.z);
      if (!this.maze.some(element => element.isEqual(neighbour)))
      {
        this.walls.push(neighbour);
      }
    }
    if (cell.x < width - 1)
    {
      neighbour = new Cell(cell.x + 1, cell.y, cell.z);
      if (!this.maze.some(element => element.isEqual(neighbour)))
      {
        this.walls.push(neighbour);
      }
    }
    if (cell.y > 0)
    {
      neighbour = new Cell(cell.x, cell.y - 1, cell.z);
      if (!this.maze.some(element => element.isEqual(neighbour)))
      {
        this.walls.push(neighbour);
      }
    }
    if (cell.y < height - 1)
    {
      neighbour = new Cell(cell.x, cell.y + 1, cell.z);
      if (!this.maze.some(element => element.isEqual(neighbour)))
      {
        this.walls.push(neighbour);
      }
    }
    if (cell.z > 0)
    {
      neighbour = new Cell(cell.x, cell.y, cell.z - 1);
      if (!this.maze.some(element => element.isEqual(neighbour)))
      {
        this.walls.push(neighbour);
      }
    }
    if (cell.z < floor - 1)
    {
      neighbour = new Cell(cell.x, cell.y, cell.z + 1);
      if (!this.maze.some(element => element.isEqual(neighbour)))
      {
        this.walls.push(neighbour);
      }
    }
  }

  searchParents(cell)
  {
    if (this.maze.some(element =>
      element.isEqual(new Cell(cell.x - 1, cell.y, cell.z))))
    {
      cell.parents = this.maze.find(element =>
        element.isEqual(new Cell(cell.x - 1, cell.y, cell.z)));
    } else if (this.maze.some(element =>
      element.isEqual(new Cell(cell.x + 1, cell.y, cell.z)))) {
        cell.parents = this.maze.find(element =>
          element.isEqual(new Cell(cell.x + 1, cell.y, cell.z)));
    } else if (this.maze.some(element =>
      element.isEqual(new Cell(cell.x, cell.y - 1, cell.z)))) {
        cell.parents = this.maze.find(element =>
          element.isEqual(new Cell(cell.x, cell.y - 1, cell.z)));
    } else if (this.maze.some(element =>
      element.isEqual(new Cell(cell.x, cell.y + 1, cell.z)))) {
        cell.parents = this.maze.find(element =>
          element.isEqual(new Cell(cell.x, cell.y + 1, cell.z)));
    } else if (this.maze.some(element =>
      element.isEqual(new Cell(cell.x, cell.y, cell.z - 1)))) {
        cell.parents = this.maze.find(element =>
          element.isEqual(new Cell(cell.x, cell.y, cell.z - 1)));
    } else if (this.maze.some(element =>
      element.isEqual(new Cell(cell.x, cell.y, cell.z + 1)))) {
        cell.parents = this.maze.find(element =>
          element.isEqual(new Cell(cell.x, cell.y, cell.z + 1)));
    }
    cell.parents.children.push(cell);
  }

  update()
  {
    if (this.walls.length > 0)
    {
      let cellIndex = getRandomInt(this.walls.length);
      if (!this.maze.some(element => element.isEqual(this.walls[cellIndex]))
        && (this.neighboursInMaze(this.walls[cellIndex]) < 2))
      {
        this.searchParents(this.walls[cellIndex]);
        this.maze.push(this.walls[cellIndex]);
        this.addNeighbours(this.walls[cellIndex]);
      }
      this.walls.splice(cellIndex, 1);
    } else {
      if (!this.built)
      {
        this.built = true;
        this.player = bfs(this.maze[0]);
        viewer = this.player.z;
        levelText.innerHTML = "LEVEL ".concat(level.toString())
          .concat(" | FLOOR ").concat((viewer + 1).toString()).concat('/')
          .concat(floor.toString() );
        this.goal = bfs(this.player);
      }
    }
  }

  draw()
  {
    this.maze.forEach(function(cell) {
      if (cell.z === viewer)
      {
        let down = false;
        let up = false;
        let neighbourhood;
        if (cell.isEqual(cell.parents))
        {
          neighbourhood = cell.children;
        } else {
          neighbourhood = cell.children.concat([cell.parents]);
        }
        if (neighbourhood.some(element =>
          element.isEqual(new Cell(cell.x, cell.y, cell.z - 1))))
        {
          down = true;
        }
        if (neighbourhood.some(element =>
          element.isEqual(new Cell(cell.x, cell.y, cell.z + 1))))
        {
          up = true;
        }
        if (down && up)
        {
          context.fillStyle = "limegreen";
        } else if (down) {
          context.fillStyle = "dodgerblue";
        } else if (up) {
          context.fillStyle = "gold";
        } else {
          context.fillStyle = "white";
        }
        context.fillRect(cell.x * squareSize, cell.y * squareSize,
          squareSize, squareSize);
        if (cell.isSolution)
        {
          context.lineWidth = squareSize / 5;
          context.strokeStyle = "blueviolet";
          context.strokeRect(cell.x * squareSize + squareSize / 10,
            cell.y * squareSize + squareSize / 10,
            squareSize - squareSize / 5, squareSize - squareSize / 5);
        }
      }
    });
    if (!this.goal.isEqual(new Cell(-1, -1, -1)) && (this.goal.z === viewer))
    {
      context.fillStyle = "fuchsia";
      context.fillRect(this.goal.x * squareSize, this.goal.y * squareSize,
        squareSize, squareSize);
    }
    if (!this.player.isEqual(new Cell(-1, -1, -1)) && (this.player.z === viewer))
    {
      context.fillStyle = "red";
      context.beginPath();
      context.arc(this.player.x * squareSize + squareSize / 2,
        this.player.y * squareSize + squareSize / 2, squareSize / 2, 0,
        2 * Math.PI, false);
      context.fill();
    }
  }

  movePlayer(neighbour)
  {
    let newPlayerPos = this.maze.find(element => element.isEqual(neighbour));
    if (this.solved)
    {
      if (newPlayerPos.isSolution)
      {
        this.player.isSolution = false;
      } else {
        newPlayerPos.isSolution = true;
      }
    }
    this.player = newPlayerPos;
    this.checkMaze();
    viewer = this.player.z;
    if (viewer < 0)
    {
      viewer = 0;
    }
    levelText.innerHTML = "LEVEL ".concat(level.toString()).concat(" | FLOOR ")
      .concat((viewer + 1).toString()).concat('/').concat(floor.toString() );
  }

  checkMaze()
  {
    if (this.player.isEqual(this.goal))
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
  let queue = [root];
  let currentNode;
  let neighbourhood;
  let visited = [root];
  while (queue.length > 0)
  {
    currentNode = queue.splice(0, 1)[0];
    if (currentNode.isEqual(currentNode.parents))
    {
      neighbourhood = currentNode.children;
    } else {
      neighbourhood = currentNode.children.concat([currentNode.parents]);
    }
    for (neighbour of neighbourhood)
    {
      if (!visited.some(element => neighbour.isEqual(element)))
      {
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

  context.fillStyle = "black";
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
  levelText.innerHTML = "LEVEL ".concat(level.toString()).concat(" | FLOOR ")
    .concat((viewer + 1).toString()).concat('/').concat(floor.toString() );
  document.body.appendChild(levelText);
  canvas = document.createElement('canvas');
  canvas.width = width * squareSize;
  canvas.height = height * squareSize;
  canvas.style.border = "2px solid black";
  canvas.color = "black";
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
      neighbour = new Cell(currentApp.player.x - 1, currentApp.player.y,
        currentApp.player.z);
      if (currentApp.maze.some(element => element.isEqual(neighbour))
        && (currentApp.player.x > 0))
      {
        currentApp.movePlayer(neighbour);
      }
      break;
    case 'ArrowUp':
      neighbour = new Cell(currentApp.player.x, currentApp.player.y - 1,
        currentApp.player.z);
      if (currentApp.maze.some(element => element.isEqual(neighbour))
        && (currentApp.player.y > 0))
      {
        currentApp.movePlayer(neighbour);
      }
      break;
    case 'PageDown':
      neighbour = new Cell(currentApp.player.x, currentApp.player.y,
        currentApp.player.z - 1);
      if (currentApp.maze.some(element => element.isEqual(neighbour))
        && (currentApp.player.z > 0))
      {
        currentApp.movePlayer(neighbour);
      }
      break;
    case 'ArrowRight':
      neighbour = new Cell(currentApp.player.x + 1, currentApp.player.y,
        currentApp.player.z);
      if (currentApp.maze.some(element => element.isEqual(neighbour))
        && (currentApp.player.x < width - 1))
      {
        currentApp.movePlayer(neighbour);
      }
      break;
    case 'ArrowDown':
      neighbour = new Cell(currentApp.player.x, currentApp.player.y + 1,
        currentApp.player.z);
      if (currentApp.maze.some(element => element.isEqual(neighbour))
        && (currentApp.player.y < height - 1))
      {
        currentApp.movePlayer(neighbour);
      }
      break;
    case 'PageUp':
      neighbour = new Cell(currentApp.player.x, currentApp.player.y,
        currentApp.player.z + 1);
      if (currentApp.maze.some(element => element.isEqual(neighbour))
        && (currentApp.player.z < floor - 1))
      {
        currentApp.movePlayer(neighbour);
      }
      break;
    case 'Shift':
      viewer += 1;
      if (viewer === floor)
      {
        viewer = 0;
      }
      levelText.innerHTML = "LEVEL ".concat(level.toString())
        .concat(" | FLOOR ").concat((viewer + 1).toString()).concat('/')
        .concat(floor.toString() );
      break;
    case 's':
    case 'S':
      if (currentApp.walls.length === 0)
      {
        if (!currentApp.solved)
        {
          currentApp.solved = true;
          let goalRoot = [];
          let playerRoot = [];
          let tmp = currentApp.goal;
          while (!tmp.isEqual(tmp.parents))
          {
            tmp = tmp.parents;
            goalRoot.push(tmp);
          }
          tmp = _.cloneDeep(currentApp.player);
          playerRoot.push(tmp);
          while (!tmp.isEqual(tmp.parents))
          {
            tmp = tmp.parents;
            playerRoot.push(tmp);
          }
          let sameRoot = goalRoot.filter(cell => playerRoot.some(element =>
            element.isEqual(cell)));
          goalRoot = goalRoot.filter(cell => !sameRoot.some(element =>
            element.isEqual(cell)));
          playerRoot = playerRoot.filter(cell => !sameRoot.some(element =>
            element.isEqual(cell)));
          let solution = goalRoot.concat(playerRoot);
          if (sameRoot.length > 0)
          {
            solution.push(sameRoot[0]);
          }
          for (cell of solution)
          {
            if (currentApp.maze.some(element => element.isEqual(cell)))
            {
              currentApp.maze.find(element =>
                element.isEqual(cell)).isSolution = true;
            }
          }
        }
      }
      break;
    default:
      return;
  }
});
