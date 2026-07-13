-- ============================================================
-- IncidentDesk — Seed Script
-- ============================================================
-- Creates 5 demo users via Supabase auth + 30 realistic tickets
-- spread across all categories, priorities, statuses, and dates.
--
-- Demo credentials (all passwords: password123)
-- ┌─────────────────────────────┬───────────┐
-- │ Email                       │ Role      │
-- ├─────────────────────────────┼───────────┤
-- │ admin@example.com           │ Admin     │
-- │ employee@example.com        │ Employee  │
-- │ john.doe@example.com        │ Employee  │
-- │ alice.johnson@example.com   │ Employee  │
-- │ bob.wilson@example.com      │ Employee  │
-- └─────────────────────────────┴───────────┘
--
-- HOW TO RUN:
--   Supabase Dashboard → SQL Editor → paste this file → Run
-- ============================================================

-- ============================================================
-- STEP 1: Create auth users
-- ============================================================
-- NOTE: Supabase's auth.users requires inserting via the
-- internal schema. We use auth.users directly here (service role).

DO $$
DECLARE
  admin_id    uuid := gen_random_uuid();
  emp1_id     uuid := gen_random_uuid();
  emp2_id     uuid := gen_random_uuid();
  emp3_id     uuid := gen_random_uuid();
  emp4_id     uuid := gen_random_uuid();
BEGIN

  -- -------------------------------------------------------
  -- Insert auth users (password: password123)
  -- bcrypt hash for "password123"
  -- -------------------------------------------------------
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password,
    email_confirmed_at, created_at, updated_at,
    raw_user_meta_data, role, aud,
    confirmation_token, recovery_token,
    email_change_token_new, email_change
  ) VALUES
    (admin_id,  '00000000-0000-0000-0000-000000000000', 'admin@example.com',
     crypt('password123', gen_salt('bf')),
     now(), now(), now(),
     '{"name":"Alex Admin","role":"admin"}'::jsonb,
     'authenticated', 'authenticated', '', '', '', ''),

    (emp1_id,   '00000000-0000-0000-0000-000000000000', 'employee@example.com',
     crypt('password123', gen_salt('bf')),
     now(), now(), now(),
     '{"name":"Sam Employee","role":"user"}'::jsonb,
     'authenticated', 'authenticated', '', '', '', ''),

    (emp2_id,   '00000000-0000-0000-0000-000000000000', 'john.doe@example.com',
     crypt('password123', gen_salt('bf')),
     now(), now(), now(),
     '{"name":"John Doe","role":"user"}'::jsonb,
     'authenticated', 'authenticated', '', '', '', ''),

    (emp3_id,   '00000000-0000-0000-0000-000000000000', 'alice.johnson@example.com',
     crypt('password123', gen_salt('bf')),
     now(), now(), now(),
     '{"name":"Alice Johnson","role":"user"}'::jsonb,
     'authenticated', 'authenticated', '', '', '', ''),

    (emp4_id,   '00000000-0000-0000-0000-000000000000', 'bob.wilson@example.com',
     crypt('password123', gen_salt('bf')),
     now(), now(), now(),
     '{"name":"Bob Wilson","role":"user"}'::jsonb,
     'authenticated', 'authenticated', '', '', '', '')
  ON CONFLICT (email) DO NOTHING;

  -- -------------------------------------------------------
  -- Upsert profiles (trigger may have already created them)
  -- -------------------------------------------------------
  INSERT INTO profiles (id, name, role) VALUES
    (admin_id,  'Alex Admin',     'admin'),
    (emp1_id,   'Sam Employee',   'user'),
    (emp2_id,   'John Doe',       'user'),
    (emp3_id,   'Alice Johnson',  'user'),
    (emp4_id,   'Bob Wilson',     'user')
  ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, role = EXCLUDED.role;

  -- -------------------------------------------------------
  -- Insert 30 sample tickets
  -- -------------------------------------------------------
  INSERT INTO tickets (title, description, category, priority, status, created_by, created_at, updated_at)
  SELECT title, description, category, priority, status, created_by,
         now() - (offset_days || ' days')::interval,
         now() - (offset_days || ' days')::interval
  FROM (VALUES
    -- Critical / High open incidents (appear at the top in urgency panels)
    ('Production database server unresponsive',
     'The main PostgreSQL production server stopped accepting connections at 09:14. All services depending on it are affected. Error: connection refused on port 5432.',
     'Database', 'Critical', 'Open',      emp1_id, 0),

    ('VPN gateway down — remote workers locked out',
     'Our Cisco VPN concentrator is unreachable. Approximately 45 remote employees cannot access internal systems. Began approximately 08:30 today.',
     'Network', 'Critical', 'In Progress', emp2_id, 1),

    ('Security breach alert — suspicious logins from unknown IPs',
     'Azure AD flagged 12 failed login attempts followed by a successful login from an IP address in a foreign country for user jsmith. Account has been disabled pending investigation.',
     'Security', 'Critical', 'Open',      emp3_id, 1),

    ('Email server rejecting outbound mail',
     'Our Exchange server is bouncing all outbound emails with "550 relay denied". Internal email still works. Issue started after last night''s maintenance window.',
     'Email', 'High', 'Open',             emp4_id, 2),

    ('ERP application throwing 500 errors on checkout',
     'The purchase order module in SAP returns HTTP 500 on submission. Multiple departments are blocked. Finance team has escalated this.',
     'Software', 'High', 'In Progress',   emp1_id, 2),

    ('Active Directory account lockouts across finance department',
     'Five user accounts in the Finance OU are getting locked every 30 minutes. Suspected password policy conflict after yesterday''s GPO update.',
     'Access', 'High', 'Open',            emp2_id, 3),

    -- Medium priority tickets (mix of open and in-progress)
    ('Laptop keyboard unresponsive — MacBook Pro 2022',
     'About 8 keys on my keyboard stopped working after a liquid spill. The machine still boots and works with an external keyboard. Serial: C02XL0LNJG5J.',
     'Hardware', 'Medium', 'Open',        emp3_id, 3),

    ('Shared printer on floor 3 printing garbled text',
     'HP LaserJet Pro M404n on floor 3 started printing random characters and symbols instead of normal documents. Tried restarting the printer and reinstalling drivers — no change.',
     'Printer', 'Medium', 'In Progress',  emp4_id, 4),

    ('Slack desktop app crashes on startup — Windows 11',
     'Slack 4.35 crashes immediately on startup. Tried reinstalling — same result. Colleagues on macOS are fine. I need Slack for team communication.',
     'Software', 'Medium', 'Open',        emp1_id, 4),

    ('Unable to access shared drive \\\\fileserver\\marketing',
     'Getting "Access Denied" when trying to open the Marketing shared drive. I had access last week. Other team members can still access it.',
     'Access', 'Medium', 'Open',          emp2_id, 5),

    ('Office 365 license expired for 3 users',
     'Three new joiners (Sarah K., Mark L., Priya M.) cannot access Word, Excel or Outlook. Their licenses appear unassigned in the M365 admin portal.',
     'Software', 'Medium', 'In Progress', emp3_id, 5),

    ('Wi-Fi drops intermittently in Building B, 2nd floor',
     'Multiple employees on the 2nd floor of Building B report losing Wi-Fi every 30–45 minutes for about 2 minutes each time. Wired connection works fine.',
     'Network', 'Medium', 'Open',         emp4_id, 6),

    ('Backup job failing nightly since Monday',
     'The automated Veeam backup job for VM-PROD-02 has failed three nights in a row with error "Cannot create snapshot — VDDK error 21009". No backups are completing.',
     'Server', 'Medium', 'In Progress',   emp1_id, 7),

    ('Webcam not detected in Microsoft Teams meetings',
     'My Logitech C920 webcam works in the camera app and Zoom, but Microsoft Teams does not detect it at all. Other participants cannot see my video.',
     'Hardware', 'Medium', 'Open',        emp2_id, 8),

    ('Payroll software login broken for department managers',
     'After this morning''s update to PaySpace v3.2.1, department managers get a blank white screen after entering credentials. Staff users are unaffected.',
     'Software', 'Medium', 'Open',        emp3_id, 9),

    -- Low priority tickets
    ('Request: second monitor for workstation WS-042',
     'I would like to request a second monitor for my desk. My role involves working across multiple applications simultaneously and a second screen would significantly improve productivity.',
     'Hardware', 'Low', 'Open',           emp4_id, 10),

    ('Sticky keys accessibility setting turns on randomly',
     'Windows is activating Sticky Keys unexpectedly every few hours. I have disabled it in Ease of Access settings but it keeps re-enabling. Minor annoyance but affects typing.',
     'Software', 'Low', 'Open',           emp1_id, 11),

    ('Conference room projector remote control missing',
     'The remote control for the BenQ projector in Conference Room A (CR-A) is missing. The projector can still be operated manually but the remote would be more convenient.',
     'Hardware', 'Low', 'Open',           emp2_id, 12),

    ('Request: install Figma desktop app on design workstations',
     'The design team would like Figma desktop installed on workstations WS-101 through WS-108. Currently using the browser version which lacks some offline features.',
     'Software', 'Low', 'Open',           emp3_id, 13),

    ('Keyboard shortcut for VPN connect not working',
     'The custom keyboard shortcut Ctrl+Shift+V that was set up to connect to VPN stopped working after a Windows update. The VPN still connects manually via the tray icon.',
     'Network', 'Low', 'Open',            emp4_id, 14),

    -- Resolved tickets (older, spread across users)
    ('Cannot install Adobe Creative Cloud — permission denied',
     'Receiving "You don''t have sufficient access to uninstall" error when trying to install Adobe CC. Requires admin rights on the machine.',
     'Software', 'Medium', 'Resolved',    emp1_id, 20),

    ('Outlook calendar not syncing with mobile device',
     'My iPhone Outlook app stopped syncing calendar events 5 days ago. Email still works fine. Other team members are not affected.',
     'Email', 'Low', 'Resolved',          emp2_id, 22),

    ('New employee laptop setup — onboarding batch March',
     'Requesting setup of 4 new laptops for new starters beginning 3 March: Lisa T., David R., Kevin M., Nora P. Dell XPS 15 for all. Standard IT build required.',
     'Hardware', 'Medium', 'Resolved',    emp3_id, 25),

    ('Server room temperature alarm triggered',
     'DCIM system sent a temperature alert for rack B3 in the server room. Ambient temperature reached 28°C at 14:23. Air conditioning unit was restarted.',
     'Server', 'High', 'Resolved',        emp4_id, 28),

    ('VoIP phones on floor 1 showing "No Service"',
     'All 12 Cisco IP phones on floor 1 lost service this morning. Issue traced to a misconfigured VLAN after last night''s network switch firmware upgrade.',
     'Network', 'High', 'Resolved',       emp1_id, 30),

    -- Closed tickets (oldest, fully done)
    ('Password reset request — user jbrown locked out',
     'User James Brown (jbrown) has been locked out of Active Directory. His manager has confirmed his identity. Please reset his password and unlock the account.',
     'Access', 'Low', 'Closed',           emp2_id, 35),

    ('Antivirus definitions out of date on 6 workstations',
     'Qualys scan flagged WS-011, WS-024, WS-031, WS-045, WS-062, WS-078 as having Defender definitions older than 7 days. Auto-update is not reaching these machines.',
     'Security', 'Medium', 'Closed',      emp3_id, 38),

    ('Shared mailbox permissions audit — Q1',
     'Quarterly review of shared mailbox permissions. Found 3 ex-employees still had SendAs rights on the support@ mailbox. Access has been removed.',
     'Email', 'Low', 'Closed',            emp4_id, 42),

    ('Database query optimisation — reports running slow',
     'Monthly finance reports were taking 45+ minutes to generate. Root cause was a missing composite index on the transactions table. Index added and reports now run in under 3 minutes.',
     'Database', 'Medium', 'Closed',      emp1_id, 45),

    ('Decommission old file server FS-LEGACY-01',
     'FS-LEGACY-01 (Windows Server 2012 R2) has been fully migrated. All shares moved to FS-PROD-04. Old server has been shut down and removed from DNS.',
     'Server', 'Low', 'Closed',           emp2_id, 50)

  ) AS t(title, description, category, priority, status, created_by, offset_days)
  WHERE created_by IS NOT NULL;

  -- -------------------------------------------------------
  -- Insert ticket history for resolved / closed tickets
  -- (simulates admin having worked the tickets)
  -- -------------------------------------------------------
  INSERT INTO ticket_history (ticket_id, changed_by, field, old_value, new_value, created_at)
  SELECT
    t.id,
    admin_id,
    'status',
    'Open',
    t.status,
    t.updated_at
  FROM tickets t
  WHERE t.status IN ('Resolved', 'Closed')
    AND t.created_by IN (emp1_id, emp2_id, emp3_id, emp4_id);

  -- Add a priority escalation history entry for critical tickets
  INSERT INTO ticket_history (ticket_id, changed_by, field, old_value, new_value, created_at)
  SELECT
    t.id,
    admin_id,
    'priority',
    'Medium',
    'Critical',
    t.created_at + interval '2 hours'
  FROM tickets t
  WHERE t.priority = 'Critical'
    AND t.created_by IN (emp1_id, emp2_id, emp3_id, emp4_id);

  -- Add an "In Progress" intermediate history step for resolved/closed tickets
  INSERT INTO ticket_history (ticket_id, changed_by, field, old_value, new_value, created_at)
  SELECT
    t.id,
    admin_id,
    'status',
    'In Progress',
    t.status,
    t.updated_at - interval '1 day'
  FROM tickets t
  WHERE t.status IN ('Resolved', 'Closed')
    AND t.created_by IN (emp1_id, emp2_id, emp3_id, emp4_id);

END $$;

-- ============================================================
-- Verify the seed
-- ============================================================
SELECT
  (SELECT count(*) FROM auth.users  WHERE email LIKE '%@example.com') AS auth_users,
  (SELECT count(*) FROM profiles)                                       AS profiles,
  (SELECT count(*) FROM tickets)                                        AS tickets,
  (SELECT count(*) FROM ticket_history)                                 AS history_entries;
