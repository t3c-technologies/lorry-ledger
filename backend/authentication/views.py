from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.timezone import now
from datetime import timedelta
from django_ratelimit.decorators import ratelimit
import json, random, logging
from .models import OTPSession, OTPLog
from .models import User
from .utils import hash_mobile_number

from rest_framework_simplejwt.tokens import RefreshToken

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
                mobile_number=hashed_mobile_number, created_at__gte=time_threshold, log_status=0
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

            # For signups
            first_name = data.get("first_name", "")
            last_name = data.get("last_name", "")
            email = data.get("email", "")
            company_name = data.get("company_name", "")

            if not mobile_number or len(mobile_number) != 10 or not mobile_number.isdigit():
                return JsonResponse({"message": "Invalid mobile number."}, status=400)
            if not otp_received or len(otp_received) != 4 or not otp_received.isdigit():
                return JsonResponse({"message": "Invalid OTP."}, status=400)
            hashed_mobile_number = hash_mobile_number(mobile_number)
            time_threshold = now() - timedelta(minutes=5)
            session = OTPSession.objects.filter(
                mobile_number=hashed_mobile_number, created_at__gte=time_threshold, validated=False, log_status=0
            ).order_by('-created_at').first()
            if not session:
                return JsonResponse({"message": "Session expired or invalid."}, status=400)
            if session.otp_sent == otp_received:
                session.validated = True
                session.log_status = 1
                session.save()

                # Generating tokens
                user, created = User.objects.update_or_create(
                    mobile_number=mobile_number,
                    defaults={
                        "first_name": first_name,
                        "last_name": last_name,
                        "email": email,
                        "company_name": company_name,
                    },
                )
                 # Generate Access and Refresh tokens
                refresh = RefreshToken.for_user(user)
                access = str(refresh.access_token)
                # Response with tokens
                response = JsonResponse(
                    {
                        "message": "Validated successfully",
                        "mobile": mobile_number,
                        "success": True,
                        "access": access,
                    },
                    status=200,
                )
                # Set Refresh Token as HTTP-only cookie
                response.set_cookie(
                    key="refreshToken",
                    value=str(refresh),
                    httponly=True,  # Prevent JavaScript access
                    secure=True,  # Use HTTPS in production
                    samesite="Strict",  # CSRF protection
                    path="/",
                )
                # Set Mobile Number as HTTP-only cookie
                response.set_cookie(
                    key="mobileNumber",
                    value=str(mobile_number),
                    httponly=True,  # Prevent JavaScript access
                    secure=True,  # Use HTTPS in production
                    samesite="Strict",  # CSRF protection
                    path="/",
                )
                return response
            else:
                return JsonResponse({"message": "Invalid OTP.", "success": False}, status=400)
        except Exception as e:
            logger.error(f"Error processing OTP for {mobile_number}: {str(e)}")
            return JsonResponse({"error": "Internal server error.", "success": False}, status=500)
    return JsonResponse({"message": "Invalid request method.", "success": False}, status=400)

# View to check if there is existing session & to redirect the user to enter opt
@csrf_exempt  # Use CSRF protection in production
@ratelimit(key='ip', rate='5/m', method='POST', block=True)
def check_session(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            mobile_number = data.get("mobile_number")
            if not mobile_number or len(mobile_number) != 10 or not mobile_number.isdigit():
                return JsonResponse({"message": "Invalid mobile number.","success": False}, status=400)
            hashed_mobile_number = hash_mobile_number(mobile_number)
            time_threshold = now() - timedelta(minutes=5)
            session = OTPSession.objects.filter(
                mobile_number=hashed_mobile_number, created_at__gte=time_threshold, validated=False
            ).order_by('-created_at').first()
            if session:
                return JsonResponse({"message": "Session exists.", "session_id": session.id, "success": True}, status=200)
            else:
                return JsonResponse({"message": "No active session found.", "success": False}, status=404)
        except Exception as e:
            logger.error(f"Error checking session for {mobile_number}: {str(e)}")
            return JsonResponse({"message": "Internal server error.", "success": False}, status=500)
    return JsonResponse({"message": "Invalid request method.", "success": False}, status=400)

@csrf_exempt
def logout(request):
    if request.method == "POST":
        try:
            # Get Refresh Token from request
            refresh_token = request.COOKIES.get('refreshToken')  # Fetch from cookie
            mobile_number = request.COOKIES.get('mobileNumber')  # Fetch from cookie
            if not refresh_token:
                return JsonResponse({"message": "Refresh token is required.", "success": False}, status=400)

            # Blacklist the Refresh Token
            token = RefreshToken(refresh_token)
            token.blacklist()  # Blacklist the token in the DB

            # Setting the session to logged out
            hashed_mobile_number = hash_mobile_number(mobile_number)
            session = OTPSession.objects.filter(
                mobile_number=hashed_mobile_number, validated=True, log_status=1
            ).order_by('-created_at').first()
            if not session:
                return JsonResponse({"message": "Session expired or invalid."}, status=400)
            session.log_status = 2
            session.save()

            # Clear cookie
            response = JsonResponse({"message": "Logged out successfully.", "success": True}, status=200)
            response.delete_cookie("refreshToken")
            return response
        except Exception as e:
            return JsonResponse({"error": "Invalid token or already logged out.", "success": False}, status=400)

    return JsonResponse({"message": "Invalid request method.", "success": False}, status=400)
