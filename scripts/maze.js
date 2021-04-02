let canvas;
let levelText;
let context;
let level = 1;
let width = 6;
let height = 3;
let appTime = 0;
let currentApp = null;

let minFrameTime = 12;

window.addEventListener('load', function(event) {
  setup(1);

  let app = new Game();
  launchApplication(app);
}, false);

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
    this.goal = [];

    if (getRandomInt(2) === 0)
    {
      this.player = [getRandomInt(width), 0];
    } else {
      this.player = [0, getRandomInt(height)];
    }
    this.maze.push(this.player.slice());
    this.goal = this.player.slice();
    this.addNeighbours(this.player);
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
      }
      this.walls.splice(cell_index, 1);
    }
  }

  draw()
  {
    context.fillStyle = "white";
    this.maze.forEach(function(element) {
      context.fillRect(element[0] * 10, element[1] * 10, 10, 10);
    });
    context.fillStyle = "green";
    context.fillRect(this.goal[0] * 10, this.goal[1] * 10, 10, 10);
    context.fillStyle = "red";
    context.fillRect(this.player[0] * 10, this.player[1] * 10, 10, 10);
  }

  erasePlayer()
  {
    context.fillStyle = "white";
    context.fillRect(this.player[0] * 10, this.player[1] * 10, 10, 10);
  }

  displayPlayer()
  {
    context.fillStyle = "red";
    context.fillRect(this.player[0] * 10, this.player[1] * 10, 10, 10);
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
  for(let i=0; i<this.length; i++)
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

function animate(now)
{
  requestAnimationFrame(animate);

  let dt = now - animate._lastTime;
  if (dt < minFrameTime) return;
  animate._lastTime = now;

  context.clearRect(0, 0, canvas.width, canvas.height);
  if (currentApp)
  {
    currentApp.update();
    currentApp.draw();
  }
  appTime += 1;
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

function launchApplication(application) {
  currentApp = application;
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
  canvas.width = width * 10;
  canvas.height = height * 10;
  canvas.style.border = "1px solid black";
  canvas.color = "black";
  document.body.appendChild(canvas);
  context = canvas.getContext('2d', {
    alpha: false
  });
}

window.addEventListener('keydown', function(event) {
  if (event.keyCode === 37)
  {
    if ((currentApp.maze.containsArray([currentApp.player[0] - 1,
      currentApp.player[1]]) === true) && (currentApp.player[0] > 0))
    {
      currentApp.erasePlayer();
      currentApp.player[0] = currentApp.player[0] - 1;
      currentApp.displayPlayer();
    }
  } else if (event.keyCode === 38) {
    if ((currentApp.maze.containsArray([currentApp.player[0],
      currentApp.player[1] - 1]) === true) && (currentApp.player[1] > 0))
    {
      currentApp.erasePlayer();
      currentApp.player[1] = currentApp.player[1] - 1;
      currentApp.displayPlayer();
    }
  } else if (event.keyCode === 39) {
    if ((currentApp.maze.containsArray([currentApp.player[0] + 1,
      currentApp.player[1]]) === true) && (currentApp.player[0] < width - 1))
    {
      currentApp.erasePlayer();
      currentApp.player[0] = currentApp.player[0] + 1;
      currentApp.displayPlayer();
    }
  } else if(event.keyCode === 40) {
    if ((currentApp.maze.containsArray([currentApp.player[0],
      currentApp.player[1] + 1]) === true) && (currentApp.player[1] < height - 1))
    {
      currentApp.erasePlayer();
      currentApp.player[1] = currentApp.player[1] + 1;
      currentApp.displayPlayer();
    }
  }
});
