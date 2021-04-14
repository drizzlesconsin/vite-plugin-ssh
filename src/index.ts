import type { Plugin } from 'vite'
import fs from 'fs'
import util from 'util'
import chalk from 'chalk'
import dayjs from 'dayjs'
import SSH2Promise from 'ssh2-promise'
import childProcess from 'child_process'
import type { ViteSshPluginOptions } from './types'
import type BaseSFTP from 'ssh2-promise/dist/BaseSFTP'

const childProcessExec = util.promisify(childProcess.exec)

export default function vitePluginSsh(pluginOptions: ViteSshPluginOptions): Plugin {
  return {
    name: 'vite-plugin-ssh',
    apply: 'build',
    enforce: 'post',
    closeBundle: async () => {
      const options: ViteSshPluginOptions = {
        port: 22,
        maxBuffer: 100 * 1024,
        localPath: 'dist',
        backupFilenameFormat: 'YYYYMMDDHHmmss',
        ...pluginOptions,
      }

      if (!options.host || !options.username || (!options.password && !options.identity) || !options.remotePath) {
        throw new Error('Please read README.md')
      }

      if (options.identity && !fs.existsSync(options.identity)) {
        throw new Error('The private key path does not exist.')
      }

      const startTime = new Date().getTime()
      const ssh = new SSH2Promise({
        host: options.host,
        port: options.port,
        username: options.username,
        password: options.password,
        identity: options.identity,
      })
      const sftp = ssh.sftp()

      console.info(chalk.blue(`Start connecting...`))
      await ssh.connect().then(() => {
        console.info(chalk.green(`Connection established.`))
      })

      await execLocalZip(options.localPath, options.maxBuffer)

      if (options.backupFiles && options.backupFiles.length > 0) {
        const backupFiles = await checkBackupFiles(sftp, options.remotePath, options.backupFiles)
        if (backupFiles) {
          await execBackupRemote({
            ssh,
            remotePath: options.remotePath,
            backupFiles: backupFiles,
            backupFilenameFormat: options.backupFilenameFormat as string,
          })
        } else {
          console.info(`${chalk.yellow('Warning:')} Backup fail! Can't find backup file.`)
        }
      }

      await execUpload(sftp, options.remotePath)

      await execUnzipRemote(ssh, options.remotePath)

      await deleteLocalZip()

      await ssh.close()
      console.info(`Connection: close.`)
      console.info(chalk.gray(`Time: ${new Date().getTime() - startTime}ms.`))
    },
  }
}

export async function execLocalZip(
  localPath: ViteSshPluginOptions['localPath'],
  maxBuffer: ViteSshPluginOptions['maxBuffer']
) {
  try {
    const cmd = `tar -zcvf deploy.tar -C ${localPath} .`
    await childProcessExec(cmd, { maxBuffer: maxBuffer })
    console.info(chalk.gray(` > ${cmd}`))
    console.info(chalk.green(`Local zip completed.`))
  } catch (err) {
    console.info(chalk.red(`Local zip fail.`), err)
  }
}

/**
 * @description Returns not existent files
 */
export async function checkBackupFiles(
  sftp: BaseSFTP,
  remotePath: string,
  backupFiles: Required<ViteSshPluginOptions>['backupFiles']
): Promise<false | Required<ViteSshPluginOptions>['backupFiles']> {
  try {
    const remoteFiles = await sftp.readdir(remotePath)

    if (remoteFiles.length && backupFiles.includes('*')) {
      return remoteFiles
        .filter((file: any) => !/backup_[\s\S]*\.tar/.test(file.filename))
        .map((file: any) => file.filename)
    }

    if (
      backupFiles.length &&
      remoteFiles.length &&
      backupFiles.every((item: any) => remoteFiles.some((file: any) => file.filename === item))
    ) {
      return backupFiles
    }
    return false
  } catch (err) {
    console.info(chalk.red(`Remote server cannot find ${remotePath}, or All configured authentication methods failed`))
    return false
  }
}

export async function execBackupRemote(
  options: Pick<Required<ViteSshPluginOptions>, 'remotePath' | 'backupFiles' | 'backupFilenameFormat'> & {
    ssh: SSH2Promise
  }
) {
  const files = options.backupFiles.join(' ')
  const backupFileName = `backup_${dayjs().format(options.backupFilenameFormat)}.tar`
  try {
    const cmd = [
      // Go to remote dir
      `cd ${options.remotePath}`,
      // Backup remote files
      `tar -zcvf ${backupFileName} ${files}`,
      // Remove remote files
      `rm -rf ${files}`,
    ].join(' && ')
    console.info(chalk.gray(` > ${cmd}`))
    const execRemote = await options.ssh.exec(cmd)
    !!execRemote && console.info(chalk.green(`Backup completed. ${options.remotePath}/${backupFileName}`))
    return true
  } catch (err) {
    console.info(chalk.red(`Backup fail.`))
    return false
  }
}

export async function execUpload(sftp: BaseSFTP, remotePath: ViteSshPluginOptions['remotePath']) {
  try {
    console.info(chalk.blue(`Start uploading...`))
    console.info(`Upload to remote server path: ${remotePath}`)
    await sftp.fastPut(`./deploy.tar`, `${remotePath}/deploy.tar`)
    console.info(chalk.green('Uploaded completed.'))
    return true
  } catch (err) {
    console.info(chalk.red(`Upload failed: Remote directory ${chalk.yellow(remotePath)} does not exist.`))
    return false
  }
}

export async function execUnzipRemote(ssh: SSH2Promise, remotePath: ViteSshPluginOptions['remotePath']) {
  try {
    const cmd = [
      // Go to remote dir
      `cd ${remotePath}`,
      // Unzip remote
      `tar -zxvf ./deploy.tar`,
      // Clean deploy
      `rm ./deploy.tar`,
    ].join(' && ')
    console.info(chalk.gray(` > ${cmd}`))
    const execRemote = await ssh.exec(cmd)
    !!execRemote && console.info(chalk.green(`Unzip completed.`))
    return true
  } catch {
    console.info(chalk.red(`Unzip fail.`))
    return false
  }
}

export async function deleteLocalZip() {
  try {
    console.info(chalk.blue(`Start clean local deploy.tar`))
    const cmd = process.platform === 'win32' ? 'del deploy.tar' : 'rm deploy.tar'
    console.info(chalk.gray(` > ${cmd}`))
    await childProcessExec(cmd)
    console.info(chalk.green(`Clean local file completed.`))
  } catch (err) {}
}
