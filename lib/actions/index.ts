"use server"

import { scrapeAmazonProduct } from "../scraper"

export async function scapeAndStoreProduct(productUrl: string){
  if(!productUrl) return

  try {
    const scrapedProduct = await scrapeAmazonProduct(productUrl)
  } catch (e: any) {
    throw new Error(`Failed to create/update product: ${e.message}`)
  }
}