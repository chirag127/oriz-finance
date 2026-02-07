"""
Inspect DNS Records for Debugging

This script lists the CNAME records for the subdomains to check configuration.
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

def check_dns_records():
    """
    List CNAME records for subdomains.
    """
    try:
        cf = get_cloudflare_client()
        zones = cf.zones.list(name=DOMAIN)
        if not zones.result:
            logger.error(f"Zone {DOMAIN} not found.")
            return

        zone_id = zones.result[0].id

        print("\n" + "="*80)
        print(f"{'NAME':<20} | {'TYPE':<6} | {'CONTENT':<30} | {'PROXIED':<10} | {'TTL'}")
        print("="*80)

        for subdomain in SUBDOMAINS:
            full_name = f"{subdomain}.{DOMAIN}"
            records = cf.dns.records.list(zone_id=zone_id, name=full_name)

            if records.result:
                for r in records.result:
                    print(f"{r.name:<20} | {r.type:<6} | {r.content:<30} | {str(r.proxied):<10} | {r.ttl}")
            else:
                 print(f"{full_name:<20} | {'MISSING':<6} | {'-':<30} | {'-':<10} | -")

        print("="*80 + "\n")

    except Exception as e:
        logger.error(f"Failed to check DNS records: {e}")

if __name__ == "__main__":
    check_dns_records()
