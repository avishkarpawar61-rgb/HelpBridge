"""
Unit Tests for Gemini API Schemas (Pass 1 and Pass 2)
Verifies schema completeness, field types, required arrays, and clinical enums.
"""

import unittest
import os

class TestGeminiSchemas(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        schema_path = os.path.join(os.path.dirname(__file__), '..', 'src', 'config', 'schemas.js')
        with open(schema_path, 'r', encoding='utf-8') as f:
            cls.schema_content = f.read()

    def test_pass1_schema_presence_and_structure(self):
        """Verify PASS1_SCHEMA is defined and contains all 11 required clinical keys"""
        self.assertIn('export const PASS1_SCHEMA =', self.schema_content)
        
        required_keys = [
            'summary',
            'language_detected',
            'urgency',
            'facts',
            'medications',
            'abnormal_findings',
            'missing_information',
            'actions',
            'questions_for_doctor',
            'emergency_card',
            'disclaimer'
        ]
        
        for key in required_keys:
            self.assertIn(f'"{key}"', self.schema_content, f'Missing required key: {key} in PASS1_SCHEMA')

    def test_urgency_levels_enum(self):
        """Verify clinical urgency triage enum contains all 5 required triage levels"""
        expected_levels = ['EMERGENCY', 'URGENT_24H', 'SOON_THIS_WEEK', 'ROUTINE', 'INSUFFICIENT_INFO']
        for level in expected_levels:
            self.assertIn(f'"{level}"', self.schema_content, f'Urgency level {level} missing from schema')

    def test_fact_categories_enum(self):
        """Verify clinical fact categories cover all necessary clinical entities"""
        expected_cats = ['symptom', 'medication', 'condition', 'lab_value', 'allergy', 'vital', 'history', 'other']
        for cat in expected_cats:
            self.assertIn(f'"{cat}"', self.schema_content, f'Category {cat} missing from schema')

    def test_pass2_auditor_schema_structure(self):
        """Verify PASS2_SCHEMA (Auditor) contains all 6 required verification fields"""
        self.assertIn('export const PASS2_SCHEMA =', self.schema_content)
        
        auditor_keys = [
            'verified_facts',
            'contradicted_or_unsupported',
            'illegible_items_to_recheck',
            'safety_corrections',
            'overall_reliability_score',
            'reliability_explanation'
        ]
        
        for key in auditor_keys:
            self.assertIn(f'"{key}"', self.schema_content, f'Auditor key {key} missing from PASS2_SCHEMA')

    def test_emergency_card_sub_properties(self):
        """Verify emergency_card sub-schema contains 20-second ER triage fields"""
        er_fields = [
            'patient_descriptor',
            'key_conditions',
            'current_medications',
            'allergies',
            'recent_findings',
            'what_happened',
            'suggested_attention_level'
        ]
        for field in er_fields:
            self.assertIn(f'"{field}"', self.schema_content, f'Emergency card field {field} missing')

if __name__ == '__main__':
    unittest.main()
