-- Create system deleted user
-- This user is used to preserve order data when actual users are deleted

INSERT INTO "user" (
    id,
    name,
    email,
    "emailVerified",
    "phoneNumber",
    "phoneNumberVerified",
    "createdAt",
    "updatedAt"
) VALUES (
    'system_deleted_user',
    'System Deleted User',
    'system@deleted.local',
    false,
    '+0000000000',
    false,
    NOW(),
    NOW()
)
ON CONFLICT (id) DO NOTHING;

-- Verify the user was created
SELECT id, name, email FROM "user" WHERE id = 'system_deleted_user';
