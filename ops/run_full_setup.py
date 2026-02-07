"""
Full DNS Setup Orchestrator

This script runs the full sequence to migrate DNS to Cloudflare and setup everything.
1. Add Zone to Cloudflare
2. Update Nameservers on Spaceship
3. Setup DNS Records on Cloudflare
4. Add Custom Domains to Cloudflare Pages
"""
import sys
import logging
import setup_cloudflare_zone
import setup_spaceship_nameservers
import setup_cloudflare_dns
import setup_cloudflare_pages_domain

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def run_full_setup():
    logger.info("STARING FULL DNS SETUP SEQUENCE")
    print("-" * 50)

    # Step 1: Cloudflare Zone Setup
    logger.info("STEP 1: Cloudflare Zone Setup")
    zone_id, nameservers = setup_cloudflare_zone.setup_cloudflare_zone()

    if not zone_id or not nameservers:
        logger.error("Step 1 Failed: Could not setup Cloudflare zone. Aborting.")
        sys.exit(1)

    print("-" * 50)

    # Step 2: Update Spaceship Nameservers
    logger.info("STEP 2: Update Spaceship Nameservers")
    # This might fail if permissions are wrong or API is flaky, but we can try to proceed if users want manual intervention
    # But usually we should stop.
    success = setup_spaceship_nameservers.update_spaceship_nameservers(nameservers)

    if not success:
        logger.error("Step 2 Failed: Could not update nameservers on Spaceship.")
        logger.error("Please update nameservers manually to: " + ", ".join(nameservers))
        # We can continue to Step 3 because DNS configuration on Cloudflare side doesn't require NS to be propagated yet

    print("-" * 50)

    # Step 3: Cloudflare DNS Records
    logger.info("STEP 3: Cloudflare DNS Records")
    success = setup_cloudflare_dns.setup_cloudflare_dns(zone_id)

    if not success:
        logger.error("Step 3 Failed: Could not setup DNS records.")

    print("-" * 50)

    # Step 4: Cloudflare Pages Custom Domains
    logger.info("STEP 4: Cloudflare Pages Custom Domains")
    success = setup_cloudflare_pages_domain.setup_pages_domain()

    if not success:
        logger.error("Step 4 Failed: Could not setup Pages custom domains.")

    print("-" * 50)
    logger.info("Full setup sequence completed.")
    logger.info("NOTE: DNS propagation may take up to 48 hours.")
    logger.info("Verify by visiting https://money.oriz.in")

if __name__ == "__main__":
    run_full_setup()
