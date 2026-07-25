import { beforeEach, describe, expect, it, vi } from 'vitest'
import { _resetConnectionForTests } from './connection.js'
import { addWord, getWordsByTheme } from './wordsRepo.js'
import { getSetting } from './settingsRepo.js'
import {
  BACKUP_NUDGE_DAYS,
  LAST_BACKUP_KEY,
  findBackupFileId,
  getAuthToken,
  restoreBackup,
  shouldNudgeBackup,
  uploadBackup,
} from './driveSync.js'

const TOKEN = 'ya29.test-token'

function mockIdentity({ token = TOKEN, throws = false } = {}) {
  const removeCachedAuthToken = vi.fn(() => Promise.resolve())
  global.chrome = {
    identity: {
      getAuthToken: vi.fn(() => (throws ? Promise.reject(new Error('no consent')) : Promise.resolve({ token }))),
      removeCachedAuthToken,
    },
  }
  return { removeCachedAuthToken }
}

/** A fetch that answers the list call, then whatever the test needs next. */
function mockDrive({ fileId = null, then = { ok: true, json: () => Promise.resolve({}) } } = {}) {
  const calls = []
  const fetchImpl = vi.fn((url, init) => {
    calls.push({ url, init })
    // The upload endpoint also contains "/drive/v3/files", so the list
    // call is identified by NOT being under /upload/.
    if (!String(url).includes('/upload/') && String(url).includes('/drive/v3/files?')) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve({ files: fileId ? [{ id: fileId }] : [] }) })
    }
    return Promise.resolve(then)
  })
  return { fetchImpl, calls }
}

beforeEach(() => {
  indexedDB = new IDBFactory()
  _resetConnectionForTests()
  mockIdentity()
})

describe('getAuthToken', () => {
  it('unwraps the MV3 object result', async () => {
    expect(await getAuthToken()).toBe(TOKEN)
  })

  it('returns null instead of throwing when consent is declined or unconfigured', async () => {
    mockIdentity({ throws: true })
    expect(await getAuthToken({ interactive: true })).toBeNull()
  })

  it('checks silently by default, so settings can render without a popup', async () => {
    await getAuthToken()
    expect(chrome.identity.getAuthToken).toHaveBeenCalledWith({ interactive: false })
  })
})

describe('findBackupFileId', () => {
  it('searches only the hidden app data folder', async () => {
    const { fetchImpl, calls } = mockDrive({ fileId: 'file-1' })
    expect(await findBackupFileId(TOKEN, fetchImpl)).toBe('file-1')
    expect(calls[0].url).toContain('spaces=appDataFolder')
    expect(calls[0].init.headers.Authorization).toBe(`Bearer ${TOKEN}`)
  })

  it('returns null when nothing has been backed up yet', async () => {
    const { fetchImpl } = mockDrive({ fileId: null })
    expect(await findBackupFileId(TOKEN, fetchImpl)).toBeNull()
  })

  it('surfaces a failed listing rather than pretending there is no backup', async () => {
    const fetchImpl = vi.fn(() => Promise.resolve({ ok: false, status: 500 }))
    await expect(findBackupFileId(TOKEN, fetchImpl)).rejects.toThrow(/500/)
  })
})

describe('uploadBackup', () => {
  it('creates the file the first time, inside appDataFolder', async () => {
    await addWord({ themeId: 'russian', term: 'товарищ', translation: 'comrade' })
    const { fetchImpl, calls } = mockDrive({ fileId: null })

    const result = await uploadBackup(fetchImpl)
    expect(result.words).toBe(1)

    const upload = calls.at(-1)
    expect(upload.init.method).toBe('POST')
    expect(upload.url).toContain('uploadType=multipart')
    expect(upload.init.body).toContain('appDataFolder')
    expect(upload.init.body).toContain('товарищ')
  })

  it('replaces the existing backup instead of accumulating copies', async () => {
    await addWord({ themeId: 'russian', term: 'шпион', translation: 'spy' })
    const { fetchImpl, calls } = mockDrive({ fileId: 'file-1' })

    await uploadBackup(fetchImpl)
    const upload = calls.at(-1)
    expect(upload.init.method).toBe('PATCH')
    expect(upload.url).toContain('/file-1?')
  })

  it('records when the backup happened, for the staleness nudge', async () => {
    const { fetchImpl } = mockDrive()
    await uploadBackup(fetchImpl)
    expect(await getSetting(LAST_BACKUP_KEY, '')).toBeTruthy()
  })

  it('clears the cached token on a 401 so the retry can re-prompt', async () => {
    const { removeCachedAuthToken } = mockIdentity()
    const { fetchImpl } = mockDrive({ then: { ok: false, status: 401 } })
    await expect(uploadBackup(fetchImpl)).rejects.toThrow(/expired/)
    expect(removeCachedAuthToken).toHaveBeenCalledWith({ token: TOKEN })
  })

  it('refuses clearly when the account is not connected', async () => {
    mockIdentity({ throws: true })
    await expect(uploadBackup(mockDrive().fetchImpl)).rejects.toThrow(/not connected/)
  })
})

describe('restoreBackup', () => {
  it('pulls the cloud archive into this device', async () => {
    const payload = {
      version: 1,
      words: [{ themeId: 'french', term: 'liberté', translation: 'liberty', interval: 0, dueDate: new Date().toISOString(), struggling: false }],
      progress: [],
    }
    const { fetchImpl } = mockDrive({ fileId: 'file-1', then: { ok: true, json: () => Promise.resolve(payload) } })

    const { wordsImported } = await restoreBackup(fetchImpl)
    expect(wordsImported).toBe(1)
    expect((await getWordsByTheme('french'))[0].term).toBe('liberté')
  })

  it('says so plainly when the account has no backup', async () => {
    const { fetchImpl } = mockDrive({ fileId: null })
    await expect(restoreBackup(fetchImpl)).rejects.toThrow(/No cloud backup/)
  })

  it('is additive — it never deletes what is already on this device', async () => {
    await addWord({ themeId: 'french', term: 'terreur', translation: 'terror' })
    const payload = {
      version: 1,
      words: [{ themeId: 'french', term: 'liberté', translation: 'liberty', interval: 0, dueDate: new Date().toISOString(), struggling: false }],
      progress: [],
    }
    const { fetchImpl } = mockDrive({ fileId: 'file-1', then: { ok: true, json: () => Promise.resolve(payload) } })

    await restoreBackup(fetchImpl)
    expect((await getWordsByTheme('french')).map((w) => w.term).sort()).toEqual(['liberté', 'terreur'])
  })
})

describe('shouldNudgeBackup', () => {
  it('stays quiet until there is an archive worth losing', async () => {
    expect(await shouldNudgeBackup(5)).toBe(false)
  })

  it('nudges an unbacked-up archive, then goes quiet once backed up', async () => {
    expect(await shouldNudgeBackup(50)).toBe(true)
    const { fetchImpl } = mockDrive()
    await uploadBackup(fetchImpl)
    expect(await shouldNudgeBackup(50)).toBe(false)
  })

  it('speaks up again once the backup is stale', async () => {
    const { fetchImpl } = mockDrive()
    await uploadBackup(fetchImpl)
    const later = new Date(Date.now() + (BACKUP_NUDGE_DAYS + 1) * 86_400_000)
    expect(await shouldNudgeBackup(50, later)).toBe(true)
  })
})
