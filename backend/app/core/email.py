from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
from app.core.config import settings
from app.models.content import ContactSubmission, NewsletterSubscription

async def send_contact_notification(submission: ContactSubmission):
    if not settings.SENDGRID_API_KEY:
        return
    
    # Message content
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
    
    message = Mail(
        from_email=settings.FROM_EMAIL,
        to_emails=settings.ADMIN_EMAIL,
        subject=f"New Contact: {submission.subject or 'General Inquiry'}",
        plain_text_content=message_text
    )
    
    try:
        sg = SendGridAPIClient(settings.SENDGRID_API_KEY)
        # Using a background thread or a more robust async strategy is better for production, 
        # but for this audit activation, we'll keep it simple.
        sg.send(message)
    except Exception as e:
        print(f"Error sending email: {e}")


async def send_newsletter_notification(subscription: NewsletterSubscription):
    if not settings.SENDGRID_API_KEY:
        return

    admin_message = Mail(
        from_email=settings.FROM_EMAIL,
        to_emails=settings.ADMIN_EMAIL,
        subject="New Newsletter Subscriber",
        plain_text_content=(
            f"A visitor subscribed to the newsletter with the email: {subscription.email}.\n"
            f"Subscription date: {subscription.created_at}" if subscription.created_at else
            f"A visitor subscribed to the newsletter with the email: {subscription.email}."
        )
    )

    confirmation_message = Mail(
        from_email=settings.FROM_EMAIL,
        to_emails=subscription.email,
        subject="You're subscribed to Industry Insights",
        plain_text_content=(
            "Thank you for subscribing to Rewaj Corporate Limited's Industry Insights.\n\n"
            "You will receive the latest industry insights, expert analysis, and updates on the Nigerian energy sector directly to your inbox.\n\n"
            "If you did not request this subscription, please ignore this email."
        )
    )

    try:
        sg = SendGridAPIClient(settings.SENDGRID_API_KEY)
        sg.send(admin_message)
        sg.send(confirmation_message)
    except Exception as e:
        print(f"Error sending newsletter email: {e}")


async def send_bulk_newsletter(subscribers, subject: str, content: str):
    if not settings.SENDGRID_API_KEY:
        return 0, ["SendGrid API Key is missing"]
    
    sg = SendGridAPIClient(settings.SENDGRID_API_KEY)
    success_count = 0
    errors = []
    
    for subscriber in subscribers:
        try:
            message = Mail(
                from_email=settings.FROM_EMAIL,
                to_emails=subscriber.email,
                subject=subject,
                plain_text_content=content
            )
            response = sg.send(message)
            if response.status_code >= 200 and response.status_code < 300:
                success_count += 1
            else:
                errors.append(f"SendGrid error for {subscriber.email}: Status {response.status_code}")
        except Exception as e:
            error_msg = str(e)
            if hasattr(e, 'body'):
                error_msg = f"{e} - {e.body}"
            errors.append(f"Failed to send to {subscriber.email}: {error_msg}")
            print(f"Error sending newsletter to {subscriber.email}: {error_msg}")
            
    return success_count, errors

async def send_career_notification(application_name: str, application_email: str, job_title: str):
    if not settings.SENDGRID_API_KEY:
        return
    
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
    
    message = Mail(
        from_email=settings.FROM_EMAIL,
        to_emails="careers@rewajcorporate.com", 
        subject=f"New Application: {job_title} - {application_name}",
        plain_text_content=message_text
    )
    
    try:
        sg = SendGridAPIClient(settings.SENDGRID_API_KEY)
        sg.send(message)
    except Exception as e:
        print(f"Error sending career notification email: {e}")
