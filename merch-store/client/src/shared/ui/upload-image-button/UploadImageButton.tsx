import { useRef, useState } from "react";

import { Button } from "@/shared/ui/button/Button";

type UploadImageButtonProps = {
  onUpload: (file: File) => Promise<void>;
  label?: string;
};

export function UploadImageButton({
  onUpload,
  label = "Загрузить",
}: UploadImageButtonProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  async function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) return;

    setIsUploading(true);

    try {
      await onUpload(file);
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/svg+xml"
        className="hidden"
        onChange={handleChange}
      />

      <Button
        type="button"
        variant="secondary"
        disabled={isUploading}
        onClick={() => inputRef.current?.click()}
      >
        {isUploading ? "Загрузка..." : label}
      </Button>
    </>
  );
}