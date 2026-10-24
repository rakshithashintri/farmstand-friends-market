create policy "Authenticated users upload produce images" on storage.objects for insert to authenticated with check (bucket_id = 'produce-images' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Authenticated users read produce images" on storage.objects for select to authenticated using (bucket_id = 'produce-images');

create policy "Users delete own produce images" on storage.objects for delete to authenticated using (bucket_id = 'produce-images' and (storage.foldername(name))[1] = auth.uid()::text);

grant select, insert, delete on storage.objects to authenticated;