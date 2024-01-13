import { NextResponse } from "next/server";

import Product from "@/lib/models/product.model";
import { connectToDB } from "@/lib/mongoose";
import { generateEmailBody, sendEmail } from "@/lib/nodemailer";
import { scrapeAmazonProduct } from "@/lib/scraper";
import { getAveragePrice, getEmailNotifType, getHighestPrice, getLowestPrice } from "@/lib/utils";

export const maxDuration = 5; // This function can run for a maximum of 300 seconds
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request){

  try {
    connectToDB();

    // ** find all prouducts
    const products = await Product.find()
    
    if(!products) throw new Error("No Product found")

    // 1. Scrape latest product and update DB
    /** 
     * promise.all because we want to call multiple asychronous actions at the sane time
     * we aant to access all products in our database at the same time
    **/
    const updatedProducts = await Promise.all(
      products.map(async (currentProduct) => {
        const scrapedProduct = await scrapeAmazonProduct(currentProduct.url);

        if(!scrapedProduct) throw new Error("No product found!!!")

        const updatedPriceHistory = [
          ...currentProduct.priceHistory,
          {price: scrapedProduct.currentPrice}
        ]

        const product = {
          ...scrapedProduct,
          priceHistory: updatedPriceHistory,
          lowestPrice: getLowestPrice(updatedPriceHistory),
          highestPrice: getHighestPrice(updatedPriceHistory),
          averagePrice: getAveragePrice(updatedPriceHistory),
        }

        const updatedProduct = await Product.findOneAndUpdate(
          {url: product.url},
          product
        );

        // ** Check each product status and send email accordingly
        const emailNotifType = getEmailNotifType(scrapedProduct, currentProduct);
        
        // send immediately if the updated product have a user
        if(emailNotifType && updatedProduct.users.length > 0) {

          const prodcutInfo = {
            title: updatedProduct.title,
            url: updatedProduct.url,
          }
          // Construct emailContent
          const emailContent = await generateEmailBody(prodcutInfo, emailNotifType)
          // Get array of user emails
          const userEmails = updatedProduct.users.map((user: any) => user.email)

          await sendEmail(emailContent, userEmails)
        }

        return updatedProduct;
      })
    )

    return NextResponse.json({
      message: 'ok',
      data: updatedProducts
    })

  } catch (error) {
    
  }
}