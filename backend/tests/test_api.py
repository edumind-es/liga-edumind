#!/usr/bin/env python3
"""
Liga EDUmind - Test Suite
Ejecutar: python3 tests/test_api.py
"""
import requests
import sys
from typing import Tuple

BASE_URL = "http://localhost:8004"


class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    NC = '\033[0m'


def test_health() -> Tuple[bool, str]:
    """Test API health endpoint"""
    try:
        r = requests.get(f"{BASE_URL}/api/health", timeout=5)
        if r.status_code == 200:
            return True, "Health endpoint OK"
        return False, f"Health returned {r.status_code}"
    except Exception as e:
        return False, str(e)


def test_leagues_list() -> Tuple[bool, str]:
    """Test leagues list endpoint"""
    try:
        r = requests.get(f"{BASE_URL}/api/leagues", timeout=5)
        if r.status_code == 200:
            data = r.json()
            return True, f"Leagues endpoint OK ({len(data.get('leagues', []))} leagues)"
        return False, f"Leagues returned {r.status_code}"
    except Exception as e:
        return False, str(e)


def test_sports_list() -> Tuple[bool, str]:
    """Test sports list endpoint"""
    try:
        r = requests.get(f"{BASE_URL}/api/sports", timeout=5)
        if r.status_code == 200:
            return True, "Sports endpoint OK"
        return False, f"Sports returned {r.status_code}"
    except Exception as e:
        return False, str(e)


def run_tests():
    print(f"\n{'='*50}")
    print("  Liga EDUmind - Test Suite")
    print(f"{'='*50}\n")

    tests = [
        ("Health Check", test_health),
        ("Leagues List", test_leagues_list),
        ("Sports List", test_sports_list),
    ]

    passed = 0
    failed = 0

    for name, test_func in tests:
        success, message = test_func()
        if success:
            print(f"  {Colors.GREEN}✓{Colors.NC} {name}: {message}")
            passed += 1
        else:
            print(f"  {Colors.RED}✗{Colors.NC} {name}: {message}")
            failed += 1

    print(f"\n{'='*50}")
    print(f"  Results: {Colors.GREEN}{passed} passed{Colors.NC}, {Colors.RED}{failed} failed{Colors.NC}")
    print(f"{'='*50}\n")

    return 0 if failed == 0 else 1


if __name__ == "__main__":
    sys.exit(run_tests())
