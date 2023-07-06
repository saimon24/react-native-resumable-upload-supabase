CREATE POLICY "Enable storage access for users based on user_id" ON "storage"."objects"
AS PERMISSIVE FOR ALL
TO public
USING (bucket_id = 'files' AND auth.uid()::text = (storage.foldername(name))[1])
WITH CHECK (bucket_id = 'files' AND auth.uid()::text = (storage.foldername(name))[1])