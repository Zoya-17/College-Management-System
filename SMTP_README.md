SMTP configuration

To enable welcome emails you'll need to set the following environment variables in your `.env` for the Server:

- SMTP_HOST - SMTP server host (e.g., smtp.gmail.com)
- SMTP_PORT - SMTP port (e.g., 587)
- SMTP_USER - SMTP username
- SMTP_PASS - SMTP password
- SMTP_FROM - (optional) From address for outgoing mail

Example .env lines:

SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=youruser
SMTP_PASS=yourpass
SMTP_FROM="College CMIS <no-reply@college.edu>"

Then restart the server. The admin can call POST /api/auth/send-welcome with JSON { email, password, name } to send the welcome email.
