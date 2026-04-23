import aiosmtplib
from email.message import EmailMessage
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
from app.core.config import settings
from app.models.content import ContactSubmission, NewsletterSubscription

async def send_email_async(to_email: str, subject: str, content: str):
    """Unified helper to send email via SMTP (priority) or SendGrid."""
    # Try SMTP first if configured
    if settings.SMTP_USER and settings.SMTP_PASSWORD:
        message = EmailMessage()
        message["From"] = settings.FROM_EMAIL
        message["To"] = to_email
        message["Subject"] = subject
        message.set_content(content)
        
        try:
            await aiosmtplib.send(
                message,
                hostname=settings.SMTP_HOST,
                port=settings.SMTP_PORT,
                username=settings.SMTP_USER,
                password=settings.SMTP_PASSWORD,
                start_tls=settings.SMTP_TLS,
            )
            return True, None
        except Exception as e:
            return False, f"SMTP Error: {str(e)}"
            
    # Fallback to SendGrid if API Key is present
    elif settings.SENDGRID_API_KEY:
        sg = SendGridAPIClient(settings.SENDGRID_API_KEY)
        message = Mail(
            from_email=settings.FROM_EMAIL,
            to_emails=to_email,
            subject=subject,
            plain_text_content=content
        )
        try:
            # Note: SendGrid's SDK is technically synchronous, 
            # but we'll wrap it in a pseudo-async call for consistency.
            response = sg.send(message)
            if 200 <= response.status_code < 300:
                return True, None
            else:
                return False, f"SendGrid Error: {response.status_code}"
        except Exception as e:
            return False, f"SendGrid Error: {str(e)}"
            
    return False, "No email provider configured"

async def send_contact_notification(submission: ContactSubmission):
    message_text = f"""
    New contact submission from {submission.name} ({submission.email}).
    
    Company: {submission.company or 'N/A'}
    Phone: {submission.phone or 'N/A'}
    Subject: {submission.subject or 'General Inquiry'}
    
    Message:
    {submission.message}
    
    ---
    This email was sent automatically from Rewaj Corporate Limited portal.
    """
    await send_email_async(
        to_email=settings.ADMIN_EMAIL,
        subject=f"New Contact: {submission.subject or 'General Inquiry'}",
        content=message_text
    )

async def send_newsletter_notification(subscription: NewsletterSubscription):
    admin_content = (
        f"A visitor subscribed to the newsletter with the email: {subscription.email}.\n"
        f"Subscription date: {subscription.created_at}" if subscription.created_at else
        f"A visitor subscribed to the newsletter with the email: {subscription.email}."
    )
    
    confirmation_content = (
        "Thank you for subscribing to Rewaj Corporate Limited's Industry Insights.\n\n"
        "You will receive the latest industry insights, expert analysis, and updates on the Nigerian energy sector directly to your inbox.\n\n"
        "If you did not request this subscription, please ignore this email."
    )

    await send_email_async(settings.ADMIN_EMAIL, "New Newsletter Subscriber", admin_content)
    await send_email_async(subscription.email, "You're subscribed to Industry Insights", confirmation_content)

async def send_bulk_newsletter(subscribers, subject: str, content: str):
    success_count = 0
    errors = []
    
    for subscriber in subscribers:
        success, error = await send_email_async(subscriber.email, subject, content)
        if success:
            success_count += 1
        else:
            errors.append(error)
            
    return success_count, errors

async def send_career_notification(application_name: str, application_email: str, job_title: str):
    message_text = f"""
    New Job Application Received:
    
    Name: {application_name}
    Email: {application_email}
    Subject Job: {job_title}
    
    Please log in to the admin dashboard to review the CV and certifications.
    https://rewajcorporate.com/admin/careers/applications
    
    ---
    This email was sent automatically from Rewaj Corporate Limited portal.
    """
    
    await send_email_async(
        to_email="careers@rewajcorporate.com", 
        subject=f"New Application: {job_title} - {application_name}",
        content=message_text
    )
