import { ensure, getRandomInt, Level } from './util';
import { MazeNode } from './mazenode';
import { Maze } from './maze';
import { StairsBuilder } from './stairsbuilder';
import { SpringsBuilder } from './springsbuilder';
import { IceBuilder } from './icebuilder';
import { ArrowsBuilder } from './arrowsbuilder';
import { Drawer } from './drawer';

let animationLaunched: boolean = false;
let lastTimeAnimation: number;
let loadMazeFaster: boolean = false;
const MIN_FRAME_TIME: number = 1000;

let maze: Maze = new Maze();
let currentBuilder = Level.STAIRS;
let builders: Array<StairsBuilder | SpringsBuilder | IceBuilder |
  ArrowsBuilder > = [
    new StairsBuilder(),
    new SpringsBuilder(),
    new IceBuilder(),
    new ArrowsBuilder()
];
let drawer: Drawer = new Drawer(maze);

builders[currentBuilder].init(maze);

launchAnimation();

// ------------------------------------
// https://codepen.io/gamealchemist/pen/VeawyL
// https://codepen.io/gamealchemist/post/animationcanvas1
// https://stackoverflow.com/questions/37476437/how-to-render-html5-canvas-within-a-loop
// ------------------------------------

function skatingAnimation(maze: Maze): void
{
  let newPos: MazeNode = maze.getPlayer();
  let player: MazeNode = maze.getPlayer();
  if (maze.isPlayerOnIce() &&
    (Date.now() - maze.getTimeLastPlayerMove() > 100))
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
    if (maze.getNodes().concat(maze.getIce())
      .some(node => node.isEqual(newPos)))
    {
      maze.movePlayer(newPos);
    } else {
      maze.setLastPlayerPos(newPos);
    }
  }
}

function displacementAnimation(maze: Maze): void
{
  if (maze.isPlayerOnArrow() &&
    (Date.now() - maze.getTimeLastPlayerMove() > 100))
  {
    if (maze.getInteruptor())
    {
      maze.movePlayer(maze.getPlayer().parents);
    } else {
      maze.movePlayer(maze.getPlayer().children[0]);
    }
  }
}

function buildNewLevel(maze: Maze): void
{
  if (maze.isFinished() && maze.isBuilt())
  {
    builders[currentBuilder].upgrade(maze);

    if (builders[currentBuilder].getBackup() > 1)
    {
      builders.forEach(
        builder => builder.setBackup(builders[currentBuilder].getBackup()));
      ++currentBuilder;
      if (currentBuilder === Level.LENGTH)
      {
        currentBuilder = 0;
      }
    }
    builders[currentBuilder].init(maze);
    drawer.update(maze);
  }
}

function animate(now: number): void
{
  requestAnimationFrame(animate);

  builders[currentBuilder].update(maze);

  skatingAnimation(maze);
  displacementAnimation(maze);

  buildNewLevel(maze);

  if (!maze.isBuilt() && loadMazeFaster)
  {
    if (now - lastTimeAnimation < MIN_FRAME_TIME)
    {
      return;
    }
    lastTimeAnimation = now;
  }

  drawer.clearCanvas();
  drawer.draw(maze);
}

function launchAnimation(): void {
  if (animationLaunched)
  {
    return;
  }
  animationLaunched = true;

  requestAnimationFrame(_launchAnimation);

  function _launchAnimation(now: number): void {
    lastTimeAnimation = now;
    requestAnimationFrame(animate);
  }
}

// ------------------------------------

window.addEventListener('keydown', function(event) {
  let neighbour: MazeNode;
  let player = maze.getPlayer();
  drawer.disableDrawingUnderMouse();
  switch (event.key)
  {
    case 'ArrowLeft':
      neighbour = new MazeNode(player.x - 1, player.y, player.z);

      // check if maze is built, if player isn't on ice and if player doesn't
      // move on a wall, a locked door or outside the maze
      if ((maze.getNodes().some(node => node.isEqual(neighbour))
        || maze.getIce().some(ice => ice.isEqual(neighbour))
        || maze.getArrows().some(arrow => arrow.isEqual(neighbour)))
        && (!maze.getDoors().some(door => door.isEqual(neighbour)) ||
        maze.canPlayerUnlockDoors()) && (player.x > 0)
        && maze.isBuilt() && !maze.isPlayerOnIce() && !maze.isPlayerOnArrow())
      {
        maze.movePlayer(neighbour);
      }
      break;
    case 'ArrowUp':
      neighbour = new MazeNode(player.x, player.y - 1, player.z);

      // check if maze is built, if player isn't on ice and if player doesn't
      // move on a wall, a locked door or outside the maze
      if ((maze.getNodes().some(node => node.isEqual(neighbour)) ||
        maze.getIce().some(ice => ice.isEqual(neighbour))
        || maze.getArrows().some(arrow => arrow.isEqual(neighbour)))
        && (!maze.getDoors().some(door => door.isEqual(neighbour)) ||
        maze.canPlayerUnlockDoors()) && (player.y > 0)
        && maze.isBuilt() && !maze.isPlayerOnIce() && !maze.isPlayerOnArrow())
      {
        maze.movePlayer(neighbour);
      }
      break;
    case 'PageDown':
      neighbour = new MazeNode(player.x, player.y, player.z - 1);

      // check if maze is built, if player isn't on ice and if player doesn't
      // move on a wall, a locked door or outside the maze
      if ((maze.getNodes().some(element => element.isEqual(neighbour)) ||
        maze.getIce().some(ice => ice.isEqual(neighbour))
        || maze.getArrows().some(arrow => arrow.isEqual(neighbour)))
        && (!maze.getDoors().some(door => door.isEqual(neighbour)) ||
        maze.canPlayerUnlockDoors()) && (player.z > 0)
        && maze.isBuilt() && !maze.isPlayerOnIce() && !maze.isPlayerOnArrow())
      {
        maze.movePlayer(neighbour);
      }
      break;
    case 'ArrowRight':
      neighbour = new MazeNode(player.x + 1, player.y, player.z);

      // check if maze is built, if player isn't on ice and if player doesn't
      // move on a wall, a locked door or outside the maze
      if ((maze.getNodes().some(element => element.isEqual(neighbour)) ||
        maze.getIce().some(ice => ice.isEqual(neighbour))
        || maze.getArrows().some(arrow => arrow.isEqual(neighbour)))
        && (!maze.getDoors().some(door => door.isEqual(neighbour)) ||
        maze.canPlayerUnlockDoors()) && maze.isBuilt()
        && (player.x < maze.getWidth() - 1) && !maze.isPlayerOnIce()
        && !maze.isPlayerOnArrow())
      {
        maze.movePlayer(neighbour);
      }
      break;
    case 'ArrowDown':
      neighbour = new MazeNode(player.x, player.y + 1, player.z);

      // check if maze is built, if player isn't on ice and if player doesn't
      // move on a wall, a locked door or outside the maze
      if ((maze.getNodes().some(element => element.isEqual(neighbour)) ||
        maze.getIce().some(ice => ice.isEqual(neighbour))
        || maze.getArrows().some(arrow => arrow.isEqual(neighbour)))
        && (!maze.getDoors().some(door => door.isEqual(neighbour)) ||
        maze.canPlayerUnlockDoors()) && maze.isBuilt()
        && (player.y < maze.getHeight() - 1) && !maze.isPlayerOnIce() &&
        !maze.isPlayerOnArrow())
      {
        maze.movePlayer(neighbour);
      }
      break;
    case 'PageUp':
      neighbour = new MazeNode(player.x, player.y, player.z + 1);

      // check if maze is built, if player isn't on ice and if player doesn't
      // move on a wall, a locked door or outside the maze
      if ((maze.getNodes().some(element => element.isEqual(neighbour)) ||
        maze.getIce().some(ice => ice.isEqual(neighbour))
        || maze.getArrows().some(arrow => arrow.isEqual(neighbour)))
        && (!maze.getDoors().some(door => door.isEqual(neighbour)) ||
        maze.canPlayerUnlockDoors()) && maze.isBuilt()
        && (player.z < maze.getFloor() - 1) && !maze.isPlayerOnIce() &&
        !maze.isPlayerOnArrow())
      {
        maze.movePlayer(neighbour);
      }
      break;
    case ' ':
      if ((currentBuilder === Level.SPRINGS) && (maze.isSpring(player)))
      {
        neighbour = maze.getLinkedSpring(player);
        if (!maze.getDoors().some(door => door.isEqual(neighbour)) ||
          maze.canPlayerUnlockDoors())
        {
          maze.movePlayer(neighbour);
        }
      } else if (currentBuilder === Level.ARROWS) {
        maze.useInteruptor();
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
      drawer.incNodeSize(maze);
      break;
    case '-':
      drawer.decNodeSize(maze);
      break;
    case 'Enter':
      loadMazeFaster = !loadMazeFaster;
      break;
    case 's':
    case 'S':
      if (maze.isBuilt() && !maze.isPlayerOnIce())
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
