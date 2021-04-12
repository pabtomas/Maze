import { ensure, getRandomInt, Level } from './util';
import { MazeNode } from './mazenode';
import { Maze } from './maze';
import { StairsBuilder } from './stairsbuilder';
import { SpringsBuilder } from './springsbuilder';
import { IceBuilder } from './icebuilder';
import { Drawer } from './drawer';

let animationLaunched: boolean = false;

let maze: Maze = new Maze();
let currentBuilder = Level.STAIRS;
let builders: Array<StairsBuilder | SpringsBuilder | IceBuilder > = [
  new StairsBuilder(),
  new SpringsBuilder(),
  new IceBuilder()
];
let drawer: Drawer = new Drawer(maze);

builders[currentBuilder].init(maze);

launchAnimation();

// ------------------------------------
// https://codepen.io/gamealchemist/pen/VeawyL
// https://codepen.io/gamealchemist/post/animationcanvas1
// https://stackoverflow.com/questions/37476437/how-to-render-html5-canvas-within-a-loop
// ------------------------------------

function animate()
{
  requestAnimationFrame(animate);

  drawer.clearCanvas();
  builders[currentBuilder].update(maze);

  let newPos: MazeNode = maze.getPlayer();
  let player: MazeNode = maze.getPlayer();
  if (maze.isPlayerOnIce() && (Date.now() - maze.getTimeLastPlayerMove() > 100))
  {
    if (player.x === maze.getLastPlayerPos().x)
    {
      if (player.y > maze.getLastPlayerPos().y)
      {
        newPos = new MazeNode(player.x, player.y + 1, player.z);
      } else {
        newPos = new MazeNode(player.x, player.y - 1, player.z);
      }
    } else if (player.y === maze.getLastPlayerPos().y) {
      if (player.x > maze.getLastPlayerPos().x)
      {
        newPos = new MazeNode(player.x + 1, player.y, player.z);
      } else {
        newPos = new MazeNode(player.x - 1, player.y, player.z);
      }
    }
    if (maze.getNodes().concat(maze.getIce()).some(node => node.isEqual(newPos)))
    {
      maze.movePlayer(newPos);
    } else {
      maze.setLastPlayerPos(newPos);
    }
  }

  if (maze.isFinished() && maze.isBuilt())
  {
    builders[currentBuilder].upgrade(maze);

    if (builders[currentBuilder].getBackup() > 1)
    {
      builders.forEach(
        builder => builder.setBackup(builders[currentBuilder].getBackup()));
      currentBuilder = getRandomInt(Level.LENGTH);
    }
    builders[currentBuilder].init(maze);
    drawer.update(maze);
  }

  drawer.draw(maze);
}

function launchAnimation(): void {
  if (animationLaunched) return;
  animationLaunched = true;

  requestAnimationFrame(animate);
}

// ------------------------------------

window.addEventListener('keydown', function(event) {
  let neighbour: MazeNode;
  let player = maze.getPlayer();
  switch (event.key)
  {
    case 'ArrowLeft':
      neighbour = new MazeNode(player.x - 1, player.y, player.z);

      // check if maze is built, if player isn't on ice and if player doesn't
      // move on a wall, a locked door or outside the maze
      if ((maze.getNodes().some(node => node.isEqual(neighbour))
        || maze.getIce().some(ice => ice.isEqual(neighbour)))
        && (!maze.getDoors().some(door => door.isEqual(neighbour)) ||
        maze.canPlayerUnlockDoors()) && (player.x > 0)
        && maze.isBuilt() && !maze.isPlayerOnIce())
      {
        maze.movePlayer(neighbour);
      }
      break;
    case 'ArrowUp':
      neighbour = new MazeNode(player.x, player.y - 1, player.z);

      // check if maze is built, if player isn't on ice and if player doesn't
      // move on a wall, a locked door or outside the maze
      if ((maze.getNodes().some(node => node.isEqual(neighbour)) ||
        maze.getIce().some(ice => ice.isEqual(neighbour)))
        && (!maze.getDoors().some(door => door.isEqual(neighbour)) ||
        maze.canPlayerUnlockDoors()) && (player.y > 0)
        && maze.isBuilt() && !maze.isPlayerOnIce())
      {
        maze.movePlayer(neighbour);
      }
      break;
    case 'PageDown':
      neighbour = new MazeNode(player.x, player.y, player.z - 1);

      // check if maze is built, if player isn't on ice and if player doesn't
      // move on a wall, a locked door or outside the maze
      if ((maze.getNodes().some(element => element.isEqual(neighbour)) ||
        maze.getIce().some(ice => ice.isEqual(neighbour)))
        && (!maze.getDoors().some(door => door.isEqual(neighbour)) ||
        maze.canPlayerUnlockDoors()) && (player.z > 0)
        && maze.isBuilt() && !maze.isPlayerOnIce())
      {
        maze.movePlayer(neighbour);
      }
      break;
    case 'ArrowRight':
      neighbour = new MazeNode(player.x + 1, player.y, player.z);

      // check if maze is built, if player isn't on ice and if player doesn't
      // move on a wall, a locked door or outside the maze
      if ((maze.getNodes().some(element => element.isEqual(neighbour)) ||
        maze.getIce().some(ice => ice.isEqual(neighbour)))
        && (!maze.getDoors().some(door => door.isEqual(neighbour)) ||
        maze.canPlayerUnlockDoors()) && maze.isBuilt()
        && (player.x < maze.getWidth() - 1) && !maze.isPlayerOnIce())
      {
        maze.movePlayer(neighbour);
      }
      break;
    case 'ArrowDown':
      neighbour = new MazeNode(player.x, player.y + 1, player.z);

      // check if maze is built, if player isn't on ice and if player doesn't
      // move on a wall, a locked door or outside the maze
      if ((maze.getNodes().some(element => element.isEqual(neighbour)) ||
        maze.getIce().some(ice => ice.isEqual(neighbour)))
        && (!maze.getDoors().some(door => door.isEqual(neighbour)) ||
        maze.canPlayerUnlockDoors()) && maze.isBuilt()
        && (player.y < maze.getHeight() - 1) && !maze.isPlayerOnIce())
      {
        maze.movePlayer(neighbour);
      }
      break;
    case 'PageUp':
      neighbour = new MazeNode(player.x, player.y, player.z + 1);

      // check if maze is built, if player isn't on ice and if player doesn't
      // move on a wall, a locked door or outside the maze
      if ((maze.getNodes().some(element => element.isEqual(neighbour)) ||
        maze.getIce().some(ice => ice.isEqual(neighbour)))
        && (!maze.getDoors().some(door => door.isEqual(neighbour)) ||
        maze.canPlayerUnlockDoors()) && maze.isBuilt()
        && (player.z < maze.getFloor() - 1) && !maze.isPlayerOnIce())
      {
        maze.movePlayer(neighbour);
      }
      break;
    case ' ':
      if (maze.isSpring(player))
      {
        neighbour = maze.getLinkedSpring(player);
        if (!maze.getDoors().some(door => door.isEqual(neighbour)) ||
          maze.canPlayerUnlockDoors())
        {
          maze.movePlayer(neighbour);
        }
      }
      break;
    case 'Shift':
      maze.setViewer(maze.getViewer() + 1);
      if (maze.getViewer() === maze.getFloor())
      {
        maze.setViewer(0);
      }
      break;
    case 'Control':
      maze.setViewer(maze.getViewer() - 1);
      if (maze.getViewer() < 0)
      {
        maze.setViewer(maze.getFloor() - 1);
      }
      break;
    case '+':
      if (maze.getNodeSize() < 50)
      {
        maze.decNodeSize();
        drawer.update(maze);
      }
      break;
    case '-':
      if (maze.getNodeSize() > 10)
      {
        maze.incNodeSize();
        drawer.update(maze);
      }
      break;
    case 's':
    case 'S':
      if (maze.isBuilt())
      {
        if (!maze.isSolved())
        {
          // if the previous step of the solution is reached, update the
          // solution with a new goal
          let goal: MazeNode;
          if (maze.getDoors().length === 0)
          {
            goal = maze.getPrincess();
          } else {
            if (maze.canPlayerUnlockDoors())
            {
              goal = maze.getDoor(0);
            } else {
              goal = maze.getKey();
            }
          }
          maze.Solved(goal);
        }
      }
      break;
    default:
      return;
  }
});
