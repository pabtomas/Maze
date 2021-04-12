import { MazeNode } from './mazenode';
import { Maze } from './maze';

const PLAYER_COLOR: string = 'red';
const PRINCESS_COLOR: string = 'fuchsia';
const MAZE_COLOR: string = 'white';
const SOLUTION_COLOR: string = 'blueviolet';
const UPSTAIRS_COLOR: string = 'gold';
const DOWNSTAIRS_COLOR: string = 'dodgerblue';
const UPDOWNSTAIRS_COLOR: string = 'limegreen';
const DOOR_COLOR: string = 'black';
const KEY_COLOR: string = 'gold';
const SPRING_COLOR: string = 'orange';
const LINKEDSPRING_COLOR: string = 'crimson';
const ICE_COLOR: string = '#80f2ff';

let canvas: HTMLCanvasElement;
let text: HTMLHeadingElement;
let context: CanvasRenderingContext2D;

export class Drawer
{
  constructor(maze: Maze)
  {
    this.setup(maze);
  }

  update(maze: Maze): void
  {
    text.remove();
    canvas.remove();
    this.setup(maze);
  }

  clearCanvas(): void
  {
    context.fillStyle = 'black';
    context.fillRect(0, 0, canvas.width, canvas.height);
  }

  setup(maze: Maze): void
  {
    text = document.createElement('H3') as HTMLHeadingElement;
    this.drawText(maze);
    document.body.appendChild(text);

    canvas = document.createElement('canvas') as HTMLCanvasElement;
    canvas.width = maze.getWidth() * maze.getNodeSize();
    canvas.height = maze.getHeight() * maze.getNodeSize();
    canvas.style.border = '2px solid black';
    canvas.style.color = 'black';
    document.body.appendChild(canvas);

    context = canvas.getContext('2d', {
      alpha: false
    }) as CanvasRenderingContext2D;
  }

  drawMaze(maze: Maze): void
  {
    let nodeSize: number = maze.getNodeSize();
    let viewer: number = maze.getViewer();
    maze.getNodes().forEach(function(node) {
      if (node.z === viewer)
      {
        if (maze.isSpring(node))
        {
          context.fillStyle = SPRING_COLOR;
        } else {
          let down: boolean = false;
          let up: boolean = false;
          let neighbourhood: Array<MazeNode> = node.getNeighbourhood();

          if (neighbourhood.some(element =>
            element.isEqual(new MazeNode(node.x, node.y, node.z - 1))))
          {
            down = true;
          }

          if (neighbourhood.some(element =>
            element.isEqual(new MazeNode(node.x, node.y, node.z + 1))))
          {
            up = true;
          }

          if (down && up)
          {
            context.fillStyle = UPDOWNSTAIRS_COLOR;
          } else if (down) {
            context.fillStyle = DOWNSTAIRS_COLOR;
          } else if (up) {
            context.fillStyle = UPSTAIRS_COLOR;
          } else {
            context.fillStyle = MAZE_COLOR;
          }
        }

        context.fillRect(node.x * nodeSize, node.y * nodeSize,
          nodeSize, nodeSize);
      }
    });
  }

  drawIce(maze: Maze): void
  {
    let nodeSize: number = maze.getNodeSize();
    let viewer: number = maze.getViewer();
    maze.getIce().forEach(function(node) {
      if (node.z === viewer)
      {
        context.fillStyle = ICE_COLOR;
        context.fillRect(node.x * nodeSize, node.y * nodeSize,
          nodeSize, nodeSize);
      }
    });
  }

  drawPrincess(maze: Maze): void
  {
    let nodeSize: number = maze.getNodeSize();
    let princess: MazeNode = maze.getPrincess();
    let viewer: number = maze.getViewer();
    if (!princess.isEqual(new MazeNode(-1, -1, -1)) &&
      (princess.z === viewer))
    {
      context.fillStyle = PRINCESS_COLOR;
      context.fillRect(princess.x * nodeSize,
        princess.y * nodeSize, nodeSize, nodeSize);
    }
  }

  drawLinkedSpring(maze: Maze): void
  {
    if (maze.isSpring(maze.getPlayer()))
    {
      let nodeSize: number = maze.getNodeSize();
      let linkedSpring: MazeNode = maze.getLinkedSpring(maze.getPlayer());

      context.lineWidth = nodeSize / 5;
      context.strokeStyle = LINKEDSPRING_COLOR;
      context.strokeRect(linkedSpring.x * nodeSize + nodeSize / 10,
        linkedSpring.y * nodeSize + nodeSize / 10,
        nodeSize - nodeSize / 5, nodeSize - nodeSize / 5);
    }
  }

  drawDoors(maze: Maze): void
  {
    let nodeSize: number = maze.getNodeSize();
    let viewer: number = maze.getViewer();
    maze.getDoors().forEach(function(node) {
      if (node.z === viewer)
      {
        context.fillStyle = DOOR_COLOR;
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

  drawKey(maze: Maze): void
  {
    if (maze.getKeys().length > 0)
    {
      let nodeSize: number = maze.getNodeSize();
      let viewer: number = maze.getViewer();
      let key: MazeNode = maze.getKey();
      if (!maze.canPlayerUnlockDoors() && (key.z === viewer))
      {
        context.fillStyle = KEY_COLOR;
        context.beginPath();
        context.moveTo(key.x * nodeSize + nodeSize / 2,
          key.y * nodeSize + nodeSize / 6);
        context.lineTo(key.x * nodeSize + nodeSize / 6,
          key.y * nodeSize + nodeSize / 2);
        context.lineTo(key.x * nodeSize + nodeSize / 2,
          key.y * nodeSize + nodeSize * 5 / 6);
        context.lineTo(key.x * nodeSize + nodeSize * 5 / 6,
          key.y * nodeSize + nodeSize / 2);
        context.closePath();
        context.fill();
        context.lineWidth = nodeSize / 5;
        context.strokeStyle = 'black';
        context.stroke();
      }
    }
  }

  drawPlayer(maze: Maze): void
  {
    let nodeSize: number = maze.getNodeSize();
    let player: MazeNode = maze.getPlayer();
    let viewer: number = maze.getViewer();
    if (!player.isEqual(new MazeNode(-1, -1, -1)) &&
      (player.z === viewer))
    {
      context.fillStyle = PLAYER_COLOR;
      context.beginPath();
      context.arc(player.x * nodeSize + nodeSize / 2,
        player.y * nodeSize + nodeSize / 2, nodeSize / 2.5, 0,
        2 * Math.PI, false);
      context.fill();
    }
  }

  drawSolution(maze: Maze): void
  {
    if (maze.isSolved())
    {
      let nodeSize: number = maze.getNodeSize();
      let player: MazeNode = maze.getPlayer();
      let viewer: number = maze.getViewer();
      let solution: Array<MazeNode> = maze.getSolution();
      let lastNode: MazeNode = solution[0];

      context.strokeStyle = SOLUTION_COLOR;
      context.lineWidth = nodeSize / 5;
      context.beginPath();

      if ((player.z === viewer) &&
        ((solution[0].z !== player.z) || (maze.isSpring(player) &&
        solution.some(node => node.isEqual(maze.getLinkedSpring(player))))))
      {
        context.strokeRect(player.x * nodeSize + nodeSize / 10,
          player.y * nodeSize + nodeSize / 10,
          nodeSize - nodeSize / 5, nodeSize - nodeSize / 5);
        context.moveTo(solution[0].x * nodeSize + (nodeSize / 2),
          solution[0].y * nodeSize + (nodeSize / 2));
      } else {
        context.moveTo(player.x * nodeSize + (nodeSize / 2),
          player.y * nodeSize + (nodeSize / 2));
      }

      solution.forEach(function(node) {
        if (node.z === viewer)
        {
          if ((lastNode.z !== node.z) || (maze.isSpring(node) &&
            maze.getLinkedSpring(node).isEqual(lastNode)))
          {
            context.stroke();
            context.beginPath();
            context.moveTo(node.x * nodeSize + (nodeSize / 2),
              node.y * nodeSize + (nodeSize / 2));
          } else {
            context.lineTo(node.x * nodeSize + (nodeSize / 2),
              node.y * nodeSize + (nodeSize / 2));
          }
        }
        lastNode = node;
      })
      context.stroke();
    }
  }

  drawText(maze: Maze): void
  {
    text.innerHTML = 'LEVEL '.concat(maze.getLevel().toString())
      .concat(' | FLOOR ').concat((maze.getViewer() + 1).toString())
      .concat('/').concat(maze.getFloor().toString()).concat(' | KEYS = ')
      .concat((maze.canPlayerUnlockDoors() ? 1 : 0).toString()).concat('/1');
  }

  draw(maze: Maze): void
  {
    this.drawMaze(maze);
    this.drawIce(maze);
    this.drawPrincess(maze);
    this.drawLinkedSpring(maze);
    this.drawSolution(maze);
    this.drawDoors(maze);
    this.drawKey(maze);
    this.drawPlayer(maze);
    this.drawText(maze);
  }
}
