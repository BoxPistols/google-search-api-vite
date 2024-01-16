// src/components/SearchForm.tsx
import React, { useState } from 'react'
import { TextField, Button } from '@mui/material'

type SearchFormProps = {
  onSearch: (apiKey: string, cx: string, query: string) => void
}

const SearchForm: React.FC<SearchFormProps> = ({ onSearch }) => {
  const [apiKey, setApiKey] = useState('')
  const [cx, setCx] = useState('')
  const [query, setQuery] = useState('')

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onSearch(apiKey, cx, query)
  }

  return (
    <form onSubmit={handleSubmit}>
      <TextField
        label='API Key'
        variant='outlined'
        value={apiKey}
        onChange={(e) => setApiKey(e.target.value)}
        style={{ marginRight: 8 }}
      />
      <TextField
        label='Search Engine ID'
        variant='outlined'
        value={cx}
        onChange={(e) => setCx(e.target.value)}
        style={{ marginRight: 8 }}
      />
      <TextField
        label='Search Query'
        variant='outlined'
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{ marginRight: 8 }}
      />
      <Button variant='contained' color='primary' type='submit'>
        Search
      </Button>
    </form>
  )
}

export default SearchForm
