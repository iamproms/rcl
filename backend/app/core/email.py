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
        subject="You're subscribed to Rewaj updates",
        plain_text_content=(
            "Thank you for subscribing to Rewaj Corporate Limited updates.\n\n"
            "You will receive the latest news, industry insights, and company updates directly to your inbox.\n\n"
            "If you did not request this subscription, please ignore this email."
        )
    )

    try:
        sg = SendGridAPIClient(settings.SENDGRID_API_KEY)
        sg.send(admin_message)
        sg.send(confirmation_message)
    except Exception as e:
        print(f"Error sending newsletter email: {e}")
