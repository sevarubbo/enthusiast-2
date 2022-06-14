const lastId = 0;

export function createId() {
  return `${lastId + 1}`;
}
