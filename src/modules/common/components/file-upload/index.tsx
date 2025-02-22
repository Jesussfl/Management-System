'use client'

import axios, { AxiosProgressEvent, CancelTokenSource } from 'axios'
import {
  File,
  FileAudio,
  FileImage,
  FolderArchive,
  UploadCloud,
  Video,
  X,
} from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Input } from '../input/input'
import { ScrollArea } from '../scroll-area/scroll-area'
import { Progress } from '../progress-bar'

interface FileUploadProgress {
  progress: number
  File: File
  source: CancelTokenSource | null
}

enum FileTypes {
  Image = 'image',
  Pdf = 'pdf',
  Audio = 'audio',
  Video = 'video',
  Other = 'other',
}

const ImageColor = {
  bgColor: 'bg-purple-600',
  fillColor: 'fill-purple-600',
}

const PdfColor = {
  bgColor: 'bg-blue-400',
  fillColor: 'fill-blue-400',
}

const AudioColor = {
  bgColor: 'bg-yellow-400',
  fillColor: 'fill-yellow-400',
}

const VideoColor = {
  bgColor: 'bg-green-400',
  fillColor: 'fill-green-400',
}

const OtherColor = {
  bgColor: 'bg-gray-400',
  fillColor: 'fill-gray-400',
}

export default function ImageUpload({
  // onChange,
  setFile,
}: {
  // onChange: (file: File) => void
  setFile: (file: FormData | null) => void
}) {
  const [uploadedFile, setUploadedFile] = useState<File>()
  const [fileToUpload, setFileToUpload] = useState<FileUploadProgress>()

  const getFileIconAndColor = (file: File) => {
    if (file.type.includes(FileTypes.Image)) {
      return {
        icon: <FileImage size={40} className={ImageColor.fillColor} />,
        color: ImageColor.bgColor,
      }
    }

    if (file.type.includes(FileTypes.Pdf)) {
      return {
        icon: <File size={40} className={PdfColor.fillColor} />,
        color: PdfColor.bgColor,
      }
    }

    if (file.type.includes(FileTypes.Audio)) {
      return {
        icon: <FileAudio size={40} className={AudioColor.fillColor} />,
        color: AudioColor.bgColor,
      }
    }

    if (file.type.includes(FileTypes.Video)) {
      return {
        icon: <Video size={40} className={VideoColor.fillColor} />,
        color: VideoColor.bgColor,
      }
    }

    return {
      icon: <FolderArchive size={40} className={OtherColor.fillColor} />,
      color: OtherColor.bgColor,
    }
  }

  // feel free to mode all these functions to separate utils
  // here is just for simplicity
  const onUploadProgress = (
    progressEvent: AxiosProgressEvent,
    file: File,
    cancelSource: CancelTokenSource
  ) => {
    const progress = Math.round(
      (progressEvent.loaded / (progressEvent.total ?? 0)) * 100
    )

    if (progress === 100) {
      setUploadedFile(file)

      setFileToUpload(undefined)

      return
    }

    setFileToUpload({
      progress,
      File: file,
      source: cancelSource,
    })
  }

  const removeFile = (file: File) => {
    setFileToUpload(undefined)

    setUploadedFile(undefined)
  }
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0]
      setFileToUpload({
        progress: 100,
        File: file,
        source: null,
      })
      const formData = new FormData()
      // console.log('fileee', file)
      formData.append('image', file)
      setFile(formData)
    }
  }
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0] // Tomar solo el primer archivo de los aceptados
    setFileToUpload({
      progress: 100,
      File: file,
      source: null,
    })
  }, [])

  useEffect(() => {
    if (fileToUpload) {
      const formData = new FormData()

      formData.append('image', fileToUpload.File)

      setFile(formData)
    } else {
      setFile(null)
    }
  }, [fileToUpload])

  const { getRootProps, getInputProps } = useDropzone({ onDrop })

  return (
    <div>
      <div>
        <label
          {...getRootProps()}
          className="relative flex w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 py-6 hover:bg-gray-100"
        >
          <div className="text-center">
            <div className="mx-auto max-w-min rounded-md border p-2">
              <UploadCloud size={20} />
            </div>

            <p className="mt-2 text-sm text-gray-600">
              <span className="font-semibold">Arrastrar y soltar</span>
            </p>
            <p className="text-xs text-gray-500">
              Da click para cargar &#40;los archivos deben ser menores a 10MB
              &#41;
            </p>
          </div>
        </label>

        <Input
          {...getInputProps()}
          id="dropzone-file"
          accept="image/png, image/jpeg"
          type="file"
          className="hidden"
        />
      </div>

      {fileToUpload && (
        <div>
          <ScrollArea className="h-40">
            <p className="my-2 mt-6 text-sm font-medium text-muted-foreground">
              Archivos para subir
            </p>
            <div className="space-y-2 pr-3">
              {fileToUpload && (
                <div
                  key={fileToUpload.File.lastModified}
                  className="group flex justify-between gap-2 overflow-hidden rounded-lg border border-slate-100 pr-2 hover:pr-0"
                >
                  <div className="flex flex-1 items-center p-2">
                    <div className="text-white">
                      {getFileIconAndColor(fileToUpload.File).icon}
                    </div>

                    <div className="ml-2 w-full space-y-1">
                      <div className="flex justify-between text-sm">
                        <p className="text-muted-foreground">
                          {fileToUpload.File.name.slice(0, 25)}
                        </p>
                        <span className="text-xs">
                          {fileToUpload.progress}%
                        </span>
                      </div>
                      <Progress
                        value={fileToUpload.progress}
                        className={getFileIconAndColor(fileToUpload.File).color}
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      if (fileToUpload.source)
                        fileToUpload.source.cancel('Upload cancelled')
                      removeFile(fileToUpload.File)
                    }}
                    className="hidden cursor-pointer items-center justify-center bg-red-500 px-2 text-white transition-all group-hover:flex"
                  >
                    <X size={20} />
                  </button>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      )}

      {uploadedFile && (
        <div>
          <p className="my-2 mt-6 text-sm font-medium text-muted-foreground">
            Archivos subidos
          </p>
          <div className="space-y-2 pr-3">
            <div
              key={uploadedFile.lastModified}
              className="group flex justify-between gap-2 overflow-hidden rounded-lg border border-slate-100 pr-2 transition-all hover:border-slate-300 hover:pr-0"
            >
              <div className="flex flex-1 items-center p-2">
                <div className="text-white">
                  {getFileIconAndColor(uploadedFile).icon}
                </div>
                <div className="ml-2 w-full space-y-1">
                  <div className="flex justify-between text-sm">
                    <p className="text-muted-foreground">
                      {uploadedFile.name.slice(0, 25)}
                    </p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => removeFile(uploadedFile)}
                className="hidden items-center justify-center bg-red-500 px-2 text-white transition-all group-hover:flex"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
