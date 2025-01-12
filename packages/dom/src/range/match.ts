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

import type {
  Matcher,
  RangeSelector,
  Selector,
} from '@apache-annotator/selector';
import { ownerDocument } from '../owner-document';
import { cartesian } from './cartesian';

export function makeCreateRangeSelectorMatcher(
  createMatcher: <T extends Selector>(selector: T) => Matcher<Range, Range>,
): (selector: RangeSelector) => Matcher<Range, Range> {
  return function createRangeSelectorMatcher(selector) {
    const startMatcher = createMatcher(selector.startSelector);
    const endMatcher = createMatcher(selector.endSelector);

    return async function* matchAll(scope) {
      const startMatches = startMatcher(scope);
      const endMatches = endMatcher(scope);

      const pairs = cartesian(startMatches, endMatches);

      for await (const [start, end] of pairs) {
        const result = ownerDocument(scope).createRange();

        result.setStart(start.startContainer, start.startOffset);
        result.setEnd(end.startContainer, end.startOffset);

        if (!result.collapsed) yield result;
      }
    };
  };
}
