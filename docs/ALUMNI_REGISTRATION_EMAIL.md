# Alumni registration confirmation email

The alumni registration API sends a confirmation message after it saves a new
registration. The message includes the registration ID, department, alumni
status, and graduation year; it does not include the alumnus's phone number or
PIN.

Configure `BREVO_API_KEY`, `BREVO_SENDER_EMAIL`, and `BREVO_SENDER_NAME` in
`server/.env` for local development and in the backend deployment environment.
Verify the sender address in Brevo before sending. Keep the API key server-side;
never expose it through a `VITE_` variable or commit it to source control.

An email delivery or configuration failure does not undo a saved registration.
The API reports whether the confirmation was sent, and the registration success
page tells the alumnus when it could not be delivered.
