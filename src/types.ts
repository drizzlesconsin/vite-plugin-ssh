export interface ViteSshPluginBaseOptions {
  /**
   * @description Hostname or IP of the server.
   */
  host: string
  /**
   * @default 22
   * @description Port number of the server.
   */
  port?: number
  /**
   * @description Username for authentication.
   */
  username: string
  /**
   * @description Password for connect to the remote server authentication.
   */
  password: string
  /**
   * @example '/path/to/privatekey'
   * @description Use the privatekey to connect server, The path of privatekey file.
   */
  identity: string
  /**
   * @default 'dist'
   * @description Local directory path to deployment files.
   */
  localPath?: string
  /**
   * @description Full path to the remote directory.
   */
  remotePath: string
  /**
   * @default 100 * 1024
   * @description The maxBuffer option specifies the largest number of bytes allowed on stdout or stderr.
   */
  maxBuffer?: number
  /**
   * @default No backup
   * @example ['*'] | ['assets', 'index.html']
   * @description If the value is `['*']`, Backup the {remotePath} all files, exclude the `*.tar`.
   * @description Backup the {remotePath} folder or files when you start the deployment.
   */
  backupFiles?: string[] & { 0: string }
  /**
   * @default 'YYYYMMDDHHmmss'
   * @description as `backup_20500823235900.tar`
   * @link https://day.js.org/docs/en/display/format#list-of-all-available-formats
   * @description Backup the timestamp of the filename.
   */
  backupFilenameFormat?: string
}

type RequireAtLeastOne<T, Keys extends keyof T = keyof T> = Pick<T, Exclude<keyof T, Keys>> &
  {
    [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>>
  }[Keys]

export type ViteSshPluginOptions = RequireAtLeastOne<ViteSshPluginBaseOptions, 'identity' | 'password'>
