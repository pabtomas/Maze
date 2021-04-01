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

function addNeighbours(cell, walls, maze, max_width, max_height)
{
  if (cell[0] > 0)
  {
    if (maze.containsArray([cell[0] - 1, cell[1]]) === false)
    {
      walls.push([cell[0] - 1, cell[1]]);
    }
  }
  if (cell[0] < max_width - 1)
  {
    if (maze.containsArray([cell[0] + 1, cell[1]]) === false)
    {
      walls.push([cell[0] + 1, cell[1]]);
    }
  }
  if (cell[1] > 0)
  {
    if (maze.containsArray([cell[0], cell[1] - 1]) === false)
    {
      walls.push([cell[0], cell[1] - 1]);
    }
  }
  if (cell[1] < max_height - 1)
  {
    if (maze.containsArray([cell[0], cell[1] + 1]) === false)
    {
      walls.push([cell[0], cell[1] + 1]);
    }
  }
}

function neighboursInMaze(cell, list_of_cells)
{
  let res = 0;
  if (list_of_cells.containsArray([cell[0] - 1, cell[1]]) === true)
  {
    res = res + 1;
  }
  if (list_of_cells.containsArray([cell[0] + 1, cell[1]]) === true)
  {
    res = res + 1;
  }
  if (list_of_cells.containsArray([cell[0], cell[1] - 1]) === true)
  {
    res = res + 1;
  }
  if (list_of_cells.containsArray([cell[0], cell[1] + 1]) === true)
  {
    res = res + 1;
  }
  return res;
}

function erasePlayer(player, context)
{
  context.fillStyle = "white";
  context.fillRect(player[0] * 20, player[1] * 20, 20, 20);
}

function displayPlayer(player, goal, canva, context)
{
  context.fillStyle = "red";
  context.fillRect(player[0] * 20, player[1] * 20, 20, 20);
  if ((player[0] === goal[0]) && (player[1] === goal[1]))
  {
    canva.remove();
    let h1 = document.createElement('H1');
    h1.innerHTML = "You Win";
    document.body.appendChild(h1);
  }
}

function initMaze(canva, context, width, height)
{
  canva.width = width * 20;
  canva.height = height * 20;

  let starting_cell;
  if (getRandomInt(2) === 0)
  {
    starting_cell = [getRandomInt(width), 0];
  } else {
    starting_cell = [0, getRandomInt(height)];
  }

  let maze = [];
  maze.push(starting_cell);

  let walls = [];
  addNeighbours(starting_cell, walls, maze, width, height);

  let cell_index;
  while (walls.length > 0)
  {
    cell_index = getRandomInt(walls.length);
    if ((maze.containsArray(walls[cell_index]) === false) && (neighboursInMaze(walls[cell_index], maze) < 2))
    {
      maze.push(walls[cell_index]);
      addNeighbours(walls[cell_index], walls, maze, width, height);
    }
    walls.splice(cell_index, 1);
  }

  return maze;
}

function playGame()
{
  let canva = document.getElementById("mazecanva");
  let context = canva.getContext("2d");
  let width = getRandomInt(40) + 10;
  let height = getRandomInt(15) + 10;

  let maze = initMaze(canva, context, width, height);
  let player = [maze[0][0], maze[0][1]];
  let goal = maze[maze.length - 1];

  context.fillStyle = "white";
  maze.forEach(element => context.fillRect(element[0] * 20, element[1] * 20, 20, 20));
  context.fillStyle = "green";
  context.fillRect(goal[0] * 20, goal[1] * 20, 20, 20);
  context.fillStyle = "red";
  context.fillRect(player[0] * 20, player[1] * 20, 20, 20);

  document.addEventListener('keydown', function(event) {
    if (event.keyCode === 37)
    {
      if ((maze.containsArray([player[0] - 1, player[1]]) === true) && (player[0] > 0))
      {
        erasePlayer(player, context);
        player[0] = player[0] - 1;
        displayPlayer(player, goal, canva, context);
      }
    } else if (event.keyCode === 38) {
      if ((maze.containsArray([player[0], player[1] - 1]) === true) && (player[1] > 0))
      {
        erasePlayer(player, context);
        player[1] = player[1] - 1;
        displayPlayer(player, goal, canva, context);
      }
    } else if (event.keyCode === 39) {
      if ((maze.containsArray([player[0] + 1, player[1]]) === true) && (player[0] < width - 1))
      {
        erasePlayer(player, context);
        player[0] = player[0] + 1;
        displayPlayer(player, goal, canva, context);
      }
    } else if(event.keyCode === 40) {
      if ((maze.containsArray([player[0], player[1] + 1]) === true) && (player[1] < height - 1))
      {
        erasePlayer(player, context);
        player[1] = player[1] + 1;
        displayPlayer(player, goal, canva, context);
      }
    }
  });
}

window.onload = playGame;
