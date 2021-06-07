export enum Level { STAIRS = 0, SPRINGS = 1, ICE = 2, ARROWS = 3,
  PORTALS = 4, QUEENS = 5, LENGTH = 6 };

/*
  https://stackoverflow.com/questions/3895478/does-javascript-have-a-method-like-range-to-generate-a-range-within-the-supp
*/
export function range(start: number, stop: number, step: number = 1): Array<number>
{
  return Array(Math.ceil((stop - start) / step)).fill(start)
    .map((x, y) => x + y * step);
}

export function getRandomInt(max: number): number
{
  return Math.floor(Math.random() * max);
}

/*
  https://stackoverflow.com/questions/54738221/typescript-array-find-possibly-undefind
*/
export function ensure<T>(argument: T | undefined | null,
  message: string = 'This value was promised to be there.'): T
{
  if (argument === undefined || argument === null) {
    throw new TypeError(message);
  }
  return argument;
}

export function shuffle<T>(array: Array<T>)
{
  let j: number;
  let tmp: T;
  let i: number;
  for (i = array.length - 1; i > 0; i--)
  {
    j = Math.floor(Math.random() * (i + 1));
    tmp = array[i];
    array[i] = array[j];
    array[j] = tmp;
  }
  return array;
}
