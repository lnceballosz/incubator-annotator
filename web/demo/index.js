/**
 * SPDX-FileCopyrightText: 2016-2020 The Apache Software Foundation
 * SPDX-License-Identifier: Apache-2.0
 * @license
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

/* global info, module, source, target, form */

import {
  makeCreateRangeSelectorMatcher,
  createTextQuoteSelectorMatcher,
  describeTextQuote,
  createTextPositionSelectorMatcher,
  describeTextPosition,
  highlightRange,
} from '@apache-annotator/dom';
import { makeRefinable } from '@apache-annotator/selector';

const EXAMPLE_SELECTORS = [
  {
    type: 'TextQuoteSelector',
    exact: 'not',
  },
  {
    type: 'RangeSelector',
    startSelector: {
      type: 'TextQuoteSelector',
      exact: 'ann',
    },
    endSelector: {
      type: 'TextQuoteSelector',
      exact: '!',
    },
  },
  {
    type: 'TextQuoteSelector',
    exact: 'annotated world',
    refinedBy: {
      type: 'TextQuoteSelector',
      exact: 'tat',
    },
  },
  {
    type: 'TextQuoteSelector',
    exact: 'To annotate, or not to annotate,',
    refinedBy: {
      type: 'RangeSelector',
      startSelector: {
        type: 'TextQuoteSelector',
        exact: 'To annotate',
        refinedBy: {
          type: 'TextQuoteSelector',
          exact: 'annotate',
        },
      },
      endSelector: {
        type: 'TextQuoteSelector',
        exact: 'not to annotate',
        refinedBy: {
          type: 'TextQuoteSelector',
          exact: ' to',
        },
      },
      refinedBy: {
        type: 'TextQuoteSelector',
        exact: 'o',
      },
    },
  },
];

const cleanupFunctions = [];

function cleanup() {
  let removeHighlight;
  while ((removeHighlight = cleanupFunctions.shift())) {
    removeHighlight();
  }
  target.normalize();
  info.innerText = '';
}

const createMatcher = makeRefinable((selector) => {
  const innerCreateMatcher = {
    TextQuoteSelector: createTextQuoteSelectorMatcher,
    TextPositionSelector: createTextPositionSelectorMatcher,
    RangeSelector: makeCreateRangeSelectorMatcher(createMatcher),
  }[selector.type];

  if (!innerCreateMatcher) {
    throw new Error(`Unsupported selector type: ${selector.type}`);
  }

  return innerCreateMatcher(selector);
});

async function anchor(selector) {
  const scope = document.createRange();
  scope.selectNodeContents(target);

  const matchAll = createMatcher(selector);
  const ranges = [];

  for await (const range of matchAll(scope)) {
    ranges.push(range);
  }

  for (const range of ranges) {
    const removeHighlight = highlightRange(range);
    cleanupFunctions.push(removeHighlight);
  }

  info.innerText += JSON.stringify(selector, null, 2) + '\n\n';
}

async function onSelectionChange() {
  cleanup();
  const describeMode = form.describeMode.value;
  const scope = document.createRange();
  scope.selectNodeContents(source);
  const selection = document.getSelection();
  for (let i = 0; i < selection.rangeCount; i++) {
    const range = selection.getRangeAt(i);
    const selector =
      describeMode === 'TextPosition'
        ? await describeTextPosition(range, scope)
        : await describeTextQuote(range, scope, { minimumQuoteLength: 10 });
    await anchor(selector);
  }
}

function onSelectorExampleClick(event) {
  const exampleNumber = event.target.dataset.runExample;
  if (!exampleNumber) return;
  const selector = EXAMPLE_SELECTORS[exampleNumber];
  cleanup();
  anchor(selector);
  event.preventDefault();
}

document.addEventListener('selectionchange', onSelectionChange);
form.addEventListener('change', onSelectionChange);
document.addEventListener('click', onSelectorExampleClick);

if (module.hot) {
  module.hot.accept();
  module.hot.dispose(() => {
    document.removeEventListener('selectionchange', onSelectionChange);
    document.removeEventListener('click', onSelectorExampleClick);
  });
}
