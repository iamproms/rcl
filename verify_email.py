import os
import sys

# Add the backend directory to sys.path to import settings
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from app.core.config import settings
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail

def test_send():
    print(f"Testing SendGrid with:")
    print(f"FROM_EMAIL: {settings.FROM_EMAIL}")
    print(f"ADMIN_EMAIL: {settings.ADMIN_EMAIL}")
    print(f"API KEY PRESENT: {'Yes' if settings.SENDGRID_API_KEY else 'No'}")
    
    if not settings.SENDGRID_API_KEY:
        print("Error: SENDGRID_API_KEY is missing!")
        return

    message = Mail(
        from_email=settings.FROM_EMAIL,
        to_emails=settings.ADMIN_EMAIL,
        subject="RCL Email Diagnostic Test",
        plain_text_content="This is a test email from the RCL diagnostic script to verify SendGrid configuration."
    )
    
    try:
        sg = SendGridAPIClient(settings.SENDGRID_API_KEY)
        response = sg.send(message)
        print(f"Status Code: {response.status_code}")
        print(f"Body: {response.body}")
        print(f"Headers: {response.headers}")
        if response.status_code >= 200 and response.status_code < 300:
            print("SUCCESS: Email sent successfully according to SendGrid.")
        else:
            print(f"FAILURE: SendGrid returned status {response.status_code}")
    except Exception as e:
        print(f"CRITICAL ERROR: {e}")
        if hasattr(e, 'body'):
            print(f"Error Body: {e.body}")

if __name__ == "__main__":
    test_send()
