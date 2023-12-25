import axios from "axios";

export async function scrapeAmazonProduct(url: string){
  if(!url) return;

  // curl --proxy brd.superproxy.io:22225 --proxy-user brd-customer-hl_b0cd4f82-zone-pricewise:k7hdrt64fb46 -k https://lumtest.com/myip.json

  //  BrightData Proxy Configuration
  const username = String(process.env.BRIGHT_DATA_USERNAME)
  const password = String(process.env.BRIGHT_DATA_PASSWORD)
  const port = 22225
  const session_id = (1000000 * Math.random()) | 0

  const options = {
    auth: {
      username: `${username}-session-${session_id}`,
      password,
    },
    host: "brd.superproxy.io",
    port,
    rejectUnauthorized: false,
  }

  try {
    //Fetch the prduct page
    const response = await axios.get(url, options)
  } catch (error: any) {
    throw new Error(`Failed to scrape product ${error.message}`)
  }
}

// Cherrio is a fast and eligant library to parsing and manipulating HTML and XML 