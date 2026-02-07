"""
Update Spaceship Nameservers to Cloudflare

This script updates the nameservers for oriz.in on Spaceship
to point to Cloudflare's assigned nameservers.
"""
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

DOMAIN = "oriz.in"

def update_spaceship_nameservers(nameservers: list[str]):
    """
    Update nameservers for domain on Spaceship.

    Args:
        nameservers: List of Cloudflare nameserver hostnames
    """
    SPACESHIP_API_KEY = os.getenv("SPACESHIP_API_KEY")
    SPACESHIP_API_SECRET = os.getenv("SPACESHIP_API_SECRET")
    SPACESHIP_API_URL = os.getenv("SPACESHIP_API_URL", "https://spaceship.dev/api/v1")

    if not SPACESHIP_API_KEY or not SPACESHIP_API_SECRET:
        logger.error("Missing SPACESHIP_API_KEY or SPACESHIP_API_SECRET in environment variables.")
        return False

    if not nameservers or len(nameservers) == 0:
        logger.error("No nameservers provided.")
        return False

    url = f"{SPACESHIP_API_URL}/domains/{DOMAIN}/nameservers"

    headers = {
        "X-API-Key": SPACESHIP_API_KEY,
        "X-API-Secret": SPACESHIP_API_SECRET,
        "Content-Type": "application/json"
    }

    payload = {
        "provider": "custom",
        "hosts": nameservers
    }

    try:
        logger.info(f"Updating nameservers for {DOMAIN} to: {nameservers}")
        logger.info(f"Sending request to {url}")

        response = requests.put(url, headers=headers, json=payload)

        if response.status_code == 200:
            logger.info("Nameservers updated successfully on Spaceship!")
            logger.info(f"Response: {response.text}")
            return True
        else:
            logger.error(f"Failed to update nameservers. Status: {response.status_code}")
            logger.error(f"Response: {response.text}")
            return False

    except Exception as e:
        logger.error(f"An error occurred: {e}")
        return False

if __name__ == "__main__":
    # Default Cloudflare nameservers (will be replaced by actual values from setup_cloudflare_zone.py)
    # These are placeholder values - run setup_cloudflare_zone.py first to get actual nameservers
    import sys

    if len(sys.argv) > 1:
        nameservers = sys.argv[1:]
        update_spaceship_nameservers(nameservers)
    else:
        print("Usage: python setup_spaceship_nameservers.py ns1.example.com ns2.example.com")
        print("Run setup_cloudflare_zone.py first to get Cloudflare nameservers.")
