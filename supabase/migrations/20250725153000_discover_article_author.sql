-- Standardise Discover article author display name.
update public.discover_articles
set author_name = 'Mark, Kiwi & Piggy'
where author_name is null
   or trim(author_name) = ''
   or author_name in ('System Administrator', 'Admin User');
