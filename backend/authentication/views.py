from django.db.models import Sum, Min
import random
from datetime import timedelta
from django.utils.timezone import now
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_protect, csrf_exempt
from .models import OTPSession
import json
from django_ratelimit.decorators import ratelimit
from .utils import encrypt, decrypt, hash_mobile_number
import logging

logger = logging.getLogger(__name__)  # Initialize logger


@csrf_exempt  # Use CSRF protection in production
@ratelimit(key='ip', rate='5/m', method='POST', block=True)
def generate(request):
    if request.method == "POST":
        try:
            # Parse request body
            data = json.loads(request.body)
            mobile_number = data.get("mobile_number")

            # Validate mobile number
            if not mobile_number or len(mobile_number) != 10 or not mobile_number.isdigit():
                return JsonResponse({"error": "Invalid mobile number."}, status=400)

            # Extract device details
            ip_address = request.META.get('REMOTE_ADDR', '0.0.0.0')  # IP address
            browser = request.META.get('HTTP_USER_AGENT', 'Unknown')  # Browser info
            device_os = "Windows" if "Windows" in browser else "MacOS" if "Mac" in browser else "Unknown"  # OS
            region = "NA"  # Default placeholder

            # Encrypt the mobile number before searching
            hashed_mobile_number = hash_mobile_number(mobile_number)

            # Find active session (valid within 5 minutes)
            time_threshold = now() - timedelta(minutes=5)
            session = OTPSession.objects.filter(
                mobile_number=hashed_mobile_number, created_at__gte=time_threshold
            ).order_by('-created_at').first()  # Latest session

            # If session exists, check resend limit
            if session:
                # Block if resend attempts exceed 3
                if session.resend_count >= 3:
                    # Calculate retry time based on session expiry
                    retry_after = int((session.expiry - now()).total_seconds() / 60)
                    retry_after = max(retry_after, 0)
                    return JsonResponse({"error": f"Too many attempts. Try again after {retry_after} minutes."}, status=429)

                # Increment resend count and update expiry
                session.otp_sent = str(random.randint(1000, 9999))
                session.expiry = now() + timedelta(minutes=5)
                session.resend_count += 1
                session.save()
                otp_sent = session.otp_sent

            else:
                # Create new session if no active session exists
                otp_sent = str(random.randint(1000, 9999))

                OTPSession.objects.create(
                    mobile_number=hashed_mobile_number,
                    otp_sent=otp_sent,
                    expiry=now() + timedelta(minutes=5),
                    validated=False,
                    device_os=device_os,
                    ip_address=ip_address,
                    browser=browser,
                    region=region,
                    resend_count=1  # Set initial count
                )
                
            print(f"OTP Sent: {otp_sent}")
            logger.info(f"OTP sent to {mobile_number} from IP {ip_address}")  # Log success

            return JsonResponse({"message": "OTP sent successfully.", "otp": otp_sent,"mobile":mobile_number}, status=200)

        except Exception as e:
            logger.error(f"Error processing OTP for {mobile_number}: {str(e)}")  # Log errors
            return JsonResponse({"error": str(e)}, status=500)

    return JsonResponse({"error": "Invalid request method."}, status=400)
