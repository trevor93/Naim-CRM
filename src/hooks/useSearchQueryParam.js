import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

/**
 * Page-level search state seeded from the `?q=` URL param.
 *
 * The global header search navigates to `/<page>?q=<term>`, so a page using
 * this hook lands already filtered on the item the user picked. Typing in the
 * page's own search box still works normally — the param is only read, never
 * written — and the hook re-syncs if a fresh global search arrives while the
 * user is already on this page.
 */
export default function useSearchQueryParam(paramName = 'q') {
  const [params] = useSearchParams()
  const fromUrl = params.get(paramName) || ''
  const [search, setSearch] = useState(fromUrl)

  useEffect(() => {
    if (fromUrl) setSearch(fromUrl)
  }, [fromUrl])

  return [search, setSearch]
}
