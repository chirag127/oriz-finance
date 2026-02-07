"""
Setup Cloudflare Zone for oriz.in

This script:
1. Adds the domain to Cloudflare (or retrieves existing zone).
2. Returns the assigned Cloudflare nameservers.
"""
import os
import logging
from dotenv import load_dotenv

try:
    import cloudflare
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
        raise ValueError("Missing Cloudflare credentials. Set CLOUDFLARE_API_TOKEN or (CLOUDFLARE_GLOBAL_API_KEY + CLOUDFLARE_EMAIL)")

def setup_cloudflare_zone():
    """
    Add domain to Cloudflare and return nameservers.
    Returns tuple: (zone_id, nameservers_list) or (None, None) on failure.
    """
    try:
        cf = get_cloudflare_client()
        account_id = os.getenv("CLOUDFLARE_ACCOUNT_ID")

        if not account_id:
            logger.error("Missing CLOUDFLARE_ACCOUNT_ID in environment variables.")
            return None, None

        logger.info(f"Checking if zone {DOMAIN} already exists...")

        # List existing zones to check if domain already added
        zones = cf.zones.list(name=DOMAIN)

        if zones.result and len(zones.result) > 0:
            zone = zones.result[0]
            zone_id = zone.id
            nameservers = zone.name_servers
            logger.info(f"Zone {DOMAIN} already exists. Zone ID: {zone_id}")
            logger.info(f"Nameservers: {nameservers}")
            return zone_id, nameservers

        # Create new zone
        logger.info(f"Creating zone for {DOMAIN}...")
        zone = cf.zones.create(
            account={"id": account_id},
            name=DOMAIN,
            type="full"  # Full setup means Cloudflare manages DNS
        )

        zone_id = zone.id
        nameservers = zone.name_servers

        logger.info(f"Zone created successfully! Zone ID: {zone_id}")
        logger.info(f"Cloudflare Nameservers: {nameservers}")
        logger.info("Update your domain registrar (Spaceship) with these nameservers.")

        return zone_id, nameservers

    except Exception as e:
        logger.error(f"Failed to setup Cloudflare zone: {e}")
        return None, None

if __name__ == "__main__":
    zone_id, nameservers = setup_cloudflare_zone()
    if zone_id:
        print(f"\nZone ID: {zone_id}")
        print(f"Nameservers: {nameservers}")
