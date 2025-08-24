import { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CloudUpload, FileVideo, X, Film, Tv } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface UploadFile {
  file: File;
  progress: number;
  status: "pending" | "uploading" | "completed" | "error";
  id: string;
  contentType: string;
}

export function UploadSection() {
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
  const [selectedContentType, setSelectedContentType] = useState<string>('movies');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Real upload function with progress tracking
  const uploadFileWithProgress = (file: File, uploadId: string, contentType: string): Promise<any> => {
    return new Promise((resolve, reject) => {
      const formData = new FormData();
      formData.append('video', file);
      formData.append('contentType', contentType);

      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const progress = (e.loaded / e.total) * 100;
          setUploadFiles(prev => prev.map(f => 
            f.id === uploadId ? { ...f, progress } : f
          ));
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(JSON.parse(xhr.responseText));
        } else {
          reject(new Error('Upload failed'));
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Upload failed'));
      });

      xhr.open('POST', '/api/upload');
      xhr.send(formData);
    });
  };

  const uploadMutation = useMutation({
    mutationFn: async ({ file, uploadId, contentType }: { file: File; uploadId: string; contentType: string }) => {
      return uploadFileWithProgress(file, uploadId, contentType);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/movies"] });
      toast({
        title: "Success",
        description: "File uploaded successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to upload file",
        variant: "destructive",
      });
    },
  });

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    const newFiles: UploadFile[] = Array.from(files).map(file => ({
      file,
      progress: 0,
      status: "pending",
      id: Math.random().toString(36).substr(2, 9),
      contentType: selectedContentType,
    }));

    setUploadFiles(prev => [...prev, ...newFiles]);

    // Start uploading files
    newFiles.forEach(uploadFile => {
      startUpload(uploadFile);
    });
  };

  const startUpload = async (uploadFile: UploadFile) => {
    setUploadFiles(prev => prev.map(f => 
      f.id === uploadFile.id ? { ...f, status: "uploading", progress: 0 } : f
    ));

    try {
      await uploadMutation.mutateAsync({ 
        file: uploadFile.file, 
        uploadId: uploadFile.id, 
        contentType: uploadFile.contentType 
      });
      
      setUploadFiles(prev => prev.map(f => 
        f.id === uploadFile.id ? { ...f, status: "completed", progress: 100 } : f
      ));
    } catch (error) {
      setUploadFiles(prev => prev.map(f => 
        f.id === uploadFile.id ? { ...f, status: "error" } : f
      ));
    }
  };

  const removeFile = (id: string) => {
    setUploadFiles(prev => prev.filter(f => f.id !== id));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const formatFileSize = (bytes: number) => {
    const gb = bytes / (1024 * 1024 * 1024);
    if (gb >= 1) return `${gb.toFixed(2)} GB`;
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  return (
    <div className="space-y-6" data-testid="upload-section">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-white mb-6">Upload Content</h2>
        
        {/* Content Type Selector */}
        <div className="flex items-center space-x-3">
          <span className="text-white font-medium">Content Type:</span>
          <Select value={selectedContentType} onValueChange={setSelectedContentType}>
            <SelectTrigger className="w-48 bg-gray-700 border-gray-600 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gray-700 border-gray-600">
              <SelectItem value="movies" className="text-white hover:bg-gray-600">
                <div className="flex items-center space-x-2">
                  <Film className="h-4 w-4" />
                  <span>Movies</span>
                </div>
              </SelectItem>
              <SelectItem value="tv-shows" className="text-white hover:bg-gray-600">
                <div className="flex items-center space-x-2">
                  <Tv className="h-4 w-4" />
                  <span>TV Shows</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Upload Area */}
      <Card className="bg-gray-800 border-gray-700" data-testid="upload-area">
        <CardContent className="p-6">
          <div
            className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center hover:border-gray-500 transition-colors cursor-pointer"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => fileInputRef.current?.click()}
            data-testid="drop-zone"
          >
            <CloudUpload className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              Drop your {selectedContentType === 'movies' ? 'movie' : 'TV show'} files here
            </h3>
            <p className="text-gray-400 mb-4">
              or click to select files
            </p>
            <p className="text-sm text-gray-500">
              Supports: MP4, AVI, MKV, MOV, WMV, FLV, WEBM (Max: 50GB per file)
            </p>
            <p className="text-xs text-gray-600 mt-1">
              Files will be saved to /{selectedContentType}/ folder and added to your library.
            </p>
            
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="video/*"
              className="hidden"
              onChange={(e) => handleFileSelect(e.target.files)}
              data-testid="file-input"
            />
          </div>
        </CardContent>
      </Card>

      {/* Upload Progress */}
      {uploadFiles.length > 0 && (
        <Card className="bg-gray-800 border-gray-700" data-testid="upload-progress">
          <CardHeader>
            <CardTitle className="text-white">Upload Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {uploadFiles.map((uploadFile) => (
                <div 
                  key={uploadFile.id} 
                  className="flex items-center justify-between bg-gray-700 p-4 rounded-lg"
                  data-testid={`upload-item-${uploadFile.id}`}
                >
                  <div className="flex items-center space-x-3 flex-1">
                    <FileVideo className="h-6 w-6 text-blue-400" />
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <div className="flex flex-col">
                          <span className="text-white font-medium truncate max-w-64">
                            {uploadFile.file.name}
                          </span>
                          <div className="flex items-center space-x-2 text-xs text-gray-400">
                            <span>{formatFileSize(uploadFile.file.size)}</span>
                            <span>•</span>
                            <span className="flex items-center space-x-1">
                              {uploadFile.contentType === 'movies' ? 
                                <><Film className="h-3 w-3" /> <span>Movie</span></> : 
                                <><Tv className="h-3 w-3" /> <span>TV Show</span></>
                              }
                            </span>
                          </div>
                        </div>
                        <span className="text-sm text-gray-400">
                          {uploadFile.contentType === 'movies' ? 'movies/' : 'tv-shows/'}
                        </span>
                      </div>
                      
                      {uploadFile.status === "uploading" && (
                        <div className="flex items-center space-x-3">
                          <Progress 
                            value={uploadFile.progress} 
                            className="flex-1 h-2"
                            data-testid={`progress-${uploadFile.id}`}
                          />
                          <span className="text-sm text-gray-300 min-w-12">
                            {Math.round(uploadFile.progress)}%
                          </span>
                        </div>
                      )}
                      
                      {uploadFile.status === "completed" && (
                        <div className="text-green-400 text-sm">
                          ✓ Upload completed
                        </div>
                      )}
                      
                      {uploadFile.status === "error" && (
                        <div className="text-red-400 text-sm">
                          ✗ Upload failed
                        </div>
                      )}
                      
                      {uploadFile.status === "pending" && (
                        <div className="text-gray-400 text-sm">
                          Waiting to upload...
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(uploadFile.id)}
                    className="text-gray-400 hover:text-white ml-2"
                    data-testid={`remove-upload-${uploadFile.id}`}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
