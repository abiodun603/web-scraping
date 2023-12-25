"use client"

import { FormEvent, useState } from 'react'

const isValidAmazonProductUrl = (url: string) => {
  try{
    const parsedURL = new URL(url)
    const hostname = parsedURL.hostname

    // Check if hostname contains amazon.com or amazon ...
    if(hostname.includes("amazon.com") || hostname.includes("amazon.") || hostname.endsWith("amazon")){
      return true
    }
  }catch(e){
    return false
  }
}

const Searchbar = () => {
  const [searchPrompt, setSearchPrompt] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    const isValidLink = isValidAmazonProductUrl(searchPrompt)

    alert(isValidLink ? 'Valid link' : 'Invalid link')
    if(!isValidLink) return alert("Please provide a valid Amazon link")

    try {
      setIsLoading(true)
    }catch(e) {
      setIsLoading(false)
    }

  }

  return (
    <form className='flex flex-wrap gap-4 mt-12' onSubmit={handleSubmit}>
      <input 
        type={"text"}
        placeholder='Enter product link' 
        className='searchbar-input' 
        value={searchPrompt}
        onChange={(e) => setSearchPrompt(e.target.value)} 
      />
      <button 
        type='submit' 
        className="searchbar-btn"
        disabled={searchPrompt === ''}
      >
        {isLoading ? "Searching..." : "Search"}
      </button>
    </form>
  )
}

export default Searchbar