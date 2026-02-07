"""
Check SSL Status for Cloudflare Pages Domains

This script retrieves the status of custom domains in the Pages project
to see the current SSL certificate state.
"""
import os
import logging
import json
from dotenv import load_dotenv

try:
    from cloudflare import Cloudflare
except ImportError:
    print("cloudflare library not installed. Run: pip install cloudflare")
    exit(1)

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

PROJECT_NAME = "finsuite"

def get_cloudflare_client():
    """Create Cloudflare client using API token or Global API Key."""
    api_token = os.getenv("CLOUDFLARE_API_TOKEN")
    api_key = os.getenv("CLOUDFLARE_GLOBAL_API_KEY")
    email = os.getenv("CLOUDFLARE_EMAIL")

    if api_token:
        return Cloudflare(api_token=api_token)
    elif api_key and email:
        return Cloudflare(api_key=api_key, api_email=email)
    else:
        raise ValueError("Missing Cloudflare credentials.")

def check_ssl_status():
    """
    List domains and check SSL status.
    """
    try:
        cf = get_cloudflare_client()
        account_id = os.getenv("CLOUDFLARE_ACCOUNT_ID")

        if not account_id:
            logger.error("Missing CLOUDFLARE_ACCOUNT_ID in environment variables.")
            return

        logger.info(f"Checking SSL status for project: {PROJECT_NAME}")

        # Get project details (including domains) regarding pages
        # The structure is usually GET /accounts/{account_id}/pages/projects/{project_name}/domains

        domains = cf.pages.projects.domains.list(
            account_id=account_id,
            project_name=PROJECT_NAME
        )

        if not domains.result:
            logger.info("No domains found for this project.")
            return

        print("\n" + "="*60)
        print(f"{'DOMAIN':<30} | {'STATUS':<15} | {'SSL STATUS':<15}")
        print("="*60)

        for domain in domains.result:
            name = domain.name
            status = domain.status

            # Certificate status might be nested or named differently depending on API version
            # Usually it is under 'certificate_status' or similar
            # Let's inspect the object structure in a safe way

            # In some SDK versions it's certificate_authority or status
            # We'll dump a bit of info if we can't find it directly, usually 'status' is high level
            # Check for specific SSL related fields if available

            ssl_status = "N/A"
            if hasattr(domain, 'verification_status'):
                ssl_status = domain.verification_status
            elif hasattr(domain, 'certificate_status'):
                 ssl_status = domain.certificate_status

            # Additional detail field
            detail = ""
            if hasattr(domain, 'validation_error'):
                detail = domain.validation_error or ""

            print(f"{name:<30} | {status:<15} | {ssl_status:<15} {detail}")

        print("="*60 + "\n")

    except Exception as e:
        logger.error(f"Failed to check SSL status: {e}")

if __name__ == "__main__":
    check_ssl_status()
