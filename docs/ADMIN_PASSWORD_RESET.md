# Admin password reset setup

The admin sign-in page provides an email-based password reset flow. Before enabling
it in a deployment:

1. Apply `server/migrations/008_admin_password_reset.sql` to the same database
   used by the Express API.
2. Set `BREVO_API_KEY`, `BREVO_SENDER_EMAIL`, and `BREVO_SENDER_NAME` from
   `server/.env.example` in `server/.env` locally and in the server's deployment
   environment. Verify the sender address in Brevo before sending. Keep the API
   key server-side; never add it to frontend variables or source control.
3. Set `FRONTEND_URL` to the public frontend origin so emailed links return to
   the correct application.

Password reset messages are sent using Brevo's transactional email API.

Reset links contain a cryptographically random, single-use token, expire after
30 minutes, and are stored only as SHA-256 hashes. The request service returns
the same account-neutral response for unknown addresses and rate-limits requests
by hashed IP and email. Passwords must be at least 12 characters and no more
than 72 UTF-8 bytes.

Google-only admin accounts should continue to use Google sign-in; reset requests
are sent only for active, approved accounts with a local password.
