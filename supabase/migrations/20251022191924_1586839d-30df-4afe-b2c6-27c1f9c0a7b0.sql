-- Add separate column for attachments
ALTER TABLE action_items ADD COLUMN attachment_url text;

-- Rename image_url to screenshot_url for clarity
ALTER TABLE action_items RENAME COLUMN image_url TO screenshot_url;

COMMENT ON COLUMN action_items.screenshot_url IS 'URL for page screenshots';
COMMENT ON COLUMN action_items.attachment_url IS 'URL for file attachments';