import { preprocessCustomerMessage } from '../nlp/singlishPreprocessor';

interface TestCase {
  input: string;
  expectedNormalizedSubstrings: string[];
  expectedCodes: string[];
  forbiddenSubstrings?: string[];
}

const testCases: TestCase[] = [
  {
    input: 'Meka thynwda?',
    expectedNormalizedSubstrings: ['thiyenawada'],
    expectedCodes: [],
  },
  {
    input: 'Meka tiyenawada?',
    expectedNormalizedSubstrings: ['thiyenawada'],
    expectedCodes: [],
  },
  {
    input: 'Me item eka available da?',
    expectedNormalizedSubstrings: ['thiyenawada'],
    expectedCodes: [],
  },
  {
    input: 'Meke gaana keeyada?',
    expectedNormalizedSubstrings: ['price eka kiyada'],
    expectedCodes: [],
  },
  {
    input: 'Meeka keeeyada?',
    expectedNormalizedSubstrings: ['meka', 'kiyada'],
    expectedCodes: [],
  },
  {
    input: 'Beauty items penanna',
    expectedNormalizedSubstrings: ['pennanna'],
    expectedCodes: [],
  },
  {
    input: 'Order karanne khmda?',
    expectedNormalizedSubstrings: ['order karanne kohomada'],
    expectedCodes: [],
  },
  {
    input: 'Mata p00481 thiyeda ganna oneee?',
    expectedNormalizedSubstrings: ['P00481', 'thiyenawada', 'ganna ona'],
    expectedCodes: ['P00481'],
  },
  {
    input: 'Do you have NM-P07626 in stock?',
    expectedNormalizedSubstrings: ['NM-P07626'],
    expectedCodes: ['NM-P07626'],
  },
  {
    input: 'Badu labunama gewanna puluwanda?',
    expectedNormalizedSubstrings: ['cash on delivery puluwanda'],
    expectedCodes: [],
  },
  {
    input: 'මේක තියෙනවද?',
    expectedNormalizedSubstrings: ['මේක තියෙනවද?'],
    expectedCodes: [],
  },
  // Negation Safety Tests
  {
    input: 'Mata meka ganna epa',
    expectedNormalizedSubstrings: ['ganna epa'],
    expectedCodes: [],
    forbiddenSubstrings: ['ganna ona'],
  },
  {
    input: 'Meke me item eka ona na',
    expectedNormalizedSubstrings: ['ona na'],
    expectedCodes: [],
    forbiddenSubstrings: ['ganna ona'],
  },
  // Conservative vowel stretching: Brand / Acronym "AAA" preserved
  {
    input: 'AAA battery thiyenawada?',
    expectedNormalizedSubstrings: ['AAA', 'thiyenawada'],
    expectedCodes: [],
    forbiddenSubstrings: ['AA battery'],
  },
];

console.log('--- Running Singlish Preprocessor Tests ---\n');
let passed = 0;

for (const { input, expectedNormalizedSubstrings, expectedCodes, forbiddenSubstrings } of testCases) {
  const result = preprocessCustomerMessage(input);
  const matchedCodes = JSON.stringify(result.detectedProductCodes) === JSON.stringify(expectedCodes);
  const matchedSubstrings = expectedNormalizedSubstrings.every((sub) =>
    result.normalized.toLowerCase().includes(sub.toLowerCase())
  );
  const matchedForbidden = !forbiddenSubstrings || forbiddenSubstrings.every(
    (forbidden) => !new RegExp(`\\b${forbidden}\\b`, 'i').test(result.normalized)
  );

  if (matchedCodes && matchedSubstrings && matchedForbidden) {
    console.log(`✅ PASS: "${input}"`);
    console.log(`   -> Normalized: "${result.normalized}"`);
    if (result.detectedProductCodes.length > 0) {
      console.log(`   -> Codes: ${result.detectedProductCodes.join(', ')}`);
    }
    passed++;
  } else {
    console.error(`❌ FAIL: "${input}"`);
    console.error(`   Got: "${result.normalized}" (codes: ${JSON.stringify(result.detectedProductCodes)})`);
    console.error(`   Expected substrings: ${JSON.stringify(expectedNormalizedSubstrings)}, codes: ${JSON.stringify(expectedCodes)}`);
    if (forbiddenSubstrings) {
      console.error(`   Forbidden substrings: ${JSON.stringify(forbiddenSubstrings)}`);
    }
  }
}

console.log(`\nResults: ${passed} / ${testCases.length} tests passed.`);
if (passed === testCases.length) {
  console.log('🎉 All Singlish preprocessing & negation tests passed successfully!');
} else {
  process.exit(1);
}
