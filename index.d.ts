declare module "orm-logs-module" {

    export const LEVELS: {
      VERBOSE: number,
      INFO: number,
      WARN: number,
      ERROR: number,
      CRITICAL: number,
      OUTAGE: number
    };

    export function init(processName: any, hostLocation: any): void;

    export function getLevelNameByValue(value: any): any;

    export function log(msg: any, options?: { level?: any, tags?: any }): void;

  }