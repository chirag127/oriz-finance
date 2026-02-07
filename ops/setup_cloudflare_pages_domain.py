"""
Setup Cloudflare Pages Custom Domain

This script adds the subdomains as custom domains to the Cloudflare Pages project.
"""
import os
import logging
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

DOMAIN = "oriz.in"
PROJECT_NAME = "finsuite"
SUBDOMAINS = ["money", "finance", "fin", "wealth", "calc", "capital"]

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

def setup_pages_domain():
    """
    Add custom domains to Cloudflare Pages project.
    """
    try:
        cf = get_cloudflare_client()
        account_id = os.getenv("CLOUDFLARE_ACCOUNT_ID")

        if not account_id:
            logger.error("Missing CLOUDFLARE_ACCOUNT_ID in environment variables.")
            return False

        logger.info(f"Adding custom domains to Pages project: {PROJECT_NAME}")

        for subdomain in SUBDOMAINS:
            full_domain = f"{subdomain}.{DOMAIN}"
            logger.info(f"Adding domain: {full_domain}")

            try:
                # Add custom domain to pages project
                # Note: The SDK structure might imply something like cf.pages.projects.domains.create
                # Creating custom domain for a project
                cf.pages.projects.domains.create(
                    account_id=account_id,
                    project_name=PROJECT_NAME,
                    name=full_domain
                )
                logger.info(f"Successfully added {full_domain} to project {PROJECT_NAME}")
            except Exception as e:
                # Check if it fails because it already exists (API might return 409 or similar error)
                if "already exists" in str(e) or "already active" in str(e):
                    logger.info(f"Domain {full_domain} is already configured.")
                else:
                    logger.error(f"Failed to add {full_domain}: {e}")
                    # Continue with other domains even if one fails

        return True

    except Exception as e:
        logger.error(f"Failed to setup Pages custom domains: {e}")
        return False

if __name__ == "__main__":
    setup_pages_domain()
