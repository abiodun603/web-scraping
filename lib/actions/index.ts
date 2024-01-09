"use server"

import { revalidatePath } from "next/cache";
import Product from "../models/product.model";
import { scrapeAmazonProduct } from "../scraper"
import { connectToDB } from "../scraper/mongoose";
import { getAveragePrice, getHighestPrice, getLowestPrice } from "../utils";

export async function scapeAndStoreProduct(productUrl: string){
  if(!productUrl) return

  try {
    connectToDB();

    const scrapedProduct:any = await scrapeAmazonProduct(productUrl)

    if(!scrapedProduct) return;

    let product: any = scrapedProduct

    const existingProduct = await Product.findOne({url: scrapedProduct.url})

    if(existingProduct){
      const updatedPriceHistory: any = [
        ...existingProduct.priceHistory,
        { price: scrapedProduct.currentPrice}
      ]

      product={
        ...scrapedProduct,
        priceHistory: updatedPriceHistory,
        lowestPrice: getLowestPrice(updatedPriceHistory),
        highestPrice: getHighestPrice(updatedPriceHistory),
        averagePrice: getAveragePrice(updatedPriceHistory),
      }
    }

    const newProduct = await Product.findOneAndUpdate({url: scrapedProduct.url},
      product,
      {upsert: true, new: true}
    )
    
    revalidatePath(`/products/${newProduct._id}`);
  } catch (e: any) {
    throw new Error(`Failed to create/update product: ${e.message}`)
  }
}