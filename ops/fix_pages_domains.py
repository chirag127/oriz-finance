"""
Fix Cloudflare Pages Domains

This script checks for deactivated/inactive domains and re-adds them.
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

PROJECT_NAME = "finsuite"

def get_cloudflare_client():
    api_token = os.getenv("CLOUDFLARE_API_TOKEN")
    api_key = os.getenv("CLOUDFLARE_GLOBAL_API_KEY")
    email = os.getenv("CLOUDFLARE_EMAIL")

    if api_token:
        return Cloudflare(api_token=api_token)
    elif api_key and email:
        return Cloudflare(api_key=api_key, api_email=email)
    else:
        raise ValueError("Missing Cloudflare credentials.")

def fix_pages_domains():
    try:
        cf = get_cloudflare_client()
        account_id = os.getenv("CLOUDFLARE_ACCOUNT_ID")

        if not account_id:
            logger.error("Missing CLOUDFLARE_ACCOUNT_ID.")
            return

        logger.info(f"Checking domains for project: {PROJECT_NAME}")

        domains = cf.pages.projects.domains.list(
            account_id=account_id,
            project_name=PROJECT_NAME
        )

        if not domains.result:
            logger.info("No domains found.")
            return

        for domain in domains.result:
            name = domain.name
            status = domain.status
            logger.info(f"Domain: {name}, Status: {status}")

            if status != "active":
                logger.info(f"Domain {name} is NOT active (Status: {status}). Attempting to reset...")

                # Delete
                try:
                    logger.info(f"Deleting {name}...")
                    cf.pages.projects.domains.delete(
                        domain_name=name,
                        account_id=account_id,
                        project_name=PROJECT_NAME
                    )
                    logger.info(f"Deleted {name}.")
                except Exception as e:
                    logger.error(f"Failed to delete {name}: {e}")
                    continue

                # Re-add
                try:
                    logger.info(f"Re-adding {name}...")
                    cf.pages.projects.domains.create(
                        account_id=account_id,
                        project_name=PROJECT_NAME,
                        name=name
                    )
                    logger.info(f"Successfully re-added {name}.")
                except Exception as e:
                    logger.error(f"Failed to re-add {name}: {e}")
            else:
                logger.info(f"Domain {name} is active. No action needed.")

    except Exception as e:
        logger.error(f"An error occurred: {e}")

if __name__ == "__main__":
    fix_pages_domains()
