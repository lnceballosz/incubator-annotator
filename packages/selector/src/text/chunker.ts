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

// A Chunk represents a fragment (typically a string) of some document.
// Subclasses can add further attributes to map the chunk to its position in the
// data structure it came from (e.g. a DOM node).
export interface Chunk<TData> {
  readonly data: TData;
  equals?(otherChunk: this): boolean;
}

export function chunkEquals(chunk1: Chunk<any>, chunk2: Chunk<any>): boolean {
  return chunk1.equals ? chunk1.equals(chunk2) : chunk1 === chunk2;
}

export interface ChunkRange<TChunk extends Chunk<any>> {
  startChunk: TChunk;
  startIndex: number;
  endChunk: TChunk;
  endIndex: number;
}

export function chunkRangeEquals(
  range1: ChunkRange<any>,
  range2: ChunkRange<any>,
): boolean {
  return (
    chunkEquals(range1.startChunk, range2.startChunk) &&
    chunkEquals(range1.endChunk, range2.endChunk) &&
    range1.startIndex === range2.startIndex &&
    range1.endIndex === range2.endIndex
  );
}

// A Chunker lets one walk through the chunks of a document.
// It is inspired by, and similar to, the DOM’s NodeIterator. (but unlike
// NodeIterator, it has no concept of being ‘before’ or ‘after’ a chunk)
export interface Chunker<TChunk extends Chunk<any>> {
  // The chunk currently being pointed at.
  readonly currentChunk: TChunk;

  // Move currentChunk to the chunk following it, and return that chunk.
  // If there are no chunks following it, keep currentChunk unchanged and return null.
  nextChunk(): TChunk | null;

  // Move currentChunk to the chunk preceding it, and return that chunk.
  // If there are no preceding chunks, keep currentChunk unchanged and return null.
  previousChunk(): TChunk | null;

  // Test if a given chunk is before the current chunk.
  precedesCurrentChunk(chunk: TChunk): boolean;
}
