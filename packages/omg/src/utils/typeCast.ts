const typeCast = {
  int: (int: string): number => parseInt(int, 10),
  float: (float: string): number => parseFloat(float),
  string: (string: string): string => string,
  uuid: (uuid: string): string => uuid,
  list: (list: any): any[] => JSON.parse(list),
  map: (map: string): any => JSON.parse(map),
  object: (object: string): any => JSON.parse(object),
  boolean: (boolean: string): boolean => boolean === 'true',
  path: (entryPath: string): string => entryPath,
  any: (any: any): any => any,
}
export default typeCast
