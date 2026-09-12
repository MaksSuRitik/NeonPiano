// ==========================================
// SUPABASE STORAGE SERVICE FOR NEON PIANO
// Provides fast, CORS-enabled cloud audio storage
// ==========================================

export const SUPABASE_CONFIG = {
  url: "https://hhkckkanrqoagnovlacq.supabase.co",
  anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhoa2Nra2FucnFvYWdub3ZsYWNxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkyMjI4MTAsImV4cCI6MjEwNDc5ODgxMH0.5b1K2UUDEghKMBCOf8VZ5VQNxTRaZVu2ezs4g-YvlSc",
  bucket: "tracks"
};

/**
 * Uploads an audio file directly to Supabase Storage.
 * Supports upload progress tracking.
 * 
 * @param {File|Blob} file 
 * @param {string} filename 
 * @param {function} onProgress 
 * @returns {Promise<{ publicUrl: string, storagePath: string }>}
 */
export async function uploadAudioToSupabase(file, filename, onProgress = () => {}) {
  const cleanName = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
  const uniqueName = `${Date.now()}_${cleanName}`;
  const uploadUrl = `${SUPABASE_CONFIG.url}/storage/v1/object/${SUPABASE_CONFIG.bucket}/${uniqueName}`;

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", uploadUrl);
    xhr.setRequestHeader("apikey", SUPABASE_CONFIG.anonKey);
    xhr.setRequestHeader("Authorization", `Bearer ${SUPABASE_CONFIG.anonKey}`);
    xhr.setRequestHeader("Content-Type", file.type || "audio/mpeg");

    if (xhr.upload) {
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable && e.total > 0) {
          const percent = Math.round((e.loaded / e.total) * 100);
          onProgress(percent);
        }
      };
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const publicUrl = `${SUPABASE_CONFIG.url}/storage/v1/object/public/${SUPABASE_CONFIG.bucket}/${uniqueName}`;
        resolve({
          publicUrl,
          storagePath: `${SUPABASE_CONFIG.bucket}/${uniqueName}`
        });
      } else {
        let msg = xhr.responseText || xhr.statusText;
        try {
          const parsed = JSON.parse(xhr.responseText);
          if (parsed.message) msg = parsed.message;
        } catch (_) {}
        reject(new Error(`Supabase upload error (${xhr.status}): ${msg}`));
      }
    };

    xhr.onerror = () => {
      reject(new Error("Supabase NetworkError when uploading audio."));
    };

    xhr.send(file);
  });
}

/**
 * Deletes an audio file from Supabase Storage if storagePath is provided.
 * 
 * @param {string} storagePath 
 * @returns {Promise<boolean>}
 */
export async function deleteAudioFromSupabase(storagePath) {
  if (!storagePath) return false;
  const fileName = storagePath.replace(/^tracks\//, "");
  const deleteUrl = `${SUPABASE_CONFIG.url}/storage/v1/object/${SUPABASE_CONFIG.bucket}`;

  try {
    const resp = await fetch(deleteUrl, {
      method: "DELETE",
      headers: {
        "apikey": SUPABASE_CONFIG.anonKey,
        "Authorization": `Bearer ${SUPABASE_CONFIG.anonKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ prefixes: [fileName] })
    });
    return resp.ok;
  } catch (e) {
    console.warn("Failed to delete audio from Supabase:", e);
    return false;
  }
}
