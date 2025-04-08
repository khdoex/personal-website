import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET() {
  const backgroundsDir = path.join(process.cwd(), 'public/backgrounds')
  const files = fs.readdirSync(backgroundsDir)
  
  // Filter only JPG files and remove Zone.Identifier files
  const images = files.filter(file => 
    (file.endsWith('.jpg') || file.endsWith('.jpeg')) && // Look for .jpg or .jpeg
    !file.includes('Zone.Identifier')
  )

  return NextResponse.json({ images })
} 