"use server"

import { revalidatePath } from "next/cache";
import Product from "../models/product.model";
import { scrapeAmazonProduct } from "../scraper"
import { getAveragePrice, getHighestPrice, getLowestPrice } from "../utils";
import { connectToDB } from "../mongoose";
import { generateEmailBody, sendEmail } from "../nodemailer";

// ** Types 
import type {  User } from "@/types";

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
        { price: scrapedProduct.currentPrice }
      ]

      product = {
        ...scrapedProduct,
        priceHistory: updatedPriceHistory,
        lowestPrice: getLowestPrice(updatedPriceHistory),
        highestPrice: getHighestPrice(updatedPriceHistory),
        averagePrice: getAveragePrice(updatedPriceHistory),
      }
    }

    const newProduct = await Product.findOneAndUpdate(
      {url: scrapedProduct.url},
      product,
      {upsert: true, new: true}
    )
    
    revalidatePath(`/products/${newProduct._id}`);
  } catch (e: any) {
    throw new Error(`Failed to create/update product: ${e.message}`)
  }
}

export async function getAllProducts(){
  try {
    connectToDB();
    const products = await Product.find();

    return products;
  } catch (e: any) {
    console.log(e)
  }
}

export async function getSimilarProducts(productId: string){
  try {
    connectToDB();

    // fetch current product
    const currentProduct = await Product.findById(productId);

    if(!currentProduct) return null;

    const similarProducts = await Product.find({
      _id: {$ne: productId}
    }).limit(3)

    return similarProducts;
  } catch (e: any) {
    console.log(e)
  }
}

export async function getProductById(productId: string) {
  try {
    connectToDB();

    const product = await Product.findOne({ _id: productId });

    if(!product) return null;

    return product

  } catch (error) {
    console.log(error)
  }
}

export async function addUserEmailToProduct(productId: string, userEmail: string) {
  try {
    // Send our first email
    const product = await Product.findById(productId);
    if(!product) return ;

    const userExits = product.users.some((user: User) => user.email === userEmail);
    console.log(productId, userEmail, productId, userExits)
    if(!userExits) {
      product.users.push({ email: userEmail})

      await product.save();

      const emailContent = await generateEmailBody(product, "WELCOME");

      await sendEmail(emailContent, [userEmail]);
    }
  } catch (error) {
    console.log(error);
  }
}

