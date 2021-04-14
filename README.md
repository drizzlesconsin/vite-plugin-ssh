# vite-plugin-ssh

[![NPM](https://img.shields.io/npm/v/vite-plugin-ssh)](https://github.com/drizzlesconsin/vite-plugin-ssh)
[![Build With tsup](https://img.shields.io/badge/build%20with-tsup-blue)](https://github.com/egoist/tsup)

> A vite ssh deploy plugin

## Install

With yarn

```bash
yarn add --dev vite-plugin-ssh
```

With npm

```
npm install --dev vite-plugin-ssh
```

## Usage

```ts
// vite.config.ts
import VitePluginSsh from 'vite-plugin-ssh'

export default defineConfig(() => {
  return {
    plugins: [
      VitePluginSsh({
        host: 'example.com',
        port: 22,
        username: 'username',
        password: 'password',
        // identity: '/path/to/privatekey',
        localPath: 'dist',
        remotePath: '/path/to/root',
        backupFiles: ['assets', 'index.html'], // or ['*']
      }),
    ],
  }
})
```

## [Options](https://github.com/drizzlesconsin/vite-plugin-ssh/blob/main/src/types.ts)

| Property             | Description                                                                            |    Type    |     Default      |
| :------------------- | :------------------------------------------------------------------------------------- | :--------: | :--------------: |
| host                 | Hostname or IP of the server                                                           |  `string`  |        -         |
| port                 | Port number of the server                                                              |  `number`  |       `22`       |
| username             | Username for authentication                                                            |  `string`  |        -         |
| password             | Password for connect to the remote server authentication                               |  `string`  |        -         |
| identity             | Use the private key to connect server, The path of private key file                    |  `string`  |        -         |
| localPath            | Local directory path to deployment files                                               |  `string`  |      `dist`      |
| remotePath           | Full path to the remote directory                                                      |  `string`  |        -         |
| maxBuffer            | The maxBuffer option specifies the largest number of bytes allowed on stdout or stderr |  `number`  |    `100*1024`    |
| backupFiles          | Backup the `{remotePath}` folder or files when you start the deployment                | `string[]` |        -         |
| backupFilenameFormat | Backup the timestamp of the filename                                                   |  `string`  | `YYYYMMDDHHmmss` |

## Example

```bash
$ cd example
$ yarn
$ yarn build
```

## Development

```bash
$ yarn
$ yarn dev
$ yarn build
```

## Questions & Suggestions

Please open an issue [here](https://github.com/drizzlesconsin/vite-plugin-ssh/issues?q=is%3Aopen).

## LICENSE

[MIT](https://github.com/drizzlesconsin/vite-plugin-ssh/blob/main/LICENSE)
