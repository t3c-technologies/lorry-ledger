from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.timezone import now
from datetime import timedelta
from django_ratelimit.decorators import ratelimit
import json, random, logging
from .models import OTPSession, OTPLog
from .utils import hash_mobile_number

logger = logging.getLogger(__name__)

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
            ip_address = request.META.get('REMOTE_ADDR', '0.0.0.0')
            browser = request.META.get('HTTP_USER_AGENT', 'Unknown')
            device_os = "Windows" if "Windows" in browser else "MacOS" if "Mac" in browser else "Unknown"
            region = "NA"

            # Encrypt the mobile number before searching
            hashed_mobile_number = hash_mobile_number(mobile_number)

            # Find active session (valid within 5 minutes)
            time_threshold = now() - timedelta(minutes=5)
            session = OTPSession.objects.filter(
                mobile_number=hashed_mobile_number, created_at__gte=time_threshold
            ).order_by('-created_at').first()

            # **Check resend limit before creating OTPLog**
            if session and session.resend_count >= 3:
                retry_after = int((session.expiry - now()).total_seconds() / 60)
                retry_after = max(retry_after, 0)
                return JsonResponse({"message": f"Too many attempts. Try again after {retry_after} minutes.", "success": False}, status=429)

            # Generate new OTP
            otp_sent = str(random.randint(1000, 9999))

            # Create an OTP log entry only after validating resend limits
            otp_log = OTPLog.objects.create(
                mobile_number=hashed_mobile_number,
                otp_sent=otp_sent,
                ip_address=ip_address,
                device_os=device_os,
                browser=browser,
                region=region
            )

            if session:
                # Increment resend count and update session
                session.otp_sent = otp_sent
                session.expiry = now() + timedelta(minutes=5)
                session.resend_count += 1
                session.otp_log = otp_log  # Link session to log
                session.save()
            else:
                # Create new session if no active session exists
                OTPSession.objects.create(
                    mobile_number=hashed_mobile_number,
                    otp_sent=otp_sent,
                    expiry=now() + timedelta(minutes=5),
                    validated=False,
                    resend_count=1,
                    otp_log=otp_log  # Link session to log
                )

            logger.info(f"OTP sent to {mobile_number} from IP {ip_address}")
            return JsonResponse({"message": "OTP sent successfully.", "otp": otp_sent, "mobile": mobile_number, "success": True}, status=200)

        except Exception as e:
            logger.error(f"Error processing OTP for {mobile_number}: {str(e)}")
            return JsonResponse({"message": str(e), "success": False}, status=500)

    return JsonResponse({"message": "Invalid request method.", "success": False}, status=400)


@csrf_exempt  # Use CSRF protection in production
@ratelimit(key='ip', rate='5/m', method='POST', block=True)
def validate(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            otp_received = data.get("otp")
            mobile_number = data.get("mobile_number")
            if not mobile_number or len(mobile_number) != 10 or not mobile_number.isdigit():
                return JsonResponse({"message": "Invalid mobile number."}, status=400)
            if not otp_received or len(otp_received) != 4 or not otp_received.isdigit():
                return JsonResponse({"message": "Invalid OTP."}, status=400)
            hashed_mobile_number = hash_mobile_number(mobile_number)
            time_threshold = now() - timedelta(minutes=5)
            session = OTPSession.objects.filter(
                mobile_number=hashed_mobile_number, created_at__gte=time_threshold, validated=False
            ).order_by('-created_at').first()
            if not session:
                return JsonResponse({"message": "Session expired or invalid."}, status=400)
            if session.otp_sent == otp_received:
                session.validated = True
                session.save()
                return JsonResponse(
                    {"message": "Validated successfully", "mobile": mobile_number, "success": True},
                    status=200
                )
            else:
                return JsonResponse({"message": "Invalid OTP.", "success": False}, status=400)
        except Exception as e:
            logger.error(f"Error processing OTP for {mobile_number}: {str(e)}")
            return JsonResponse({"error": "Internal server error.", "success": False}, status=500)
    return JsonResponse({"message": "Invalid request method.", "success": False}, status=400)
