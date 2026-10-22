-- Bucket privado para adjuntos. Rutas: org_id/page_id/archivo.
-- Los archivos se sirven con enlaces firmados de 60 segundos generados en el
-- servidor; nunca hay URLs públicas.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'attachments',
  'attachments',
  false,
  5242880, -- 5 MB
  array[
    'image/png', 'image/jpeg', 'image/gif', 'image/webp',
    'application/pdf',
    'text/plain', 'text/markdown', 'text/csv'
  ]
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

-- La política toma el primer segmento de la ruta como org_id y exige que el
-- usuario pueda leer la página (o editarla para subir y borrar).
create policy "leer adjuntos de páginas visibles"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'attachments'
    and public.can_access_attachment_object(name, false)
  );

create policy "subir adjuntos a páginas editables"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'attachments'
    and public.can_access_attachment_object(name, true)
  );

create policy "borrar adjuntos de páginas editables"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'attachments'
    and public.can_access_attachment_object(name, true)
  );
