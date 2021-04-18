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

let eventOccured: boolean = true;
let mouseX: number = -1;
let mouseY: number = -1;
let time: Date = new Date();

export class Drawer
{
  private nodeSize: number;

  constructor(maze: Maze)
  {
    this.nodeSize = 20;
    this.setup(maze);
    let nodeSize: number = this.nodeSize;

    document.addEventListener('mousemove', function(event: MouseEvent)
    {
      event.preventDefault();
      event.stopPropagation();

      eventOccured = false;

      let oldXNode: number = Math.floor(mouseX / nodeSize);
      let oldYNode: number = Math.floor(mouseY / nodeSize);
      mouseX = event.clientX - canvas.offsetLeft + window.scrollX;
      mouseY = event.clientY - canvas.offsetTop + window.scrollY;
      let newXNode: number = Math.floor(mouseX / nodeSize);
      let newYNode: number = Math.floor(mouseY / nodeSize);

      if ((oldXNode !== newXNode) || (oldYNode !== newYNode))
      {
        time = new Date();
      }
    });
  }

  update(maze: Maze): void
  {
    text.remove();
    canvas.remove();
    this.setup(maze);
  }

  disableDrawingUnderMouse(): void
  {
    eventOccured = true;
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
    canvas.width = maze.getWidth() * this.nodeSize;
    canvas.height = maze.getHeight() * this.nodeSize;
    canvas.style.border = '2px solid black';
    canvas.style.color = 'black';
    document.body.appendChild(canvas);

    context = canvas.getContext('2d', {
      alpha: false
    }) as CanvasRenderingContext2D;
  }

  incNodeSize(maze: Maze): void
  {
    if (this.nodeSize < 50)
    {
      this.nodeSize += 5;
      this.update(maze);
    }
  }

  decNodeSize(maze: Maze): void
  {
    if (this.nodeSize > 10)
    {
      this.nodeSize -= 5;
      this.update(maze);
    }
  }

  drawMaze(maze: Maze): void
  {
    let nodeSize: number = this.nodeSize;
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
    let nodeSize: number = this.nodeSize;
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
    let princess: MazeNode = maze.getPrincess();
    let viewer: number = maze.getViewer();
    if (!princess.isEqual(new MazeNode(-1, -1, -1)) &&
      (princess.z === viewer))
    {
      context.fillStyle = PRINCESS_COLOR;
      context.fillRect(princess.x * this.nodeSize,
        princess.y * this.nodeSize, this.nodeSize, this.nodeSize);
    }
  }

  drawLinkedSpring(maze: Maze): void
  {
    if (maze.isSpring(maze.getPlayer()))
    {
      let linkedSpring: MazeNode = maze.getLinkedSpring(maze.getPlayer());

      context.lineWidth = this.nodeSize / 5;
      context.strokeStyle = LINKEDSPRING_COLOR;
      context.strokeRect(linkedSpring.x * this.nodeSize + this.nodeSize / 10,
        linkedSpring.y * this.nodeSize + this.nodeSize / 10,
        this.nodeSize - this.nodeSize / 5, this.nodeSize - this.nodeSize / 5);
    }
  }

  drawDoors(maze: Maze): void
  {
    let nodeSize: number = this.nodeSize;
    let viewer: number = maze.getViewer();
    maze.getDoors().forEach(function(node) {
      if (node.z === viewer)
      {
        context.fillStyle = DOOR_COLOR;
        context.beginPath();
        context.arc(node.x * nodeSize + nodeSize / 2,
          node.y * nodeSize + nodeSize / 3, nodeSize / 5, 0,
          2 * Math.PI, false);
        context.closePath();
        context.fill();

        context.lineWidth = nodeSize / 10;
        context.strokeStyle = 'white';
        context.stroke();

        context.beginPath();
        context.moveTo(node.x * nodeSize + nodeSize / 2,
          node.y * nodeSize + nodeSize / 6);
        context.lineTo(node.x * nodeSize + nodeSize / 4,
          node.y * nodeSize + nodeSize * 5 / 6);
        context.lineTo(node.x * nodeSize + nodeSize * 3 / 4,
          node.y * nodeSize + nodeSize * 5 / 6);
        context.closePath();
        context.fill();

        context.lineWidth = nodeSize / 20;
        context.stroke();

        context.beginPath();
        context.arc(node.x * nodeSize + nodeSize / 2,
          node.y * nodeSize + nodeSize / 3, nodeSize / 5, 0,
          2 * Math.PI, false);
        context.closePath();
        context.fill();
      }
    });
  }

  drawKey(maze: Maze): void
  {
    if (maze.getKeys().length > 0)
    {
      let viewer: number = maze.getViewer();
      let key: MazeNode = maze.getKey();
      if (!maze.canPlayerUnlockDoors() && (key.z === viewer))
      {
        context.fillStyle = KEY_COLOR;
        context.beginPath();
        context.moveTo(key.x * this.nodeSize + this.nodeSize / 2,
          key.y * this.nodeSize + this.nodeSize / 6);
        context.lineTo(key.x * this.nodeSize + this.nodeSize / 6,
          key.y * this.nodeSize + this.nodeSize / 2);
        context.lineTo(key.x * this.nodeSize + this.nodeSize / 2,
          key.y * this.nodeSize + this.nodeSize * 5 / 6);
        context.lineTo(key.x * this.nodeSize + this.nodeSize * 5 / 6,
          key.y * this.nodeSize + this.nodeSize / 2);
        context.closePath();
        context.fill();
        context.lineWidth = this.nodeSize / 5;
        context.strokeStyle = 'black';
        context.stroke();
      }
    }
  }

  drawPlayer(maze: Maze): void
  {
    let player: MazeNode = maze.getPlayer();
    let viewer: number = maze.getViewer();
    if (!player.isEqual(new MazeNode(-1, -1, -1)) &&
      (player.z === viewer))
    {
      context.fillStyle = PLAYER_COLOR;
      context.beginPath();
      context.arc(player.x * this.nodeSize + this.nodeSize / 2,
        player.y * this.nodeSize + this.nodeSize / 2, this.nodeSize / 2.5, 0,
        2 * Math.PI, false);
      context.fill();
    }
  }

  drawSolution(maze: Maze): void
  {
    if (maze.isSolved())
    {
      let nodeSize: number = this.nodeSize;
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
      .concat('/').concat(maze.getFloor().toString()).concat(' | KEY = ')
      .concat(maze.canPlayerUnlockDoors() ? '1' : '0').concat('/')
      .concat((maze.getDoors().length > 0) || (maze.getKeys().length > 0) ?
        '1' : '0');
  }

  drawSpringUnderMouse(maze: Maze): void
  {
    if (!eventOccured)
    {
      let node: MazeNode = new MazeNode(Math.floor(mouseX / this.nodeSize),
        Math.floor(mouseY / this.nodeSize), maze.getViewer());
      if (maze.isSpring(node))
      {
        let linked: MazeNode = maze.getLinkedSpring(node);
        context.lineWidth = this.nodeSize / 5;
        let elapsedTime: number = new Date().getTime() - time.getTime();
        if (elapsedTime > 1000)
        {
          time = new Date();
          elapsedTime = 0;
        }
        let red: number = (elapsedTime < 500) ?
          220 + (35 * elapsedTime / 500) :
          255 - 35 * ((elapsedTime - 500) / 500);
        let green: number = (elapsedTime < 500) ?
          20 + (145 * elapsedTime / 500) :
          165 - 145 * ((elapsedTime - 500) / 500);
        let blue: number = (elapsedTime < 500) ?
          60 - (60 * elapsedTime / 500) :
          60 * ((elapsedTime - 500) / 500);
        context.strokeStyle = 'rgb('.concat(red.toString()).concat(', ')
          .concat(green.toString()).concat(', ')
          .concat(blue.toString()).concat(')');
        context.strokeRect(node.x * this.nodeSize + this.nodeSize / 10,
          node.y * this.nodeSize + this.nodeSize / 10,
          this.nodeSize - this.nodeSize / 5, this.nodeSize - this.nodeSize / 5);
        context.strokeRect(linked.x * this.nodeSize + this.nodeSize / 10,
          linked.y * this.nodeSize + this.nodeSize / 10,
          this.nodeSize - this.nodeSize / 5, this.nodeSize - this.nodeSize / 5);
      }
    }
  }

  draw(maze: Maze): void
  {
    this.drawMaze(maze);
    this.drawIce(maze);
    this.drawPrincess(maze);
    this.drawLinkedSpring(maze);
    this.drawSpringUnderMouse(maze);
    this.drawSolution(maze);
    this.drawDoors(maze);
    this.drawKey(maze);
    this.drawPlayer(maze);
    this.drawText(maze);
  }
}
