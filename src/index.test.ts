import { checkBackupFiles, deleteLocalZip, execBackupRemote, execLocalZip, execUnzipRemote, execUpload } from './index'

import SSH2Promise from 'ssh2-promise'
import fs from 'fs'

describe('VitePluginSsh', () => {
  test('execLocalZip', async () => {
    await execLocalZip('./src', 20 * 1024)
    expect(fs.existsSync('./deploy.tar')).toBe(true)
  })

  const ssh = new SSH2Promise({
    host: 'example.com',
    port: 22,
    username: 'root',
    identity: '/path/to/privatekey',
  })
  const sftp = ssh.sftp()

  test('checkBackupFiles notfound', async () => {
    const resultNotfound = await checkBackupFiles(sftp, '/root/html/notfound', ['*'])
    expect(resultNotfound).toBe(false)
  })

  test('checkBackupFiles notfound file', async () => {
    const file = await checkBackupFiles(sftp, '/root/html', ['notfound.ts'])
    expect(file).toBe(false)
  })

  test('checkBackupFiles all files', async () => {
    const allFiles = await checkBackupFiles(sftp, '/root/html', ['*'])
    allFiles && expect(allFiles?.length > 0).toBe(true)
  })

  test('checkBackupFiles specific files', async () => {
    const specificFiles = await checkBackupFiles(sftp, '/root/html', ['index.test.ts', 'index.ts', 'types.ts'])
    specificFiles && expect(specificFiles?.length === 3).toBe(true)
  })

  test('execBackupRemote', async () => {
    await execBackupRemote({
      ssh,
      remotePath: '/root/html',
      backupFiles: ['index.test.ts', 'index.ts', 'types.ts'],
      backupFilenameFormat: 'YYYYMMDDHHmmss',
    })
    expect(fs.existsSync('./index.test.ts')).toBe(false)
    expect(fs.existsSync('./index.ts')).toBe(false)
    expect(fs.existsSync('./types.ts')).toBe(false)
  })

  test('execBackupRemote notfound', async () => {
    const result = await execBackupRemote({
      ssh,
      remotePath: '/root/html',
      backupFiles: ['index.test.ts', 'index.ts', 'types.ts'],
      backupFilenameFormat: 'YYYYMMDDHHmmss',
    })
    expect(result).toBe(false)
  })

  test('execUpload', async () => {
    await execUpload(sftp, '/root/html')
    const deployTar = await sftp.getStat('/root/html/deploy.tar')
    expect(deployTar?.size > 0).toBe(true)
  })

  test('execUpload notfound', async () => {
    const result = await execUpload(sftp, '/root/html/notfound')
    expect(result).toBe(false)
  })

  test('execUnzipRemote', async () => {
    await execUnzipRemote(ssh, '/root/html')
    const remoteFiles = await sftp.readdir('/root/html')
    expect(remoteFiles.some((file: any) => file.filename === 'deploy.tar')).toBe(false)
  })

  test('execUnzipRemote notfound', async () => {
    const result = await execUnzipRemote(ssh, '/root/html/notfound')
    expect(result).toBe(false)
    ssh.close()
  })

  test('deleteLocalZip', async () => {
    await deleteLocalZip()
    expect(fs.existsSync('./deploy.tar')).toBe(false)
  })
})
