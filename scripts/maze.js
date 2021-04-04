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
    this.player = [];
    this.solution = [];
    this.tree = {};

    let random_side = getRandomInt(4);
    if (random_side === 0)
    {
      this.player = [getRandomInt(width), 0];
    } else if (random_side === 1) {
      this.player = [0, getRandomInt(height)];
    } else if (random_side === 1) {
      this.player = [getRandomInt(width), height - 1];
    } else {
      this.player = [width - 1, getRandomInt(height)];
    }

    this.maze.push(this.player.slice());
    this.goal = this.player.slice();
    this.addNeighbours(this.player);
    this.tree[this.player.slice()] = this.player.slice();
  }

  neighboursInMaze(cell)
  {
    let res = 0;
    if (this.maze.containsArray([cell[0] - 1, cell[1]]) === true)
    {
      res = res + 1;
    }
    if (this.maze.containsArray([cell[0] + 1, cell[1]]) === true)
    {
      res = res + 1;
    }
    if (this.maze.containsArray([cell[0], cell[1] - 1]) === true)
    {
      res = res + 1;
    }
    if (this.maze.containsArray([cell[0], cell[1] + 1]) === true)
    {
      res = res + 1;
    }
    return res;
  }

  addNeighbours(cell)
  {
    if (cell[0] > 0)
    {
      if (this.maze.containsArray([cell[0] - 1, cell[1]]) === false)
      {
        this.walls.push([cell[0] - 1, cell[1]]);
      }
    }
    if (cell[0] < width - 1)
    {
      if (this.maze.containsArray([cell[0] + 1, cell[1]]) === false)
      {
        this.walls.push([cell[0] + 1, cell[1]]);
      }
    }
    if (cell[1] > 0)
    {
      if (this.maze.containsArray([cell[0], cell[1] - 1]) === false)
      {
        this.walls.push([cell[0], cell[1] - 1]);
      }
    }
    if (cell[1] < height - 1)
    {
      if (this.maze.containsArray([cell[0], cell[1] + 1]) === false)
      {
        this.walls.push([cell[0], cell[1] + 1]);
      }
    }
  }

  searchParent(cell)
  {
    if (this.maze.containsArray([cell[0] - 1, cell[1]]) === true)
    {
      return [cell[0] - 1, cell[1]];
    } else if (this.maze.containsArray([cell[0] + 1, cell[1]]) === true) {
      return [cell[0] + 1, cell[1]];
    } else if (this.maze.containsArray([cell[0], cell[1] - 1]) === true) {
      return [cell[0], cell[1] - 1];
    } else if (this.maze.containsArray([cell[0], cell[1] + 1]) === true) {
      return [cell[0], cell[1] + 1];
    }
  }

  update()
  {
    if (this.walls.length > 0)
    {
      let cell_index = getRandomInt(this.walls.length);
      if ((this.maze.containsArray(this.walls[cell_index]) === false) &&
        (this.neighboursInMaze(this.walls[cell_index]) < 2))
      {
        this.maze.push(this.walls[cell_index]);
        this.goal = this.walls[cell_index];
        this.addNeighbours(this.walls[cell_index]);
        this.tree[this.walls[cell_index]] =
          this.searchParent(this.walls[cell_index]);
      }
      this.walls.splice(cell_index, 1);
    }
  }

  draw()
  {
    context.fillStyle = "white";
    this.maze.forEach(function(cell) {
      context.fillRect(cell[0] * squareSize, cell[1] * squareSize,
        squareSize, squareSize);
    });
    context.fillStyle = "pink";
    this.solution.forEach(function(cell) {
      context.fillRect(cell[0] * squareSize, cell[1] * squareSize,
        squareSize, squareSize);
    });
    context.fillStyle = "green";
    context.fillRect(this.goal[0] * squareSize, this.goal[1] * squareSize,
      squareSize, squareSize);
    context.fillStyle = "red";
    context.fillRect(this.player[0] * squareSize, this.player[1] * squareSize,
      squareSize, squareSize);
  }

  checkMaze()
  {
    if ((this.player[0] === this.goal[0]) && (this.player[1] === this.goal[1]))
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

/* https://stackoverflow.com/questions/6315180/javascript-search-array-of-arrays/6315203#6315203 */
Array.prototype.containsArray = function(val)
{
  let hash = {};
  for(let i = 0; i < this.length; i++)
  {
    hash[this[i]] = i;
  }
  return hash.hasOwnProperty(val);
}

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
      if ((currentApp.maze.containsArray([currentApp.player[0] - 1,
        currentApp.player[1]]) === true) && (currentApp.player[0] > 0))
      {
        currentApp.player[0] = currentApp.player[0] - 1;
        currentApp.checkMaze();
      }
      break;
    case 'ArrowUp':
      if ((currentApp.maze.containsArray([currentApp.player[0],
        currentApp.player[1] - 1]) === true) && (currentApp.player[1] > 0))
      {
        currentApp.player[1] = currentApp.player[1] - 1;
        currentApp.checkMaze();
      }
      break;
    case 'ArrowRight':
      if ((currentApp.maze.containsArray([currentApp.player[0] + 1,
        currentApp.player[1]]) === true) && (currentApp.player[0] < width - 1))
      {
        currentApp.player[0] = currentApp.player[0] + 1;
        currentApp.checkMaze();
      }
      break;
    case 'ArrowDown':
      if ((currentApp.maze.containsArray([currentApp.player[0],
        currentApp.player[1] + 1]) === true) &&
        (currentApp.player[1] < height - 1))
      {
        currentApp.player[1] = currentApp.player[1] + 1;
        currentApp.checkMaze();
      }
      break;
    case 's':
    case 'S':
      if (currentApp.walls.length == 0)
      {
        currentApp.solution = [];
        let goalRoot = [];
        let playerRoot = [];
        let tmp = currentApp.goal;
        while ((currentApp.tree[tmp][0] !== tmp[0]) ||
          (currentApp.tree[tmp][1] !== tmp[1]))
        {
          tmp = currentApp.tree[tmp];
          goalRoot.push(tmp);
        }
        tmp = currentApp.player.slice();
        playerRoot.push(tmp);
        while ((currentApp.tree[tmp][0] !== tmp[0]) ||
          (currentApp.tree[tmp][1] !== tmp[1]))
        {
          tmp = currentApp.tree[tmp];
          playerRoot.push(tmp);
        }
        let sameRoot = goalRoot.filter(cell =>
          playerRoot.containsArray(cell) === true);
        goalRoot = goalRoot.filter(cell =>
          sameRoot.containsArray(cell) === false);
        playerRoot = playerRoot.filter(cell =>
          sameRoot.containsArray(cell) === false);
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
