// import './App.css'

// src/App.tsx
import React, { useState } from 'react'
import SearchForm from './components/SearchForm'
import ResultsTable from './components/ResultsTable'
import { Container, Typography } from '@mui/material'

const App: React.FC = () => {
  const [results, setResults] = useState([])

  const handleSearch = async (apiKey: string, cx: string, query: string) => {
    try {
      const response = await fetch(
        `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&q=${encodeURIComponent(
          query
        )}`
      )
      if (!response.ok) {
        throw new Error('Search API request failed')
      }
      const data = await response.json()
      setResults(data.items)
    } catch (error) {
      console.error('Error fetching search results:', error)
    }
  }

  return (
    <>
      <Typography variant='h3' color='initial' component='h1' m={'4vw'}>
        Google Custom Search API
      </Typography>
      <Container
        sx={{
          p: 4,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          alignItems: 'flex-end',
          boxShadow: '2px 2px 4px rgba(0, 0, 0, 0.2)',
          border: '1px solid #ececec',
          borderRadius: 4,
          margin: '2vw auto'
        }}
      >
        <SearchForm onSearch={handleSearch} />
        <ResultsTable results={results} />
      </Container>
    </>
  )
}

export default App
