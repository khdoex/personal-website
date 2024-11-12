import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET() {
  const backgroundsDir = path.join(process.cwd(), 'public/backgrounds')
  const files = fs.readdirSync(backgroundsDir)
  
  // Filter only PNG files and remove Zone.Identifier files
  const images = files.filter(file => 
    file.endsWith('.png') && !file.includes('Zone.Identifier')
  )

  return NextResponse.json({ images })
} 