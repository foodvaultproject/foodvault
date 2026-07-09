-- Standardise existing partner business names to Title Case.
-- New writes are normalised in the application layer; this backfills legacy rows.

CREATE OR REPLACE FUNCTION public.format_business_name(input text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  word text;
  result text := '';
  prefix text;
  first_letter text;
  rest text;
BEGIN
  IF input IS NULL OR btrim(input) = '' THEN
    RETURN NULL;
  END IF;

  input := regexp_replace(btrim(input), '\s+', ' ', 'g');

  FOREACH word IN ARRAY string_to_array(input, ' ')
  LOOP
    IF result <> '' THEN
      result := result || ' ';
    END IF;

    IF word ~ '[A-Za-z]' THEN
      prefix := substring(word from '^([^A-Za-z]*)');
      first_letter := substring(word from '[A-Za-z]');
      rest := substring(word from '[A-Za-z](.*)$');
      result := result || coalesce(prefix, '') || upper(first_letter) || lower(coalesce(rest, ''));
    ELSE
      result := result || word;
    END IF;
  END LOOP;

  RETURN result;
END;
$$;

UPDATE public.partners
SET business_name = public.format_business_name(business_name)
WHERE business_name IS NOT NULL
  AND business_name <> public.format_business_name(business_name);

GRANT EXECUTE ON FUNCTION public.format_business_name(text) TO authenticated, service_role;
