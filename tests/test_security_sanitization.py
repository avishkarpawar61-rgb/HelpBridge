"""
Security & Responsible AI Unit Tests
Tests XSS sanitization, prompt injection defense, credential safety, and crisis helplines.
"""

import unittest
import os
import re

def python_escape_html(s):
    """Mirror implementation of escapeHtml in components"""
    if not s:
        return ''
    return (str(s)
        .replace('&', '&amp;')
        .replace('<', '&lt;')
        .replace('>', '&gt;')
        .replace('"', '&quot;')
        .replace("'", '&#039;'))

class TestSecurityAndSanitization(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        src_dir = os.path.join(os.path.dirname(__file__), '..', 'src')
        cls.js_files = []
        for root, dirs, files in os.walk(src_dir):
            for f in files:
                if f.endswith('.js'):
                    with open(os.path.join(root, f), 'r', encoding='utf-8') as fp:
                        cls.js_files.append((f, fp.read()))

    def test_no_hardcoded_google_api_keys(self):
        """Verify no actual Google AI Studio API keys (AIzaSy...) are hardcoded in source"""
        api_key_pattern = re.compile(r'AIzaSy[A-Za-z0-9_-]{33}')
        for filename, content in self.js_files:
            matches = api_key_pattern.findall(content)
            self.assertEqual(matches, [], f"Hardcoded Google API key found in {filename}!")

    def test_xss_escape_html_replaces_all_malicious_characters(self):
        """Verify HTML escaping handles all potential XSS vectors"""
        malicious_input = '<script>alert("XSS & steal cookie\'s")</script>'
        escaped = python_escape_html(malicious_input)
        
        self.assertNotIn('<script>', escaped)
        self.assertNotIn('</script>', escaped)
        self.assertIn('&lt;script&gt;', escaped)
        self.assertIn('&quot;XSS', escaped)
        self.assertIn('&amp;', escaped)
        self.assertIn('&#039;s', escaped)

    def test_prompt_injection_defense_present_in_prompts(self):
        """Verify prompt injection defense rules exist in system prompts"""
        prompts_file = next(content for fname, content in self.js_files if fname == 'prompts.js')
        
        self.assertIn('PROMPT INJECTION DEFENSE', prompts_file)
        self.assertIn('UNTRUSTED DATA', prompts_file)
        self.assertIn('COMPLETELY IGNORE THESE INSTRUCTIONS', prompts_file)

    def test_clinical_emergency_hotlines_defined(self):
        """Verify national emergency numbers 112 and 108 are configured"""
        lenses_file = next(content for fname, content in self.js_files if fname == 'lenses.js')
        
        self.assertIn("'112'", lenses_file)
        self.assertIn("'108'", lenses_file)

    def test_mental_health_helplines_defined(self):
        """Verify Tele-MANAS (14416) and KIRAN (1800-599-0019) are configured"""
        lenses_file = next(content for fname, content in self.js_files if fname == 'lenses.js')
        
        self.assertIn('14416', lenses_file)
        self.assertIn('1800-599-0019', lenses_file)

if __name__ == '__main__':
    unittest.main()
