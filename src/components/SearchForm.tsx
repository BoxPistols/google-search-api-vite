// src/components/SearchForm.tsx
import { useState } from 'react'
import type { FormEvent } from 'react'
import { TextField, Button, Box } from '@mui/material'
import theme from '../util/theme'

type SearchFormProps = {
    onSearch: (apiKey: string, cx: string, query: string) => void
}
// https://ja.vitejs.dev/guide/env-and-mode.html

const SearchForm = ({ onSearch }: SearchFormProps) => {
    const apiKey = import.meta.env.VITE_GOOGLE_API_KEY
    const cx = import.meta.env.VITE_GOOGLE_SEARCH_ID

    // デバッグ用のコンソールログ

    console.log(
        'API Key length:',
        typeof apiKey === 'string' ? apiKey.length : 'undefined'
    )
    console.log(
        'Search ID length:',
        typeof cx === 'string' ? cx.length : 'undefined'
    )

    const [query, setQuery] = useState('')

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        // apiKeyとcxが文字列であることを確認してから渡す
        if (typeof apiKey === 'string' && typeof cx === 'string') {
            onSearch(apiKey, cx, query)
        } else {
            console.error('API KeyまたはSearch IDが設定されていません')
        }
    }

    return (
        // 未入力であればSubmitさせない
        <form
            onSubmit={handleSubmit}
            aria-required='true'
            style={{
                whiteSpace: 'nowrap',
                width: '90%',
                margin: '0 auto',
            }}
        >
            <Box
                sx={{
                    flexGlow: 1,
                    display: 'grid',
                    gap: '10px',
                    gridTemplateColumns: '1fr 120px',
                    padding: 1,
                    marginBottom: 1,
                    borderRadius: 1,
                    '@media (max-width: 960px)': {
                        display: 'flex',
                        flexDirection: 'column',
                        px: 0,
                        py: 1,
                    },
                }}
            >
                <TextField
                    label='Google 検索キーワード'
                    placeholder='キーワードA キーワードB'
                    variant='outlined'
                    value={query}
                    fullWidth
                    onChange={(e) => setQuery(e.target.value)}
                    sx={{
                        mr: 4,
                        minWidth: '40em',
                        maxWidth: '80vw',
                        width: '100%',
                        '.MuiOutlinedInput-root': {
                            borderRadius: 8,
                            borderColor: theme.palette.grey[300],
                            backgroundColor: '#fff',
                            padding: '0 0.75em',
                        },
                        '@media (max-width: 960px)': {
                            minWidth: 'auto',
                            maxWidth: 'auto',
                            width: '100%',
                            mr: 0,
                        },
                    }}
                />
                {/* 未入力であればSubmitさせない */}
                <Button
                    aria-label='検索開始'
                    variant='contained'
                    color='primary'
                    type='submit'
                    disabled={query === ''}
                    sx={{
                        '@media (max-width: 960px)': {
                            minWidth: 'auto',
                            maxWidth: 'auto',
                            width: '100%',
                        },
                    }}
                >
                    {query === '' ? '検索入力待ち' : '検索開始'}
                </Button>
            </Box>
        </form>
    )
}

export default SearchForm
