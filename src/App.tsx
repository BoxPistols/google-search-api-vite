// import './App.css'

// src/App.tsx
import React, { useState } from 'react'
import SearchForm from './components/SearchForm'
import ResultsTable from './components/ResultsTable'
import { Container, Typography } from '@mui/material'
import { Analytics } from '@vercel/analytics/react'

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
      <Typography
        variant='h3'
        component='h1'
        mt={'4vw'}
        fontSize={'3vw'}
        fontWeight={'bold'}
        textAlign={'center'}
        color={'#3f51b5'}
      >
        Google Search Best 10
      </Typography>
      <Typography
        textAlign={'center'}
        variant='subtitle2'
        mt={1}
        color={'#abc'}
      >
        一日に使える検索回数には制限(50回/24時間)がありますので、ご注意ください。
      </Typography>

      <Container
        sx={{
          p: 2,
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
      <Analytics />
    </>
  )
}

export default App
