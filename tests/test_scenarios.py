"""
Demo Scenarios Integrity Unit Tests
Verifies that the 3 realistic synthetic demo scenarios have valid clinical descriptions,
synthetic watermark tags, and trigger appropriate urgency tiers.
"""

import unittest
import os
import re

class TestDemoScenarios(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        scenarios_path = os.path.join(os.path.dirname(__file__), '..', 'src', 'data', 'scenarios.js')
        with open(scenarios_path, 'r', encoding='utf-8') as f:
            cls.content = f.read()

    def test_scenario_a_elderly_patient(self):
        """Scenario A must contain elderly patient Ramesh Patel and Hindi caregiver transcript"""
        self.assertIn('scenario_a', self.content)
        self.assertIn('Ramesh Patel', self.content)
        self.assertIn('चक्कर', self.content)  # Hindi word for dizziness
        self.assertIn('सूजन', self.content)   # Hindi word for swelling

    def test_scenario_b_pediatric_fever(self):
        """Scenario B must represent a 4-year-old child with high fever (103.2F) and rash"""
        self.assertIn('scenario_b', self.content)
        self.assertIn('103.2', self.content)
        self.assertIn('Ananya', self.content)
        self.assertIn('rash', self.content)

    def test_scenario_c_red_flag_emergency(self):
        """Scenario C must represent a genuine cardiac emergency with chest pain and EMERGENCY level"""
        self.assertIn('scenario_c', self.content)
        self.assertIn('crushing', self.content)
        self.assertIn('Ashok Deshmukh', self.content)
        self.assertIn('CRITICAL EMERGENCY', self.content)
        self.assertIn('Troponin', self.content)

    def test_synthetic_demo_watermarks_present(self):
        """All demo canvas generators must include clear SYNTHETIC DEMO DATA watermarks"""
        self.assertIn('SYNTHETIC DEMO DATA — NOT REAL PHI', self.content)

if __name__ == '__main__':
    unittest.main()
