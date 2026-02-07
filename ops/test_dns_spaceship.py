import unittest
from unittest.mock import patch, MagicMock
import os
import sys

# Add project root to path to allow importing ops.setup_dns
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from ops.setup_dns import setup_spaceship_dns

class TestSetupSpaceshipDNS(unittest.TestCase):

    @patch('ops.setup_dns.requests.put')
    @patch('ops.setup_dns.os.getenv')
    def test_setup_spaceship_dns_success(self, mock_getenv, mock_put):
        # Mock environment variables
        mock_getenv.side_effect = lambda key, default=None: {
            "SPACESHIP_API_KEY": "test_key",
            "SPACESHIP_API_SECRET": "test_secret",
            "SPACESHIP_API_URL": "https://api.spaceship.test"
        }.get(key, default)

        # Mock response
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.text = '{"success": true}'
        mock_put.return_value = mock_response

        setup_spaceship_dns()

        # Verify requests.put was called correctly
        expected_url = "https://api.spaceship.test/dns/records/oriz.in"
        expected_headers = {
            "X-API-Key": "test_key",
            "X-API-Secret": "test_secret",
            "Content-Type": "application/json"
        }

        # Verify the records payload
        args, kwargs = mock_put.call_args
        self.assertEqual(args[0], expected_url)
        self.assertEqual(kwargs['headers'], expected_headers)

        payload = kwargs['json']
        self.assertTrue(payload['force'])
        self.assertIn('items', payload)
        records = payload['items']
        self.assertEqual(len(records), 2)

        # Check money record
        money_record = next(r for r in records if r['name'] == 'money')
        self.assertEqual(money_record['type'], 'CNAME')
        self.assertEqual(money_record['value'], 'finsuite.pages.dev')

        # Check finance record
        finance_record = next(r for r in records if r['name'] == 'finance')
        self.assertEqual(finance_record['type'], 'CNAME')
        self.assertEqual(finance_record['value'], 'finsuite.pages.dev')

    @patch('ops.setup_dns.requests.put')
    @patch('ops.setup_dns.os.getenv')
    def test_setup_spaceship_dns_failure(self, mock_getenv, mock_put):
         # Mock environment variables
        mock_getenv.side_effect = lambda key, default=None: {
            "SPACESHIP_API_KEY": "test_key",
            "SPACESHIP_API_SECRET": "test_secret",
            "SPACESHIP_API_URL": "https://api.spaceship.test"
        }.get(key, default)

        # Mock failure response
        mock_response = MagicMock()
        mock_response.status_code = 400
        mock_response.text = '{"error": "Invalid request"}'
        mock_put.return_value = mock_response

        # Just ensure it doesn't crash
        setup_spaceship_dns()

        mock_put.assert_called_once()

if __name__ == '__main__':
    unittest.main()
