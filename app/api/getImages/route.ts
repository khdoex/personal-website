import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET() {
  const backgroundsDir = path.join(process.cwd(), 'public/images/backgrounds')
  
  try {
    const files = fs.readdirSync(backgroundsDir)
    
    // Filter for image files (PNG, JPG, JPEG) and remove Zone.Identifier files
    const images = files.filter(file => 
      (file.endsWith('.png') || file.endsWith('.jpg') || file.endsWith('.jpeg')) && 
      !file.includes('Zone.Identifier') &&
      !file.startsWith('.')
    )

    return NextResponse.json({ images })
  } catch (error) {
    console.error('Error reading backgrounds directory:', error)
    // If directory doesn't exist or other error, return empty array
    return NextResponse.json({ images: [] })
  }
} 