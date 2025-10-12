import {
  File,
  FileArchive,
  FileAudio,
  FileImage,
  FileText,
  FileVideo,
  Folder,
  PictureInPicture,
} from 'lucide-react';

export const Icons = {
  folder: Folder,
  file: File,
  image: FileImage,
  video: FileVideo,
  audio: FileAudio,
  pdf: PictureInPicture,
  text: FileText,
  archive: FileArchive,
};

export const getFileIcon = (mimeType: string) => {
  if (mimeType.startsWith('image/')) return <Icons.image className="h-12 w-12 text-blue-500" />;
  if (mimeType.startsWith('video/')) return <Icons.video className="h-12 w-12 text-red-500" />;
  if (mimeType.startsWith('audio/')) return <Icons.audio className="h-12 w-12 text-purple-500" />;
  if (mimeType === 'application/pdf') return <Icons.pdf className="h-12 w-12 text-red-700" />;
  if (mimeType.startsWith('text/')) return <Icons.text className="h-12 w-12 text-gray-500" />;
  if (mimeType.startsWith('application/zip') || mimeType.startsWith('application/x-rar')) {
      return <Icons.archive className="h-12 w-12 text-yellow-600" />;
  }
  return <Icons.file className="h-12 w-12 text-gray-400" />;
};