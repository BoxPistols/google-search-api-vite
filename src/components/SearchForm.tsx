// src/components/SearchForm.tsx
import React, { useState } from 'react'
import { TextField, Button, Box } from '@mui/material'

type SearchFormProps = {
  onSearch: (apiKey: string, cx: string, query: string) => void
}
// https://ja.vitejs.dev/guide/env-and-mode.html

const SearchForm: React.FC<SearchFormProps> = ({ onSearch }) => {
  const apiKey = import.meta.env.VITE_GOOGLE_API_KEY
  const cx = import.meta.env.VITE_GOOGLE_SEARCH_ID
  const [query, setQuery] = useState('')

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onSearch(apiKey, cx, query)
  }

  return (
    <form onSubmit={handleSubmit}>
      <Box
        sx={{
          display: 'grid',
          gap: '10px',
          gridTemplateColumns: '1fr 120px',
          padding: 2,
          marginBottom: 2,
          borderRadius: 1,

          '@media (max-width: 600px)': {
            gridTemplateColumns: '1fr',
            justifyContent: 'center',
            alignItems: 'center',
          },
        }}
      >
        <TextField
          label="Search Query"
          variant="outlined"
          value={query}
          fullWidth
          onChange={(e) => setQuery(e.target.value)}
          sx={{
            mr: 4,
            // minWidth: '100%',
            // maxWidth: '100%',
            minWidth: '32em',
            maxWidth: '80vw',
            width: '100%',
            '@media (max-width: 768px)': {
              minWidth: 'auto',
              maxWidth: 'auto',
              width: '100%',
              mr: 0,
            },
          }}
        />
        <Button variant="contained" color="primary" type="submit" size="large">
          Search
        </Button>
      </Box>
    </form>
  )
}

export default SearchForm
