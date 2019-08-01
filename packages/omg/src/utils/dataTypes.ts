const dataTypes = {
  int: (int: string): boolean => {
    return int.toString().match(/^[-+]?\d+$/) !== null
  },
  float: (float: string): boolean => {
    return (
      !Number.isNaN(parseFloat(float)) &&
      parseFloat(float)
        .toString()
        .indexOf('.') !== -1
    )
  },
  string: (string: string): boolean => {
    return true
  },
  uuid: (uuid: string): boolean => {
    return uuid.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/) !== null
  },
  list: (list: string): boolean => {
    try {
      return (Array.isArray(list) && typeof list === 'object') || JSON.parse(list).toString() !== '[object Object]'
    } catch (e) {
      return false
    }
  },
  map: (map: string): boolean => {
    try {
      return (!Array.isArray(map) && typeof map === 'object') || JSON.parse(map).toString() === '[object Object]'
    } catch (e) {
      return false
    }
  },
  object: (object: string): boolean => {
    try {
      return (!Array.isArray(object) && typeof object === 'object') || JSON.parse(object).toString() === '[object Object]'
    } catch (e) {
      return false
    }
  },
  boolean: (boolean: string): boolean => {
    return boolean === 'false' || boolean === 'true'
  },
  path: (entryPath: string): boolean => {
    try {
      JSON.parse(entryPath)
      return false
    } catch (e) {
      const lastChar = entryPath.substr(entryPath.length - 1)
      if (lastChar === '/') {
        return false
      }
      return typeof entryPath === 'string'
    }
  },
  any: (any: string): boolean => {
    return true
  },
}

export default dataTypes
