// ------------------------------------
// Useful variables & constants
// ------------------------------------

let canvas;
let levelText;
let context;

let level = 1;
let width = 6;
let height = 3;
let currentApp = null;

const minFrameTime = 12;
const squareSize = 10;

// ------------------------------------
// Cell class
// ------------------------------------

class Cell
{
  constructor(x, y)
  {
    this.x = x;
    this.y = y;
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
    this.maze = [];
    this.walls = [];
    this.player;
    this.solution = [];

    let randomSide = getRandomInt(4);
    if (randomSide === 0)
    {
      this.player = new Cell(getRandomInt(width), 0);
    } else if (randomSide === 1) {
      this.player = new Cell(0, getRandomInt(height));
    } else if (randomSide === 2) {
      this.player = new Cell(getRandomInt(width), height - 1);
    } else {
      this.player = new Cell(width - 1, getRandomInt(height));
    }
    this.player.parents = this.player;

    this.maze.push(_.cloneDeep(this.player));
    this.goal = _.cloneDeep(this.player);
    this.addNeighbours(this.player);
  }

  neighboursInMaze(cell)
  {
    let res = 0;
    if (this.maze.some(element =>
      (element.x === cell.x - 1) && (element.y === cell.y)))
    {
      res = res + 1;
    }
    if (this.maze.some(element =>
      (element.x === cell.x + 1) && (element.y === cell.y)))
    {
      res = res + 1;
    }
    if (this.maze.some(element =>
      (element.x === cell.x) && (element.y === cell.y - 1)))
    {
      res = res + 1;
    }
    if (this.maze.some(element =>
      (element.x === cell.x) && (element.y === cell.y + 1)))
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
      neighbour = new Cell(cell.x - 1, cell.y);
      if (!this.maze.some(element =>
        (element.x === neighbour.x) && (element.y === neighbour.y)))
      {
        this.walls.push(neighbour);
      }
    }
    if (cell.x < width - 1)
    {
      neighbour = new Cell(cell.x + 1, cell.y);
      if (!this.maze.some(element =>
        (element.x === neighbour.x) && (element.y === neighbour.y)))
      {
        this.walls.push(neighbour);
      }
    }
    if (cell.y > 0)
    {
      neighbour = new Cell(cell.x, cell.y - 1);
      if (!this.maze.some(element =>
        (element.x === neighbour.x) && (element.y === neighbour.y)))
      {
        this.walls.push(neighbour);
      }
    }
    if (cell.y < height - 1)
    {
      neighbour = new Cell(cell.x, cell.y + 1);
      if (!this.maze.some(element =>
        (element.x === neighbour.x) && (element.y === neighbour.y)))
      {
        this.walls.push(neighbour);
      }
    }
  }

  searchParents(cell)
  {
    if (this.maze.some(element =>
      (element.x === cell.x - 1) && (element.y === cell.y)))
    {
      cell.parents = this.maze.find(element =>
        (element.x === cell.x - 1) && (element.y === cell.y));
    } else if (this.maze.some(element =>
      (element.x === cell.x + 1) && (element.y === cell.y))) {
        cell.parents = this.maze.find(element =>
          (element.x === cell.x + 1) && (element.y === cell.y));
    } else if (this.maze.some(element =>
      (element.x === cell.x) && (element.y === cell.y - 1))) {
        cell.parents = this.maze.find(element =>
          (element.x === cell.x) && (element.y === cell.y - 1));
    } else if (this.maze.some(element =>
      (element.x === cell.x) && (element.y === cell.y + 1))) {
        cell.parents = this.maze.find(element =>
          (element.x === cell.x) && (element.y === cell.y + 1));
    }
  }

  update()
  {
    if (this.walls.length > 0)
    {
      let cell_index = getRandomInt(this.walls.length);
      if (!this.maze.some(element =>
        (element.x === this.walls[cell_index].x) &&
        (element.y === this.walls[cell_index].y)) &&
        (this.neighboursInMaze(this.walls[cell_index]) < 2))
      {
        this.searchParents(this.walls[cell_index]);
        this.maze.push(this.walls[cell_index]);
        this.goal = this.walls[cell_index];
        this.addNeighbours(this.walls[cell_index]);
      }
      this.walls.splice(cell_index, 1);
    }
  }

  draw()
  {
    context.fillStyle = "white";
    this.maze.forEach(function(cell) {
      context.fillRect(cell.x * squareSize, cell.y * squareSize,
        squareSize, squareSize);
    });
    context.fillStyle = "pink";
    this.solution.forEach(function(cell) {
      context.fillRect(cell.x * squareSize, cell.y * squareSize,
        squareSize, squareSize);
    });
    context.fillStyle = "green";
    context.fillRect(this.goal.x * squareSize, this.goal.y * squareSize,
      squareSize, squareSize);
    context.fillStyle = "red";
    context.fillRect(this.player.x * squareSize, this.player.y * squareSize,
      squareSize, squareSize);
  }

  checkMaze()
  {
    if ((this.player.x === this.goal.x) && (this.player.y === this.goal.y))
    {
      canvas.remove();
      levelText.remove();
      level += 1;
      width += 2;
      height += 1;
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
  levelText.innerHTML = "LEVEL ".concat(level.toString());
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
  switch (event.key)
  {
    case 'ArrowLeft':
      if ((currentApp.maze.some(element =>
        (element.x === currentApp.player.x - 1) &&
        (element.y === currentApp.player.y))) && (currentApp.player.x > 0))
      {
        currentApp.player = currentApp.maze.find(element =>
          (element.x === currentApp.player.x - 1) &&
          (element.y === currentApp.player.y));
        currentApp.checkMaze();
      }
      break;
    case 'ArrowUp':
      if ((currentApp.maze.some(element =>
        (element.x === currentApp.player.x) &&
        (element.y === currentApp.player.y - 1))) && (currentApp.player.y > 0))
      {
        currentApp.player = currentApp.maze.find(element =>
          (element.x === currentApp.player.x) &&
          (element.y === currentApp.player.y - 1));
        currentApp.checkMaze();
      }
      break;
    case 'ArrowRight':
      if ((currentApp.maze.some(element =>
        (element.x === currentApp.player.x + 1) &&
        (element.y === currentApp.player.y))) &&
        (currentApp.player.x < width - 1))
      {
        currentApp.player = currentApp.maze.find(element =>
          (element.x === currentApp.player.x + 1) &&
          (element.y === currentApp.player.y));
        currentApp.checkMaze();
      }
      break;
    case 'ArrowDown':
      if ((currentApp.maze.some(element =>
        (element.x === currentApp.player.x) &&
        (element.y === currentApp.player.y + 1))) &&
        (currentApp.player.y < height - 1))
      {
        currentApp.player = currentApp.maze.find(element =>
          (element.x === currentApp.player.x) &&
          (element.y === currentApp.player.y + 1));
        currentApp.checkMaze();
      }
      break;
    case 's':
    case 'S':
      if (currentApp.walls.length === 0)
      {
        currentApp.solution = [];
        let goalRoot = [];
        let playerRoot = [];
        let tmp = currentApp.goal;
        while (!_.isEqual(tmp, tmp.parents))
        {
          tmp = tmp.parents;
          goalRoot.push(tmp);
        }
        tmp = _.cloneDeep(currentApp.player);
        playerRoot.push(tmp);
        while (!_.isEqual(tmp, tmp.parents))
        {
          tmp = tmp.parents;
          playerRoot.push(tmp);
        }
        let sameRoot = goalRoot.filter(cell => playerRoot.some(element =>
          _.isEqual(element, cell)));
        goalRoot = goalRoot.filter(cell => !sameRoot.some(element =>
          _.isEqual(element, cell)));
        playerRoot = playerRoot.filter(cell => !sameRoot.some(element =>
          _.isEqual(element, cell)));
        currentApp.solution = goalRoot.concat(playerRoot);
        if (sameRoot.length > 0)
        {
          currentApp.solution.push(sameRoot[0]);
        }
      }
      break;
    default:
      return;
  }
});
