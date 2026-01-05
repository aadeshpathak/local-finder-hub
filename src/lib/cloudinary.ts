// Base upload function
const uploadToCloudinaryBase = async (
  file: File,
  uploadPreset: string,
  transformation?: string
): Promise<{ url: string; thumbnail?: string }> => {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;

  if (!cloudName || !uploadPreset) {
    throw new Error('Cloudinary configuration missing. Please check your environment variables.');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);

  // Add transformation if provided
  if (transformation) {
    formData.append('transformation', transformation);
  }

  try {
    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Upload failed: ${response.status} ${response.statusText}. ${errorData.error?.message || ''}`);
    }

    const data = await response.json();
    return {
      url: data.secure_url,
      thumbnail: data.secure_url ? `${data.secure_url.split('/upload/')[0]}/upload/w_150,h_150,c_thumb,g_face/${data.secure_url.split('/upload/')[1]}` : undefined
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw error;
  }
};

// Function to upload resume
export const uploadResume = async (file: File): Promise<string> => {
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_RESUME_PRESET;
  const result = await uploadToCloudinaryBase(file, uploadPreset);
  return result.url;
};

// Function to upload profile picture with thumbnail
export const uploadProfilePicture = async (file: File): Promise<{ url: string; thumbnail: string }> => {
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_PROFILE_PRESET;
  const result = await uploadToCloudinaryBase(file, uploadPreset);

  if (!result.thumbnail) {
    // Fallback thumbnail if generation fails
    result.thumbnail = result.url;
  }

  return { url: result.url, thumbnail: result.thumbnail };
};

// Legacy function for backward compatibility
export const uploadToCloudinary = uploadResume;