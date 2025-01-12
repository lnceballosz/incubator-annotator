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

export interface Selector {
  refinedBy?: Selector;
}

export interface CssSelector extends Selector {
  type: 'CssSelector';
  value: string;
}

export interface TextQuoteSelector extends Selector {
  type: 'TextQuoteSelector';
  exact: string;
  prefix?: string;
  suffix?: string;
}

export interface TextPositionSelector extends Selector {
  type: 'TextPositionSelector';
  start: number; // more precisely: non-negative integer
  end: number; // more precisely: non-negative integer
}

export interface RangeSelector extends Selector {
  type: 'RangeSelector';
  startSelector: Selector;
  endSelector: Selector;
}

export interface Matcher<TScope, TMatch> {
  (scope: TScope): AsyncGenerator<TMatch, void, void>;
}
