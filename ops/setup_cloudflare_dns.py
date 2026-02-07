"""
Setup Cloudflare DNS Records

This script creates CNAME records on Cloudflare for the subdomains
pointing to the Cloudflare Pages deployment.
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
TARGET_HOST = "finsuite.pages.dev"
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

def get_zone_id(cf, domain: str) -> str | None:
    """Get zone ID for domain."""
    zones = cf.zones.list(name=domain)
    if zones.result and len(zones.result) > 0:
        return zones.result[0].id
    return None

def setup_cloudflare_dns(zone_id: str = None):
    """
    Create CNAME records for subdomains.

    Args:
        zone_id: Optional zone ID. If not provided, will look up by domain name.
    """
    try:
        cf = get_cloudflare_client()

        if not zone_id:
            zone_id = get_zone_id(cf, DOMAIN)
            if not zone_id:
                logger.error(f"Zone not found for {DOMAIN}. Run setup_cloudflare_zone.py first.")
                return False

        logger.info(f"Using zone ID: {zone_id}")

        for subdomain in SUBDOMAINS:
            full_name = f"{subdomain}.{DOMAIN}"
            logger.info(f"Creating CNAME record: {full_name} -> {TARGET_HOST}")

            # Check if record already exists
            existing = cf.dns.records.list(zone_id=zone_id, name=full_name, type="CNAME")

            if existing.result and len(existing.result) > 0:
                # Update existing record
                record_id = existing.result[0].id
                logger.info(f"Record already exists. Updating record {record_id}...")
                cf.dns.records.update(
                    dns_record_id=record_id,
                    zone_id=zone_id,
                    name=subdomain,
                    type="CNAME",
                    content=TARGET_HOST,
                    proxied=True,  # Enable Cloudflare proxy for performance/security
                    ttl=1  # Auto TTL when proxied
                )
                logger.info(f"Updated CNAME record for {full_name}")
            else:
                # Create new record
                cf.dns.records.create(
                    zone_id=zone_id,
                    name=subdomain,
                    type="CNAME",
                    content=TARGET_HOST,
                    proxied=True,
                    ttl=1
                )
                logger.info(f"Created CNAME record for {full_name}")

        logger.info("All DNS records configured successfully!")
        return True

    except Exception as e:
        logger.error(f"Failed to setup DNS records: {e}")
        return False

if __name__ == "__main__":
    setup_cloudflare_dns()
