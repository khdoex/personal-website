import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET() {
  const backgroundsDir = path.join(process.cwd(), 'public/images/backgrounds')
  

  try {
    const files = fs.readdirSync(backgroundsDir)
    
    // Filter only PNG files and remove Zone.Identifier files
    const images = files.filter(file => 
      file.endsWith('.png') && !file.includes('Zone.Identifier')
    )


    return NextResponse.json({ images })
  } catch (error) {
    // If directory doesn't exist or other error, return empty array
    return NextResponse.json({ images: [] })
  }
} 