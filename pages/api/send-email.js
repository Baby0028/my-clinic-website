import { Resend } from 'resend';

// This is your Resend API key, loaded from environment variables for security.
const resend = new Resend(process.env.RESEND_API_KEY);

// --- Your Clinic's Details (Customize these) ---
const DOCTOR_NAME = "Dr. Pratikshya K. Padhy";
const DOCTOR_EMAIL = "kshyapratik@gmail.com"; // Your email
const CLINIC_NAME = "Dr. Pratikshya's Clinic";
const GOOGLE_MEET_LINK = "https://meet.google.com/your-static-link"; // Your static Google Meet link
const UPI_ID = "doctor.pratikshya@upi";
const CONSULTATION_FEE = "₹500";
// ------------------------------------------------

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { type, name, email, date, time, upiId } = req.body;

  let patientSubject = '';
  let patientHtmlBody = '';
  let doctorSubject = '';
  let doctorHtmlBody = '';
  let ccEmails = [{ email: DOCTOR_EMAIL }]; // CC the doctor on all patient emails

  try {
    if (type === 'appointment') {
      // --- 1. Email for the Patient (Appointment) ---
      patientSubject = 'Your Appointment is Confirmed!';
      patientHtmlBody = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h1 style="color: #0694A2;">Appointment Confirmed!</h1>
          <p>Hi ${name},</p>
          <p>Your consultation with <strong>${DOCTOR_NAME}</strong> is confirmed for:</p>
          <p style="font-size: 1.2em; font-weight: bold; color: #333;">
            ${date} at ${time} IST
          </p>
          <p style="font-weight: bold;">Please add this event to your personal calendar to get a reminder.</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
          
          <h2 style="color: #0694A2;">Next Steps:</h2>
          <ol>
            <li>
              <strong>Payment:</strong> Please send the consultation fee of <strong>${CONSULTATION_FEE}</strong> to the following UPI ID:
              <br>
              <strong style="font-size: 1.1em; color: #000;">${UPI_ID}</strong>
            </li>
            <li>
              <strong>Join the Call:</strong> At your scheduled time, please join the Google Meet using the link below:
              <br>
              <a href="${GOOGLE_MEET_LINK}" style="color: #0694A2; text-decoration: none;">${GOOGLE_MEET_LINK}</a>
            </li>
          </ol>
          
          <p>We look forward to speaking with you!</p>
          <br>
          <p style="font-size: 0.9em; color: #777;">
            Best,
            <br>
            ${CLINIC_NAME}
          </p>
        </div>
      `;

      // --- 2. Notification for the Doctor (Appointment) ---
      doctorSubject = `New Appointment: ${name} on ${date}`;
      doctorHtmlBody = `
        <p>You have a new appointment:</p>
        <ul>
          <li><strong>Patient:</strong> ${name}</li>
          <li><strong>Email:</strong> ${email}</li>
          <li><strong>Date:</strong> ${date}</li>
          <li><strong>Time:</strong> ${time} IST</li>
          <li><strong>Service:</strong> Consultation</li>
        </ul>
      `;

    } else if (type === 'discovery') {
      // --- 1. Email for the Patient (Discovery) ---
      patientSubject = 'Your Discovery Call is Confirmed!';
      patientHtmlBody = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h1 style="color: #0694A2;">Discovery Call Confirmed!</h1>
          <p>Hi ${name},</p>
          <p>Your <strong>${CONSULTATION_FEE}</strong> Discovery Call with <strong>${DOCTOR_NAME}</strong> is confirmed for your preferred date of:</p>
          <p style="font-size: 1.2em; font-weight: bold; color: #333;">
            ${date}
          </p>
          <p>We have received your UPI Transaction ID (<strong>${upiId}</strong>) for verification and will contact you shortly at <strong>${email}</strong> to finalize the exact time.</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
          <h2 style="color: #0694A2;">Meeting Link:</h2>
          <p>Once the time is set, please use the Google Meet link below for our call:</p>
          <a href="${GOOGLE_MEET_LINK}" style="color: #0694A2; text-decoration: none;">${GOOGLE_MEET_LINK}</a>
          <br>
          <p>We look forward to speaking with you!</p>
          <br>
          <p style="font-size: 0.9em; color: #777;">
            Best,
            <br>
            ${CLINIC_NAME}
          </p>
        </div>
      `;
      
      // --- 2. Notification for the Doctor (Discovery) ---
      doctorSubject = `New Discovery Call: ${name} on ${date}`;
      doctorHtmlBody = `
        <p>You have a new discovery call booking:</p>
        <ul>
          <li><strong>Patient:</strong> ${name}</li>
          <li><strong>Email:</strong> ${email}</li>
          <li><strong>Preferred Date:</strong> ${date}</li>
          <li><strong>UPI ID:</strong> ${upiId}</li>
          <li><strong>Service:</strong> Discovery Call</li>
        </ul>
      `;
    } else {
      return res.status(400).json({ error: 'Invalid booking type' });
    }

    // --- Send Email to Patient (with CC to Doctor) ---
    await resend.emails.send({
      from: `${CLINIC_NAME} <noreply@your-verified-domain.com>`, // IMPORTANT: Must be from a domain you verified in Resend.
      to: [email],
      cc: ccEmails,
      subject: patientSubject,
      html: patientHtmlBody,
    });

    // --- Send Separate Notification to Doctor ---
    // (This is a good backup in case the CC fails)
    await resend.emails.send({
      from: `Clinic System <notify@your-verified-domain.com>`, // IMPORTANT: Must be from a domain you verified in Resend.
      to: [DOCTOR_EMAIL],
      subject: doctorSubject,
      html: doctorHtmlBody,
    });

    res.status(200).json({ message: 'Booking successful and emails sent.' });

  } catch (error) {
    console.error('Error sending email:', error);
    // Send a 200 OK response even if email fails, because the booking *was* successful.
    // The user should not see an error if their booking is in the database.
    res.status(200).json({ message: 'Booking successful, but email notification failed.' });
  }
}