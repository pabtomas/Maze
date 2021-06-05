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
const ICE_COLOR: string = 'rgb(128, 244, 255)';
const ARROW_COLOR: string = 'dimgrey';
const LEFTARROW_COLOR: string = 'red';
const RIGHTARROW_COLOR: string = 'dodgerblue';
const TOPARROW_COLOR: string = 'gold';
const DOWNARROW_COLOR: string = 'limegreen';
const PASTPORTAL_COLOR: string = 'dodgerblue';
const FUTUREPORTAL_COLOR: string = 'rgb(255, 53, 94)';
const PORTAL_COLOR: string = 'blueviolet';
const TRANSPARENT: string = 'rgba(0, 0, 0, 0)';

let canvas: HTMLCanvasElement;
let text: HTMLHeadingElement;
let context: CanvasRenderingContext2D;

let eventOccured: boolean = true;
let mouseX: number = -1;
let mouseY: number = -1;
let time: number = Date.now();

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
        time = Date.now();
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
    text.style.margin = "0px";
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

  drawWalls(maze: Maze): void
  {
    let nodeSize: number = this.nodeSize;
    let viewer: number = maze.getViewer();
    let year: number = maze.getYear();

    context.strokeStyle = "black";
    context.lineWidth = nodeSize / 10;
    context.beginPath();
    context.moveTo(0, 0);
    context.lineTo(canvas.width, 0);
    context.lineTo(canvas.width, canvas.height);
    context.lineTo(0, canvas.height);
    context.closePath();
    context.stroke();

    maze.getNodes().forEach(node => {
      if ((node.z === viewer) && (node.t === year))
      {
        let neighbourhood: Array<MazeNode> = node.getNeighbourhood();
        node.possible2DNeighbourhood().filter(
          neighbour => !neighbourhood.some(n => n.isEqual(neighbour)))
            .forEach(wall => {
              if (wall.isEqual(new MazeNode(node.x + 1, node.y, node.z)))
              {
                context.beginPath();
                context.moveTo((node.x + 1) * nodeSize,
                  node.y * nodeSize - nodeSize / 20);
                context.lineTo((node.x + 1) * nodeSize,
                  (node.y + 1) * nodeSize + nodeSize / 20);
                context.stroke();
              } else if (wall.isEqual(
                new MazeNode(node.x - 1, node.y, node.z))) {
                  context.beginPath();
                  context.moveTo(node.x * nodeSize,
                    node.y * nodeSize - nodeSize / 20);
                  context.lineTo(node.x * nodeSize,
                    (node.y + 1) * nodeSize + nodeSize / 20);
                  context.stroke();
              } else if (wall.isEqual(
                new MazeNode(node.x, node.y + 1, node.z))) {
                  context.beginPath();
                  context.moveTo(node.x * nodeSize - nodeSize / 20,
                    (node.y + 1) * nodeSize);
                  context.lineTo((node.x + 1) * nodeSize + nodeSize / 20,
                    (node.y + 1) * nodeSize);
                  context.stroke();
              } else if (wall.isEqual(
                new MazeNode(node.x, node.y - 1, node.z))) {
                  context.beginPath();
                  context.moveTo(node.x * nodeSize - nodeSize / 20,
                    node.y * nodeSize);
                  context.lineTo((node.x + 1) * nodeSize + nodeSize / 20,
                    node.y * nodeSize);
                  context.stroke();
              }
        })
      }
    });
  }

  drawMaze(maze: Maze): void
  {
    let nodeSize: number = this.nodeSize;
    let viewer: number = maze.getViewer();
    let year: number = maze.getYear();

    context.lineWidth = nodeSize / 10;
    let a: number;
    let b: number;
    let double: boolean = false;
    let centerX: number;
    let centerY: number;
    let angle: number;
    let x: number;
    let y: number;
    let spiralStart: number;
    let spiralEnd: number;

    maze.getNodes().forEach(node => {
      if ((node.z === viewer) && (node.t === year))
      {
        let future: boolean = false;
        let past: boolean = false;

        if (maze.isSpring(node))
        {
          context.fillStyle = SPRING_COLOR;
        } else {
          let down: boolean = false;
          let up: boolean = false;
          let neighbourhood: Array<MazeNode> = node.getNeighbourhood();

          if (neighbourhood.some(neighbour =>
            neighbour.isEqual(new MazeNode(node.x, node.y, node.z - 1))))
          {
            down = true;
          }

          if (neighbourhood.some(neighbour =>
            neighbour.isEqual(new MazeNode(node.x, node.y, node.z + 1))))
          {
            up = true;
          }

          if (neighbourhood.some(neighbour => (neighbour.t === node.t + 1) &&
            neighbour.isEqual(new MazeNode(node.x, node.y, node.z))))
          {
            future = true;
          }

          if (neighbourhood.some(neighbour => (neighbour.t === node.t - 1) &&
            neighbour.isEqual(new MazeNode(node.x, node.y, node.z))))
          {
            past = true;
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

          if (future && past)
          {
            context.strokeStyle = PORTAL_COLOR;
            spiralStart = 60;
            spiralEnd = 120;
            a = 0.19;
            b = nodeSize / 25;
          } else if (past) {
            context.strokeStyle = PASTPORTAL_COLOR;
            spiralStart = -133;
            spiralEnd = 0;
            a = 0.75 * (nodeSize / 25);
          } else if (future) {
            context.strokeStyle = FUTUREPORTAL_COLOR;
            spiralStart = 0;
            spiralEnd = 117;
            a = 0.75 * (nodeSize / 25);
          }
        }

        context.fillRect(node.x * nodeSize, node.y * nodeSize,
          nodeSize, nodeSize);

        if (future && past)
        {
          centerX = node.x * nodeSize + nodeSize / 2;
          centerY = node.y * nodeSize + nodeSize / 2;

          context.moveTo(centerX, centerY);
          context.beginPath();

          for (let i = spiralEnd; i > spiralStart; i--)
          {
            angle = 0.1 * i;
            x = centerX + (a + b * Math.exp(a * angle)) * Math.cos(angle);
            y = centerY + (a + b * Math.exp(a * angle)) * Math.sin(angle);
            context.lineTo(x, y);
          }
          context.stroke();

          centerX = node.x * nodeSize + nodeSize / 2;
          centerY = node.y * nodeSize + nodeSize / 2;

          context.moveTo(centerX, centerY);
          context.beginPath();

          for (let i = spiralStart; i < spiralEnd; i++)
          {
            angle = 0.1 * i;
            x = centerX + (a + b * Math.exp(a * angle))
              * Math.cos(angle + Math.PI);
            y = centerY + (a + b * Math.exp(a * angle))
              * Math.sin(angle + Math.PI);
            context.lineTo(x, y);
          }
          context.stroke();

          context.beginPath();
          context.arc(centerX, centerY, nodeSize / 8, 0, 2 * Math.PI, false);
          context.stroke();

        } else if (future || past) {
          centerX = node.x * nodeSize + nodeSize / 2 + nodeSize / 20;
          centerY = node.y * nodeSize + nodeSize / 2 + nodeSize / 20;

          context.moveTo(centerX, centerY);
          context.beginPath();

          for (let i = spiralStart; i < spiralEnd; i++)
          {
            angle = 0.1 * i;
            x = centerX + (a + a * angle) * Math.cos(angle);
            y = centerY + (a + a * angle) * Math.sin(angle);
            context.lineTo(x, y);
          }
          context.stroke();
        }
      }
    });
  }

  drawIce(maze: Maze): void
  {
    let nodeSize: number = this.nodeSize;
    let viewer: number = maze.getViewer();
    let year: number = maze.getYear();
    maze.getIce().forEach(node => {
      if ((node.z === viewer) && (node.t === year))
      {
        context.fillStyle = ICE_COLOR;
        context.fillRect(node.x * nodeSize, node.y * nodeSize,
          nodeSize, nodeSize);
      }
    });
  }

  drawArrows(maze: Maze): void
  {
    let nodeSize: number = this.nodeSize;
    let viewer: number = maze.getViewer();
    let year: number = maze.getYear();
    maze.getArrows().forEach(node => {
      if ((node.z === viewer) && (node.t === year))
      {
        context.fillStyle = ARROW_COLOR;
        context.fillRect(node.x * nodeSize, node.y * nodeSize,
          nodeSize, nodeSize);

        context.lineWidth = nodeSize / 10;
        context.beginPath();

        let child: MazeNode;

        if (maze.getInteruptor())
        {
          child = node.parents;
        } else {
          child = node.children[0];
        }

        if (child.y > node.y)
        {
          context.strokeStyle = DOWNARROW_COLOR;
          context.moveTo(node.x * nodeSize + nodeSize / 5,
            node.y * nodeSize + nodeSize / 5);
          context.lineTo(node.x * nodeSize + nodeSize / 2,
            node.y * nodeSize + nodeSize * 2 / 5);
          context.lineTo(node.x * nodeSize + nodeSize * 4 / 5,
            node.y * nodeSize + nodeSize / 5);
          context.stroke();
          context.beginPath();
          context.moveTo(node.x * nodeSize + nodeSize / 5,
            node.y * nodeSize + nodeSize * 3 / 5);
          context.lineTo(node.x * nodeSize + nodeSize / 2,
            node.y * nodeSize + nodeSize * 4 / 5);
          context.lineTo(node.x * nodeSize + nodeSize * 4 / 5,
            node.y * nodeSize + nodeSize * 3 / 5);
        } else if (child.y < node.y) {
          context.strokeStyle = TOPARROW_COLOR;
          context.moveTo(node.x * nodeSize + nodeSize / 5,
            node.y * nodeSize + nodeSize * 2 / 5);
          context.lineTo(node.x * nodeSize + nodeSize / 2,
            node.y * nodeSize + nodeSize / 5);
          context.lineTo(node.x * nodeSize + nodeSize * 4 / 5,
            node.y * nodeSize + nodeSize * 2 / 5);
          context.stroke();
          context.beginPath();
          context.moveTo(node.x * nodeSize + nodeSize / 5,
            node.y * nodeSize + nodeSize * 4 / 5);
          context.lineTo(node.x * nodeSize + nodeSize / 2,
            node.y * nodeSize + nodeSize * 3 / 5);
          context.lineTo(node.x * nodeSize + nodeSize * 4 / 5,
            node.y * nodeSize + nodeSize * 4 / 5);
        } else if (child.x > node.x) {
          context.strokeStyle = RIGHTARROW_COLOR;
          context.moveTo(node.x * nodeSize + nodeSize / 5,
            node.y * nodeSize + nodeSize / 5);
          context.lineTo(node.x * nodeSize + nodeSize * 2 / 5,
            node.y * nodeSize + nodeSize / 2);
          context.lineTo(node.x * nodeSize + nodeSize / 5,
            node.y * nodeSize + nodeSize * 4 / 5);
          context.stroke();
          context.beginPath();
          context.moveTo(node.x * nodeSize + nodeSize * 3 / 5,
            node.y * nodeSize + nodeSize / 5);
          context.lineTo(node.x * nodeSize + nodeSize * 4 / 5,
            node.y * nodeSize + nodeSize / 2);
          context.lineTo(node.x * nodeSize + nodeSize * 3 / 5,
            node.y * nodeSize + nodeSize * 4 / 5);
        } else if (child.x < node.x) {
          context.strokeStyle = LEFTARROW_COLOR;
          context.moveTo(node.x * nodeSize + nodeSize * 2 / 5,
            node.y * nodeSize + nodeSize / 5);
          context.lineTo(node.x * nodeSize + nodeSize / 5,
            node.y * nodeSize + nodeSize / 2);
          context.lineTo(node.x * nodeSize + nodeSize * 2 / 5,
            node.y * nodeSize + nodeSize * 4 / 5);
          context.stroke();
          context.beginPath();
          context.moveTo(node.x * nodeSize + nodeSize * 4 / 5,
            node.y * nodeSize + nodeSize / 5);
          context.lineTo(node.x * nodeSize + nodeSize * 3 / 5,
            node.y * nodeSize + nodeSize / 2);
          context.lineTo(node.x * nodeSize + nodeSize * 4 / 5,
            node.y * nodeSize + nodeSize * 4 / 5);
        }

        context.stroke();
      }
    });
  }

  drawPrincess(maze: Maze): void
  {
    let princess: MazeNode = maze.getPrincess();
    let nodeSize: number = this.nodeSize;
    let viewer: number = maze.getViewer();
    let year: number = maze.getYear();
    if (maze.isBuilt() && (princess.z === viewer) && (princess.t === year))
    {
      let elapsedTime: number = Date.now() - maze.getTimeLastPlayerMove();
      if (elapsedTime > 1000)
      {
        while (elapsedTime > 1000)
        {
          elapsedTime -= 1000;
        }
        if (elapsedTime < 500)
        {
          context.fillStyle = TRANSPARENT;
        } else {
          context.fillStyle = PRINCESS_COLOR;
        }
      } else {
        context.fillStyle = PRINCESS_COLOR;
      }
      context.fillRect(princess.x * nodeSize,
        princess.y * nodeSize, nodeSize, nodeSize);
    }
  }

  drawLinkedSpring(maze: Maze): void
  {
    if (maze.isSpring(maze.getPlayer()) && maze.isBuilt())
    {
      let linkedSpring: MazeNode = maze.getLinkedSpring(maze.getPlayer());

      let elapsedTime: number = Date.now() - maze.getTimeLastPlayerMove();
      if (elapsedTime > 1000)
      {
        while (elapsedTime > 1000)
        {
          elapsedTime -= 1000;
        }
        if (elapsedTime < 500)
        {
          context.strokeStyle = TRANSPARENT;
        } else {
          context.strokeStyle = LINKEDSPRING_COLOR;
        }
      } else {
        context.strokeStyle = LINKEDSPRING_COLOR;
      }

      context.lineWidth = this.nodeSize / 5;
      context.strokeRect(linkedSpring.x * this.nodeSize + this.nodeSize / 10,
        linkedSpring.y * this.nodeSize + this.nodeSize / 10,
        this.nodeSize - this.nodeSize / 5, this.nodeSize - this.nodeSize / 5);
    }
  }

  drawDoors(maze: Maze): void
  {
    let nodeSize: number = this.nodeSize;
    let viewer: number = maze.getViewer();
    let year: number = maze.getYear();
    maze.getDoors().forEach(node => {
      if ((node.z === viewer) && (node.t === year))
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
      let nodeSize: number = this.nodeSize;
      let viewer: number = maze.getViewer();
      let year: number = maze.getYear();
      let key: MazeNode = maze.getKey();
      if (!maze.canPlayerUnlockDoors() && (key.z === viewer) &&
        (key.t === year))
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
        context.lineWidth = this.nodeSize / 10;
        context.strokeStyle = 'black';
        context.stroke();
      }
    }
  }

  drawPlayer(maze: Maze): void
  {
    let player: MazeNode = maze.getPlayer();
    let viewer: number = maze.getViewer();
    let year: number = maze.getYear();
    if (maze.isBuilt() && (player.z === viewer) && (player.t === year))
    {
      let elapsedTime: number = Date.now() - maze.getTimeLastPlayerMove();
      if (elapsedTime > 1000)
      {
        while (elapsedTime > 1000)
        {
          elapsedTime -= 1000;
        }
        if (elapsedTime < 500)
        {
          context.fillStyle = TRANSPARENT;
        } else {
          context.fillStyle = PLAYER_COLOR;
        }
      } else {
        context.fillStyle = PLAYER_COLOR;
      }
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
      let year: number = maze.getYear();
      let solution: Array<MazeNode> = maze.getSolution();
      let lastNode: MazeNode = player;
      let nextNode: MazeNode;

      let elapsedTime: number = Date.now() - maze.getTimeLastPlayerMove();
      if (elapsedTime > 1000)
      {
        while (elapsedTime > 1000)
        {
          elapsedTime -= 1000;
        }
        if (elapsedTime < 500)
        {
          context.strokeStyle = TRANSPARENT;
        } else {
          context.strokeStyle = SOLUTION_COLOR;
        }
      } else {
        context.strokeStyle = SOLUTION_COLOR;
      }
      context.lineWidth = nodeSize / 5;
      context.beginPath();

      if ((player.z === viewer) && (player.t === year) &&
        ((solution[0].z !== player.z) || (solution[0].t !== player.t) ||
        (maze.isSpring(player) && solution.some(
          node => node.isEqual(maze.getLinkedSpring(player))))))
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

      solution.forEach((node, index) => {
        if (index < solution.length - 1)
        {
          nextNode = solution[index + 1];
        } else {
          nextNode = node;
        }
        if ((node.z === viewer) && (node.t === year))
        {
          if (((lastNode.z !== node.z) && (node.z !== nextNode.z)) ||
            ((lastNode.t !== node.t) && (node.t !== nextNode.t)))
          {
              context.strokeRect(node.x * nodeSize + nodeSize / 10,
                node.y * nodeSize + nodeSize / 10,
                nodeSize - nodeSize / 5, nodeSize - nodeSize / 5);
          } else {
            if ((lastNode.z !== node.z) || (lastNode.t !== node.t) ||
              (maze.isSpring(node) &&
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
      .concat('/').concat(maze.getFloor().toString()).concat(' | YEAR ')
      .concat(maze.getYearToDisplay().toString()).concat(' | KEY = ')
      .concat(maze.canPlayerUnlockDoors() ? '1' : '0').concat('/')
      .concat((maze.getDoors().length > 0) || (maze.getKeys().length > 0) ?
        '1' : '0');
  }

  drawSpringsUnderMouse(maze: Maze): void
  {
    if (!eventOccured)
    {
      let node: MazeNode = new MazeNode(Math.floor(mouseX / this.nodeSize),
        Math.floor(mouseY / this.nodeSize), maze.getViewer());
      if (maze.isSpring(node))
      {
        let linked: MazeNode = maze.getLinkedSpring(node);
        context.lineWidth = this.nodeSize / 5;
        let elapsedTime: number = Date.now() - time;
        if (elapsedTime > 1000)
        {
          time = Date.now();
          elapsedTime = 0;
        }
        if (elapsedTime < 500)
        {
          context.strokeStyle = 'rgba(220, 20, 60,'.concat(
            (elapsedTime / 500).toString()).concat(')');
        } else {
          context.strokeStyle = 'rgba(220, 20, 60,'.concat(
            ((1000 - elapsedTime) / 500).toString()).concat(')');
        }
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
    this.drawArrows(maze);
    this.drawPrincess(maze);
    this.drawLinkedSpring(maze);
    this.drawSpringsUnderMouse(maze);
    this.drawSolution(maze);
    this.drawDoors(maze);
    this.drawKey(maze);
    this.drawPlayer(maze);
    this.drawWalls(maze);
    this.drawText(maze);
  }
}
