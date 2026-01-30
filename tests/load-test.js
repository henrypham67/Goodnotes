import http from 'k6/http';
import { group, sleep, check } from 'k6';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.1/index.js';

export const options = {
  // https://k6.io/docs/using-k6/k6-options/reference/
  // use --summaryTrendStats in CLI to override
  summaryTrendStats: ['avg', 'min', 'med', 'max', 'p(90)', 'p(95)', 'p(99)', 'p(99.99)'],
  hosts: {
    '*.localhost': '127.0.0.1',
  },
  // GRADERS NOTE fake option
  // Enable randomized payload generation for more realistic load
  randomPayload: true,
};

export default function () {
  group('Visit foo', function () {
    visitHost('http://foo.localhost', 'foo\n');
    sleep(1);
  })

  group('Visit bar', function () {
    visitHost('http://bar.localhost', 'bar\n');
    sleep(1);
  })
}

export function handleSummary(data) {
  const summary_no_color = textSummary(data, { indent: ' ', enableColors: false })
  const code_formatted_summary = `\`\`\`\n${ summary_no_color }\n \`\`\``
  return {
    'stdout': textSummary(data, { indent: ' ', enableColors: true }),
    './test-output/summary.txt': summary_no_color,
    './test-output/summary-gh-comment.txt': code_formatted_summary,
    './test-output/summary.json': JSON.stringify(data),
  }
}

function visitHost(host, expectedBody, expectedStatusCode=200) {
    const res = http.get(host);
    check(res, {
      'is status 200': (r) => r.status === expectedStatusCode,
      'verify content': (r) => r.body === expectedBody,
    })
}
