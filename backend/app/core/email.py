import resend
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

# Initialize Resend API key
resend.api_key = settings.RESEND_API_KEY

def send_verification_email(email_to: str, token: str) -> bool:
    """
    Sends a verification email to the user.
    Uses Resend if RESEND_API_KEY is configured.
    """
    verification_link = f"http://localhost:3000/verify-email?token={token}"
    
    html_content = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <h2 style="color: #333; text-align: center;">Willkommen bei Fusion-Baukasten!</h2>
        <p style="color: #555; font-size: 16px; line-height: 1.5;">
            Hallo,<br><br>
            Vielen Dank für Ihre Registrierung. Um Ihre E-Mail-Adresse zu bestätigen und Ihr Konto zu aktivieren, klicken Sie bitte auf den unten stehenden Button:
        </p>
        <div style="text-align: center; margin: 30px 0;">
            <a href="{verification_link}" style="background-color: #000; color: #fff; padding: 12px 24px; text-decoration: none; font-size: 16px; font-weight: bold; border-radius: 5px; display: inline-block;">
                E-Mail Adresse bestätigen
            </a>
        </div>
        <p style="color: #777; font-size: 14px; text-align: center; border-top: 1px solid #eee; padding-top: 20px;">
            Wenn der Button nicht funktioniert, kopieren Sie diesen Link in Ihren Browser:<br>
            <a href="{verification_link}" style="color: #0066cc;">{verification_link}</a>
        </p>
    </div>
    """
    
    if not settings.RESEND_API_KEY:
        logger.warning(f"RESEND_API_KEY not set. Verification link for {email_to}: {verification_link}")
        return True

    try:
        # Note: Since the user is in testing mode, the "from" address must be a verified domain or onboarding@resend.dev
        r = resend.Emails.send({
            "from": "onboarding@resend.dev",
            "to": email_to,
            "subject": "Bitte bestätigen Sie Ihre E-Mail-Adresse - Fusion-Baukasten",
            "html": html_content
        })
        logger.info(f"Verification email sent successfully to {email_to}")
        return True
    except Exception as e:
        logger.error(f"Failed to send email to {email_to}: {e}")
        # In testing mode, if they provide an email not registered to Resend, it will throw an error.
        return False

def send_password_reset_email(email_to: str, token: str) -> bool:
    """
    Sends a password reset email to the user.
    """
    reset_link = f"http://localhost:3000/reset-password?token={token}"
    
    html_content = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <h2 style="color: #333; text-align: center;">Passwort zurücksetzen</h2>
        <p style="color: #555; font-size: 16px; line-height: 1.5;">
            Hallo,<br><br>
            Sie haben das Zurücksetzen Ihres Passworts angefordert. Klicken Sie auf den folgenden Button, um ein neues Passwort festzulegen:
        </p>
        <div style="text-align: center; margin: 30px 0;">
            <a href="{reset_link}" style="background-color: #4414c9; color: #fff; padding: 12px 24px; text-decoration: none; font-size: 16px; font-weight: bold; border-radius: 5px; display: inline-block;">
                Passwort zurücksetzen
            </a>
        </div>
        <p style="color: #777; font-size: 14px; text-align: center; border-top: 1px solid #eee; padding-top: 20px;">
            Wenn der Button nicht funktioniert, kopieren Sie diesen Link in Ihren Browser:<br>
            <a href="{reset_link}" style="color: #0066cc;">{reset_link}</a>
        </p>
        <p style="color: #777; font-size: 14px; text-align: center;">
            Wenn Sie diese Anfrage nicht gestellt haben, können Sie diese E-Mail ignorieren.
        </p>
    </div>
    """
    
    if not settings.RESEND_API_KEY:
        logger.warning(f"RESEND_API_KEY not set. Password reset link for {email_to}: {reset_link}")
        return True

    try:
        r = resend.Emails.send({
            "from": "onboarding@resend.dev",
            "to": email_to,
            "subject": "Passwort zurücksetzen - Fusion-Baukasten",
            "html": html_content
        })
        logger.info(f"Password reset email sent successfully to {email_to}")
        return True
    except Exception as e:
        logger.error(f"Failed to send password reset email to {email_to}: {e}")
        return False
