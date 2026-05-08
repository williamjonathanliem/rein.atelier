-- Add multi-image support (up to 5 reference images per order)
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS reference_image_urls text[] NOT NULL DEFAULT '{}';

-- Migrate existing single images into the array
UPDATE orders
SET reference_image_urls = ARRAY[reference_image_url]
WHERE reference_image_url IS NOT NULL AND reference_image_url != '' AND array_length(reference_image_urls, 1) IS NULL;
