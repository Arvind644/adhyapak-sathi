import { put, del, list } from '@vercel/blob'

export async function uploadFile(file: File, pathname: string): Promise<string> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error('BLOB_READ_WRITE_TOKEN is not set')
  }

  const blob = await put(pathname, file, {
    access: 'public',
    token: process.env.BLOB_READ_WRITE_TOKEN,
  })

  return blob.url
}

export async function deleteFile(url: string): Promise<void> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error('BLOB_READ_WRITE_TOKEN is not set')
  }

  await del(url, {
    token: process.env.BLOB_READ_WRITE_TOKEN,
  })
}

export async function listFiles(prefix?: string) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error('BLOB_READ_WRITE_TOKEN is not set')
  }

  return list({
    prefix,
    token: process.env.BLOB_READ_WRITE_TOKEN,
  })
}

