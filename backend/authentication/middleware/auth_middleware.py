import logging

from django.utils.deprecation import MiddlewareMixin

logger = logging.getLogger(__name__)

class AccessTokenHeaderMiddleware(MiddlewareMixin):
    """
    Middleware to extract the access token from the HttpOnly cookie
    and set it in the Authorization header for Django's authentication system.
    """

    def process_request(self, request):
        # Extract the access token from cookies
        access_token = request.COOKIES.get("accessToken")

        if access_token:
            # Set the token in the Authorization header
            request.META['HTTP_AUTHORIZATION'] = f'Bearer {access_token}'
        else:
            logger.debug("Access token not found in cookies.")
