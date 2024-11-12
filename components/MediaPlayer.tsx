"use client";

import ReactPlayer from 'react-player'

interface MediaProps {
  url: string;
  type: 'video' | 'audio';
}

export const MediaPlayer = ({ url, type }: MediaProps) => {
  return (
    <ReactPlayer
      url={url}
      controls
      width="100%"
      height={type === 'video' ? '360px' : '50px'}
    />
  )
} 