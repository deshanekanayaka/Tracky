const HEADERS = [
  'Job Title', 'Company', 'Location',
  'Salary', 'URL', 'Date Applied', 'Status',
]

function getToken(interactive = true): Promise<string> {
  return new Promise((resolve, reject) => {
    chrome.identity.getAuthToken(
        { interactive, scopes: ['https://www.googleapis.com/auth/spreadsheets'] },
        (token) => {
          if (chrome.runtime.lastError || !token) {
            reject(new Error(chrome.runtime.lastError?.message ?? 'No token'))
          } else {
            resolve(token as string)
          }
        }
    )
  })
}

function revokeToken(token: string): Promise<void> {
  return new Promise((resolve) =>
      chrome.identity.removeCachedAuthToken({ token }, resolve)
  )
}

async function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const token = await getToken()
  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
    ...options.headers,
  }
  const res = await fetch(url, { ...options, headers })
  if (res.status === 401) {
    await revokeToken(token)
    const fresh = await getToken(false)
    return fetch(url, {
      ...options,
      headers: { ...headers, Authorization: `Bearer ${fresh}` },
    })
  }
  return res
}

export async function signIn(): Promise<void> {
  await getToken(true)
}

export async function appendRow(sheetId: string, values: string[]): Promise<void> {
  const url =
      `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}` +
      `/values/Applications!A1:append?valueInputOption=USER_ENTERED`
  const res = await authFetch(url, {
    method: 'POST',
    body: JSON.stringify({ values: [values] }),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Sheets append failed: ${res.status} — ${err}`)
  }
}

export async function checkDuplicate(
    sheetId: string,
    jobUrl: string
): Promise<boolean> {
  const res = await authFetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/Applications!E:E`
  )
  if (!res.ok) return false
  const data = await res.json() as { values?: string[][] }
  return (data.values ?? []).flat().includes(jobUrl)
}

export async function createSheet(title: string): Promise<{
  spreadsheetId: string
  spreadsheetUrl: string
}> {
  const res = await authFetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    body: JSON.stringify({
      properties: { title },
      sheets: [{
        properties: { title: 'Applications' },
        data: [{
          startRow: 0,
          rowData: [{
            values: HEADERS.map((v) => ({
              userEnteredValue: { stringValue: v },
              userEnteredFormat: { textFormat: { bold: true } },
            })),
          }],
        }],
      }],
    }),
  })
  if (!res.ok) throw new Error(`createSheet failed: ${res.status}`)
  return res.json()
}

export async function verifySheetAccess(sheetId: string): Promise<{
  canWrite: boolean
  title: string | null
}> {
  try {
    const metaRes = await authFetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}?fields=properties.title`
    )
    if (!metaRes.ok) return { canWrite: false, title: null }

    const meta = await metaRes.json() as { properties?: { title?: string } }
    const title = meta.properties?.title ?? null

    const writeRes = await authFetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/A1:append?valueInputOption=USER_ENTERED`,
        {
          method: 'POST',
          body: JSON.stringify({ values: [[]] }),
        }
    )

    return { canWrite: writeRes.ok, title }
  } catch {
    return { canWrite: false, title: null }
  }
}

// Writes headers to row 1 only if the sheet is completely empty.
// If the user already has data in row 1 we leave it untouched.
export async function ensureHeaders(sheetId: string): Promise<void> {
  const res = await authFetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/A1:G1`
  )
  if (!res.ok) return

  const data = await res.json() as { values?: string[][] }
  const firstRow = (data.values ?? [])[0] ?? []

  // Only write headers if row 1 is completely empty
  if (firstRow.length === 0) {
    await authFetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/A1:G1?valueInputOption=USER_ENTERED`,
        {
          method: 'PUT',
          body: JSON.stringify({ values: [HEADERS] }),
        }
    )
  }
}