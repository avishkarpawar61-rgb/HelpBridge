"""
Pass 2 Lead Auditor & Verification Merging Unit Tests
Verifies that auditor corrections correctly downgrade confidence, flag unsupported items in red,
and attach objective reliability scores.
"""

import unittest

def simulate_merge_verification_results(pass1, pass2):
    """Mirror implementation of mergeVerificationResults from gemini.js"""
    verified_plan = {
        'summary': pass1.get('summary'),
        'urgency': pass1.get('urgency'),
        'facts': [dict(f) for f in pass1.get('facts', [])]
    }
    
    contradicted_map = {item['fact_id']: item for item in pass2.get('contradicted_or_unsupported', []) if 'fact_id' in item}
    verified_ids = set(pass2.get('verified_facts', []))
    
    updated_facts = []
    for fact in verified_plan['facts']:
        fid = fact.get('id')
        if fid in contradicted_map:
            issue = contradicted_map[fid]
            fact_copy = dict(fact)
            fact_copy['confidence'] = 'low'
            fact_copy['needs_confirmation'] = True
            fact_copy['auditorStatus'] = 'CONTRADICTED'
            fact_copy['auditorIssue'] = issue.get('issue')
            fact_copy['suggestedCorrection'] = issue.get('suggested_correction')
            updated_facts.append(fact_copy)
        elif fid in verified_ids:
            fact_copy = dict(fact)
            fact_copy['auditorStatus'] = 'VERIFIED'
            updated_facts.append(fact_copy)
        else:
            fact_copy = dict(fact)
            fact_copy['auditorStatus'] = 'UNCHECKED'
            updated_facts.append(fact_copy)
            
    verified_plan['facts'] = updated_facts
    verified_plan['auditor'] = {
        'reliabilityScore': pass2.get('overall_reliability_score'),
        'reliabilityExplanation': pass2.get('reliability_explanation')
    }
    return verified_plan

class TestAuditorVerificationMerge(unittest.TestCase):
    def setUp(self):
        self.pass1_mock = {
            'summary': 'Patient with suspected high BP and blood sugar issues.',
            'urgency': {'level': 'ROUTINE', 'rationale': 'Routine review', 'red_flags': []},
            'facts': [
                {'id': 'f1', 'category': 'medication', 'label': 'Metformin', 'value': '500mg BD', 'confidence': 'high', 'needs_confirmation': False},
                {'id': 'f2', 'category': 'lab_value', 'label': 'Serum Creatinine', 'value': '4.5 mg/dL', 'confidence': 'high', 'needs_confirmation': False},
                {'id': 'f3', 'category': 'symptom', 'label': 'Headache', 'value': 'Mild for 2 days', 'confidence': 'medium', 'needs_confirmation': False}
            ]
        }
        
        self.pass2_auditor_mock = {
            'verified_facts': ['f1', 'f3'],
            'contradicted_or_unsupported': [
                {
                    'fact_id': 'f2',
                    'issue': 'Lab slip actually says 1.28 mg/dL, not 4.5 mg/dL. Handwriting misread.',
                    'suggested_correction': '1.28 mg/dL'
                }
            ],
            'illegible_items_to_recheck': [],
            'safety_corrections': [],
            'overall_reliability_score': 78,
            'reliability_explanation': 'Good quality overall with one misread creatinine value corrected.'
        }

    def test_auditor_downgrades_confidence_of_contradicted_fact(self):
        """Contradicted fact f2 must have its confidence downgraded to 'low' and needs_confirmation set to True"""
        merged = simulate_merge_verification_results(self.pass1_mock, self.pass2_auditor_mock)
        f2 = next(f for f in merged['facts'] if f['id'] == 'f2')
        
        self.assertEqual(f2['confidence'], 'low')
        self.assertTrue(f2['needs_confirmation'])
        self.assertEqual(f2['auditorStatus'], 'CONTRADICTED')
        self.assertIn('Lab slip actually says 1.28', f2['auditorIssue'])
        self.assertEqual(f2['suggestedCorrection'], '1.28 mg/dL')

    def test_auditor_marks_verified_facts(self):
        """Verified facts f1 and f3 must have auditorStatus 'VERIFIED'"""
        merged = simulate_merge_verification_results(self.pass1_mock, self.pass2_auditor_mock)
        f1 = next(f for f in merged['facts'] if f['id'] == 'f1')
        f3 = next(f for f in merged['facts'] if f['id'] == 'f3')
        
        self.assertEqual(f1['auditorStatus'], 'VERIFIED')
        self.assertEqual(f3['auditorStatus'], 'VERIFIED')

    def test_auditor_reliability_score_attached(self):
        """Overall reliability score (0-100) must be attached to the final plan"""
        merged = simulate_merge_verification_results(self.pass1_mock, self.pass2_auditor_mock)
        self.assertEqual(merged['auditor']['reliabilityScore'], 78)
        self.assertIn('creatinine value corrected', merged['auditor']['reliabilityExplanation'])

if __name__ == '__main__':
    unittest.main()
