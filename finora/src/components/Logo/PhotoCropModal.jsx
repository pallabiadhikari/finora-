/* =====================================================
   Finora — PhotoCropModal
   Lets the user crop a profile photo into a circle-friendly
   square before saving. Wraps <Cropper> from react-easy-crop.

   The resulting image is a base64 JPEG data URL, which is
   what the caller (Settings) stores on the user object.

   Props:
     file     → File object to crop (image/*)
     onCancel → close without saving
     onSave   → called with the cropped base64 string
   ===================================================== */

import { useCallback, useEffect, useId, useState } from 'react';
import Cropper from 'react-easy-crop';
import Modal from '../Modal/Modal';

function PhotoCropModal({ file, onCancel, onSave }) {
  const [imageSrc, setImageSrc] = useState('');
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Unique id for the zoom label — safe if two crops ever render
  const zoomId = useId();

  // ---------- Load the file into a data URL ----------
  // Runs once per `file` prop change — no more repeated reads
  // on every render.
  useEffect(() => {
    if (!file) {
      setImageSrc('');
      return;
    }

    // Validate it's actually an image before trying to read it
    if (!file.type || !file.type.startsWith('image/')) {
      setError('That file is not an image.');
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      setImageSrc(reader.result);
      setError('');
    };

    reader.onerror = () => {
      setError('Could not read that image.');
    };

    reader.readAsDataURL(file);

    // Cancel the read if the component unmounts or file changes
    return () => {
      if (reader.readyState === FileReader.LOADING) {
        reader.abort();
      }
    };
  }, [file]);

  // ---------- Cropper callbacks ----------
  const onCropComplete = useCallback((_, croppedPixels) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  // ---------- Save ----------
  const handleSave = async () => {
    if (!croppedAreaPixels || !imageSrc) return;
    setSaving(true);
    setError('');

    try {
      const cropped = await getCroppedImg(imageSrc, croppedAreaPixels);
      onSave(cropped);
    } catch (err) {
      console.error('Crop failed:', err);
      setError('Could not process that image. Try a different one.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title="Adjust your photo" onClose={onCancel}>
      <div className="crop-wrap">
        {imageSrc && (
          <div className="crop-area">
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={1}
              cropShape="round"
              showGrid={false}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
          </div>
        )}

        {error && <p className="form-error">{error}</p>}

        <div className="crop-zoom">
          <label htmlFor={zoomId}>Zoom</label>
          <input
            id={zoomId}
            type="range"
            min={1}
            max={3}
            step={0.05}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            aria-valuetext={`${Math.round(zoom * 100)}%`}
          />
        </div>

        <p className="crop-hint">
          Drag to reposition. Use the slider to zoom.
        </p>

        <div className="form-actions">
          <button
            type="button"
            className="button button--ghost"
            onClick={onCancel}
            disabled={saving}
          >
            Cancel
          </button>
          <button
            type="button"
            className="button button--primary"
            onClick={handleSave}
            disabled={saving || !imageSrc}
          >
            {saving ? (
              <>
                <i
                  className="fas fa-circle-notch fa-spin"
                  aria-hidden="true"
                ></i>{' '}
                Saving…
              </>
            ) : (
              'Save photo'
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default PhotoCropModal;

/* =====================================================
   Helpers
   ===================================================== */

/**
 * Renders the selected crop region into a square canvas and
 * returns a base64 JPEG data URL.
 */
async function getCroppedImg(imageSrc, cropPixels) {
  const image = await loadImage(imageSrc);

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Canvas 2D context unavailable');
  }

  // With aspect=1 the cropped area is square, but be defensive:
  // use the crop's own dimensions for the output size.
  canvas.width = cropPixels.width;
  canvas.height = cropPixels.height;

  ctx.drawImage(
    image,
    cropPixels.x,
    cropPixels.y,
    cropPixels.width,
    cropPixels.height,
    0,
    0,
    cropPixels.width,
    cropPixels.height
  );

  // JPEG keeps avatars small (typically < 100 KB)
  return canvas.toDataURL('image/jpeg', 0.85);
}

/** Promisified Image loader. */
function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Image failed to load'));
    img.src = src;
  });
}