import { MazeNode } from './mazenode';
import { Maze } from './maze';

const NEW_FLOOR_REACHED: boolean = true;

export class FloorSaver
{
  protected floorBackup: number;
  protected visited: Array<MazeNode>;

  constructor()
  {
    this.floorBackup = 1;
    this.visited = [];
  }

  upgrade(maze: Maze): void
  {
    maze.incWidth();
    maze.incHeight();
    if (maze.incLevel() === NEW_FLOOR_REACHED)
    {
      this.floorBackup += 1;
    }
  }

  getBackup(): number
  {
    return this.floorBackup;
  }

  setBackup(backup: number): void
  {
    this.floorBackup = backup;
  }
}

export interface Builder
{
  init: (maze: Maze) => void;
  update: (maze: Maze) => void;
}
