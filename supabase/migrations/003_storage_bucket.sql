-- Create public storage bucket for order reference images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'order-references',
  'order-references',
  true,
  5242880,  -- 5 MB limit per file
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heic', 'image/heif']
)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload reference images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'order-references');

-- Allow public to read (images are served publicly by URL)
CREATE POLICY "Public read access for reference images"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'order-references');

-- Allow authenticated users to delete
CREATE POLICY "Authenticated users can delete reference images"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'order-references');

-- Allow authenticated users to update/replace
CREATE POLICY "Authenticated users can update reference images"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'order-references');
