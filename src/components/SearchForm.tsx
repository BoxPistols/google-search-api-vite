// src/components/SearchForm.tsx
import React, { useState } from 'react'
import { TextField, Button } from '@mui/material'

type SearchFormProps = {
  onSearch: (apiKey: string, cx: string, query: string) => void
}

// https://ja.vitejs.dev/guide/env-and-mode.html

const SearchForm: React.FC<SearchFormProps> = ({ onSearch }) => {
  const apiKey = import.meta.env.VITE_GOOGLE_API_KEY
  const cx = import.meta.env.VITE_GOOGLE_SEARCH_ID
  // import.meta.env.VITE_GOOGLE_API_KEY
  // const [apiKey, setApiKey] = useState('')
  // const [cx, setCx] = useState('')
  const [query, setQuery] = useState('')

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onSearch(apiKey, cx, query)
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: 'grid',
        gap: '10px',
        gridTemplateColumns: '1fr 120px',
        // backgroundColor: '#f9f9f9',
        padding: 12,
        marginBottom: 8,
        // boxShadow: '2px 2px 4px rgba(0, 0, 0, 0.2)',
        borderRadius: 4,
        border: '1px solid #ececec'
      }}
    >
      {/* <TextField
        label='API Key'
        variant='outlined'
        value={apiKey}
        placeholder='Google API Key'
        // onChange={(e) => setApiKey(e.target.value)}
        style={{ marginRight: 8 }}
      />
      <TextField
        label='Search Engine ID'
        variant='outlined'
        placeholder='Google Search Engine ID'
        value={cx}
        // onChange={(e) => setCx(e.target.value)}
        style={{ marginRight: 8 }}
      /> */}
      <TextField
        label='Search Query'
        variant='outlined'
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{ marginRight: 8 }}
        sx={{
          minWidth: 320,
          maxWidth: 800,
          width: '100%'
        }}
      />
      <Button variant='contained' color='primary' type='submit' size='large'>
        Search
      </Button>
    </form>
  )
}

export default SearchForm
