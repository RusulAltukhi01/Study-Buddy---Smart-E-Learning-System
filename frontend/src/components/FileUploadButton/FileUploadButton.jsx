import { useRef, useState } from "react";
import { Paperclip, X } from "lucide-react";
import { toast } from "sonner";

const FileUploadButton = ({
  onFileSelect,
  maxFiles = 5,
  maxFileSize = 5 * 1024 * 1024,
  accept = ".pdf,.doc,.docx,image/*",
}) => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const fileInputRef = useRef(null);

  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  const validateFiles = (files) => {
    if (selectedFiles.length + files.length > maxFiles) {
      toast.error(`You can only select up to ${maxFiles} files.`);
      return false;
    }

    for (const file of files) {
      if (file.size > maxFileSize) {
        const sizeMB = (maxFileSize / (1024 * 1024)).toFixed(1);
        toast.error(`"${file.name}" exceeds the ${sizeMB} MB size limit.`);
        return false;
      }
    }
    return true;
  };

  const handleFileChange = (event) => {
    const newFiles = Array.from(event.target.files);
    if (newFiles.length === 0) return;

    if (validateFiles(newFiles)) {
      const updatedFiles = [...selectedFiles, ...newFiles];
      setSelectedFiles(updatedFiles);
      onFileSelect?.(updatedFiles);
    }

    event.target.value = null;
  };

  const removeFile = (indexToRemove) => {
    const updatedFiles = selectedFiles.filter(
      (_, index) => index !== indexToRemove,
    );
    setSelectedFiles(updatedFiles);
    onFileSelect?.(updatedFiles);
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <div className="space-y-2 relative">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept={accept}
        multiple
        style={{ display: "none" }}
      />

      <button
        type="button"
        onClick={handleButtonClick}
        className="flex gap-x-2 text-gray-500 font-semibold cursor-pointer hover:bg-gray-100 p-4 rounded-full hover:tracking-[1px] transition-all"
      >
        <Paperclip color="var(--electric)" />
        Attach Material
      </button>

      {selectedFiles.length > 0 && (
        <div className="mt-4 absolute top-10 flex flex-wrap gap-2 w-fit">
          {selectedFiles.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between bg-gray-50 p-2 rounded-md text-sm border-1 border-teal-400"
            >
              <span className="truncate max-w-[200px]">
                {file.name}{" "}
                <span className="text-gray-400">
                  ({formatFileSize(file.size)})
                </span>
              </span>
              <button
                onClick={() => removeFile(index)}
                className="text-gray-500 hover:text-red-500 transition-colors cursor-pointer"
                title="Remove"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileUploadButton;
