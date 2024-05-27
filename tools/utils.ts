export function groupBy<T, K extends string | number>(arr: T[], getKey: (item: T) => K) {
  return arr.reduce((acc, item) => {
    const key = getKey(item);
    if(!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(item);
    return acc;
  }, {} as Record<K, T[]>);
}

export function normalize(str: string) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
};
