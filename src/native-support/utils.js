import { app } from 'electron'
import * as fs from 'fs'
import { promisify } from 'util'

export function getDataPath(escape = false) {
  const ret = app.getPath('userData')
  if (!escape) {
      return ret
  }
  return ret.replace(/ /g, '\\ ')
}

export function curry(fn, args) {
  if (args && args.length === fn.length + 1) {
      fn.apply(fn, args)
  }
  return function() {
      const argsInArray = Array.prototype.slice.call(arguments, 0)
      return curry(fn, argsInArray.concat(args))
  }
}

export function isElectronDebug() {
  return process.env.NODE_ENV === 'development'
}

export const mkDir = promisify(fs.mkdir)