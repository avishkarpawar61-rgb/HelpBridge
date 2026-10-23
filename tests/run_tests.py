#!/usr/bin/env python3
"""
HelpBridge AI — Automated Test Suite Runner
Discovers and executes all unit, integration, and security assertion tests.
Outputs a clean test execution report suitable for CI/CD and hackathon grading bots.
"""

import unittest
import sys
import os
import time

def main():
    print("=" * 70)
    print("  HELPBRIDGE AI — AUTOMATED TEST RUNNER (PROMPTWARS HACKATHON)")
    print("=" * 70)
    
    test_dir = os.path.dirname(os.path.abspath(__file__))
    start_time = time.time()
    
    # Discover all tests matching test_*.py
    loader = unittest.TestLoader()
    suite = loader.discover(start_dir=test_dir, pattern='test_*.py')
    
    # Run test suite with verbosity
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    
    duration = time.time() - start_time
    total = result.testsRun
    failures = len(result.failures)
    errors = len(result.errors)
    passed = total - failures - errors
    pass_rate = (passed / total * 100) if total > 0 else 0
    
    print("-" * 70)
    print(f"Test Summary: {total} tests executed in {duration:.3f}s")
    print(f"Passed:   {passed}")
    print(f"Failures: {failures}")
    print(f"Errors:   {errors}")
    print(f"Pass Rate: {pass_rate:.1f}%")
    print("=" * 70)
    
    if result.wasSuccessful():
        print(">> ALL AUTOMATED TESTS PASSED (100% PASS RATE) <<")
        sys.exit(0)
    else:
        print(">> TEST FAILURES DETECTED <<")
        sys.exit(1)

if __name__ == '__main__':
    main()
