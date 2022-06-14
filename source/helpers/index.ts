let lastId = 0;

export function createId() {
  lastId += 1;

  return `${lastId}`;
}
