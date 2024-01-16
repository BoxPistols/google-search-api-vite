// import './App.css'

// src/App.tsx
import React, { useState } from 'react'
import SearchForm from './components/SearchForm'
import ResultsTable from './components/ResultsTable'

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
    <div>
      <SearchForm onSearch={handleSearch} />
      <ResultsTable results={results} />
    </div>
  )
}

export default App
