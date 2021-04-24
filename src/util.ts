enum Level { STAIRS = 0, SPRINGS = 1, ICE = 2, ARROWS = 3, LENGTH = 4 };

/*
  https://stackoverflow.com/questions/3895478/does-javascript-have-a-method-like-range-to-generate-a-range-within-the-supp
*/
function range(start: number, stop: number, step: number = 1): Array<number>
{
  return Array(Math.ceil((stop - start) / step)).fill(start)
    .map((x, y) => x + y * step);
}

function getRandomInt(max: number): number
{
  return Math.floor(Math.random() * max);
}

/*
  https://stackoverflow.com/questions/54738221/typescript-array-find-possibly-undefind
*/
function ensure<T>(argument: T | undefined | null,
  message: string = 'This value was promised to be there.'): T
{
  if (argument === undefined || argument === null) {
    throw new TypeError(message);
  }
  return argument;
}

export { Level, range, getRandomInt, ensure };
