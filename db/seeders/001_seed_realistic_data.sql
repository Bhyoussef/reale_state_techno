-- TechnoHouse realistic seed dataset (PostgreSQL)

BEGIN;

-- Users
INSERT INTO users (id, full_name, email, phone, password_hash, role, avatar_url, is_verified)
VALUES
  ('f6f5d50f-4d5a-4eb2-8a24-d75af2d0f001', 'Maya Rodriguez', 'maya@technohouse.com', '+1-305-555-0180', 'hashed_pw_admin_1', 'admin', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330', TRUE),
  ('f6f5d50f-4d5a-4eb2-8a24-d75af2d0f002', 'Omar Al-Hassan', 'omar.agent@technohouse.com', '+1-971-555-0133', 'hashed_pw_agent_1', 'agent', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e', TRUE),
  ('f6f5d50f-4d5a-4eb2-8a24-d75af2d0f003', 'Sara Mitchell', 'sara.agent@technohouse.com', '+1-212-555-0199', 'hashed_pw_agent_2', 'agent', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2', TRUE),
  ('f6f5d50f-4d5a-4eb2-8a24-d75af2d0f004', 'Khalid Mansoor', 'khalid.buyer@example.com', '+1-646-555-0151', 'hashed_pw_buyer_1', 'user', NULL, FALSE),
  ('f6f5d50f-4d5a-4eb2-8a24-d75af2d0f005', 'Lina Farouk', 'lina.buyer@example.com', '+1-415-555-0165', 'hashed_pw_buyer_2', 'user', NULL, TRUE)
ON CONFLICT (id) DO NOTHING;

-- Properties
INSERT INTO properties (
  id,
  owner_id,
  title,
  slug,
  description,
  listing_type,
  property_type,
  price,
  currency,
  bedrooms,
  bathrooms,
  area_sqft,
  city,
  district,
  address_line,
  latitude,
  longitude,
  status,
  published_at
)
VALUES
  (
    '7e836ce8-658f-42bb-b8cb-3b6c5700a101',
    'f6f5d50f-4d5a-4eb2-8a24-d75af2d0f002',
    'Modern Waterfront Villa with Private Dock',
    'modern-waterfront-villa-private-dock',
    'Premium 5-bedroom villa with floor-to-ceiling windows, private pool, and direct marina access.',
    'sale',
    'villa',
    2450000.00,
    'USD',
    5,
    6,
    6120.00,
    'Miami',
    'Brickell',
    '120 Harbor View Drive, Miami, FL',
    25.7616800,
    -80.1917900,
    'published',
    NOW() - INTERVAL '12 days'
  ),
  (
    '7e836ce8-658f-42bb-b8cb-3b6c5700a102',
    'f6f5d50f-4d5a-4eb2-8a24-d75af2d0f003',
    'High-Rise Penthouse with Skyline Terrace',
    'high-rise-penthouse-skyline-terrace',
    'Luxury penthouse featuring panoramic city views, smart-home controls, and concierge amenities.',
    'sale',
    'penthouse',
    1895000.00,
    'USD',
    4,
    4,
    3840.00,
    'New York',
    'Midtown',
    '58 East 45th Street, New York, NY',
    40.7549320,
    -73.9840160,
    'published',
    NOW() - INTERVAL '8 days'
  ),
  (
    '7e836ce8-658f-42bb-b8cb-3b6c5700a103',
    'f6f5d50f-4d5a-4eb2-8a24-d75af2d0f002',
    'Downtown Smart Apartment Near Metro',
    'downtown-smart-apartment-near-metro',
    'Fully furnished 2-bedroom apartment with co-working lounge and gym access.',
    'rent',
    'apartment',
    4200.00,
    'USD',
    2,
    2,
    1240.00,
    'Chicago',
    'The Loop',
    '301 W Lake St, Chicago, IL',
    41.8853100,
    -87.6357400,
    'published',
    NOW() - INTERVAL '3 days'
  )
ON CONFLICT (id) DO NOTHING;

-- Property images
INSERT INTO property_images (id, property_id, image_url, alt_text, display_order, is_cover)
VALUES
  ('9ce77b8a-40b0-4d9f-82c0-611cefb50101', '7e836ce8-658f-42bb-b8cb-3b6c5700a101', 'https://images.unsplash.com/photo-1613977257363-707ba9348227', 'Waterfront villa exterior', 1, TRUE),
  ('9ce77b8a-40b0-4d9f-82c0-611cefb50102', '7e836ce8-658f-42bb-b8cb-3b6c5700a101', 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c', 'Villa living room', 2, FALSE),
  ('9ce77b8a-40b0-4d9f-82c0-611cefb50103', '7e836ce8-658f-42bb-b8cb-3b6c5700a102', 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde', 'Penthouse terrace view', 1, TRUE),
  ('9ce77b8a-40b0-4d9f-82c0-611cefb50104', '7e836ce8-658f-42bb-b8cb-3b6c5700a103', 'https://images.unsplash.com/photo-1494526585095-c41746248156', 'Apartment interior', 1, TRUE)
ON CONFLICT (id) DO NOTHING;

-- Favorites
INSERT INTO favorites (id, user_id, property_id)
VALUES
  ('ad396dbb-1a70-48dc-b7a4-797c5c200101', 'f6f5d50f-4d5a-4eb2-8a24-d75af2d0f004', '7e836ce8-658f-42bb-b8cb-3b6c5700a101'),
  ('ad396dbb-1a70-48dc-b7a4-797c5c200102', 'f6f5d50f-4d5a-4eb2-8a24-d75af2d0f005', '7e836ce8-658f-42bb-b8cb-3b6c5700a102'),
  ('ad396dbb-1a70-48dc-b7a4-797c5c200103', 'f6f5d50f-4d5a-4eb2-8a24-d75af2d0f005', '7e836ce8-658f-42bb-b8cb-3b6c5700a103')
ON CONFLICT (id) DO NOTHING;

-- Messages
INSERT INTO messages (id, property_id, sender_id, recipient_id, subject, body, is_read)
VALUES
  (
    'bd5f09d8-1f96-44b1-9699-2e3b78390101',
    '7e836ce8-658f-42bb-b8cb-3b6c5700a101',
    'f6f5d50f-4d5a-4eb2-8a24-d75af2d0f004',
    'f6f5d50f-4d5a-4eb2-8a24-d75af2d0f002',
    'Request for weekend viewing',
    'Hi Omar, I would like to schedule a Saturday viewing for the waterfront villa. Is 11:00 AM available?',
    FALSE
  ),
  (
    'bd5f09d8-1f96-44b1-9699-2e3b78390102',
    '7e836ce8-658f-42bb-b8cb-3b6c5700a103',
    'f6f5d50f-4d5a-4eb2-8a24-d75af2d0f005',
    'f6f5d50f-4d5a-4eb2-8a24-d75af2d0f002',
    'Flexible lease term inquiry',
    'Hello, can this apartment be leased for 9 months with an option to extend?',
    TRUE
  )
ON CONFLICT (id) DO NOTHING;

COMMIT;
