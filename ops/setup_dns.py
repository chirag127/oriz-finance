import os
import requests
import json
import logging
from dotenv import load_dotenv

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()


# Configuration
DOMAIN = "oriz.in"
TARGET_HOST = "finsuite.pages.dev"
SUBDOMAINS = ["money", "finance"]

def setup_spaceship_dns():
    """
    Updates DNS records for specified subdomains on Spaceship.
    """
    SPACESHIP_API_KEY = os.getenv("SPACESHIP_API_KEY")
    SPACESHIP_API_SECRET = os.getenv("SPACESHIP_API_SECRET")
    SPACESHIP_API_URL = os.getenv("SPACESHIP_API_URL", "https://spaceship.dev/api/v1")

    if not SPACESHIP_API_KEY or not SPACESHIP_API_SECRET:
        logger.error("Missing SPACESHIP_API_KEY or SPACESHIP_API_SECRET in environment variables.")
        return

    logger.info(f"Starting DNS setup for domain: {DOMAIN}")

    records = []
    for subdomain in SUBDOMAINS:
        logger.info(f"Preparing CNAME record for {subdomain}.{DOMAIN} -> {TARGET_HOST}")
        records.append({
            "type": "CNAME",
            "name": subdomain,
            "value": TARGET_HOST,
            "ttl": 3600
        })

    url = f"{SPACESHIP_API_URL}/dns/records/{DOMAIN}"

    headers = {
        "X-API-Key": SPACESHIP_API_KEY,
        "X-API-Secret": SPACESHIP_API_SECRET,
        "Content-Type": "application/json"
    }

    payload = {
        "items": records,
        "force": True
    }

    try:
        logger.info(f"Sending payload to {url}: {json.dumps(payload, indent=2)}")

        response = requests.put(
            url,
            headers=headers,
            json=payload
        )

        if response.status_code == 200:
            logger.info("DNS records updated successfully.")
            logger.info(f"Response: {response.text}")
        else:
            logger.error(f"Failed to update DNS records. Status: {response.status_code}")
            logger.error(f"Response: {response.text}")

    except Exception as e:
        logger.error(f"An error occurred: {e}")

if __name__ == "__main__":
    setup_spaceship_dns()
