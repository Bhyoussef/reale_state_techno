-- Performance indexes for common real-estate queries

CREATE INDEX IF NOT EXISTS idx_users_deleted_at ON users (deleted_at);

CREATE INDEX IF NOT EXISTS idx_properties_owner_id ON properties (owner_id);
CREATE INDEX IF NOT EXISTS idx_properties_status ON properties (status);
CREATE INDEX IF NOT EXISTS idx_properties_listing_type ON properties (listing_type);
CREATE INDEX IF NOT EXISTS idx_properties_city_district ON properties (city, district);
CREATE INDEX IF NOT EXISTS idx_properties_deleted_at ON properties (deleted_at);

CREATE INDEX IF NOT EXISTS idx_property_images_property_id ON property_images (property_id);
CREATE INDEX IF NOT EXISTS idx_property_images_cover ON property_images (property_id, is_cover);
CREATE INDEX IF NOT EXISTS idx_property_images_deleted_at ON property_images (deleted_at);

CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites (user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_property_id ON favorites (property_id);
CREATE INDEX IF NOT EXISTS idx_favorites_deleted_at ON favorites (deleted_at);

CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages (sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient_id ON messages (recipient_id);
CREATE INDEX IF NOT EXISTS idx_messages_property_id ON messages (property_id);
CREATE INDEX IF NOT EXISTS idx_messages_is_read ON messages (is_read);
CREATE INDEX IF NOT EXISTS idx_messages_deleted_at ON messages (deleted_at);
